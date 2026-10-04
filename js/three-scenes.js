import { enhanceEngineeringMaterials } from './factory-assets.js';
import { disposeSceneResources } from './scene-resources.js';

/**
 * Three.js 3D Interactive Construction Visualizers
 * Scenes:
 * 1. Warehouse Digital Twin (Slide 2)
 * 2. Pile Driving & Substructure (Slide 14)
 * 3. Cellular Beam Assembly & Corbel (Slide 15)
 * 4. Super Flat Floor Stratigraphy (Slide 16)
 */

// Helper to setup basic interactive Orbiting
function setupThreeScene(canvasId, createObjectsFn) {
  let canvas = document.getElementById(canvasId);
  if (!canvas || !window.THREE) return null;

  // Replace canvas with fresh clean clone to guarantee a pristine WebGL context
  // and clear any previous event listeners or lost context states
  const freshCanvas = canvas.cloneNode(false);
  canvas.parentNode.replaceChild(freshCanvas, canvas);
  canvas = freshCanvas;

  const THREE = window.THREE;
  const width = canvas.clientWidth || (canvas.parentElement ? canvas.parentElement.clientWidth : 600) || 600;
  const height = canvas.clientHeight || (canvas.parentElement ? canvas.parentElement.clientHeight : 360) || 360;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    console.error('Failed to create WebGLRenderer on ' + canvasId, err);
    return null;
  }

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0); // Always transparent background

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(25, 20, 30);
  camera.lookAt(0, 0, 0);

  // Lighting: Balanced neutral white illumination to prevent color distortion during 360-degree rotation
  const ambientLight = new THREE.HemisphereLight(0xe1efff, 0x444038, 0.6);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffedd7, 1.65);
  dirLight1.position.set(25, 45, 25);
  dirLight1.castShadow = true;
  dirLight1.shadow.mapSize.set(2048,2048);
  Object.assign(dirLight1.shadow.camera,{left:-60,right:60,top:60,bottom:-60,near:1,far:180});
  dirLight1.shadow.normalBias = .06; dirLight1.shadow.bias = -.0001;
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xcbdfff, 0.55);
  dirLight2.position.set(-25, 20, -25);
  scene.add(dirLight2);

  // Camera light follows viewing angle so rotating objects maintain identical illumination
  const camLight = new THREE.DirectionalLight(0xcbdfff, 0.55);
  camLight.position.set(0, 5, 20);
  camera.add(camLight);
  scene.add(camera);

  const group = new THREE.Group();
  scene.add(group);

  // Create custom objects
  const customAnim = createObjectsFn(THREE, group, scene, camera);
  const finishResources = enhanceEngineeringMaterials(THREE, group, scene, renderer, document);

  // Simple Mouse Drag Orbit Controls
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let autoRotate = true;

  const onMouseDown = (e) => {
    isDragging = true;
    autoRotate = false;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  };

  const onMouseUp = () => { isDragging = false; };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;

    group.rotation.y += deltaX * 0.008;
    group.rotation.x += deltaY * 0.008;
  };

  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('mousemove', onMouseMove);

  // Touch Support
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      autoRotate = false;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    }
  };

  const onTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - prevMouseX;
    const deltaY = e.touches[0].clientY - prevMouseY;
    prevMouseX = e.touches[0].clientX;
    prevMouseY = e.touches[0].clientY;

    group.rotation.y += deltaX * 0.01;
    group.rotation.x += deltaY * 0.01;
  };

  const onTouchEnd = () => { isDragging = false; };

  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchmove', onTouchMove, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd, { passive: true });

  // Resize Listener
  const onResize = () => {
    if (!canvas || !canvas.parentElement) return;
    const w = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight || 360;
    if (w > 0 && h > 0) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
  };
  window.addEventListener('resize', onResize);

  let animationFrameId;
  let isRunning = true;
  let animationTime = 0, lastFrame = 0, animationRemainder = 0;
  function animate(now = 0) {
    if (!isRunning) return;
    animationFrameId = requestAnimationFrame(animate);
    if (document.hidden) { lastFrame = 0; return; }
    const dt = lastFrame ? Math.min(.1,Math.max(0,(now-lastFrame)/1000)) : 1/60;
    lastFrame = now;
    if (autoRotate) group.rotation.y += dt*.18;
    if (customAnim && typeof customAnim === 'function') {
      animationRemainder += dt;
      while (animationRemainder >= 1/60) {
        animationRemainder -= 1/60; animationTime += 1/60; customAnim(animationTime);
      }
    }
    renderer.render(scene, camera);
  }
  animate();

  return {
    destroy: () => {
      if (!isRunning) return;
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);

      try {
        disposeSceneResources(scene, finishResources);
        renderer.dispose();
      } catch (err) {
        console.warn('Error disposing 3D scene:', err);
      }
    },
    reset: () => {
      group.rotation.set(0, 0, 0);
      autoRotate = true;
    }
  };
}

