import { SLIDES_DATA } from './slides-data.js';
import { WAREHOUSE_MOVEMENT } from './warehouse-config.js';

export const FACTORY_FILM = Object.freeze({ duration: 24, gradingDuration: 3, buildDuration: 18, revealDuration: .5, staggerDuration: .35 });
export function constructionMonth(mesh) {
  if (Number.isFinite(mesh.userData.month)) return mesh.userData.month;
  if (mesh.material?.isMeshBasicMaterial) return 14;
  const m = mesh.material, hex = m?.color?.getHex();
  if (hex === 0x7f9079 || hex === 0xb2b1a8) return 0;
  if (hex === 0xd7d4c8) return mesh.position.y < 1 ? 4 : 3;
  if (hex === 0x66787e || hex === 0x34484f) return 5;
  if (hex === 0xb7c6ca) return 7;
  if (hex === 0xd6d1c3 || hex === 0xdce2e3) return 8;
  if (hex === 0xf4f1d7) return 9;
  if (hex === 0x547969 || hex === 0x8e938e) return 12;
  return 11;
}

/** Actual 3D reveal and continuous camera travel. GSAP is manually clocked by the scene RAF. */
export function createFactoryFilm(THREE, scene, camera, overlay, gsap, onFinish) {
  const scurveSlide = SLIDES_DATA.find(s => s.type === 'interactive-scurve' || s.id === 14 || s.originalId === 14);
  const milestones = scurveSlide ? scurveSlide.content.milestones : [];
  const panel = overlay.querySelector('.wg-film'), label = overlay.querySelector('.wg-month'), focus = overlay.querySelector('.wg-focus'), progress = overlay.querySelector('.wg-progress');
  const objects = [], pose = { x: -125, y: 88, z: -150, tx: -11.525, ty: 4, tz: 0, fov: 45, month: 1 };
  let timeline = null, elapsed = 0, running = false, roofCompleteAt = 0;
  const terrainGeometry = new THREE.PlaneGeometry(102,200,40,70); terrainGeometry.rotateX(-Math.PI/2);
  const heights = [];
  const positions = terrainGeometry.attributes.position;
  for (let i=0;i<positions.count;i++) { const x=positions.getX(i),z=positions.getZ(i); heights.push(1.8+1.2*Math.sin(x*.16)*Math.cos(z*.11)+.5*Math.sin(x*.53+z*.21)); positions.setY(i,heights[i]-.045); }
  terrainGeometry.computeVertexNormals();
  const terrain = new THREE.Mesh(terrainGeometry,new THREE.MeshStandardMaterial({color:0x8d7251,roughness:1}));
  terrain.name = 'construction-terrain';
  const soilImage=document.createElement('canvas');soilImage.width=soilImage.height=256;
  const soilContext=soilImage.getContext('2d');soilContext.fillStyle='#a48b69';soilContext.fillRect(0,0,256,256);
  for(let i=0;i<4500;i++){soilContext.fillStyle=i%2?'#907451':'#bda786';soilContext.fillRect((i*73)%256,(i*97+i*i)%256,2,2);}
  const soilTexture=new THREE.CanvasTexture(soilImage);soilTexture.wrapS=soilTexture.wrapT=THREE.RepeatWrapping;soilTexture.repeat.set(12,24);soilTexture.encoding=THREE.sRGBEncoding;terrain.material.map=soilTexture;
  const grader=new THREE.Group();grader.visible=false;grader.name='site-grader';scene.add(grader);
  const machinePaint=new THREE.MeshStandardMaterial({color:0xd9a12a,metalness:.35,roughness:.55});
  const rubber=new THREE.MeshStandardMaterial({color:0x28302d,roughness:.9});
  const body=new THREE.Mesh(new THREE.BoxGeometry(4,1.6,2.3),machinePaint);body.position.y=1.5;grader.add(body);
  const cab=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.8,2),rubber);cab.position.set(-.6,3,0);grader.add(cab);
  const blade=new THREE.Mesh(new THREE.BoxGeometry(.35,1.3,3.4),machinePaint);blade.position.set(2.6,.7,0);grader.add(blade);
  for(const x of [-1.5,1.5])for(const z of [-1.25,1.25]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.75,.75,.5,16),rubber);wheel.rotation.x=Math.PI/2;wheel.position.set(x,.65,z);grader.add(wheel);}
  grader.traverse(o=>{o.userData.visualBackdrop=true;if(o.isMesh)o.castShadow=true;});
  let previousFlatten=-1;
  terrain.visible=false; terrain.userData.visualBackdrop=true; terrain.receiveShadow=true; scene.add(terrain);
  const temporary = new THREE.Group(); temporary.visible = false; temporary.userData.constructionProps=true; scene.add(temporary);
  const foundations = new THREE.Group(); foundations.name='temporary-foundations'; temporary.add(foundations);
  const soil = new THREE.MeshStandardMaterial({color:0x665748,roughness:1});
  const footing = new THREE.MeshStandardMaterial({color:0xb7b6ac,roughness:.9});
  const yellow = new THREE.MeshStandardMaterial({color:0xe2a52d,metalness:.4,roughness:.4});
  for (let bay = 0; bay < 14; bay++) for (const x of [-33.575,10.975,33.575]) {
    const excavation = new THREE.Mesh(new THREE.BoxGeometry(2.6,.08,2.6),soil);
    excavation.position.set(x,.02,-77.45+bay*154.9/13); excavation.userData.month = 1; foundations.add(excavation);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.8,.6,1.8),footing);
    base.position.set(x,.3,excavation.position.z); base.userData.month = 2; base.castShadow=true; base.receiveShadow=true; foundations.add(base);
  }
  const crane = new THREE.Group(); crane.name="construction-crane"; temporary.add(crane);
  const mast = new THREE.Mesh(new THREE.BoxGeometry(1.4,32,1.4),yellow); mast.position.set(-45,16,-12); mast.userData.month=1; crane.add(mast);
  const jib = new THREE.Mesh(new THREE.BoxGeometry(47,.8,.9),yellow); jib.position.set(-23,32,-12); jib.userData.month=1; crane.add(jib);
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,22,8),yellow); cable.position.set(-8,21,-12); cable.userData.month=1; crane.add(cable);
  temporary.traverse(o => { o.userData.constructionProps=true; if(o.isMesh) o.castShadow=true; });
  const collect = () => {
    temporary.traverse(o => { o.userData.constructionProps = true; });
    objects.length = 0;
    scene.traverse(o => {
      if (!o.isMesh || o.userData.replacedByBlender || o.userData.visualBackdrop) return;
      objects.push({ object: o, month: constructionMonth(o), order: (o.userData.sourceIndex || 0) % 14 / 14, scale: o.scale.clone(), y: o.position.y, visible: o.visible, bakedLight: o.material?.lightMap ? [o.material.lightMapIntensity,o.material.aoMapIntensity] : null });
    });
    roofCompleteAt = Math.max(...objects.filter(item=>item.month===7).map(item=>revealStart(item)+FACTORY_FILM.revealDuration),FACTORY_FILM.gradingDuration);
  };
  const revealStart = item => item.month === 0 ? -10 : FACTORY_FILM.gradingDuration+(item.month-1)*FACTORY_FILM.buildDuration/14+item.order*FACTORY_FILM.staggerDuration;
  const restore = () => { grader.visible=false; terrain.visible = false; temporary.visible = false; for (const item of objects) { item.object.visible = item.object.userData.replacedByBlender ? false : item.visible; item.object.scale.copy(item.scale); item.object.position.y = item.y; if(item.bakedLight){item.object.material.lightMapIntensity=item.bakedLight[0];item.object.material.aoMapIntensity=item.bakedLight[1];} } };
  const display = () => {
    const month = Math.max(1, Math.min(14, Math.floor(pose.month))), milestone = milestones[month-1];
    const grading = elapsed < FACTORY_FILM.gradingDuration;
    label.textContent = grading ? 'ปรับหน้าดิน' : milestone.month;
    focus.textContent = grading ? 'เกลี่ยพื้นที่และเตรียมระดับก่อนเริ่มงานฐานราก' : milestone.focus;
    const flatten = Math.max(0,1-elapsed/FACTORY_FILM.gradingDuration);
    terrain.visible = running && elapsed < FACTORY_FILM.gradingDuration+3*FACTORY_FILM.buildDuration/14;
    if(flatten!==previousFlatten){
      for(let i=0;i<positions.count;i++){const passed=Math.max(0,Math.min(1,((1-flatten)*132-positions.getX(i)-60)/12));positions.setY(i,heights[i]*(1-passed)-.045);}
      positions.needsUpdate=true;terrainGeometry.computeVertexNormals();previousFlatten=flatten;
    }
    grader.visible=running&&grading;
    const gx=-48+(1-flatten)*108, gz=-20;
    const graded=Math.max(0,Math.min(1,((1-flatten)*132-gx-60)/12));
    const rideHeight=(1.8+1.2*Math.sin(gx*.16)*Math.cos(gz*.11)+.5*Math.sin(gx*.53+gz*.21))*(1-graded);
    grader.position.set(gx,rideHeight+.2,gz);
    temporary.visible = running && !grading && elapsed < FACTORY_FILM.gradingDuration+FACTORY_FILM.buildDuration;
    // Construction footings become buried when the finished floor starts;
    // their wider temporary pads must not remain outside the completed walls.
    foundations.visible = temporary.visible && terrain.visible;
    crane.visible = running && !grading && elapsed < roofCompleteAt;
    panel.dataset.roofComplete = String(elapsed >= roofCompleteAt);
    crane.position.z = Math.sin(elapsed*.3)*30;
    progress.style.width = Math.min(100, elapsed / FACTORY_FILM.duration * 100)+'%';
    camera.position.set(pose.x,pose.y,pose.z); camera.lookAt(pose.tx,pose.ty,pose.tz); camera.fov = pose.fov; camera.updateProjectionMatrix();
    for (const item of objects) {
      // Completed-building bakes belong to the finished walk, not future stages.
      if(item.bakedLight){item.object.material.lightMapIntensity=elapsed>=21?item.bakedLight[0]:0;item.object.material.aoMapIntensity=elapsed>=21?item.bakedLight[1]:0;}
      const start = revealStart(item);
      const reveal = Math.max(0, Math.min(1,(elapsed-start)/FACTORY_FILM.revealDuration));
      // The finished apron lies just below the graded soil. Keep it out of both
      // colour and shadow passes until soil removal, avoiding competing surfaces.
      item.object.visible = item.visible && reveal > 0 && !(item.month === 0 && terrain.visible);
      // World-space GLB meshes rise from their base. Original instances scale as one fallback assembly.
      item.object.scale.y = item.scale.y * Math.max(.001, reveal);
      if (item.month >= 7 && item.month <= 9) item.object.position.y = item.y + (1-reveal)*8;
    }
  };
  const finish = () => { running = false; timeline?.kill(); timeline = null; restore(); panel.hidden = true; overlay.classList.remove('is-film'); onFinish(); };
  return {
    start() {
      timeline?.kill(); restore(); collect(); elapsed = 0; running = true;
      panel.hidden = false; overlay.classList.add('is-film');
      Object.assign(pose, {x:-125,y:88,z:-150,tx:-11.525,ty:4,tz:0,fov:45,month:1});
      timeline = gsap.timeline({paused:true});
      timeline.to(pose,{month:14.999,duration:FACTORY_FILM.buildDuration,ease:'none'},FACTORY_FILM.gradingDuration)
        .to(pose,{x:105,y:62,z:-115,duration:12,ease:'power1.inOut'},0)
        .to(pose,{x:80,y:42,z:75,duration:9,ease:'power1.inOut'},12)
        .to(pose,{x:-11.525,y:WAREHOUSE_MOVEMENT.eyeHeight,z:WAREHOUSE_MOVEMENT.spawnZ,tx:-11.525,ty:WAREHOUSE_MOVEMENT.eyeHeight,tz:-50,fov:68,duration:3,ease:'power2.inOut'},21);
      display();
    },
    tick(dt) { if (!running) return; elapsed += Math.max(0,dt); timeline.seek(Math.min(elapsed,FACTORY_FILM.duration)); display(); if (elapsed >= FACTORY_FILM.duration) finish(); },
    skip: finish,
    stop() { running = false; timeline?.kill(); timeline = null; restore(); panel.hidden = true; overlay.classList.remove('is-film'); },
    refresh() { if (running) { restore(); collect(); display(); } },
    get running() { return running; }
  };
}
