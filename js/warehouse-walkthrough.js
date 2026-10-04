import { loadFactoryAsset, createDaylightEnvironment, addFactoryAtmosphere, REALISM_ASSET, applyWarehouseIndirect } from './factory-assets.js';
import { createFactoryFilm } from './factory-film.js';
import { WAREHOUSE_MOVEMENT, WAREHOUSE_RENDER } from './warehouse-config.js';
import { createCompletedWarehouseScene } from './warehouse-scene.js';
import { createWarehouseView } from './warehouse-view.js';
import { disposeSceneResources } from './scene-resources.js';

/** Slide 2 only. Metre-based completed building; all assets generated locally. */
export const WAREHOUSE_WALK_SPEED = Object.freeze({ normal: WAREHOUSE_MOVEMENT.normal, fast: WAREHOUSE_MOVEMENT.fast });

// Small swept steps prevent tunnelling; independent axes allow sliding along walls.
export function moveWarehouseWalker(position, dx, dz, obstacles, radius = WAREHOUSE_MOVEMENT.radius) {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dz)) / WAREHOUSE_MOVEMENT.sweptStep));
  const blocked = (x, z) => obstacles.some(b => {
    const nearestX = Math.max(b.minX, Math.min(x, b.maxX));
    const nearestZ = Math.max(b.minZ, Math.min(z, b.maxZ));
    return (x - nearestX) ** 2 + (z - nearestZ) ** 2 < radius * radius;
  });
  for (let i = 0; i < steps; i++) {
    const x = Math.max(-WAREHOUSE_MOVEMENT.limitX, Math.min(WAREHOUSE_MOVEMENT.limitX, position.x + dx / steps));
    if (!blocked(x, position.z)) position.x = x;
    const z = Math.max(-WAREHOUSE_MOVEMENT.limitZ, Math.min(WAREHOUSE_MOVEMENT.limitZ, position.z + dz / steps));
    if (!blocked(position.x, z)) position.z = z;
  }
  return position;
}

export function stepWarehouseWalker(state, keys, dt, obstacles) {
  dt = Math.min(Math.max(dt, 0), WAREHOUSE_MOVEMENT.maxDeltaSeconds);
  const forward = Number(keys.has('KeyW')) - Number(keys.has('KeyS'));
  const side = Number(keys.has('KeyD')) - Number(keys.has('KeyA'));
  const moving = !!(forward || side);
  const target = moving ? (keys.has('ShiftLeft') || keys.has('ShiftRight') ? WAREHOUSE_WALK_SPEED.fast : WAREHOUSE_WALK_SPEED.normal) : 0;
  state.speed += (target - state.speed) * (1 - Math.exp(-dt * WAREHOUSE_MOVEMENT.acceleration));
  if (moving) {
    const distance = state.speed * dt / Math.hypot(forward, side);
    moveWarehouseWalker(state,
      (-Math.sin(state.yaw) * forward + Math.cos(state.yaw) * side) * distance,
      (-Math.cos(state.yaw) * forward - Math.sin(state.yaw) * side) * distance, obstacles);
  }
  return state;
}