// 1. Warehouse 3D Digital Twin: Bangkok Roller T6-T7 (Slide 2)
// True dimensions from Bangkok Roller.pdf:
// Total Footprint: Width 68.05 m x Length 154.90 m = 10,540.95 sq.m.
// Bay T6: Span 45.00 m (Grid A to G) • Eave +11.40 m • Ridge +15.08 m • Roof Monitor Peak +16.68 m
// Bay T7: Span 23.05 m (Grid G to J) • Eave +9.30 m • Connected Peak +11.40 m at Grid G
export function initWarehouse3D(canvasId) {
  return setupThreeScene(canvasId, (THREE, group, scene, camera) => {
    // Set optimal dramatic isometric camera framing for 155m long factory
    camera.position.set(26, 19, 28);
    camera.lookAt(0, 1.2, 0);

    // Coordinate scale: 1 unit = 4.5 meters
    // Width X = 15.12 units (T6: 10.0 units from -7.56 to +2.44, T7: 5.12 units from +2.44 to +7.56)
    // Length Z = 34.42 units (from z = -17.21 to +17.21, Grid 1 to 26)
    const T6_X_START = -7.56;
    const T6_X_END = 2.44;
    const T6_X_MID = -2.56;
    const T7_X_END = 7.56;
    const Z_START = -17.21;
    const Z_END = 17.21;
    const Z_LEN = Z_END - Z_START;

    // Heights (scaled from PDF levels):
    const Y_FLOOR = 0.08;       // +0.50m / +0.80m
    const Y_WALL_BLOCK = 0.94;  // +4.25m Concrete Block Wall
    const Y_T7_EAVE = 2.07;     // +9.30m Eave level T7 (Grid J)
    const Y_T6_EAVE = 2.53;     // +11.40m Eave level T6 & Ridge level T7 (Grid G)
    const Y_T6_RIDGE = 3.35;    // +15.08m Peak Roof Ridge T6 (x = -2.56)
    const Y_MONITOR_TOP = 3.71; // +16.68m Roof Monitor Peak ("หอนก")

    // Materials Palette (stable color tone at all 360-degree angles)
    const cyanWireMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, linewidth: 2 });
    const skyWireMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
    const amberWireMat = new THREE.LineBasicMaterial({ color: 0xf59e0b });
    const emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.6,
      metalness: 0.05
    });
    const envelopeT6Mat = new THREE.MeshStandardMaterial({
      color: 0x0a192f,
      roughness: 0.9,
      metalness: 0.0,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });
    const envelopeT7Mat = new THREE.MeshStandardMaterial({
      color: 0x0a192f,
      roughness: 0.9,
      metalness: 0.0,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });
    const blockWallMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.0,
      transparent: true,
      opacity: 0.40,
      depthWrite: false
    });
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.5,
      metalness: 0.15
    });
    const craneMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.45,
      metalness: 0.15
    });
    const louverMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.6,
      metalness: 0.1
    });

    // 1. Site Infrastructure Ground & Perimeter Road (+0.30m)
    const groundGrid = new THREE.GridHelper(52, 26, 0x00e5ff, 0x1e293b);
    groundGrid.position.y = -0.05;
    group.add(groundGrid);

    // Perimeter Road (ถนน ค.ส.ล. กว้างรอบอาคาร)
    const roadGeo = new THREE.BoxGeometry(20.5, 0.04, 39.5);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(0, -0.03, 0);
    group.add(road);

    // Entrance Concrete Ramps (ทางลาด ค.ส.ล. ตามแบบ A601/A602)
    const rampNorthGeo = new THREE.BoxGeometry(4.5, 0.08, 2.2);
    const rampNorth = new THREE.Mesh(rampNorthGeo, steelMat);
    rampNorth.rotation.x = -0.06;
    rampNorth.position.set(-2.56, 0.02, Z_START - 1.0);
    group.add(rampNorth);

    const rampSouthGeo = new THREE.BoxGeometry(4.5, 0.08, 2.2);
    const rampSouth = new THREE.Mesh(rampSouthGeo, steelMat);
    rampSouth.rotation.x = 0.06;
    rampSouth.position.set(-2.56, 0.02, Z_END + 1.0);
    group.add(rampSouth);

    // 2. Factory Floor Slab: 250mm Super Flat FS with Floor Hardener (แบบ S103)
    const floorGeo = new THREE.BoxGeometry(15.12, 0.12, Z_LEN);
    const floor = new THREE.Mesh(floorGeo, emeraldMat);
    floor.position.set(0, Y_FLOOR / 2, 0);
    group.add(floor);

    const floorEdges = new THREE.LineSegments(new THREE.EdgesGeometry(floorGeo), new THREE.LineBasicMaterial({ color: 0x10b981 }));
    floorEdges.position.copy(floor.position);
    group.add(floorEdges);

    // 3. Special Equipment Pits & Underground Infrastructure (แบบ S104, S501, S502, S503)
    // (a) บ่อบำบัด SBA (SBA Pit, Grids 12–15)
    const sbaGeo = new THREE.BoxGeometry(3.2, 0.28, 4.4);
    const sbaMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const sbaPit = new THREE.Mesh(sbaGeo, sbaMat);
    sbaPit.position.set(-3.2, 0.06, 0.8);
    group.add(sbaPit);
    const sbaWire = new THREE.LineSegments(new THREE.EdgesGeometry(sbaGeo), cyanWireMat);
    sbaWire.position.copy(sbaPit.position);
    group.add(sbaWire);

    // (b) บ่อ WEQ (WEQ Equalization Pit, Grids 6–9)
    const weqGeo = new THREE.BoxGeometry(2.8, 0.24, 3.8);
    const weqMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.4 });
    const weqPit = new THREE.Mesh(weqGeo, weqMat);
    weqPit.position.set(-3.8, 0.06, -7.0);
    group.add(weqPit);

    // (c) หลุมตู้อบ PU (PU Curing Oven Pit, Grids 2–4)
    const puGeo = new THREE.BoxGeometry(3.2, 0.22, 4.8);
    const puMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
    const puPit = new THREE.Mesh(puGeo, puMat);
    puPit.position.set(-3.5, 0.05, -12.6);
    group.add(puPit);
    const puWire = new THREE.LineSegments(new THREE.EdgesGeometry(puGeo), amberWireMat);
    puWire.position.copy(puPit.position);
    group.add(puWire);

    // (d) หลุมช็อตบาสและหม้อนึ่ง (Shot Blast & Autoclave Pit, Grids 21–24)
    const shotGeo = new THREE.BoxGeometry(2.9, 0.25, 4.6);
    const shotMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 });
    const shotPit = new THREE.Mesh(shotGeo, shotMat);
    shotPit.position.set(-3.0, 0.05, 11.5);
    group.add(shotPit);

    // (e) Dual Equipment Rails (รางเลื่อนเครื่องจักรภายในโรงงานยาว 150 ม.)
    const railMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
    for (let rx of [-1.2, -4.9]) {
      const railGeo = new THREE.BoxGeometry(0.08, 0.06, 31.0);
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(rx, Y_FLOOR + 0.03, 0);
      group.add(rail);
    }

    // 4. Portal Frames & Columns (26 Structural Gridlines, แบบ S101, S105, S106, S107, S108)
    const BENT_COUNT = 14;
    for (let i = 0; i < BENT_COUNT; i++) {
      const z = Z_START + (i / (BENT_COUNT - 1)) * Z_LEN;

      // Column A (Outer West Line, x = -7.56)
      // Concrete Pedestal + Steel H-Column to Eave (+11.40m)
      const colAGeo = new THREE.BoxGeometry(0.3, Y_T6_EAVE, 0.3);
      const colA = new THREE.Mesh(colAGeo, steelMat);
      colA.position.set(T6_X_START, Y_T6_EAVE / 2, z);
      group.add(colA);

      // Column G (Center Shared Line between T6 & T7, x = +2.44)
      const colGGeo = new THREE.BoxGeometry(0.38, Y_T6_EAVE, 0.38);
      const colG = new THREE.Mesh(colGGeo, steelMat);
      colG.position.set(T6_X_END, Y_T6_EAVE / 2, z);
      group.add(colG);

      // Column J (Outer East Line of T7, x = +7.56)
      const colJGeo = new THREE.BoxGeometry(0.28, Y_T7_EAVE, 0.28);
      const colJ = new THREE.Mesh(colJGeo, steelMat);
      colJ.position.set(T7_X_END, Y_T7_EAVE / 2, z);
      group.add(colJ);

      // Crane Runway Corbel Bracket (หูช้าง) on Col A and Col G at +8.0m (y ~ 1.78)
      const corbelGeo = new THREE.BoxGeometry(0.4, 0.18, 0.3);
      const corbelA = new THREE.Mesh(corbelGeo, steelMat);
      corbelA.position.set(T6_X_START + 0.2, 1.78, z);
      group.add(corbelA);

      const corbelG = new THREE.Mesh(corbelGeo, steelMat);
      corbelG.position.set(T6_X_END - 0.2, 1.78, z);
      group.add(corbelG);

      // T6 Cellular Beam Rafter (CSB1 - 45m span double pitch)
      // Left slope: (T6_X_START, Y_T6_EAVE) -> (T6_X_MID, Y_T6_RIDGE)
      const rafterLeftGeo = new THREE.BoxGeometry(5.08, 0.18, 0.2);
      const rafterLeft = new THREE.Mesh(rafterLeftGeo, steelMat);
      rafterLeft.rotation.z = Math.atan2(Y_T6_RIDGE - Y_T6_EAVE, T6_X_MID - T6_X_START);
      rafterLeft.position.set((T6_X_START + T6_X_MID) / 2, (Y_T6_EAVE + Y_T6_RIDGE) / 2, z);
      group.add(rafterLeft);

      // Right slope: (T6_X_MID, Y_T6_RIDGE) -> (T6_X_END, Y_T6_EAVE)
      const rafterRightGeo = new THREE.BoxGeometry(5.08, 0.18, 0.2);
      const rafterRight = new THREE.Mesh(rafterRightGeo, steelMat);
      rafterRight.rotation.z = Math.atan2(Y_T6_EAVE - Y_T6_RIDGE, T6_X_END - T6_X_MID);
      rafterRight.position.set((T6_X_MID + T6_X_END) / 2, (Y_T6_RIDGE + Y_T6_EAVE) / 2, z);
      group.add(rafterRight);

      // T7 Cellular Beam Rafter (CSB2/3 - 23m span slope from Grid G to J)
      const rafterT7Geo = new THREE.BoxGeometry(5.14, 0.16, 0.18);
      const rafterT7 = new THREE.Mesh(rafterT7Geo, steelMat);
      rafterT7.rotation.z = Math.atan2(Y_T7_EAVE - Y_T6_EAVE, T7_X_END - T6_X_END);
      rafterT7.position.set((T6_X_END + T7_X_END) / 2, (Y_T6_EAVE + Y_T7_EAVE) / 2, z);
      group.add(rafterT7);

      // Cellular web opening perforations (rings)
      for (let r = 1; r <= 3; r++) {
        const ringGeo = new THREE.RingGeometry(0.04, 0.07, 8);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(T6_X_START + r * 1.2, (Y_T6_EAVE + Y_T6_RIDGE) / 2, z);
        group.add(ring);
      }
    }

    // 5. Overhead Travelling Crane (เครนสะพาน 10 ตัน) in T6 Bay
    const craneBeamGeo = new THREE.BoxGeometry(9.8, 0.28, 0.5);
    const craneBridge = new THREE.Mesh(craneBeamGeo, craneMat);
    craneBridge.position.set(T6_X_MID, 1.95, 2.0);
    group.add(craneBridge);

    const hoistTrolleyGeo = new THREE.BoxGeometry(0.7, 0.35, 0.6);
    const hoistTrolley = new THREE.Mesh(hoistTrolleyGeo, steelMat);
    hoistTrolley.position.set(T6_X_MID, 2.15, 2.0);
    group.add(hoistTrolley);

    // Longitudinal Crane Runway Girders (ทางวิ่งเครนยาวตลอด 155 ม.)
    const craneRunwayGeo = new THREE.BoxGeometry(0.18, 0.24, 32.5);
    const craneRunwayA = new THREE.Mesh(craneRunwayGeo, craneMat);
    craneRunwayA.position.set(T6_X_START + 0.35, 1.88, 0);
    group.add(craneRunwayA);

    const craneRunwayG = new THREE.Mesh(craneRunwayGeo, craneMat);
    craneRunwayG.position.set(T6_X_END - 0.35, 1.88, 0);
    group.add(craneRunwayG);

    // 6. THE SIGNATURE ROOF MONITOR ("หอนก" / Louvered Ridge Penthouse at +16.68m)
    // Sits atop the central ridge of T6 (x = -2.56, width 1.4m, length 31m)
    const monitorWidth = 1.35;
    const monitorLen = 31.0;
    const monitorHeight = Y_MONITOR_TOP - Y_T6_RIDGE; // ~ 0.36 units

    // Monitor frame box
    const monitorGeo = new THREE.BoxGeometry(monitorWidth, monitorHeight, monitorLen);
    const monitorMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.40,
      roughness: 0.4,
      depthWrite: false
    });
    const monitor = new THREE.Mesh(monitorGeo, monitorMat);
    monitor.position.set(T6_X_MID, Y_T6_RIDGE + monitorHeight / 2, 0);
    group.add(monitor);

    const monitorWire = new THREE.LineSegments(new THREE.EdgesGeometry(monitorGeo), cyanWireMat);
    monitorWire.position.copy(monitor.position);
    group.add(monitorWire);

    // Louver blades on sides of Roof Monitor (Louvremax 470)
    for (let lz = -14.5; lz <= 14.5; lz += 2.5) {
      for (let ly of [Y_T6_RIDGE + 0.08, Y_T6_RIDGE + 0.18, Y_T6_RIDGE + 0.28]) {
        const louverGeo = new THREE.BoxGeometry(0.08, 0.04, 2.2);
        const louverL = new THREE.Mesh(louverGeo, louverMat);
        louverL.position.set(T6_X_MID - monitorWidth / 2, ly, lz);
        group.add(louverL);

        const louverR = new THREE.Mesh(louverGeo, louverMat);
        louverR.position.set(T6_X_MID + monitorWidth / 2, ly, lz);
        group.add(louverR);
      }
    }

    // Monitor Pitched Cap Roof
    const capShape = new THREE.Shape();
    capShape.moveTo(-monitorWidth / 2 - 0.15, Y_MONITOR_TOP);
    capShape.lineTo(0, Y_MONITOR_TOP + 0.14);
    capShape.lineTo(monitorWidth / 2 + 0.15, Y_MONITOR_TOP);
    capShape.lineTo(-monitorWidth / 2 - 0.15, Y_MONITOR_TOP);
    const capGeo = new THREE.ExtrudeGeometry(capShape, { depth: monitorLen, bevelEnabled: false });
    capGeo.center();
    const capMesh = new THREE.Mesh(capGeo, steelMat);
    capMesh.position.set(T6_X_MID, Y_MONITOR_TOP + 0.07, 0);
    group.add(capMesh);

    const capWire = new THREE.LineSegments(new THREE.EdgesGeometry(capGeo), skyWireMat);
    capWire.position.copy(capMesh.position);
    group.add(capWire);

    // 7. Architectural Building Envelopes (T6 & T7 Translucent Volumes)
    // T6 Main Bay Envelope
    const t6BodyGeo = new THREE.BoxGeometry(10.0, Y_T6_EAVE, Z_LEN);
    const t6Body = new THREE.Mesh(t6BodyGeo, envelopeT6Mat);
    t6Body.position.set(T6_X_MID, Y_T6_EAVE / 2, 0);
    group.add(t6Body);

    const t6Wire = new THREE.LineSegments(new THREE.EdgesGeometry(t6BodyGeo), skyWireMat);
    t6Wire.position.copy(t6Body.position);
    group.add(t6Wire);

    // T7 Adjoining Bay Envelope
    const t7BodyGeo = new THREE.BoxGeometry(5.12, Y_T7_EAVE, Z_LEN);
    const t7Body = new THREE.Mesh(t7BodyGeo, envelopeT7Mat);
    t7Body.position.set((T6_X_END + T7_X_END) / 2, Y_T7_EAVE / 2, 0);
    group.add(t7Body);

    const t7Wire = new THREE.LineSegments(new THREE.EdgesGeometry(t7BodyGeo), cyanWireMat);
    t7Wire.position.copy(t7Body.position);
    group.add(t7Wire);

    // Lower Concrete Block Perimeter Wall (0 to +4.25m, y = 0.94)
    const blockWallGeo = new THREE.BoxGeometry(15.16, Y_WALL_BLOCK, Z_LEN + 0.04);
    const blockWall = new THREE.Mesh(blockWallGeo, blockWallMat);
    blockWall.position.set(0, Y_WALL_BLOCK / 2, 0);
    group.add(blockWall);

    // Main Roll-up Shutter Doors D1 (6.0 x 5.0m) on Gable Ends
    const doorGeo = new THREE.BoxGeometry(1.4, 1.15, 0.15);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.2 });
    const doorNorth = new THREE.Mesh(doorGeo, doorMat);
    doorNorth.position.set(T6_X_MID, 0.65, Z_START);
    group.add(doorNorth);

    const doorSouth = new THREE.Mesh(doorGeo, doorMat);
    doorSouth.position.set(T6_X_MID, 0.65, Z_END);
    group.add(doorSouth);

    // 8. Rising Airflow Particles from Roof Monitor ("หอนก")
    const particleCount = 25;
    const particles = [];
    const pGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const pMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let p = 0; p < particleCount; p++) {
      const part = new THREE.Mesh(pGeo, pMat);
      part.userData = {
        x: T6_X_MID + (Math.random() - 0.5) * 1.1,
        z: Z_START + 2 + Math.random() * (Z_LEN - 4),
        speed: 0.015 + Math.random() * 0.02,
        prog: Math.random()
      };
      group.add(part);
      particles.push(part);
    }

    return () => {
      // Animate rising thermal airflow particles from Roof Monitor
      particles.forEach(p => {
        p.userData.prog += p.userData.speed;
        if (p.userData.prog > 1) p.userData.prog = 0;
        p.position.set(
          p.userData.x + Math.sin(p.userData.prog * 5) * 0.15,
          Y_MONITOR_TOP + p.userData.prog * 1.5,
          p.userData.z
        );
      });
    };
  });
}

