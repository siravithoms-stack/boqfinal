/** Overlay markup is presentation only; movement and rendering live elsewhere. */
export function createWarehouseView(document) {
  const style = document.createElement('style');
  style.textContent = `
    #warehouseWalkBtn{position:absolute;bottom:20px;left:20px;z-index:4;border:1px solid #d9c695;border-radius:9px;background:#253e40;color:#fff7e0;padding:12px 20px;font:600 16px Kanit,sans-serif;cursor:pointer;box-shadow:0 5px 20px #0004}
    #warehouseWalkBtn:hover{background:#395653} #warehouseWalkBtn:focus-visible{outline:3px solid #e5aa23;outline-offset:4px}
    .warehouse-game{position:fixed;inset:0;width:100%;height:100%;z-index:2147483647;background:#172b31;color:#f4f1e6;font-family:Kanit,sans-serif;overflow:hidden;isolation:isolate}
    .warehouse-game>canvas.three-canvas{display:block;width:100%!important;height:100%!important;position:absolute;inset:0;touch-action:none;cursor:grab}
    .warehouse-game>canvas.three-canvas:active{cursor:grabbing}
    .warehouse-game .wg-top{position:absolute;left:28px;right:28px;top:24px;display:flex;justify-content:space-between;align-items:start;pointer-events:none;gap:16px}
    .warehouse-game .wg-title,.warehouse-game .wg-map-wrap,.warehouse-game .wg-help{background:#172c32de;backdrop-filter:blur(5px);border:1px solid #ffffff26;border-radius:12px;box-shadow:0 6px 22px #0002}
    .warehouse-game .wg-title{padding:12px 18px;line-height:1.5;font-size:17px}.warehouse-game .wg-title small{display:block;font-size:12px;color:#c5d2ce;letter-spacing:1px}
    .warehouse-game .wg-status{font-size:13px;color:#e8c775;margin-top:5px}
    .warehouse-game .wg-map-wrap{padding:10px;align-self:start}.warehouse-game .wg-map{width:130px;height:210px;display:block}
    .warehouse-game .wg-map-label{font-size:11px;text-align:center;color:#c5d2ce}
    .warehouse-game .wg-bottom{position:absolute;bottom:22px;left:28px;right:28px;display:flex;justify-content:space-between;align-items:end;gap:12px;pointer-events:none}
    .warehouse-game .wg-help{padding:12px 16px;font-size:13px;line-height:1.8}.warehouse-game kbd{font:600 12px monospace;color:#ffe6a1;background:#ffffff12;border:1px solid #ffffff25;border-radius:4px;padding:3px 5px}
    .warehouse-game button{pointer-events:auto;border:1px solid #ffffff40;border-radius:8px;background:#243d43;color:#f4f1e6;font:500 13px Kanit,sans-serif;padding:10px 14px;cursor:pointer}.warehouse-game button:focus-visible{outline:3px solid #e5aa23}
    .warehouse-game .wg-cross{position:absolute;left:50%;top:50%;width:6px;height:6px;border:1px solid #ffffffa0;border-radius:50%;pointer-events:none}
    .warehouse-game .wg-note{font-size:11px;color:#c5d2ce}
    .wg-film{position:absolute;left:28px;right:auto;bottom:24px;width:min(360px,calc(100% - 56px));padding:12px 16px;background:linear-gradient(110deg,#13252be8,#13252b85);border-left:3px solid #d7ae68;pointer-events:none}
    .wg-film small{font-size:9px;letter-spacing:1.5px;color:#d7ae68}.wg-month{font-size:clamp(22px,3vw,32px);line-height:1.2;font-weight:600}.wg-focus{font-size:14px;margin:4px 0 10px}.wg-track{height:3px;background:#ffffff28;max-width:520px}.wg-progress{height:100%;background:#d7ae68;width:0}.wg-film button{margin-top:10px;font-size:11px;padding:6px 10px;pointer-events:auto}.warehouse-game.is-film .wg-map-wrap,.warehouse-game.is-film .wg-cross,.warehouse-game.is-film .wg-help,.warehouse-game.is-film .wg-reset,.warehouse-game.is-film .wg-replay{display:none}.warehouse-game.is-film .wg-bottom{bottom:20px;justify-content:end}.warehouse-game.is-film .wg-title{background:#173039d9;border:1px solid #ffffff26;box-shadow:none}
    @media(max-width:700px){.warehouse-game .wg-top{left:12px;right:12px;top:12px}.warehouse-game .wg-bottom{left:12px;right:12px;bottom:12px}.warehouse-game .wg-map-wrap{display:none}.warehouse-game .wg-title{font-size:14px}.warehouse-game .wg-help{font-size:11px;padding:8px}.warehouse-game button{padding:8px}.warehouse-game .wg-note{display:none}}
  `;
  document.head.appendChild(style);
  const overlay = document.createElement('div');
  overlay.className = 'warehouse-game'; overlay.hidden = true; overlay.tabIndex = -1;
  overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', 'เดินชมโรงงาน กด Escape เพื่อกลับสไลด์');
  overlay.innerHTML = `<div class="wg-top"><div class="wg-title">เดินชมโรงงาน <small>T6 + T7 · 68.05 × 154.90 M</small><div class="wg-status" aria-live="polite">เดินปกติ</div></div><div class="wg-map-wrap"><canvas class="wg-map" width="130" height="210" aria-label="แผนผังและตำแหน่งปัจจุบัน"></canvas><div class="wg-map-label">N ↑ · ตำแหน่งปัจจุบัน</div></div></div><section class="wg-film" hidden aria-label="ลำดับการก่อสร้างโรงงาน"><small>FACTORY · CONSTRUCTION TIME-LAPSE</small><div class="wg-month">M01</div><div class="wg-focus"></div><div class="wg-track"><div class="wg-progress"></div></div><button class="wg-skip" type="button">ข้ามและเริ่มเดิน →</button></section><span class="wg-cross"></span><div class="wg-bottom"><div class="wg-help"><kbd>W A S D</kbd> เดิน &nbsp; <kbd>Shift</kbd> ค้างเพื่อเดินเร็ว<br>เมาส์ซ้ายค้าง + ลาก หรือ <kbd>↑ ↓ ← →</kbd> มองรอบตัว<br><kbd>Esc</kbd> กลับสไลด์ <div class="wg-note">ภาพจำลองอาคารเสร็จ · รายละเอียดอุปกรณ์เพื่อประกอบภาพ</div></div><div><button class="wg-replay" type="button">ชมการก่อสร้างอีกครั้ง</button> <button class="wg-reset" type="button">กลับจุดเริ่มต้น</button> <button class="wg-exit" type="button">ออก [Esc]</button></div></div>`;
  document.body.appendChild(overlay);
  return { style, overlay };
}