export function initCompletedWarehouse3D(canvasId) {
  const original = document.getElementById(canvasId);
  const THREE = window.THREE;
  if (!original || !THREE) return null;
  const canvas = original.cloneNode(false);
  original.replaceWith(canvas);
  const home = canvas.parentElement;
  const walkButton = document.getElementById('warehouseWalkBtn');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch {
    if (walkButton) { walkButton.disabled = true; walkButton.textContent = 'เครื่องนี้ไม่รองรับ 3D'; }
    return null;
  }
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // Shadows are static: render once, rather than recalculating while walking.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  let pixelRatio = Math.min(window.devicePixelRatio || 1, WAREHOUSE_RENDER.maxPixelRatio);
  renderer.setPixelRatio(pixelRatio);
  const { scene, camera, textures, materials, geometries, obstacles, left, halfLength, mid, pitLocations } = createCompletedWarehouseScene(THREE, renderer);

  scene.environment = createDaylightEnvironment(THREE, document);
  textures.add(scene.environment);
  const sky = addFactoryAtmosphere(THREE, scene);
  const walkBackground = scene.background;
  const overviewBackground = new THREE.Color(0xf4f0e8);
  const { style, overlay } = createWarehouseView(document);
  const status = overlay.querySelector('.wg-status');
  const mapCanvas = overlay.querySelector('.wg-map'), mapCtx = mapCanvas.getContext('2d');
  const keys = new Set();
  const state = { x: mid, z: WAREHOUSE_MOVEMENT.spawnZ, yaw: Math.PI, pitch: 0, speed: 0 };
  let mode = 'overview', destroyed = false, nativeEntered = false, enterTicket = 0;
  let dragging = false, lastX = 0, lastY = 0, pointerId = null;
  let theta = 0.72, phi = 0.85, radius = 225, previous = 0, frameId = 0;
  let renderAt = 0;
  let needRender = true, mapTimer = 0;
  let returnFocus = null, inertState = [];
  const startWalking = () => { if (destroyed || mode === 'overview') return; mode = 'walk'; camera.fov=68; camera.updateProjectionMatrix(); spawn(); mapDraw(); mapTimer=0; overlay.focus({ preventScroll: true }); resize(); updateCamera(); status.textContent = 'เดินปกติ'; needRender = true; renderer.shadowMap.needsUpdate = true; };
  const film = window.gsap ? createFactoryFilm(THREE, scene, camera, overlay, window.gsap, startWalking) : null;
  const beginFilm = () => { if (!film || mode === 'overview') return; cleanKeys(); mode = 'intro'; film.start(); status.textContent = 'ก่อสร้าง M01–M14 · กดข้ามเพื่อเดิน'; needRender = true; };
  const assetLoad = loadFactoryAsset(THREE, scene, root => { applyWarehouseIndirect(THREE,root,()=>{needRender=true;}); film?.refresh(); renderer.shadowMap.needsUpdate = true; needRender = true; canvas.dataset.model = 'blender'; }, () => { canvas.dataset.model = 'fallback'; status.textContent = 'ใช้โมเดลสำรอง · สามารถเดินชมได้ตามปกติ'; }, REALISM_ASSET);
  const cleanKeys = () => { keys.clear(); state.speed = 0; dragging = false; };
  const spawn = () => { Object.assign(state, { x: mid, z: WAREHOUSE_MOVEMENT.spawnZ, yaw: Math.PI, pitch: 0, speed: 0 }); cleanKeys(); needRender = true; };
  const updateCamera = () => {
    scene.background = mode !== 'overview' ? walkBackground : overviewBackground;
    sky.visible = mode !== 'overview';
    if (mode === 'intro') return;
    if (mode === 'walk') { camera.position.set(state.x, WAREHOUSE_MOVEMENT.eyeHeight, state.z); camera.rotation.set(state.pitch, state.yaw, 0); }
    else { camera.position.set(radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.cos(theta)); camera.lookAt(0, 4, 0); }
  };
  const resize = () => {
    if (destroyed) return;
    const host = mode !== 'overview' ? overlay : home;
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
    // Bound fill-rate on 4K/ultrawide displays as well as on high-DPI laptops.
    const effectiveRatio = Math.min(pixelRatio, Math.sqrt(WAREHOUSE_RENDER.maxPixels / (w * h)));
    if (renderer.getPixelRatio() !== effectiveRatio) renderer.setPixelRatio(effectiveRatio);
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); needRender = true;
  };
  const mapDraw = () => {
    const c = mapCtx, sx = 1.35, sz = 1.13, ox = 65, oz = 105;
    c.clearRect(0, 0, 130, 210); c.fillStyle = '#12252b'; c.fillRect(0, 0, 130, 210);
    c.fillStyle = '#75868a'; c.fillRect(ox + left * sx, oz - halfLength * sz, 68.05 * sx, 154.9 * sz);
    c.fillStyle = '#5f7468'; c.fillRect(ox + (mid - 1.5) * sx, oz - halfLength * sz, 3 * sx, 154.9 * sz);
    c.strokeStyle = '#e9d89d'; c.lineWidth = 1; c.strokeRect(ox + left * sx, oz - halfLength * sz, 68.05 * sx, 154.9 * sz);
    c.fillStyle = '#334b53'; pitLocations.forEach(([x,z,w,d]) => c.fillRect(ox+(x-w/2)*sx,oz+(z-d/2)*sz,w*sx,d*sz));
    c.save(); c.translate(ox + state.x * sx, oz + state.z * sz); c.rotate(-state.yaw);
    c.beginPath(); c.moveTo(0,-7); c.lineTo(-4,5); c.lineTo(4,5); c.closePath(); c.fillStyle='#ffdc7c'; c.fill(); c.restore();
  };
  const leave = (exitNative = true) => {
    if (mode === 'overview') return;
    film?.stop(); mode = 'overview'; enterTicket++; cleanKeys(); renderer.shadowMap.needsUpdate = true;
    if (pointerId !== null && canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
    pointerId = null;
    home.appendChild(canvas); overlay.hidden = true;
    inertState.forEach(([element, previousInert]) => { element.inert = previousInert; }); inertState = [];
    const ownsFullscreen = document.fullscreenElement === overlay;
    nativeEntered = false;
    if (exitNative && ownsFullscreen) document.exitFullscreen().catch(() => {});
    camera.fov = 45; camera.updateProjectionMatrix(); resize(); updateCamera();
    if (!destroyed && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    needRender = true;
  };
  const enter = async () => {
    if (destroyed || mode !== 'overview') return;
    const ticket = ++enterTicket;
    returnFocus = document.activeElement; mode = 'walk'; camera.fov=68; camera.updateProjectionMatrix(); spawn();
    overlay.hidden = false; overlay.prepend(canvas);
    inertState = [...document.body.children].filter(el => el !== overlay && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE').map(el => [el, el.inert]);
    inertState.forEach(([el]) => { el.inert = true; });
    overlay.focus({ preventScroll: true }); camera.fov = 68; camera.updateProjectionMatrix(); resize(); updateCamera(); beginFilm();
    // Called directly from the button's user gesture. Fallback still fills the browser viewport.
    try {
      if (overlay.requestFullscreen) await overlay.requestFullscreen({ navigationUI: 'hide' });
      if (destroyed || mode === 'overview' || ticket !== enterTicket) {
        if (document.fullscreenElement === overlay) await document.exitFullscreen();
        return;
      }
      nativeEntered = document.fullscreenElement === overlay;
    } catch { status.textContent = 'เต็มหน้าต่าง · กด Esc เพื่อกลับ'; }
    resize();
  };
  const fullChange = () => {
    if (mode === 'overview') return;
    if (document.fullscreenElement === overlay) { nativeEntered = true; resize(); }
    else if (nativeEntered) leave(false); // Browsers may consume Escape before keydown.
  };
  const handledKeys = new Set(['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Escape','Space','PageUp','PageDown','KeyG','KeyF','KeyT']);
  const keyDown = e => {
    if (mode === 'overview') return;
    if (e.code === 'Tab') {
      e.preventDefault(); e.stopImmediatePropagation();
      const controls = mode === 'intro' ? [overlay.querySelector('.wg-skip'), overlay.querySelector('.wg-exit')] : [overlay.querySelector('.wg-reset'), overlay.querySelector('.wg-replay'), overlay.querySelector('.wg-exit')];
      const index = controls.indexOf(document.activeElement);
      controls[(index + (e.shiftKey ? controls.length - 1 : 1)) % controls.length].focus(); return;
    }
    if (!handledKeys.has(e.code)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (e.code === 'Escape') leave();
    else if (mode === 'walk') {
      keys.add(e.code);
      // Give a short tap a visible response as well as supporting held arrows.
      if (!e.repeat && e.code.startsWith('Arrow')) {
        state.yaw += (Number(e.code === 'ArrowLeft') - Number(e.code === 'ArrowRight')) * WAREHOUSE_MOVEMENT.arrowTapRadians;
        state.pitch = Math.max(-WAREHOUSE_MOVEMENT.maximumPitch, Math.min(WAREHOUSE_MOVEMENT.maximumPitch, state.pitch + (Number(e.code === 'ArrowUp') - Number(e.code === 'ArrowDown')) * WAREHOUSE_MOVEMENT.arrowTapRadians));
        needRender = true;
      }
    }
  };
  const keyUp = e => {
    if (mode === 'overview' || !handledKeys.has(e.code)) return;
    e.preventDefault(); e.stopImmediatePropagation(); keys.delete(e.code);
  };
  const down = e => {
    if (e.button !== 0 || mode === 'intro') return;
    dragging = true; pointerId = e.pointerId; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId); e.preventDefault();
    if (mode === 'walk') overlay.focus({ preventScroll: true });
  };
  const move = e => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
    if (mode === 'walk') {
      state.yaw -= dx * WAREHOUSE_MOVEMENT.pointerSensitivity; state.pitch = Math.max(-WAREHOUSE_MOVEMENT.maximumPitch, Math.min(WAREHOUSE_MOVEMENT.maximumPitch, state.pitch - dy * WAREHOUSE_MOVEMENT.pointerSensitivity));
    } else { theta -= dx * 0.005; phi = Math.max(0.2, Math.min(1.45, phi + dy * 0.005)); }
    needRender = true;
  };
  const up = () => { dragging = false; pointerId = null; };
  const wheel = e => {
    if (mode !== 'overview') return;
    e.preventDefault(); radius = Math.max(135, Math.min(310, radius + e.deltaY * 0.1)); needRender = true;
  };
  const visibility = () => { cleanKeys(); previous = 0; needRender = true; };
  const resetClick = () => spawn();
  const skipClick = () => { if (mode === 'intro') film?.skip(); };
  const replayClick = () => beginFilm();
  const exitClick = () => leave();
  window.addEventListener('keydown', keyDown, true); window.addEventListener('keyup', keyUp, true);
  window.addEventListener('blur', cleanKeys); window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', visibility); document.addEventListener('fullscreenchange', fullChange);
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('lostpointercapture', up);
  canvas.addEventListener('wheel', wheel, { passive: false });
  overlay.querySelector('.wg-reset').addEventListener('click', resetClick);
  overlay.querySelector('.wg-exit').addEventListener('click', exitClick);
  overlay.querySelector('.wg-skip').addEventListener('click', skipClick);
  overlay.querySelector('.wg-replay').addEventListener('click', replayClick);
  if (walkButton) walkButton.onclick = enter;
  const animate = now => {
    if (destroyed) return;
    frameId = requestAnimationFrame(animate);
    const elapsed = previous ? (now - previous) / 1000 : 0; previous = now;
    if (document.hidden) return;
    const dt = Math.min(elapsed, WAREHOUSE_MOVEMENT.maxDeltaSeconds);
    if (mode === 'intro') { film.tick(Math.min(elapsed,.25)); renderer.shadowMap.needsUpdate = true; needRender = true; }
    if (mode === 'walk') {
      const oldX = state.x, oldZ = state.z, oldYaw = state.yaw, oldPitch = state.pitch;
      const look = dt * WAREHOUSE_MOVEMENT.arrowRadiansPerSecond;
      if (keys.has('ArrowLeft')) state.yaw += look;
      if (keys.has('ArrowRight')) state.yaw -= look;
      state.pitch = Math.max(-WAREHOUSE_MOVEMENT.maximumPitch, Math.min(WAREHOUSE_MOVEMENT.maximumPitch, state.pitch + (Number(keys.has('ArrowUp')) - Number(keys.has('ArrowDown'))) * look));
      stepWarehouseWalker(state, keys, dt, obstacles);
      needRender = needRender || state.x !== oldX || state.z !== oldZ || state.yaw !== oldYaw || state.pitch !== oldPitch;
      mapTimer += dt;
      if (mapTimer > WAREHOUSE_RENDER.mapIntervalSeconds) {
        mapTimer = 0; mapDraw();
        const label = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 'เดินเร็ว · Shift' : 'เดินปกติ';
        if (status.textContent !== label) status.textContent = label;
      }

    }
    // Cap drawing at 60Hz, and do no GPU work when the camera stands still.
    const interval = 1000 / WAREHOUSE_RENDER.framesPerSecond;
    if (needRender && (mode === 'overview' || now - renderAt >= interval)) {
      renderAt = now - ((now - renderAt) % interval);
      updateCamera(); renderer.render(scene, camera); needRender = false;
    }
  };
  resize(); updateCamera(); frameId = requestAnimationFrame(animate);
  return {
    get mode() { return mode; },
    get isWalkMode() { return mode === 'walk'; },
    reset() { if (mode === 'walk') spawn(); else { theta = 0.72; phi = 0.85; radius = 225; needRender = true; } },
    destroy() {
      if (destroyed) return;
      leave(); film?.destroy?.(); assetLoad.cancel(); destroyed = true; enterTicket++; cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', keyDown, true); window.removeEventListener('keyup', keyUp, true);
      window.removeEventListener('blur', cleanKeys); window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibility); document.removeEventListener('fullscreenchange', fullChange);
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); canvas.removeEventListener('lostpointercapture', up);
      canvas.removeEventListener('wheel', wheel);
      if (walkButton) walkButton.onclick = null;
      disposeSceneResources(scene, { geometries, materials, textures });
      renderer.dispose(); overlay.remove(); style.remove();
    }
  };
}