// 2. Pile Driving & Substructure (Slide 14)
export function initPileDriving3D(canvasId) {
  return setupThreeScene(canvasId, (THREE, group) => {
    // Soil Stratum Ground
    const groundGeo = new THREE.BoxGeometry(24, 6, 24);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      transparent: true,
      opacity: 0.6
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -3;
    group.add(ground);

    const grid = new THREE.GridHelper(24, 12, 0xf59e0b, 0x334155);
    group.add(grid);

    // I-300 Pile (Precast concrete pile shape)
    const pileGeo = new THREE.BoxGeometry(1.2, 14, 1.2);
    const pileMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
    const pile = new THREE.Mesh(pileGeo, pileMat);
    pile.position.set(0, 1, 0);
    group.add(pile);

    // Drop Hammer Rig Structure
    const hammerGeo = new THREE.BoxGeometry(2.5, 3.5, 2.5);
    const hammerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
    const hammer = new THREE.Mesh(hammerGeo, hammerMat);
    hammer.position.set(0, 9.5, 0);
    group.add(hammer);

    // Guide Mast lines
    const mastGeo = new THREE.CylinderGeometry(0.15, 0.15, 18, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const mast1 = new THREE.Mesh(mastGeo, mastMat);
    mast1.position.set(-1.8, 5, 0);
    const mast2 = new THREE.Mesh(mastGeo, mastMat);
    mast2.position.set(1.8, 5, 0);
    group.add(mast1);
    group.add(mast2);
    return time => {
      const phase = time % 3;
      hammer.position.y = 9.5 + (phase < 2 ? phase/2*2.4 : (1-(phase-2)*1)*2.4);
      if (phase > 2.8) hammer.position.y = 9.5;
      pile.position.y = 1-Math.min(1,time/15)*2;
    };
  });
}

// 3. Structural Steel Cellular Beam SM520 (Slide 15)
export function initCellularBeam3D(canvasId) {
  return setupThreeScene(canvasId, (THREE, group) => {
    // Concrete Column with Corbel
    const colGeo = new THREE.BoxGeometry(3, 14, 3);
    const colMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.set(-8, 0, 0);
    group.add(col);

    // Corbel Bracket (หูช้าง)
    const corbelGeo = new THREE.BoxGeometry(3, 2, 2.8);
    const corbel = new THREE.Mesh(corbelGeo, colMat);
    corbel.position.set(-5.5, 1, 0);
    group.add(corbel);

    // Cellular Beam (Web with circular openings)
    const beamLength = 20;
    const web = new THREE.Shape();
    web.moveTo(-beamLength/2,-1.25); web.lineTo(beamLength/2,-1.25); web.lineTo(beamLength/2,1.25); web.lineTo(-beamLength/2,1.25); web.closePath();
    for (let x = -8.5; x <= 8.5; x += 2.125) { const hole = new THREE.Path(); hole.absarc(x,0,.8,0,Math.PI*2,true); web.holes.push(hole); }
    const beamGeo = new THREE.ExtrudeGeometry(web,{depth:.4,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.035,curveSegments:32});
    beamGeo.translate(0,0,-.2);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x879aa5, metalness: 0.78, roughness: 0.32 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(4, 2.5, 0);
    group.add(beam);

    // Top and Bottom Flanges
    const flangeGeo = new THREE.BoxGeometry(beamLength, 0.3, 2);
    const topFlange = new THREE.Mesh(flangeGeo, beamMat);
    topFlange.position.set(4, 3.8, 0);
    const botFlange = new THREE.Mesh(flangeGeo, beamMat);
    botFlange.position.set(4, 1.2, 0);
    group.add(topFlange);
    group.add(botFlange);

    // High Strength Bolts on Bracket
    for (let by of [1.6, 2.2]) {
      for (let bz of [-0.6, 0.6]) {
        const boltGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.8, 8);
        const boltMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 });
        const bolt = new THREE.Mesh(boltGeo, boltMat);
        bolt.rotation.x = Math.PI / 2;
        bolt.position.set(-4.5, by, bz);
        group.add(bolt);
      }
    }
    return time => {
      const phase = time % 12;
      const lift = phase < 3 ? 5*(1-phase/3)**3 : phase > 10 ? 5*((phase-10)/2)**3 : 0;
      beam.position.y=2.5+lift; topFlange.position.y=3.8+lift; botFlange.position.y=1.2+lift;
    };
  });
}

