import { WAREHOUSE_RENDER } from './warehouse-config.js';

/** Build static opaque geometry and collision data; no input, fullscreen or RAF. */
export function createCompletedWarehouseScene(THREE, renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc4d2d9);
  scene.fog = new THREE.Fog(0xc4d2d9, 190, 420);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.08, 650);
  camera.rotation.order = 'YXZ';
  const hemisphere = new THREE.HemisphereLight(0xe2efff, 0x899078, 0.3);
  scene.add(hemisphere);
  const sun = new THREE.DirectionalLight(0xfff0da, 1.65);
  sun.position.set(-60, 95, -35);
  sun.castShadow = true;
  sun.shadow.mapSize.set(WAREHOUSE_RENDER.shadowMapSize, WAREHOUSE_RENDER.shadowMapSize);
  Object.assign(sun.shadow.camera, { left: -110, right: 110, top: 110, bottom: -110, near: 1, far: 260 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -0.00035;
  sun.shadow.normalBias = 0.12;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xd7e8ff, 0.12);
  fill.position.set(30, 12, 50);
  scene.add(fill);

  const textures = new Set(), materials = new Set(), geometries = new Set();
  const obstacles = [];
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  geometries.add(boxGeometry);
  const dummy = new THREE.Object3D();
  const mat = (color, roughness = 0.75, metalness = 0, extra = {}) => {
    const value = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    materials.add(value); return value;
  };
  const texture = (kind) => {
    const surface = document.createElement('canvas'); surface.width = surface.height = 256;
    const ctx = surface.getContext('2d');
    let seed = 18473;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    ctx.fillStyle = kind === 'concrete' ? '#c1c0b8' : '#c8d1d4'; ctx.fillRect(0, 0, 256, 256);
    if (kind === 'concrete') {
      for (let i = 0; i < 11000; i++) {
        const c = 130 + Math.floor(random() * 95); ctx.fillStyle = `rgba(${c},${c},${c},0.18)`;
        ctx.fillRect(random() * 256, random() * 256, 1 + random() * 2, 1 + random() * 2);
      }
    } else {
      for (let x = 0; x < 256; x += 16) {
        const gradient = ctx.createLinearGradient(x, 0, x + 16, 0);
        gradient.addColorStop(0, '#9ca9ad'); gradient.addColorStop(0.4, '#d2dadd'); gradient.addColorStop(1, '#aab7bc');
        ctx.fillStyle = gradient; ctx.fillRect(x, 0, 16, 256);
      }
    }
    const t = new THREE.CanvasTexture(surface); t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(kind === 'concrete' ? 12 : 5, kind === 'concrete' ? 24 : 1);
    t.encoding = THREE.sRGBEncoding; t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    textures.add(t); return t;
  };
  const concrete = mat(0xd7d4c8, 0.93, 0, { map: texture('concrete') });
  const wall = mat(0xd6d1c3, 0.94);
  const cladding = mat(0xdce2e3, 0.72, 0.18, { map: texture('metal') });
  const roof = mat(0xb7c6ca, 0.65, 0.25, { side: THREE.DoubleSide });
  const steel = mat(0x66787e, 0.5, 0.42);
  const steelDark = mat(0x34484f, 0.6, 0.35);
  const yellow = mat(0xe5aa23, 0.58, 0.18);
  const white = mat(0xecece3, 0.8);
  const black = mat(0x293234, 0.85);
  const green = mat(0x547969, 0.9);
  const blue = mat(0x476e83, 0.55, 0.2);
  const timber = mat(0xaa8560, 0.98);
  const lamp = mat(0xf4f1d7, 0.5, 0, { emissive: 0xffedbf, emissiveIntensity: 0.8 });
  const apron = mat(0xb2b1a8, 0.98);
  const landscape = mat(0x7f9079, 1);
  const joint = mat(0x8e938e, 1);
  const box = (w, h, d, x, y, z, material, collision = false, shadow = true) => {
    const mesh = new THREE.Mesh(boxGeometry, material); mesh.scale.set(w, h, d); mesh.position.set(x, y, z);
    mesh.castShadow = shadow; mesh.receiveShadow = true; scene.add(mesh);
    if (collision) obstacles.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
    return mesh;
  };
  const instances = (items, material, shadow = true) => {
    if (!items.length) return;
    const mesh = new THREE.InstancedMesh(boxGeometry, material, items.length);
    items.forEach((a, i) => {
      dummy.position.set(a[3], a[4], a[5]); dummy.scale.set(a[0], a[1], a[2]); dummy.rotation.set(0, 0, a[6] || 0);
      dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.castShadow = shadow; mesh.receiveShadow = true; scene.add(mesh); return mesh;
  };
  const sign = (text, w, h, x, y, z, rotation = 0, bg = '#213c43', fg = '#f1f2e8') => {
    const surface = document.createElement('canvas'); surface.width = 2048; surface.height = 512;
    const ctx = surface.getContext('2d'); ctx.fillStyle = bg; ctx.fillRect(0, 0, 2048, 512);
    ctx.strokeStyle = fg; ctx.lineWidth = 12; ctx.strokeRect(32, 32, 1984, 448);
    ctx.font = 'bold 144px Kanit, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = fg; ctx.fillText(text, 1024, 264, 1880);
    const t = new THREE.CanvasTexture(surface); t.encoding = THREE.sRGBEncoding; textures.add(t);
    const m = new THREE.MeshBasicMaterial({ map: t }); materials.add(m);
    const g = new THREE.PlaneGeometry(w, h); geometries.add(g);
    const mesh = new THREE.Mesh(g, m); mesh.position.set(x, y, z); mesh.rotation.y = rotation; scene.add(mesh);
  };
  // Same documented footprint, T6/T7 levels and roof monitor as the original slide.
  const left = -34.025, division = 10.975, right = 34.025, halfLength = 77.45, mid = -11.525;
  box(120, 0.25, 215, 0, -0.4, 0, landscape, false, false);
  box(94, 0.22, 188, 0, -0.19, 0, apron, false, false);
  box(68.05, 0.25, 154.9, 0, -0.125, 0, concrete, false, false);
  // Walls are separate solids; north/south 6m entrances are genuinely open.
  for (const x of [left, right]) {
    const height = x === left ? 11.4 : 9.3;
    box(0.26, 4.25, 154.9, x, 2.125, 0, wall, true);
    box(0.22, height - 4.25, 154.9, x, (height + 4.25) / 2, 0, cladding);
  }
  for (const z of [-halfLength, halfLength]) {
    const doorLeft = mid - 3, doorRight = mid + 3;
    for (const [a, b] of [[left, doorLeft], [doorRight, right]]) {
      box(b - a, 4.25, 0.28, (a + b) / 2, 2.125, z, wall, true);
      box(b - a, 5.05, 0.24, (a + b) / 2, 6.775, z, cladding);
    }
    box(6, 4.3, 0.25, mid, 7.15, z, cladding);
    box(6.5, 0.55, 0.55, mid, 5.15, z, steelDark);
    sign('FACTORY  /  T6 + T7', 12, 2.1, mid, 7.2, z + Math.sign(z) * 0.18, z < 0 ? Math.PI : 0);
    sign('ทางเข้า  •  ENTRANCE', 5.6, 0.6, mid, 4.5, z + Math.sign(z) * 0.24, z < 0 ? Math.PI : 0);
    sign('ทางออก  •  EXIT', 5.6, 0.6, mid, 4.5, z - Math.sign(z) * 0.24, z < 0 ? 0 : Math.PI);
  }
  const columns = [], frames = [], purlins = [], lights = [], housings = [];
  const rafters = (ax, ay, bx, by, z) => {
    const dx = bx - ax, dy = by - ay;
    frames.push([Math.hypot(dx, dy), 0.5, 0.26, (ax + bx) / 2, (ay + by) / 2, z, Math.atan2(dy, dx)]);
  };
  for (let i = 0; i < 14; i++) {
    const z = -halfLength + i * 154.9 / 13;
    for (const [x, height] of [[left + 0.45, 11.4], [division, 11.4], [right - 0.45, 9.3]]) {
      columns.push([0.62, height, 0.62, x, height / 2, z]);
      box(1.2, 0.22, 1.2, x, 0.11, z, wall, true, false);
    }
    rafters(left, 11.4, mid, 15.08, z); rafters(mid, 15.08, division, 11.4, z);
    rafters(division, 11.4, right, 9.3, z);
    for (const x of [-24, 0, 23]) {
      lights.push([1.5, 0.08, 0.65, x, 8.7, z]); housings.push([1.7, 0.18, 0.8, x, 8.85, z]);
      frames.push([0.035, 1.2, 0.035, x, 9.5, z]);
    }
  }
  instances(columns, steel); instances(frames, steelDark); instances(lights, lamp, false); instances(housings, steel, false);
  const roofPanel = (ax, ay, bx, by) => {
    const dx = bx - ax, dy = by - ay;
    const panel = box(Math.hypot(dx, dy), 0.13, 156, (ax + bx) / 2, (ay + by) / 2 + 0.1, 0, roof);
    panel.rotation.z = Math.atan2(dy, dx);
    for (let f = 0.08; f < 1; f += 0.14) purlins.push([0.15, 0.2, 154.9, ax + dx * f, ay + dy * f - 0.2, 0]);
  };
  roofPanel(left - 0.7, 11.3, mid - 0.8, 14.95);
  roofPanel(mid + 0.8, 14.95, division, 11.4);
  roofPanel(division, 11.4, right + 0.7, 9.23);
  instances(purlins, steel, false);
  // Gable triangles close the shell above the rectangular wall panels.
  for (const z of [-halfLength, halfLength]) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([
      left, 9.3, z, division, 9.3, z, mid, 15.08, z,
      left, 9.3, z, mid, 15.08, z, left, 11.4, z,
      division, 9.3, z, right, 9.3, z, division, 11.4, z,
      division, 9.3, z, mid, 15.08, z, division, 11.4, z
    ], 3)); g.computeVertexNormals(); geometries.add(g);
    const m = mat(0xc0cccf, 0.8, 0.15, { side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(g, m); mesh.castShadow = true; scene.add(mesh);
  }
  box(6, 0.16, 140, mid, 16.62, 0, roof);
  const louvers = [];
  for (const x of [mid - 2.8, mid + 2.8]) for (let y = 15.2; y < 16.6; y += 0.25) louvers.push([0.14, 0.1, 140, x, y, 0]);
  instances(louvers, steel, false);
  // Crane rails, bridge, trolley and unloaded hook.
  for (const x of [left + 1, division - 1]) box(0.35, 0.5, 150, x, 8.25, 0, steelDark);
  box(43, 0.75, 1.25, mid, 8.55, 18, yellow);
  box(2.8, 0.7, 2.1, -7, 9.2, 18, steelDark);
  box(0.055, 3.3, 0.055, -7, 6.5, 18, black, false, false);
  box(0.35, 0.5, 0.25, -7, 4.6, 18, yellow, false, false);
  sign('OVERHEAD CRANE', 8, 0.7, mid, 8.55, 17.35, Math.PI, '#dfa720', '#25333a');
  // Floor joints and safe pedestrian lane. Repeated detail is instanced.
  const joints = [], stripes = [], dashes = [];
  for (let z = -72; z < 77; z += 6) joints.push([68, 0.003, 0.025, 0, 0.006, z]);
  for (let x = -30; x < 34; x += 6) joints.push([0.025, 0.003, 154.8, x, 0.006, 0]);
  instances(joints, joint, false);
  box(3.1, 0.008, 154.7, mid, 0.012, 0, green, false, false);
  for (const x of [mid - 1.6, mid + 1.6]) stripes.push([0.1, 0.012, 154.8, x, 0.021, 0]);
  for (let z = -74; z < 75; z += 5) dashes.push([0.12, 0.008, 2, mid, 0.023, z]);
  instances(stripes, yellow, false); instances(dashes, white, false);
  // Covered equipment pits, protected by guard rails; centre walking lane stays clear.
  const railParts = [];
  const pitLocations = [[-23, 4, 9, 12, 'SBA'], [-24, -30, 8, 10, 'WEQ'], [-23, -55, 9, 12, 'PU'], [-23, 52, 9, 12, 'SHOT BLAST']];
  for (const [x, z, w, d, label] of pitLocations) {
    box(w, 0.08, d, x, 0.05, z, steelDark, true, false);
    box(w - 0.5, 0.06, d - 0.5, x, 0.11, z, steel, false, false);
    for (const endX of [x - w / 2, x + w / 2]) {
      for (const y of [0.6, 1.1]) railParts.push([0.06, 0.06, d, endX, y, z]);
      for (const endZ of [z - d / 2, z + d / 2]) railParts.push([0.09, 1.15, 0.09, endX, 0.575, endZ]);
    }
    for (const endZ of [z - d / 2, z + d / 2]) for (const y of [0.6, 1.1]) railParts.push([w, 0.06, 0.06, x, y, endZ]);
    sign(label + '  /  EQUIPMENT ZONE', 5, 0.7, x, 1.4, z - d / 2 - 0.05, Math.PI);
  }
  instances(railParts, yellow, false);
  // Invented fit-out: modest racks, pallets, control cabinets and service benches.
  const rackParts = [], pallets = [], cartons = [];
  for (let i = 0; i < 8; i++) {
    const z = -57 + i * 16, x = 30;
    obstacles.push({ minX: 27.7, maxX: 32.3, minZ: z - 3, maxZ: z + 3 });
    for (const xx of [x - 2.1, x + 2.1]) for (const zz of [z - 2.6, z + 2.6]) rackParts.push([0.13, 4.7, 0.13, xx, 2.35, zz]);
    for (const y of [0.2, 1.7, 3.2]) {
      rackParts.push([4.5, 0.16, 5.6, x, y, z]);
      pallets.push([1.6, 0.13, 1.3, x, y + 0.17, z]);
      cartons.push([1.45, 0.8, 1.2, x, y + 0.63, z]);
    }
  }
  instances(rackParts, blue); instances(pallets, timber, false); instances(cartons, wall, false);
  for (let i = 0; i < 6; i++) {
    const z = -52 + i * 20;
    box(1.1, 2.1, 0.55, 11.9, 1.05, z, white, true);
    box(0.65, 0.45, 0.025, 11.9, 1.5, z - 0.29, black, false, false);
    box(0.08, 0.08, 0.03, 11.65, 1.12, z - 0.31, green, false, false);
    box(0.08, 0.08, 0.03, 11.95, 1.12, z - 0.31, yellow, false, false);
  }
  for (const z of [-36, 36]) {
    box(3.4, 0.12, 1.1, 19, 0.95, z, timber, true);
    for (const x of [17.5, 20.5]) box(0.12, 0.9, 1, x, 0.45, z, steelDark, false, false);
  }
  sign('T6  /  PRODUCTION HALL', 9, 1, -24, 3.5, -76.9);
  sign('T7  /  SERVICE & STORAGE', 9, 1, 23, 3.5, -76.9);
  sign('KEEP WALKWAY CLEAR', 5.2, 0.65, mid, 3.8, 76.9, Math.PI, '#d7ad3b', '#28363b');

  return { scene, camera, textures, materials, geometries, obstacles, left, halfLength, mid, pitLocations };
}
