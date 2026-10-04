import { disposeSceneResources } from './scene-resources.js';

export const FACTORY_ASSET = 'assets/cinematic/factory-production.glb';
export const REALISM_ASSET = 'assets/cinematic/realism/factory-realism.glb';
export const FLOOR_INDIRECT = 'assets/cinematic/realism/floor-indirect.png';
export const FLOOR_OCCLUSION = 'assets/cinematic/realism/floor-occlusion.png';

/** Cycles-baked indirect light only: no baked direct shadows from future stages. */
export function applyWarehouseIndirect(THREE, root, onReady) {
  root.traverse(o => {
    if (!o.isMesh || o.userData.sourceIndex !== 2) return;
    const position=o.geometry.attributes.position,uv=new Float32Array(position.count*2);
    for(let i=0;i<position.count;i++) {uv[i*2]=(position.getX(i)+34.025)/68.05;uv[i*2+1]=(77.45-position.getZ(i))/154.9;}
    o.geometry.setAttribute('uv2',new THREE.BufferAttribute(uv,2));
    o.material=o.material.clone();o.material.lightMapIntensity=.85;
    const map=new THREE.TextureLoader().load(FLOOR_INDIRECT,onReady);
    map.encoding=THREE.LinearEncoding;o.material.lightMap=map;o.material.needsUpdate=true;
    const ao=new THREE.TextureLoader().load(FLOOR_OCCLUSION,onReady);
    ao.encoding=THREE.LinearEncoding;o.material.aoMap=ao;o.material.aoMapIntensity=.9;
  });
}
/** A cancelled loader owns and disposes its late result, never attaching to a dead scene. */
export function loadFactoryAsset(THREE, scene, onReady, onError, asset = FACTORY_ASSET) {
  let cancelled = false;
  if (!THREE.GLTFLoader) return { cancel() {} };
  new THREE.GLTFLoader().load(asset, gltf => {
    if (cancelled) { disposeSceneResources(gltf.scene); return; }
    const originals = [];
    scene.traverse(o => { if (o.isMesh && !o.material.isMeshBasicMaterial && !o.userData.visualBackdrop && !o.userData.constructionProps) originals.push(o); });
    originals.forEach(o => { o.visible = false; o.userData.replacedByBlender = true; });
    gltf.scene.traverse(o => { if (o.isMesh) {
      // Horizontal site/slab meshes receive building shadows without casting
      // their own nearly coincident depth back onto the large flat surface.
      o.castShadow = asset !== REALISM_ASSET || (o.userData.month !== 0 && o.userData.month !== 4);
      o.receiveShadow = true; o.material.envMapIntensity = .75;
    } });
    scene.add(gltf.scene); onReady(gltf.scene);
  }, undefined, error => { if (!cancelled) onError(error); });
  return { cancel() { cancelled = true; } };
}

/** Outdoor reflection colours, rather than rectangular studio reflection cards. */
export function createDaylightEnvironment(THREE, document) {
  const faces = [];
  for (let face=0;face<6;face++) {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
    const ctx=canvas.getContext('2d'),gradient=ctx.createLinearGradient(0,0,0,256);
    if(face===2){gradient.addColorStop(0,'#7aafd2');gradient.addColorStop(1,'#a9c9da');}
    else if(face===3){gradient.addColorStop(0,'#727967');gradient.addColorStop(1,'#8a8e77');}
    else {gradient.addColorStop(0,'#86b4d0');gradient.addColorStop(.5,'#d6e1df');gradient.addColorStop(.53,'#9a9f89');gradient.addColorStop(1,'#68735c');}
    ctx.fillStyle=gradient;ctx.fillRect(0,0,256,256);faces.push(canvas);
  }
  const environment=new THREE.CubeTexture(faces);environment.encoding=THREE.sRGBEncoding;environment.needsUpdate=true;
  return environment;
}

/** Local image-based studio reflections, independent of any remote HDR service. */
export function createStudioEnvironment(THREE, document) {
  const faces = [];
  for (let i = 0; i < 6; i++) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const ctx = c.getContext('2d'), gradient = ctx.createLinearGradient(0,0,0,128);
    gradient.addColorStop(0, '#cbdde7'); gradient.addColorStop(.48, '#70878e'); gradient.addColorStop(1, '#3a423d');
    ctx.fillStyle = gradient; ctx.fillRect(0,0,128,128);
    if (i < 4) { ctx.fillStyle = '#f4ecd9'; ctx.fillRect(18,10,15,54); ctx.fillRect(76,12,24,44); }
    faces.push(c);
  }
  const env = new THREE.CubeTexture(faces); env.encoding = THREE.sRGBEncoding; env.needsUpdate = true; return env;
}