// 4. Floor Stratigraphy Super Flat FS 250 (Slide 16)
export function initFloorStratigraphy3D(canvasId) {
  return setupThreeScene(canvasId, (THREE, group) => {
    // Stepped layered view of industrial flooring
    const layers = [
      { name: "Subgrade Soil", color: 0x334155, height: 1.5, y: -2.5, w: 18, d: 14 },
      { name: "Sand Bedding", color: 0xd97706, height: 0.6, y: -1.4, w: 16, d: 13 },
      { name: "Vapor Barrier (PE Sheet)", color: 0x0284c7, height: 0.15, y: -1.0, w: 15, d: 12 },
      { name: "Reinforced Concrete FS 250mm", color: 0x94a3b8, height: 1.8, y: 0.0, w: 14, d: 11 },
      { name: "Green Floor Hardener", color: 0x10b981, height: 0.25, y: 1.05, w: 12, d: 9 }
    ];

    layers.forEach(l => {
      const geo = new THREE.BoxGeometry(l.w, l.height, l.d);
      const mat = new THREE.MeshStandardMaterial({
        color: l.color,
        roughness: 0.5,
        metalness: 0.1
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = l.y;
      group.add(mesh);
    });

    // Rebar Wiremesh grid inside concrete
    const rebarGrid = new THREE.GridHelper(12, 10, 0xef4444, 0xef4444);
    rebarGrid.position.y = 0.0;
    group.add(rebarGrid);
    const slabs = group.children.filter(o => o.isMesh);
    return time => {
      const spread = .5*(1-Math.cos(time*Math.PI/6));
      slabs.forEach((slab,i) => { slab.position.y = layers[i].y + i*spread*.45; });
      rebarGrid.position.y = 3*spread*.45;
    };
  });
}

// 5. Roof Metal Sheet & Wall Trimdek Envelope (Slide 17)
export function initRoofCladding3D(canvasId) {
  return setupThreeScene(canvasId, (THREE, group) => {
    // Structural Steel Rafter & Truss Frame
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.3 });
    const purlinMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.2 });
    
    // Slanted Rafter (Pitched Roof ~15 deg)
    const rafterGeo = new THREE.BoxGeometry(22, 0.6, 0.8);
    const rafter = new THREE.Mesh(rafterGeo, trussMat);
    rafter.rotation.z = -0.22;
    rafter.position.set(0, 3, 0);
    group.add(rafter);

    // C-Purlins (แป C-150x75) running across rafters
    const purlinGeo = new THREE.BoxGeometry(0.4, 0.6, 20);
    const purlinCount = 6;
    for (let i = 0; i < purlinCount; i++) {
      const p = new THREE.Mesh(purlinGeo, purlinMat);
      const t = (i / (purlinCount - 1)) * 18 - 9;
      p.position.set(t, 3 - t * 0.22 + 0.4, 0);
      group.add(p);
    }

    // Yellow/Amber Thermal Insulation (PE/PU Foam)
    const insulGeo = new THREE.BoxGeometry(21, 0.2, 19);
    const insulMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.8,
      transparent: true,
      opacity: 0.85
    });
    const insul = new THREE.Mesh(insulGeo, insulMat);
    insul.rotation.z = -0.22;
    insul.position.set(0, 3.7, 0);
    group.add(insul);

    // Metal Sheet Roof Panel (Aluzinc 0.47 mm)
    const roofGeo = new THREE.BoxGeometry(21, 0.25, 19);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.85,
      roughness: 0.2
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.z = -0.22;
    roof.position.set(0, 3.9, 0);
    group.add(roof);

    // Translucent Skylight Strip in Center
    const skylightGeo = new THREE.BoxGeometry(21.2, 0.3, 3);
    const skylightMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1
    });
    const skylight = new THREE.Mesh(skylightGeo, skylightMat);
    skylight.rotation.z = -0.22;
    skylight.position.set(0, 3.95, 0);
    group.add(skylight);

    // Vertical Wall Cladding (Trimdek Siding)
    const wallGeo = new THREE.BoxGeometry(0.3, 9, 19);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(-9.5, -2, 0);
    group.add(wall);

    // Louvremax 470 ventilation louver frame
    const louverFrameGeo = new THREE.BoxGeometry(0.5, 4, 8);
    const louverFrameMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
    const louverFrame = new THREE.Mesh(louverFrameGeo, louverFrameMat);
    louverFrame.position.set(-9.5, -2, 0);
    group.add(louverFrame);

    // 6 Louver Blades (slanted 45 deg)
    for (let k = -1.5; k <= 1.5; k += 0.6) {
      const bladeGeo = new THREE.BoxGeometry(0.8, 0.08, 7.6);
      const blade = new THREE.Mesh(bladeGeo, trussMat);
      blade.rotation.z = 0.7;
      blade.position.set(-9.5, -2 + k, 0);
      group.add(blade);
    }

    // Animated Rain/Water runoff simulation (particles flowing down the roof slope)
    const dropletCount = 20;
    const droplets = [];
    const dropGeo = new THREE.SphereGeometry(0.12, 6, 6);
    const dropMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    for (let i = 0; i < dropletCount; i++) {
      const drop = new THREE.Mesh(dropGeo, dropMat);
      drop.userData = {
        prog: Math.random(),
        z: (Math.random() - 0.5) * 16,
        speed: 0.012 + Math.random() * 0.01
      };
      group.add(drop);
      droplets.push(drop);
    }

    // Sun Heat Reflection Arrows
    const sunRays = [];
    for (let i = 0; i < 3; i++) {
      const rayGeo = new THREE.CylinderGeometry(0.08, 0.08, 4, 6);
      const rayMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.8 });
      const ray = new THREE.Mesh(rayGeo, rayMat);
      ray.position.set(-4 + i * 4, 7, (i - 1) * 4);
      ray.rotation.z = 0.5;
      group.add(ray);
      sunRays.push(ray);
    }

    let time = 0;
    return () => {
      time += 0.03;
      // Animate rain droplets sliding down the roof plane
      droplets.forEach(d => {
        d.userData.prog += d.userData.speed;
        if (d.userData.prog > 1) d.userData.prog = 0;
        const x = -8 + d.userData.prog * 17;
        const y = 3 - x * 0.22 + 1.2;
        d.position.set(x, y, d.userData.z);
      });
      // Animate pulsing heat reflection rays
      sunRays.forEach((r, idx) => {
        r.position.y = 7 + Math.sin(time + idx) * 0.4;
      });
    };
  });
}

// 6. Underground Infrastructure, MEP & Road (Slide 18)
export function initInfrastructureRoad3D(canvasId) {
  return setupThreeScene(canvasId, (THREE, group) => {
    // Cutaway Trench Ground (Soil & Subbase layers)
    const soilGeo = new THREE.BoxGeometry(22, 4, 18);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9, transparent: true, opacity: 0.55 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = -2;
    group.add(soil);

    // Concrete Road Slab (หนา 200 มม.)
    const roadGeo = new THREE.BoxGeometry(14, 0.8, 18);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(-4, 0.4, 0);
    group.add(road);

    // Red Wiremesh embedded inside cutaway concrete
    const wiremesh = new THREE.GridHelper(12, 10, 0xef4444, 0xef4444);
    wiremesh.position.set(-4, 0.45, 0);
    group.add(wiremesh);

    // Concrete Manhole MH P101 (บ่อพัก ค.ส.ล.)
    const mhGeo = new THREE.CylinderGeometry(1.8, 1.8, 4.5, 16);
    const mhMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
    const mh = new THREE.Mesh(mhGeo, mhMat);
    mh.position.set(6, -1.2, -4);
    group.add(mh);

    // Cast-Iron Heavy Duty Cover (ฝาเหล็กหล่อ)
    const coverGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.2, 16);
    const coverMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const cover = new THREE.Mesh(coverGeo, coverMat);
    cover.position.set(6, 1.1, -4);
    group.add(cover);

    // Reinforced Concrete Storm Drainage Pipe (ท่อ ค.ส.ล. DN with slope)
    const pipeGeo = new THREE.CylinderGeometry(0.8, 0.8, 16, 16);
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.75
    });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.rotation.x = Math.PI / 2;
    pipe.rotation.z = -0.12; // Invert slope
    pipe.position.set(6, -1.8, 2);
    group.add(pipe);

    // Underground PE Septic Tank (ถังบำบัดน้ำเสียทรงแคปซูล)
    const tankGeo = new THREE.CylinderGeometry(1.6, 1.6, 6, 16);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4, metalness: 0.2 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.rotation.z = Math.PI / 2;
    tank.position.set(-4, -2.5, 4);
    group.add(tank);

    // Tank Access Risers
    const riserGeo = new THREE.CylinderGeometry(0.5, 0.5, 2, 12);
    const riser1 = new THREE.Mesh(riserGeo, tankMat);
    riser1.position.set(-5.5, -1, 4);
    const riser2 = new THREE.Mesh(riserGeo, tankMat);
    riser2.position.set(-2.5, -1, 4);
    group.add(riser1);
    group.add(riser2);

    // Blue Water Supply Pipe PVC CW 13.5
    const waterPipeGeo = new THREE.CylinderGeometry(0.2, 0.2, 18, 8);
    const waterPipeMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, metalness: 0.5 });
    const waterPipe = new THREE.Mesh(waterPipeGeo, waterPipeMat);
    waterPipe.rotation.x = Math.PI / 2;
    waterPipe.position.set(1.5, -0.6, 0);
    group.add(waterPipe);

    // Water flow particles inside storm pipe
    const waterParticles = [];
    const pGeo = new THREE.SphereGeometry(0.12, 6, 6);
    const pMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let i = 0; i < 15; i++) {
      const p = new THREE.Mesh(pGeo, pMat);
      p.userData = {
        zProg: (i / 15) * 14 - 7,
        speed: 0.06
      };
      group.add(p);
      waterParticles.push(p);
    }

    return () => {
      waterParticles.forEach(p => {
        p.userData.zProg += p.userData.speed;
        if (p.userData.zProg > 7) p.userData.zProg = -7;
        const z = p.userData.zProg;
        const y = -1.8 - z * 0.12;
        p.position.set(6, y, z + 2);
      });
    };
  });
}