export const DETAIL_MAPS = Object.freeze({
  concrete: 'assets/cinematic/concrete-color.png',
  concreteNormal: 'assets/cinematic/concrete-normal.png',
  metal: 'assets/cinematic/metal-color.png',
  metalNormal: 'assets/cinematic/metal-normal.png'
});
/** Improve only the engineering visualizers; diagram colours and animation objects stay intact. */
export function enhanceEngineeringMaterials(THREE, group, scene, renderer, document) {
  scene.environment = createStudioEnvironment(THREE, document);
  const textures = {};
  if (THREE.GLTFLoader) {
    const loader = new THREE.TextureLoader();
    for (const [name, url] of Object.entries(DETAIL_MAPS)) {
      const t = loader.load(url); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3,3);
      if (!name.endsWith('Normal')) t.encoding = THREE.sRGBEncoding;
      t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); textures[name] = t;
    }
  }
  const bevels = new Map();
  group.traverse(o => {
    if (!o.isMesh) return;
    const original = o.geometry;
    if (original.type === 'BoxGeometry') {
      const {width:w,height:h,depth:d} = original.parameters;
      if (Math.min(w,h,d) > .12) {
        if (!bevels.has(original)) {
          const b = Math.min(.055,Math.min(w,h,d)/10), shape = new THREE.Shape();
          shape.moveTo(-w/2+b,-h/2+b); shape.lineTo(w/2-b,-h/2+b); shape.lineTo(w/2-b,h/2-b); shape.lineTo(-w/2+b,h/2-b); shape.closePath();
          const g = new THREE.ExtrudeGeometry(shape,{depth:d-2*b,steps:1,bevelEnabled:true,bevelSize:b,bevelThickness:b,bevelSegments:3});
          g.translate(0,0,-d/2+b); bevels.set(original,g);
        }
        o.geometry = bevels.get(original);
      }
    }
    o.castShadow = !o.material.transparent; o.receiveShadow = true;
    const list = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of list) {
      if (!m.isMeshStandardMaterial || m.transparent || m.emissiveIntensity > 1) continue;
      const kind = m.metalness > .4 ? 'metal' : 'concrete';
      if (!m.map && textures[kind]) m.map = textures[kind];
      if (!m.normalMap && textures[kind+'Normal']) { m.normalMap = textures[kind+'Normal']; m.normalScale.set(.22,.22); }
      m.envMapIntensity = m.metalness > .4 ? .8 : .25; m.needsUpdate = true;
    }
  });
  bevels.forEach((_g,original) => original.dispose());
  return { textures: new Set([...Object.values(textures), scene.environment]) };
}

/** Analytic sky and bounced pendant light support the local Blender PBR scene. */
export function addFactoryAtmosphere(THREE, scene) {
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300,48,24),new THREE.ShaderMaterial({
    side:THREE.BackSide,depthWrite:false,
    vertexShader:'varying vec3 direction; void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'varying vec3 direction; float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0)),f.x),f.y);}float fbm(vec2 p){float v=0.0,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(7.2,3.8);a*=.5;}return v;} void main(){vec3 d=normalize(direction);float h=clamp(d.y,0.0,1.0);vec3 c=mix(vec3(.85,.88,.87),vec3(.32,.52,.73),pow(h,.5));float alignment=max(dot(d,normalize(vec3(-.5,.75,-.3))),0.0);float glow=pow(alignment,40.0);float sun=smoothstep(.9999,.99996,alignment);float clouds=smoothstep(.48,.75,fbm(vec2(atan(d.z,d.x),asin(d.y))*5.0))*smoothstep(.02,.2,d.y);c=mix(c,vec3(.97,.97,.94),clouds*.4);gl_FragColor=vec4(c+vec3(1.0,.83,.55)*(sun+glow*.14),1.0);}'
  }));
  sky.userData.visualBackdrop=true; sky.renderOrder=-1; scene.add(sky);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.MeshStandardMaterial({color:0x687857,roughness:1}));
  ground.rotation.x=-Math.PI/2;ground.position.y=-.65;ground.receiveShadow=true;ground.userData.visualBackdrop=true;scene.add(ground);
  for (const z of [-60,-36,-12,12,36,60]) for (const x of [-24,0,23]) {
    const light=new THREE.PointLight(0xffefd5,.65,32,1.5); light.position.set(x,8.4,z); scene.add(light);
  }
  const trees = new THREE.Group(); trees.name='factory-landscaping'; scene.add(trees);
  const bark=new THREE.MeshStandardMaterial({color:0x66513b,roughness:1});
  const leaves=new THREE.MeshStandardMaterial({color:0x496a3e,roughness:.92});
  const trunkGeometry=new THREE.CylinderGeometry(.18,.3,3.4,10);
  const leafGeometry=new THREE.IcosahedronGeometry(1.65,2);
  for (const x of [-57,57]) for (const z of [-96,-64,-32,0,32,64,96]) {
    const trunk=new THREE.Mesh(trunkGeometry,bark);trunk.position.set(x,1.5,z);trunk.castShadow=true;trees.add(trunk);
    for(let j=0;j<7;j++){
      const angle=j*2.399,r=j?1.3:0;
      const canopy=new THREE.Mesh(leafGeometry,leaves);canopy.position.set(x+Math.cos(angle)*r,3.3+((j*37+Math.abs(z))%100)/100*1.5,z+Math.sin(angle)*r);canopy.scale.set(1,1.1,.95);canopy.castShadow=true;canopy.receiveShadow=true;trees.add(canopy);
    }
  }
  trees.traverse(o=>{o.userData.visualBackdrop=true;});
  return sky;
}