// 7. QA/QC Testing Lab (Concrete Compressive & NDT Ultrasonic) (Slide 19)
export function initQualityLab3D(canvasId) {
  return setupThreeScene(canvasId, (THREE, group) => {
    // Testing Floor
    const floor = new THREE.GridHelper(24, 12, 0x00e5ff, 0x1e293b);
    floor.position.y = -4;
    group.add(floor);

    // HYDRAULIC COMPRESSION MACHINE (เครื่องกดทดสอบลูกปูน)
    const machineBaseGeo = new THREE.BoxGeometry(8, 1.2, 6);
    const machineMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const base = new THREE.Mesh(machineBaseGeo, machineMat);
    base.position.set(-5, -3.4, 0);
    group.add(base);

    // Chrome Vertical Columns
    const colGeo = new THREE.CylinderGeometry(0.35, 0.35, 9, 16);
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const c1 = new THREE.Mesh(colGeo, chromeMat);
    c1.position.set(-7.5, 1, 1.8);
    const c2 = new THREE.Mesh(colGeo, chromeMat);
    c2.position.set(-7.5, 1, -1.8);
    const c3 = new THREE.Mesh(colGeo, chromeMat);
    c3.position.set(-2.5, 1, 1.8);
    const c4 = new THREE.Mesh(colGeo, chromeMat);
    c4.position.set(-2.5, 1, -1.8);
    group.add(c1);
    group.add(c2);
    group.add(c3);
    group.add(c4);

    // Top Crosshead
    const topYoke = new THREE.Mesh(machineBaseGeo, machineMat);
    topYoke.position.set(-5, 5.5, 0);
    group.add(topYoke);

    // Hydraulic Ram Piston
    const ramGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 16);
    const ramMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
    const ram = new THREE.Mesh(ramGeo, ramMat);
    ram.position.set(-5, 3.8, 0);
    group.add(ram);

    // Standard Concrete Cylinder Specimen (15x30 cm)
    const cylGeo = new THREE.CylinderGeometry(1.1, 1.1, 3.2, 16);
    const cylMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
    const cylinder = new THREE.Mesh(cylGeo, cylMat);
    cylinder.position.set(-5, -1.2, 0);
    group.add(cylinder);

    // Steel Capping Plates
    const capGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.25, 16);
    const capTop = new THREE.Mesh(capGeo, machineMat);
    capTop.position.set(-5, 0.45, 0);
    const capBot = new THREE.Mesh(capGeo, machineMat);
    capBot.position.set(-5, -2.85, 0);
    group.add(capTop);
    group.add(capBot);

    // Digital Load Gauge Display Box
    const gaugeBoxGeo = new THREE.BoxGeometry(2.5, 3.5, 0.8);
    const gaugeBoxMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
    const gaugeBox = new THREE.Mesh(gaugeBoxGeo, gaugeBoxMat);
    gaugeBox.position.set(-9.5, 1.5, 0);
    group.add(gaugeBox);

    // Glowing LED Screen on Gauge
    const screenGeo = new THREE.PlaneGeometry(2, 1.5);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(-9.5, 2.2, 0.42);
    group.add(screen);

    // ULTRASONIC NDT TESTING STATION (On the right side)
    // Non-overlapping steel plates on left and right sides of the weld joint
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.25 });
    const plateLeftGeo = new THREE.BoxGeometry(3.2, 0.6, 7);
    const plateLeft = new THREE.Mesh(plateLeftGeo, steelMat);
    plateLeft.position.set(4.1, -2.8, 0);
    group.add(plateLeft);

    const plateRightGeo = new THREE.BoxGeometry(3.2, 0.6, 7);
    const plateRight = new THREE.Mesh(plateRightGeo, steelMat);
    plateRight.position.set(7.9, -2.8, 0);
    group.add(plateRight);

    // V-Weld Joint (Seamlessly fitted between plates with crowned top surface, zero coplanar z-fighting)
    const weldGeo = new THREE.BoxGeometry(0.6, 0.68, 6.96);
    const weldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.2 });
    const weld = new THREE.Mesh(weldGeo, weldMat);
    weld.position.set(6, -2.76, 0);
    group.add(weld);

    // NDT Probe Transducer (Flush on the left plate surface)
    const probeGeo = new THREE.BoxGeometry(1, 1.0, 0.8);
    const probeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2 });
    const probe = new THREE.Mesh(probeGeo, probeMat);
    probe.position.set(4.8, -2.0, 0);
    group.add(probe);

    // Ultrasonic Radar Wave Rings (Pulsing waves hovering smoothly above surface with depthWrite: false)
    const rings = [];
    for (let r = 0; r < 4; r++) {
      const ringGeo = new THREE.RingGeometry(0.2, 0.38, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(5.3, -2.36, 0);
      group.add(ring);
      rings.push({ mesh: ring, offset: r * 0.25 });
    }

    let time = 0;
    return () => {
      time += 0.035;
      // Ram subtle hydraulic pulsing
      ram.position.y = 3.8 + Math.sin(time) * 0.08;
      capTop.position.y = 0.45 + Math.sin(time) * 0.04;
      
      // Ultrasonic wave rings expanding smoothly with smooth sine opacity (no flashing/flickering)
      rings.forEach(r => {
        let prog = (time * 0.35 + r.offset) % 1;
        const scale = 0.5 + prog * 3.2;
        r.mesh.scale.set(scale, scale, 1);
        r.mesh.material.opacity = Math.sin(prog * Math.PI) * 0.75;
      });
    };
  });
}

// 8. Safety & Environment (HSE) Smart Site 3D (Slide 20)
export function initSafetySite3D(canvasId) {
  return setupThreeScene(canvasId, (THREE, group) => {
    // Site Ground Grid with Safety Green & Amber lines
    const ground = new THREE.GridHelper(26, 14, 0x10b981, 0x1e293b);
    ground.position.y = -4;
    group.add(ground);

    // PERIMETER SMART SAFETY FENCE
    const fencePostMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
    const fenceBarMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.5, roughness: 0.3 });
    
    // Fence Posts & Horizontal Rails
    for (let x = -10; x <= 10; x += 5) {
      const postGeo = new THREE.CylinderGeometry(0.18, 0.18, 5, 8);
      const post = new THREE.Mesh(postGeo, fencePostMat);
      post.position.set(x, -1.5, -7);
      group.add(post);
    }
    const railGeo = new THREE.CylinderGeometry(0.08, 0.08, 20, 8);
    const rail1 = new THREE.Mesh(railGeo, fenceBarMat);
    rail1.rotation.z = Math.PI / 2;
    rail1.position.set(0, -0.5, -7);
    const rail2 = new THREE.Mesh(railGeo, fenceBarMat);
    rail2.rotation.z = Math.PI / 2;
    rail2.position.set(0, -2.5, -7);
    group.add(rail1);
    group.add(rail2);

    // High-Pressure PM2.5 Water Mist Line on top of fence
    const mistPipeGeo = new THREE.CylinderGeometry(0.06, 0.06, 20, 8);
    const mistPipeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8 });
    const mistPipe = new THREE.Mesh(mistPipeGeo, mistPipeMat);
    mistPipe.rotation.z = Math.PI / 2;
    mistPipe.position.set(0, 1.05, -7);
    group.add(mistPipe);

    // PM2.5 Water Mist Cloud (Fine drifting particle droplets)
    const mistCount = 65;
    const mistParticles = [];
    const mGeo = new THREE.SphereGeometry(0.14, 6, 6);
    const mMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 });
    for (let i = 0; i < mistCount; i++) {
      const m = new THREE.Mesh(mGeo, mMat);
      m.userData = {
        origX: (Math.random() - 0.5) * 18,
        driftY: Math.random() * 2.5,
        driftZ: (Math.random() - 0.5) * 5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.015 + Math.random() * 0.02
      };
      group.add(m);
      mistParticles.push(m);
    }

    // AUTOMATIC TRUCK WHEEL WASH STATION (บ่อล้างล้อรถบรรทุก)
    const basinGeo = new THREE.BoxGeometry(7, 0.6, 9);
    const basinMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const basin = new THREE.Mesh(basinGeo, basinMat);
    basin.position.set(-6, -3.7, 0);
    group.add(basin);

    // Grating Ramp
    const grateGeo = new THREE.BoxGeometry(6.4, 0.2, 8.4);
    const grateMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.4 });
    const grate = new THREE.Mesh(grateGeo, grateMat);
    grate.position.set(-6, -3.3, 0);
    group.add(grate);

    // Lateral Water Spray Jets (High velocity spray lines)
    const sprayJets = [];
    for (let s = 0; s < 8; s++) {
      const jetGeo = new THREE.CylinderGeometry(0.04, 0.15, 2.5, 6);
      const jetMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.7 });
      const jet = new THREE.Mesh(jetGeo, jetMat);
      const isLeft = s % 2 === 0;
      jet.rotation.z = isLeft ? -0.4 : 0.4;
      jet.position.set(-6 + (isLeft ? -2.8 : 2.8), -2.2, -3.5 + Math.floor(s / 2) * 2.2);
      group.add(jet);
      sprayJets.push(jet);
    }

    // MODULAR SCAFFOLDING TOWER (นั่งร้านมาตรฐานความปลอดภัย)
    const scafMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
    for (let sx of [5, 9]) {
      for (let sz of [-1, 3]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 8, 8), scafMat);
        pole.position.set(sx, 0, sz);
        group.add(pole);
      }
    }
    // Scaffolding Top Working Platform with Yellow Toe-board
    const platGeo = new THREE.BoxGeometry(4.4, 0.2, 4.4);
    const platMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const plat = new THREE.Mesh(platGeo, platMat);
    plat.position.set(7, 3, 1);
    group.add(plat);

    const toeGeo = new THREE.BoxGeometry(4.4, 0.4, 0.1);
    const toeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const toe = new THREE.Mesh(toeGeo, toeMat);
    toe.position.set(7, 3.3, 3.1);
    group.add(toe);

    // Green Safety Tag (100% INSPECTED)
    const tagGeo = new THREE.BoxGeometry(0.6, 1.0, 0.05);
    const tagMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const tag = new THREE.Mesh(tagGeo, tagMat);
    tag.position.set(5, 1.5, 3.2);
    group.add(tag);

    // Rotating Amber Safety Strobe Beacon
    const beaconBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.4, 8), fencePostMat);
    beaconBase.position.set(-10, 1.2, -7);
    const beaconLens = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    beaconLens.position.set(-10, 1.6, -7);
    group.add(beaconBase);
    group.add(beaconLens);

    let time = 0;
    return () => {
      time += 0.04;
      // Animate drifting mist particles
      mistParticles.forEach(m => {
        m.userData.phase += m.userData.speed;
        m.position.x = m.userData.origX + Math.sin(m.userData.phase) * 0.8;
        m.position.y = 1.0 + Math.cos(m.userData.phase * 0.8) * 1.5;
        m.position.z = -7 + Math.sin(m.userData.phase * 1.2) * 2.5;
      });

      // Animate water spray jets pulsing in wheel wash bay
      sprayJets.forEach((j, idx) => {
        const pulse = 0.8 + Math.sin(time * 3 + idx) * 0.2;
        j.scale.set(pulse, pulse, pulse);
      });

      // Beacon blinking
      beaconLens.material.color.setHex((Math.sin(time * 6) > 0) ? 0xf59e0b : 0x78350f);
    };
  });
}
