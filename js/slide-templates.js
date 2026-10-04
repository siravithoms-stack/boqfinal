/** Pure HTML renderer. Exact original markup is protected by committed fixtures. */
export function renderSlideTemplate(slide) {
    const c = slide.content;
    let bodyHTML = '';

    // Render depending on slide type
    switch(slide.type) {
      case 'hero':
        bodyHTML = `
          <div class="bento-grid grid-cols-12" style="margin-top: 10px;">
            <div class="bento-card col-span-12 highlight-cyan hero-exec-banner">
              <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--accent-cyan); margin-bottom: 12px;">EXECUTIVE PRESENTATION</div>
              <div style="font-family: var(--font-display); font-size: 2.6rem; font-weight: 800; color: var(--text-pure); line-height: 1.2;">
                สัญญาก่อสร้างอาคารโรงงาน 14 เดือน (M01 - M14)
              </div>
              <p style="font-size: 1.15rem; color: var(--text-secondary); margin-top: 12px; max-width: 900px;">
                ${slide.subtitle}
              </p>
            </div>

            <!-- KPI Metric Cards -->
            ${c.metrics.map(m => `
              <div class="bento-card col-span-3 hero-kpi-card">
                <div class="hero-metric-frame">
                  <span class="metric-label">${m.label}</span>
                  <div class="metric-val ${m.color}">${m.value}</div>
                  <span class="metric-sub">${m.unit}</span>
                </div>
              </div>
            `).join('')}

            <!-- Key Stakeholders -->
            <div class="bento-card col-span-12">
              <div class="card-title" style="margin-bottom: 16px;">ภาคีผู้มีส่วนได้ส่วนเสียในโครงการ (Project Stakeholders)</div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                ${c.parties.map(p => `
                  <div class="stakeholder-card" style="background: rgba(255,255,255,0.02); padding: 14px 18px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                    <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-cyan);">${p.role}</div>
                    <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-pure); margin: 4px 0;">${p.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-tertiary);">${p.note}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
        break;

      case '3d-warehouse':
        bodyHTML = `
          <style>
            #slide-2 .slide-header{display:none}
            #slide-2 .preview-head{flex-shrink:0;margin-bottom:26px;color:var(--text-pure)}
            #slide-2 .preview-kicker{display:flex;justify-content:space-between;border-bottom:1px solid var(--border-subtle);padding:0 0 20px;color:var(--accent-cyan);font-size:18px}
            #slide-2 .preview-head h1{font-size:38px;line-height:1.3;margin:26px 0 12px;font-weight:600}
            #slide-2 .preview-head p{font-size:22px;color:var(--text-secondary);margin:0}
            #slide-2 .showcase-layout{display:grid;grid-template-columns:1.25fr 1fr;gap:40px;flex:1;min-height:0}
            #slide-2 .showcase-model{display:flex;flex-direction:column;padding:28px;border:1px solid var(--border-subtle);border-radius:12px;background:var(--bg-main);min-height:0}
            #slide-2 .three-viewport-wrapper{flex:1;min-height:0;border:0;border-radius:0;background:transparent}
            #slide-2 .showcase-actions{display:flex;gap:14px;margin:18px 0 20px;flex-shrink:0}
            #slide-2 #resetWarehouseBtn,#slide-2 #warehouseWalkBtn{position:static;box-shadow:none;border:1px solid var(--border-subtle);border-radius:5px;background:var(--bg-card);color:var(--text-pure);padding:16px 22px;font:500 21px var(--font-body);cursor:pointer}
            #slide-2 #warehouseWalkBtn{background:var(--accent-cyan);color:var(--bg-darkest);border-color:transparent}
            #slide-2 .showcase-actions button:focus-visible{outline:3px solid var(--accent-cyan);outline-offset:3px}
            #slide-2 .showcase-caption{font-size:17px;line-height:1.5;color:var(--text-secondary)}
            #slide-2 .showcase-info{padding:24px;border:1px solid var(--border-subtle);border-radius:12px;background:var(--bg-card);min-height:0;overflow-y:auto;color:var(--text-pure)}
            #slide-2 .showcase-label{font-size:18px;letter-spacing:2px;color:var(--accent-cyan);font-weight:500;margin:6px 0 16px}
            #slide-2 .showcase-dimensions{font-size:40px;font-weight:600;line-height:1.3;color:var(--accent-cyan);margin-bottom:16px}
            #slide-2 .showcase-dimensions small{font-size:24px}
            #slide-2 .showcase-table{width:100%;border-collapse:collapse;font-size:21px;background:transparent}
            #slide-2 .showcase-table th,#slide-2 .showcase-table td{padding:11px 12px;border-bottom:1px solid var(--border-subtle);text-align:left;background:transparent;font-weight:400}
            #slide-2 .showcase-table th{width:40%;color:var(--text-secondary)}
            #slide-2 .showcase-location{font-size:22px;line-height:1.6;margin:18px 0 24px}
            #slide-2 .showcase-note{border-top:1px solid var(--border-subtle);margin-top:16px;padding-top:14px;font-size:20px;line-height:1.65;color:var(--text-secondary)}
            #slide-2 .showcase-footer{margin-top:22px;border-top:1px solid var(--border-subtle);padding-top:14px;font-size:17px;color:var(--text-secondary);flex-shrink:0}
            body.theme-bronze-stone #slide-2 .preview-head,body.theme-bronze-stone #slide-2 .showcase-info{color:#1f343b}
            body.theme-bronze-stone #slide-2 .showcase-model{background:#f4f0e8;border-color:#d6dfdf}
            body.theme-bronze-stone #slide-2 .showcase-info{background:#fff;border-color:#e1d7c5}
            body.theme-bronze-stone #slide-2 .showcase-label{color:#006778}
            body.theme-bronze-stone #slide-2 .showcase-dimensions{color:#924b13}
            body.theme-bronze-stone #slide-2 #warehouseWalkBtn{background:#924b13;color:#fff}
            body.theme-bronze-stone #slide-2 #resetWarehouseBtn{background:#fff;color:#1f343b;border-color:#adc2c2}
          </style>
          <header class="preview-head"><div class="preview-kicker"><span>โครงการโรงงาน / ภาพรวมอาคาร</span><span>${String(slide.id).padStart(2, "0")} / 21</span></div><h1>${slide.title}</h1><p>${slide.subtitle} · สมุทรสาคร</p></header>
          <div class="showcase-layout">
            <section class="showcase-model" aria-label="แบบจำลองโรงงาน 3D">
              <div class="three-viewport-wrapper"><canvas id="canvasWarehouse3D" class="three-canvas"></canvas></div>
              <div class="showcase-actions"><button id="warehouseWalkBtn" type="button">เดินชมโรงงาน · เต็มจอ ↗</button><button id="resetWarehouseBtn" type="button">คืนมุมมอง</button></div>
              <div class="showcase-caption">โมเดล 3D แบบโต้ตอบ · ลากเพื่อหมุนมุมมองและเลื่อนเพื่อซูม</div>
            </section>
            <section class="showcase-info" aria-label="ข้อมูลผังและพิกัดวิศวกรรม">
              <div class="showcase-label">ขนาดโรงงาน</div>
              <div class="showcase-dimensions">${c.dimensions.width.replace(" ม.", "")} × ${c.dimensions.length.replace(" ม.", "")} <small>ม.</small></div>
              <table class="showcase-table"><tbody><tr><th scope="row">พื้นที่นำเสนอ</th><td>10,540 ตร.ม.</td></tr><tr><th scope="row">ระบบโครงสร้าง</th><td>ค.ส.ล. + Cellular Beam SM520</td></tr><tr><th scope="row">พื้นโรงงาน</th><td>FS 250 มม. · เหล็ก 2 ชั้น</td></tr></tbody></table>
              <p class="showcase-location">${c.location}</p>
            </section>
          </div>
          <footer class="showcase-footer">W A S D เดิน · Shift ค้างเดินเร็ว · เมาส์ซ้ายค้างหรือลูกศรดูรอบตัว · Esc กลับสไลด์</footer>
        `;
        break;

      case 'commercial-flow':
        bodyHTML = `
          <div class="bento-grid grid-cols-12">
            <div class="bento-card col-span-12 highlight-cyan">
              <div class="card-header-row">
                <span class="card-title">การแจกแจงโครงสร้างราคาขาย (Cost Build-up Flow)</span>
                <span class="card-badge" style="color: var(--accent-cyan);">VAT 7% Included</span>
              </div>
              <div class="math-pipeline" style="gap: 8px;">
                ${c.pipeline.map((p, idx) => `
                  <div class="math-node ${p.isGrandTotal ? 'grand-total-node' : (idx === 3 ? 'primary' : '')}" style="${p.isGrandTotal ? 'border: 2.5px solid #B45309; background: linear-gradient(135deg, rgba(180, 83, 9, 0.12), rgba(180, 83, 9, 0.03)); box-shadow: 0 6px 20px rgba(180, 83, 9, 0.2); position: relative; padding: 16px 12px;' : 'padding: 16px 12px;'}">
                    ${p.isGrandTotal ? `
                      <div style="position: absolute; top: -10px; right: 10px; background: #B45309; color: #ffffff; font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; letter-spacing: 0.05em; box-shadow: 0 2px 6px rgba(180,83,9,0.3);">รวม VAT 7%</div>
                    ` : ''}
                    <div style="font-family: var(--font-mono); font-size: 0.8rem; color: ${p.isGrandTotal ? 'var(--accent-cyan)' : (idx === 3 ? 'var(--text-secondary)' : 'var(--accent-cyan)')}; font-weight: ${p.isGrandTotal ? '800' : '600'}; margin-bottom: 4px;">${p.name}</div>
                    <div style="font-family: var(--font-display); font-size: ${p.isGrandTotal ? '1.95rem' : '1.75rem'}; font-weight: 800; color: ${p.isGrandTotal ? 'var(--accent-cyan)' : 'var(--text-pure)'}; line-height: 1.1;">${p.val}</div>
                    <div style="font-family: var(--font-mono); font-size: 0.76rem; color: ${p.isGrandTotal ? 'var(--accent-amber)' : 'var(--accent-amber)'}; font-weight: ${p.isGrandTotal ? '700' : '600'}; margin: 4px 0;">${p.share}</div>
                    <div style="font-size: 0.74rem; color: ${p.isGrandTotal ? 'var(--text-secondary)' : 'var(--text-tertiary)'}; font-weight: ${p.isGrandTotal ? '500' : '400'};">${p.desc}</div>
                  </div>
                  ${idx < c.pipeline.length - 1 ? `
                    <div class="math-operator" style="font-size: 1.4rem; color: var(--text-tertiary); padding: 0 2px;">
                      ${idx === 2 ? '=' : (idx === 3 ? '➔' : '+')}
                    </div>
                  ` : ''}
                `).join('')}
              </div>

              <!-- Executive VAT Callout Banner -->
              <div class="comm-tax-note" style="margin-top: 14px; display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1.5px solid rgba(180, 83, 9, 0.35); padding: 12px 22px; border-radius: var(--radius-md); box-shadow: 0 4px 12px rgba(180, 83, 9, 0.08);">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="font-size: 1.5rem;">🧾</span>
                  <div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">สรุปการคำนวณภาษีมูลค่าเพิ่ม (VAT Calculation)</div>
                    <div style="font-size: 0.95rem; color: var(--text-primary); margin-top: 2px;">
                      ราคาก่อนภาษี <strong>104.32 ล้านบาท</strong> + ภาษีมูลค่าเพิ่ม VAT 7% <strong>(7.30 ล้านบาท)</strong>
                    </div>
                  </div>
                </div>
                <div style="display: flex; align-items: baseline; gap: 10px; background: linear-gradient(135deg, rgba(180, 83, 9, 0.12), rgba(180, 83, 9, 0.04)); padding: 8px 20px; border-radius: var(--radius-md); border: 1.5px solid rgba(180, 83, 9, 0.35);">
                  <span style="font-size: 0.92rem; font-weight: 700; color: var(--accent-cyan);">ยอดรวมสุทธิหลังรวม VAT 7%:</span>
                  <span style="font-family: var(--font-display); font-size: 2.1rem; font-weight: 800; color: var(--accent-cyan); line-height: 1;">111.62</span>
                  <span style="font-size: 1.05rem; font-weight: 800; color: var(--accent-cyan);">ล้านบาท</span>
                </div>
              </div>
            </div>

            <div class="bento-card col-span-4">
              <span class="metric-label">ต้นทุนตรง (Direct Cost)</span>
              <div class="metric-val cyan">85.00</div>
              <span class="metric-sub">ล้านบาท (81.48% ของราคาก่อนภาษี)</span>
              <p style="font-size: 0.85rem; color: var(--text-tertiary); margin-top: 8px;">ครอบคลุมงานโครงสร้าง, สถาปัตย์, ระบบสุขาภิบาล และถนน ค.ส.ล.</p>
            </div>
            <div class="bento-card col-span-4">
              <span class="metric-label">Indirect Cost (8%)</span>
              <div class="metric-val amber">6.80</div>
              <span class="metric-sub">ล้านบาท</span>
              <p style="font-size: 0.85rem; color: var(--text-tertiary); margin-top: 8px;">ค่าใช้จ่ายทางอ้อมโครงการและสนับสนุนงานสนาม</p>
            </div>
            <div class="bento-card col-span-4">
              <span class="metric-label">Overhead & Profit (12%)</span>
              <div class="metric-val emerald">12.52</div>
              <span class="metric-sub">ล้านบาท</span>
              <p style="font-size: 0.85rem; color: var(--text-tertiary); margin-top: 8px;">ค่าดำเนินการส่วนกลางและอัตรากำไรตามกรอบสัญญา</p>
            </div>
          </div>
        `;
        break;

      case 'scope-interactive':
        bodyHTML = `
          <div class="scope-layout-grid">
            <!-- IN-SCOPE (8 หมวดงานหลัก) -->
            <div class="scope-column scope-in-col">
              <div class="scope-col-header in-scope-head">
                <div class="scope-head-left">
                  <span class="scope-head-icon">✅</span>
                  <div>
                    <div class="scope-head-title">งานที่รวมในสัญญา (In-Scope Contracted)</div>
                    <div class="scope-head-sub">รับผิดชอบเบ็ดเสร็จภายใต้กรอบงบประมาณโครงการ 111.62 ล้านบาท</div>
                  </div>
                </div>
                <span class="scope-head-badge in-badge">8 หมวดงานหลัก</span>
              </div>
              
              <div class="scope-in-grid">
                ${c.included.map((item, idx) => `
                  <div class="scope-card-in anim-fade-up anim-delay-${(idx % 4) + 1}">
                    <div class="scope-card-in-top">
                      <span class="scope-in-num">${item.num}</span>
                      <span class="scope-in-icon">${item.icon}</span>
                      <span class="scope-in-title">${item.title.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                    <div class="scope-in-desc">${item.desc}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- OUT-OF-SCOPE (4 หมวดงานยกเว้น) -->
            <div class="scope-column scope-out-col">
              <div class="scope-col-header out-scope-head">
                <div class="scope-head-left">
                  <span class="scope-head-icon">⚠️</span>
                  <div>
                    <div class="scope-head-title">งานที่ไม่รวมในสัญญา (Exclusions & Demarcation)</div>
                    <div class="scope-head-sub">ขอบเขตงานแยกประมูลหรือผู้ว่าจ้างจัดซื้อ/จัดจ้างเองโดยตรง</div>
                  </div>
                </div>
                <span class="scope-head-badge out-badge">4 หมวดงานยกเว้น</span>
              </div>

              <div class="scope-out-stack">
                ${c.excluded.map((item, idx) => `
                  <div class="scope-card-out anim-fade-up anim-delay-${idx + 1}">
                    <div class="scope-card-out-top">
                      <span class="scope-out-icon">${item.icon}</span>
                      <span class="scope-out-title">${item.title}</span>
                      <span class="scope-out-owner">ผู้ว่าจ้างแยกประมูล</span>
                    </div>
                    <div class="scope-out-desc">${item.desc}</div>
                  </div>
                `).join('')}
              </div>

              <div class="scope-mitigation-banner anim-fade-up">
                <span class="mitigation-shield">🛡️</span>
                <div class="mitigation-body">
                  <strong>กลยุทธ์จำแนกขอบเขตชัดเจน (Demarcation Protocol):</strong>
                  กำหนด Interface จุดเชื่อมต่อทางวิศวกรรมตั้งแต่วันแรก ป้องกันข้อพิพาทงานเพิ่ม-ลด (VO Leakage) และความล่าช้า 100%
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case 'org-chart':
        bodyHTML = `
          <style>
            #slide-8 .col-field-eng .org-column-header{border:1.5px solid #00e5ff;border-top:4px solid #00e5ff;background:rgba(0,229,255,0.06)}
            #slide-8 .col-qa-safety .org-column-header{border:1.5px solid #10b981;border-top:4px solid #10b981;background:rgba(16,185,129,0.06)}
            #slide-8 .col-foreman-admin .org-column-header{border:1.5px solid #f59e0b;border-top:4px solid #f59e0b;background:rgba(245,158,11,0.06)}
            #slide-8 .col-field-eng .org-role-card{border:1.5px solid rgba(0,229,255,0.45) !important;border-left:5px solid #00e5ff !important}
            #slide-8 .col-field-eng .org-role-card:hover{border-color:#00e5ff !important;box-shadow:0 6px 20px rgba(0,229,255,0.25) !important}
            #slide-8 .col-qa-safety .org-role-card{border:1.5px solid rgba(16,185,129,0.45) !important;border-left:5px solid #10b981 !important}
            #slide-8 .col-qa-safety .org-role-card:hover{border-color:#10b981 !important;box-shadow:0 6px 20px rgba(16,185,129,0.25) !important}
            #slide-8 .col-qa-safety .org-balance-card{border:1.5px dashed rgba(16,185,129,0.6) !important;border-left:5px solid #10b981 !important;background:rgba(16,185,129,0.06) !important}
            #slide-8 .col-foreman-admin .org-role-card{border:1.5px solid rgba(245,158,11,0.45) !important;border-left:5px solid #f59e0b !important}
            #slide-8 .col-foreman-admin .org-role-card:hover{border-color:#f59e0b !important;box-shadow:0 6px 20px rgba(245,158,11,0.25) !important}
            #slide-8 .org-connector-drop-field{stroke:#00e5ff;stroke-width:2.5}
            #slide-8 .org-connector-drop-qa{stroke:#10b981;stroke-width:2.5}
            #slide-8 .org-connector-drop-admin{stroke:#f59e0b;stroke-width:2.5}
            body.theme-bronze-stone #slide-8 .col-field-eng .org-column-header{border:1.5px solid #0284c7 !important;border-top:4px solid #0284c7 !important;background:rgba(2,132,199,0.05) !important}
            body.theme-bronze-stone #slide-8 .col-qa-safety .org-column-header{border:1.5px solid #059669 !important;border-top:4px solid #059669 !important;background:rgba(5,150,105,0.05) !important}
            body.theme-bronze-stone #slide-8 .col-foreman-admin .org-column-header{border:1.5px solid #b45309 !important;border-top:4px solid #b45309 !important;background:rgba(180,83,9,0.05) !important}
            body.theme-bronze-stone #slide-8 .col-field-eng .org-role-card{border:1.5px solid rgba(2,132,199,0.45) !important;border-left:5px solid #0284c7 !important}
            body.theme-bronze-stone #slide-8 .col-field-eng .org-role-card:hover{border-color:#0284c7 !important;box-shadow:0 6px 20px rgba(2,132,199,0.18) !important}
            body.theme-bronze-stone #slide-8 .col-qa-safety .org-role-card{border:1.5px solid rgba(5,150,105,0.45) !important;border-left:5px solid #059669 !important}
            body.theme-bronze-stone #slide-8 .col-qa-safety .org-role-card:hover{border-color:#059669 !important;box-shadow:0 6px 20px rgba(5,150,105,0.18) !important}
            body.theme-bronze-stone #slide-8 .col-qa-safety .org-balance-card{border:1.5px dashed rgba(5,150,105,0.6) !important;border-left:5px solid #059669 !important;background:rgba(5,150,105,0.05) !important}
            body.theme-bronze-stone #slide-8 .col-foreman-admin .org-role-card{border:1.5px solid rgba(180,83,9,0.45) !important;border-left:5px solid #b45309 !important}
            body.theme-bronze-stone #slide-8 .col-foreman-admin .org-role-card:hover{border-color:#b45309 !important;box-shadow:0 6px 20px rgba(180,83,9,0.18) !important}
            body.theme-bronze-stone #slide-8 .org-connector-drop-field{stroke:#0284c7 !important;stroke-width:2.5}
            body.theme-bronze-stone #slide-8 .org-connector-drop-qa{stroke:#059669 !important;stroke-width:2.5}
            body.theme-bronze-stone #slide-8 .org-connector-drop-admin{stroke:#b45309 !important;stroke-width:2.5}
          </style>
          <div class="org-tree-container">
            <!-- Top Level PM Executive Node -->
            <div class="org-pm-node-wrap">
              <div class="org-pm-card">
                <div class="org-pm-left">
                  <div class="org-avatar-frame pm-frame">
                    <img src="${c.pm.avatar}" alt="Project Manager" class="org-avatar-img">
                    <span class="org-avatar-badge-pm">LEADER</span>
                  </div>
                  <div class="org-pm-info">
                    <div class="org-pm-title-row">
                      <h3 class="org-pm-title">${c.pm.title}</h3>
                      <span class="org-qual-pill">${c.pm.qualification}</span>
                    </div>
                    <div class="org-pm-desc">${c.pm.desc}</div>
                  </div>
                </div>
                <div class="org-pm-salary-box">
                  <span class="org-salary-label">กรอบอัตราเงินเดือน</span>
                  <div class="org-salary-num-wrap">
                    <span class="org-salary-currency">฿</span>
                    <span class="org-salary-amount">${c.pm.salary}</span>
                    <span class="org-salary-period">/เดือน</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tree Connector Branch Lines (Perfect Pixel-Aligned SVG) -->
            <div class="org-connector-wrap">
              <svg class="org-connector-svg" preserveAspectRatio="none" viewBox="0 0 1000 24">
                <!-- Drop line directly from PM center (x=500, y=0 to y=12) -->
                <line x1="500" y1="0" x2="500" y2="12" stroke="#94a3b8" stroke-width="2" vector-effect="non-scaling-stroke" />
                <!-- Horizontal distribution bar connecting all 3 column centers -->
                <!-- Column 1 center = 1000 * (1/6) = 166.67 -->
                <!-- Column 2 center = 1000 * (1/2) = 500 -->
                <!-- Column 3 center = 1000 * (5/6) = 833.33 -->
                <line x1="166.67" y1="12" x2="833.33" y2="12" stroke="#94a3b8" stroke-width="2" vector-effect="non-scaling-stroke" />
                <!-- Branch drops down to each column header -->
                <line class="org-connector-drop-field" x1="166.67" y1="12" x2="166.67" y2="24" stroke="#94a3b8" stroke-width="2" vector-effect="non-scaling-stroke" />
                <line class="org-connector-drop-qa" x1="500" y1="12" x2="500" y2="24" stroke="#94a3b8" stroke-width="2" vector-effect="non-scaling-stroke" />
                <line class="org-connector-drop-admin" x1="833.33" y1="12" x2="833.33" y2="24" stroke="#94a3b8" stroke-width="2" vector-effect="non-scaling-stroke" />
              </svg>
            </div>

            <!-- 3 Symmetrical Department Columns Grid -->
            <div class="org-columns-grid">
              ${c.columns.map(col => `
                <div class="org-column ${col.id}">
                  <div class="org-column-header theme-${col.colorTheme}">
                    <span class="org-header-icon theme-${col.colorTheme}">
                      ${col.colorTheme === 'cyan' ? `
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      ` : col.colorTheme === 'emerald' ? `
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                      ` : `
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                      `}
                    </span>
                    <span class="org-col-title-text">${col.title}</span>
                    <span class="org-headcount-badge theme-${col.colorTheme}">${col.headcount}</span>
                  </div>

                  <div class="org-cards-stack">
                    ${col.roles.map(r => `
                      <div class="org-role-card theme-${col.colorTheme}">
                        <div class="org-card-left">
                          <img src="${r.avatar}" alt="${r.title}" class="org-avatar-img">
                          <div class="org-role-details">
                            <div class="org-role-title">${r.title}</div>
                            <div class="org-role-qual"><span class="org-qual-dot theme-${col.colorTheme}"></span>${r.qualification}</div>
                          </div>
                        </div>
                        <div class="org-salary-badge theme-${col.colorTheme}">
                          <div class="org-salary-badge-val">฿${r.salary}</div>
                          <div class="org-salary-badge-unit">${r.salaryUnit.replace('บาท/', '')}</div>
                        </div>
                      </div>
                    `).join('')}

                    ${col.roles.length === 2 ? `
                      <div class="org-balance-card theme-${col.colorTheme}">
                        <div class="org-balance-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <div class="org-balance-info">
                          <div class="org-balance-title">มาตรฐาน QA/QC & มาตรการ Zero Accident</div>
                          <div class="org-balance-sub">กำกับดูแลความปลอดภัยและคุณภาพงานตาม ISO 9001/45001 ตลอดโครงการ</div>
                        </div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Bottom Budget Banner -->
            <div class="org-bottom-banner">
              <div class="org-banner-left">
                <div class="org-banner-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="M7 15h0M2 9.5h20"></path>
                  </svg>
                </div>
                <div class="org-banner-text">
                  <strong style="color: var(--text-primary);">กรอบงบประมาณบุคลากร:</strong> จัดสรร 50% ของงบ Preliminary รวม 4.22 ล้านบาท ควบคุมตามแผน Man-Month ไม่เกินกรอบ
                </div>
              </div>
              <div class="org-budget-alert-pill">
                <span class="org-alert-pulse"></span>
                <span>เงินเดือนไม่รวมค่าล่วงเวลา (OT)</span>
              </div>
            </div>
          </div>
        `;
        break;

      case 'cost-breakdown':
        bodyHTML = `
          <div class="bento-grid grid-cols-12">
            ${c.metrics.map(m => `
              <div class="bento-card col-span-4">
                <span class="metric-label">${m.label}</span>
                <div class="metric-val ${m.color}">${m.value}</div>
                <span class="metric-sub">${m.sub}</span>
              </div>
            `).join('')}

            <div class="bento-card col-span-12">
              <div class="card-header-row">
                <span class="card-title">ตารางเปรียบเทียบ Sell BOQ กับ Working Budget (4 หมวดงานหลัก)</span>
                <span class="card-badge">Unit: THB</span>
              </div>
              <div style="overflow-x: auto;">
                <table class="tech-table">
                  <thead>
                    <tr>
                      <th>หมวดงานก่อสร้าง</th>
                      <th style="text-align: right;">ราคาขาย (Sell BOQ)</th>
                      <th style="text-align: right;">ต้นทุนวัสดุ</th>
                      <th style="text-align: right;">ต้นทุนค่าแรง/ซับ</th>
                      <th style="text-align: right;">งบต้นทุนรวม</th>
                      <th style="text-align: right;">กำไรขั้นต้น (GP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${c.table.map(row => `
                      <tr>
                        <td style="font-weight: 600;">${row.cat}</td>
                        <td class="num">${row.sell}</td>
                        <td class="num">${row.mat}</td>
                        <td class="num">${row.lab}</td>
                        <td class="num" style="color: var(--accent-cyan);">${row.cost}</td>
                        <td class="num" style="color: var(--accent-emerald); font-weight: 600;">${row.gp}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              <div style="margin-top: 12px; font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-tertiary);">
                📌 ${c.formulaNote}
              </div>
            </div>
          </div>
        `;
        break;

      case 'prelim-table':
        bodyHTML = `
          <div class="prelim-deck">
            <div class="prelim-rows-list">
              ${c.items.map((item, idx) => `
                <div class="prelim-row-card anim-fade-up anim-delay-${(idx % 4) + 1}">
                  <div class="prelim-row-left">
                    <span class="prelim-row-num">${item.icon || String(item.id).padStart(2,'0')}</span>
                    <div class="prelim-row-info">
                      <div class="prelim-row-name">${item.name}</div>
                      <div class="prelim-row-desc">${item.desc}</div>
                    </div>
                  </div>
                  <div class="prelim-row-right">
                    <div class="prelim-bar-wrap">
                      <div class="prelim-bar-fill" style="width: ${item.pct}"></div>
                    </div>
                    <div class="prelim-row-nums">
                      <span class="prelim-row-amt">${item.amt} บาท</span>
                      <span class="prelim-row-pct">${item.pct}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="prelim-footer-banner">
              <span class="prelim-footer-icon">💰</span>
              <div class="prelim-footer-body">
                <span class="prelim-footer-label">งบประมาณ Preliminary รวมทั้งหมด</span>
                <span class="prelim-footer-val">${c.totalBudget.toLocaleString("en-US")} บาท</span>
                <span class="prelim-footer-note">= ${c.budgetBasis}</span>
              </div>
            </div>
          </div>
        `;
                break;

      case 'burn-chart':
      case 'burn-rate-chart': {
const metrics = c.metrics;

const burnData = c.burnData || [];
const maxVal = Math.max(...burnData.map(d => d.monthly), 970);

const getBarClass = (m) => {
  if (m === 'M01') return 'burn-bar-mobilize';
  if (['M02','M03','M04'].includes(m)) return 'burn-bar-substructure';
  if (['M05','M06','M07'].includes(m)) return 'burn-bar-peak';
  if (['M08','M09','M10','M11','M12'].includes(m)) return 'burn-bar-finishing';
  return 'burn-bar-closeout';
};

bodyHTML = `
  <div class="burn-pres-container">
    <!-- Top KPI Cards -->
    <div class="burn-kpi-row">
      ${metrics.map(m => `
        <div class="burn-kpi-card burn-kpi-${m.color}">
          <div class="burn-kpi-icon-wrap">${m.icon}</div>
          <div class="burn-kpi-info">
            <span class="burn-kpi-label">${m.label}</span>
            <span class="burn-kpi-val">${m.val}</span>
            <span class="burn-kpi-sub">${m.sub}</span>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Main Content: Full-Width 14-Month Flow & Cash Curve -->
    <div class="burn-pres-grid burn-pres-grid-full">
      <div class="burn-card burn-flow-card burn-flow-card-full">
        <div class="burn-card-header">
          <div class="burn-card-title-group">
            <div class="burn-header-main">
              <span class="burn-card-title">แผนเบิกจ่ายรายเดือน 14 เดือน (Cash Burn-Rate)</span>
              <span class="burn-card-badge">กรอบงบ Preliminary รวม 8.45 ล้านบาท (100%)</span>
            </div>
            <div class="burn-legend-row">
              <span class="burn-leg-tag leg-mobilize">Setup & เตรียมงาน</span>
              <span class="burn-leg-tag leg-sub">งานฐานราก</span>
              <span class="burn-leg-tag leg-peak">🔥 Peak งานโครงสร้าง & หลังคา</span>
              <span class="burn-leg-tag leg-finish">สถาปัตย์ & งานระบบ MEP</span>
              <span class="burn-leg-tag leg-close">🏁 รื้อถอน & ส่งมอบ</span>
            </div>
          </div>
        </div>

        <!-- Monthly Bars (Full Width & Expanded Height) -->
        <div class="burn-bars-container">
          ${burnData.map(d => {
            const barHeightPct = Math.round((d.monthly / maxVal) * 88);
            return `
              <div class="burn-bar-col">
                <span class="burn-bar-amount">${d.monthly}k</span>
                <div class="burn-bar-track">
                  <div class="burn-bar-fill ${getBarClass(d.m)}" style="height: ${barHeightPct}%">
                    <span class="burn-bar-inner-pct">${d.pct}</span>
                  </div>
                </div>
                <span class="burn-bar-month">${d.m}</span>
                <span class="burn-bar-note">${d.note || ''}</span>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Bottom Strategy & Insights -->
        <div class="burn-strategy-box">
          <div class="burn-strat-icon">🎯</div>
          <div class="burn-strat-text">
            <span class="burn-strat-title">กลยุทธ์ควบคุมต้นทุน (Cost Control Strategy):</span>
            <span class="burn-strat-desc">${c.strategy || 'ทำสัญญาเช่าเหมาจ่ายเครื่องจักรและตู้คอนเทนเนอร์ใน M01 พร้อมล็อก Man-Month บุคลากรประจำสนาม 11 อัตรา ป้องกันปัญหา Overrun'}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

        break;
      }

      case 'gantt-weight':
        bodyHTML = `
          <div class="gantt-container">
            <!-- Toolbar with schedule badges and milestone indicators -->
            <div class="gantt-toolbar">
              <div class="gantt-toolbar-left">
                <div class="gantt-timeline-badge">
                  <span>⏱️</span>
                  <span>กรอบเวลาก่อสร้าง: 14 เดือน (M01 - M14)</span>
                </div>
                <div class="gantt-timeline-badge" style="color: var(--accent-amber); border-color: rgba(245, 158, 11, 0.35); background: rgba(245, 158, 11, 0.08);">
                  <span>📊</span>
                  <span>สัดส่วนน้ำหนักงานรวม 100.0%</span>
                </div>
              </div>
              <div class="gantt-toolbar-right">
                <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-tertiary); display: flex; align-items: center; gap: 8px;">
                  <span>🚩 หมุดหมายวิศวกรรมสำคัญ (Key Milestones): M04 • M07 • M10 • M14</span>
                </div>
              </div>
            </div>

            <!-- Gantt Board Card -->
            <div class="gantt-board" id="ganttBoard">
              <!-- Header Row: 310px Meta + 14 Months -->
              <div class="gantt-row gantt-header-row">
                <div style="font-weight: 700; font-size: 0.8rem; color: var(--accent-cyan); display: flex; justify-content: space-between; align-items: center; padding-right: 14px; white-space: nowrap; overflow: visible;">
                  <span>หมวดงานหลัก (8 หมวด)</span>
                  <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-tertiary);">น้ำหนัก (100%)</span>
                </div>
                ${Array.from({ length: 14 }, (_, i) => {
                  const mNum = i + 1;
                  const mStr = `M${mNum.toString().padStart(2, '0')}`;
                  const milestone = c.monthMilestones?.find(ms => ms.m === mStr);
                  const isFlag = milestone && milestone.note.includes('🚩');
                  return `
                    <div class="gantt-month-col-header" data-month="${mNum}" title="${milestone ? milestone.note : mStr}">
                      ${mStr}${isFlag ? '🚩' : ''}
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- 8 Task Rows -->
              ${c.categories.map((cat, idx) => `
                <div class="gantt-row" data-task-id="${cat.id}">
                  <div class="gantt-task-meta" title="${cat.name}: ${cat.desc}">
                    <span class="gantt-task-name">${cat.name}</span>
                    <span class="gantt-task-weight gantt-bar-${cat.colorTheme}">${cat.weight}%</span>
                  </div>
                  <div class="gantt-timeline-track">
                    <div 
                      class="gantt-bar-item gantt-bar-${cat.colorTheme}" 
                      style="grid-column: ${cat.startMonth} / span ${cat.duration}; animation-delay: ${idx * 60}ms;"
                      data-start="${cat.startMonth}" 
                      data-duration="${cat.duration}"
                      data-end="${cat.startMonth + cat.duration - 1}"
                      title="${cat.name} (${cat.span}): ${cat.desc}">
                      <span>${cat.span}</span>
                      <span style="font-size: 0.68rem; opacity: 0.9;">${cat.weight}%</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Phase Summary 4 Pillars -->
            <div class="gantt-phase-summary">
              ${c.phases.map(p => `
                <div class="gantt-phase-pill" style="border-left: 3px solid var(--accent-${p.color});">
                  <span class="gantt-phase-pill-title">${p.name} <span style="font-family: var(--font-mono); font-size: 0.72rem; opacity: 0.75;">(${p.months})</span></span>
                  <span class="gantt-phase-pill-val" style="color: var(--accent-${p.color});">${p.weight}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        break;

      case 'interactive-scurve':
        bodyHTML = `
          <div class="bento-grid grid-cols-12">
            <div class="bento-card col-span-12 highlight-cyan">
              <div class="card-header-row">
                <span class="card-title">แผนงานสะสม S-Curve 14 เดือน (Interactive Time Scrubber)</span>
                <span id="sliderMonthLabel" class="card-badge" style="color: var(--accent-cyan); font-size: 0.9rem;">M14 (100.0%)</span>
              </div>
              
              <div id="scurveChartContainer" class="chart-container" style="min-height: 280px;"></div>

              <div class="chart-scrubber-controls">
                <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-tertiary);">เลื่อนดูแต่ละเดือน:</span>
                <input type="range" id="scurveSlider" min="0" max="13" value="13" class="chart-scrubber-slider" />
                <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-cyan);">M01 - M14</span>
              </div>
            </div>
          </div>
        `;
        break;

      case 'shop-drawings':
        bodyHTML = `
          <div class="gantt-container">
            <!-- Toolbar with Lead-Time badges and Approval Status -->
            <div class="gantt-toolbar">
              <div class="gantt-toolbar-left">
                <div class="gantt-timeline-badge">
                  <span>📐</span>
                  <span>ช่วงเวลาจัดทำและอนุมัติแบบ: 14 เดือน (M01 - M14)</span>
                </div>
                <div class="gantt-timeline-badge" style="color: var(--accent-amber); border-color: rgba(245, 158, 11, 0.35); background: rgba(245, 158, 11, 0.08);">
                  <span>⏱️</span>
                  <span>เกณฑ์กำหนด: ${c.leadTimeNote}</span>
                </div>
              </div>
              <div class="gantt-toolbar-right">
                <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-tertiary); display: flex; align-items: center; gap: 8px;">
                  <span>📋 รวม 15 ชุดแบบมาตรฐาน (SD-01 ถึง SD-15 + As-Built)</span>
                </div>
              </div>
            </div>

            <!-- Gantt Board Card -->
            <div class="gantt-board">
              <!-- Header Row: 440px Meta + 14 Months -->
              <div class="gantt-row gantt-header-row">
                <div style="font-weight: 700; font-size: 0.8rem; color: var(--accent-cyan); display: flex; justify-content: space-between; align-items: center; padding-right: 14px; white-space: nowrap; overflow: visible;">
                  <span>ชุดแบบ Shop Drawing (8 กลุ่มงาน)</span>
                  <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-tertiary); letter-spacing: 0.5px;">รหัสแบบ</span>
                </div>
                ${Array.from({ length: 14 }, (_, i) => {
                  const mNum = i + 1;
                  const mStr = `M${mNum.toString().padStart(2, '0')}`;
                  return `
                    <div class="gantt-month-col-header" data-month="${mNum}">
                      ${mStr}
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- 8 Drawing Package Rows -->
              ${c.packages.map((pkg, idx) => `
                <div class="gantt-row" data-pkg-id="${pkg.id}">
                  <div class="gantt-task-meta" title="${pkg.code}: ${pkg.name} (${pkg.desc})">
                    <span class="gantt-task-name">${pkg.name}</span>
                    <span class="gantt-task-weight gantt-bar-${pkg.colorTheme}">${pkg.code}</span>
                  </div>
                  <div class="gantt-timeline-track">
                    <div 
                      class="gantt-bar-item gantt-bar-${pkg.colorTheme}" 
                      style="grid-column: ${pkg.startMonth} / span ${pkg.duration}; animation-delay: ${idx * 60}ms;"
                      title="${pkg.code}: ${pkg.name} (${pkg.span}) • ${pkg.leadTime} • ${pkg.desc}">
                      <span>${pkg.span}</span>
                      <span style="font-size: 0.65rem; opacity: 0.9;">${pkg.leadTime}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Discipline Summary 4 Pillars -->
            <div class="gantt-phase-summary">
              ${c.disciplines.map(d => `
                <div class="gantt-phase-pill" style="border-left: 3px solid var(--accent-${d.color});">
                  <span class="gantt-phase-pill-title">${d.name} <span style="font-family: var(--font-mono); font-size: 0.7rem; opacity: 0.75;">(${d.code})</span></span>
                  <span class="gantt-phase-pill-val" style="color: var(--accent-${d.color});">${d.span}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        break;

      case 'supply-gantt':
      case 'supply-table': {
        const formatM = (lbl, span) => {
          if (!lbl) return '';
          const clean = lbl.replace(/\s*\(.*?\)/g, '').trim();
          return (span && span < 2) ? clean.replace(/\s+/g, '') : clean;
        };

        bodyHTML = `
          <div class="supply-gantt-container">
            <!-- Toolbar & Legend -->
            <div class="supply-gantt-toolbar">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div class="gantt-timeline-badge" style="font-size: 0.78rem;">
                  <span>📦</span>
                  <span>จัดการห่วงโซ่อุปทานวัสดุก่อสร้าง & กรอบเวลาหน้างาน</span>
                </div>
                <div class="gantt-timeline-badge" style="color: var(--accent-amber); border-color: rgba(245, 158, 11, 0.35); background: rgba(245, 158, 11, 0.08); font-size: 0.78rem;">
                  <span>⏱️</span>
                  <span>Lead Time ลบ 2 เดือน (สั่งซื้อล่วงหน้า)</span>
                </div>
              </div>
              <div class="supply-gantt-legend">
                <div class="supply-legend-item">
                  <span class="supply-legend-dot supply-legend-order"></span>
                  <span>สั่งซื้อ/อนุมัติ</span>
                </div>
                <div class="supply-legend-item">
                  <span class="supply-legend-dot supply-legend-arrive"></span>
                  <span>ของเข้าหน้างาน</span>
                </div>
                <div class="supply-legend-item">
                  <span class="supply-legend-dot supply-legend-install"></span>
                  <span>ช่วงติดตั้งจริง</span>
                </div>
              </div>
            </div>

            <!-- Gantt Board Card -->
            <div class="supply-gantt-board">
              <!-- Header Row: 350px Meta + 10 Months (20 Sub-cols) -->
              <div class="supply-gantt-row supply-gantt-header-row">
                <div class="supply-header-meta">
                  <span>รายการวัสดุก่อสร้าง / อ้างอิงแบบ</span>
                </div>
                ${c.months.map(m => `
                  <div class="supply-month-header">${m}</div>
                `).join('')}
              </div>

              <!-- 8 Material Rows -->
              ${c.materials.map(m => `
                <div class="supply-gantt-row" data-material-id="${m.id}">
                  <div class="supply-item-meta" title="${m.name} | อ้างอิงแบบ: ${m.ref} | เกณฑ์: ${m.criteria}">
                    <span class="supply-item-title">${m.name}</span>
                    <span class="supply-item-sub">อ้างอิงแบบ: ${m.ref} | เกณฑ์: ${m.criteria}</span>
                  </div>
                  <div class="supply-timeline-track">
                    <!-- Order Bar -->
                    <div class="supply-sub-track">
                      <div 
                        class="supply-bar supply-bar-order" 
                        style="grid-column: ${m.order.colStart} / span ${m.order.colSpan};"
                        title="${m.name} • สั่งซื้อ/อนุมัติ: ${m.order.label}">
                        <span>${formatM(m.order.label, m.order.colSpan)}</span>
                      </div>
                    </div>
                    <!-- Arrive Bar -->
                    <div class="supply-sub-track">
                      <div 
                        class="supply-bar supply-bar-arrive" 
                        style="grid-column: ${m.arrive.colStart} / span ${m.arrive.colSpan};"
                        title="${m.name} • ของเข้าหน้างาน: ${m.arrive.label}">
                        <span>${formatM(m.arrive.label, m.arrive.colSpan)}</span>
                      </div>
                    </div>
                    <!-- Install Bar -->
                    <div class="supply-sub-track">
                      <div 
                        class="supply-bar supply-bar-install" 
                        style="grid-column: ${m.install.colStart} / span ${m.install.colSpan};"
                        title="${m.name} • ช่วงติดตั้งจริง: ${m.install.label}">
                        <span>${formatM(m.install.label, m.install.colSpan)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        break;
      }

      case '3d-pile':
        bodyHTML = `
          <div class="bento-grid grid-cols-12">
            <div class="bento-card col-span-6" style="padding: 12px;">
              <div class="three-viewport-wrapper">
                <div class="three-overlay-hud">
                  <div class="three-tag"><span>●</span> PILE DRIVING RIG • DROP HAMMER</div>
                  <button id="resetPileBtn" class="three-controls-hint hud-btn">Reset View</button>
                </div>
                <canvas id="canvasPile3D" class="three-canvas"></canvas>
              </div>
            </div>
            <div class="bento-card col-span-6">
              <div class="card-title" style="margin-bottom: 14px;">ขั้นตอนวิศวกรรมงานฐานรากและเสาเข็ม</div>
              <div class="fragment-list">
                ${c.steps.map(s => `
                  <div class="tech-step-item" style="padding: 12px; border-radius: var(--radius-sm); border-left: 3px solid var(--accent-amber); margin-bottom: 10px;">
                    <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-amber);">${s.step}</div>
                    <div style="font-weight: 600; color: var(--text-pure); margin: 2px 0;">${s.title}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${s.desc}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
        break;

      case '3d-steel':
        bodyHTML = `
          <div class="bento-grid grid-cols-12">
            <div class="bento-card col-span-6" style="padding: 12px;">
              <div class="three-viewport-wrapper">
                <div class="three-overlay-hud">
                  <div class="three-tag"><span>●</span> CELLULAR BEAM SM520 & CORBEL</div>
                  <button id="resetBeamBtn" class="three-controls-hint hud-btn">Reset View</button>
                </div>
                <canvas id="canvasBeam3D" class="three-canvas"></canvas>
              </div>
            </div>
            <div class="bento-card col-span-6">
              <div class="card-title" style="margin-bottom: 14px;">ขั้นตอนการแปรรูปและติดตั้งโครงเหล็ก</div>
              <div class="fragment-list">
                ${c.steps.map(s => `
                  <div class="tech-step-item" style="padding: 12px; border-radius: var(--radius-sm); border-left: 3px solid var(--accent-cyan); margin-bottom: 10px;">
                    <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-cyan);">${s.step}</div>
                    <div style="font-weight: 600; color: var(--text-pure); margin: 2px 0;">${s.title}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${s.desc}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
        break;

      case '3d-floor':
        bodyHTML = `
          <div class="bento-grid grid-cols-12">
            <div class="bento-card col-span-6" style="padding: 12px;">
              <div class="three-viewport-wrapper">
                <div class="three-overlay-hud">
                  <div class="three-tag"><span>●</span> FLOOR STRATIGRAPHY • FS 250 MM</div>
                  <button id="resetFloorBtn" class="three-controls-hint hud-btn">Reset View</button>
                </div>
                <canvas id="canvasFloor3D" class="three-canvas"></canvas>
              </div>
            </div>
            <div class="bento-card col-span-6">
              <div class="card-title" style="margin-bottom: 14px;">มาตรฐานพื้นอุตสาหกรรม Super Flat</div>
              <div class="fragment-list">
                ${c.steps.map(s => `
                  <div class="tech-step-item" style="padding: 12px; border-radius: var(--radius-sm); border-left: 3px solid var(--accent-emerald); margin-bottom: 10px;">
                    <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-emerald);">${s.step}</div>
                    <div style="font-weight: 600; color: var(--text-pure); margin: 2px 0;">${s.title}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${s.desc}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
        break;

      case '3d-roof':
        bodyHTML = `
          <div class="bento-grid grid-cols-12">
            <div class="bento-card col-span-6" style="padding: 12px;">
              <div class="three-viewport-wrapper">
                <div class="three-overlay-hud">
                  <div class="three-tag"><span>●</span> ROOF & TRIMDEK • WEATHER-TIGHT 3D</div>
                  <button id="resetRoofBtn" class="three-controls-hint hud-btn">Reset View</button>
                </div>
                <canvas id="canvasRoof3D" class="three-canvas"></canvas>
              </div>
            </div>
            <div class="bento-card col-span-6">
              <div class="card-title" style="margin-bottom: 12px;">มาตรฐานระบบห่อหุ้มอาคารและฉนวนกันความร้อน</div>
              <div class="fragment-list">
                ${c.features.map(f => `
                  <div class="tech-step-item" style="padding: 10px 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--accent-cyan); margin-bottom: 8px;">
                    <div style="font-weight: 600; color: var(--text-pure); font-size: 0.88rem; margin-bottom: 4px;">${f.title}</div>
                    ${f.specs.map(sp => `
                      <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4; display: flex; align-items: flex-start; gap: 6px; margin-bottom: 2px;">
                        <span style="color: var(--accent-cyan);">▪</span><span>${sp}</span>
                      </div>
                    `).join('')}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
        break;

      case '3d-mep-road':
        bodyHTML = `
          <div class="bento-grid grid-cols-12">
            <div class="bento-card col-span-6" style="padding: 12px;">
              <div class="three-viewport-wrapper">
                <div class="three-overlay-hud">
                  <div class="three-tag"><span>●</span> INFRASTRUCTURE & ROAD 3D • P101/P102</div>
                  <button id="resetMepBtn" class="three-controls-hint hud-btn">Reset View</button>
                </div>
                <canvas id="canvasMep3D" class="three-canvas"></canvas>
              </div>
            </div>
            <div class="bento-card col-span-6">
              <div class="card-title" style="margin-bottom: 12px;">งานโครงสร้างพื้นฐาน ท่อใต้ดิน และถนน ค.ส.ล.</div>
              <div class="fragment-list">
                ${c.features.map(f => `
                  <div class="tech-step-item" style="padding: 10px 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--accent-blue); margin-bottom: 8px;">
                    <div style="font-weight: 600; color: var(--text-pure); font-size: 0.88rem; margin-bottom: 4px;">${f.title}</div>
                    ${f.specs.map(sp => `
                      <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4; display: flex; align-items: flex-start; gap: 6px; margin-bottom: 2px;">
                        <span style="color: var(--accent-sky);">▪</span><span>${sp}</span>
                      </div>
                    `).join('')}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
        break;

      case '3d-qaqc':
        bodyHTML = `
          <div class="bento-grid grid-cols-12">
            <div class="bento-card col-span-6" style="padding: 12px;">
              <div class="three-viewport-wrapper">
                <div class="three-overlay-hud">
                  <div class="three-tag"><span>●</span> QA/QC TESTING LAB • ITP & NDT 3D</div>
                  <button id="resetQaqcBtn" class="three-controls-hint hud-btn">Reset View</button>
                </div>
                <canvas id="canvasQaqc3D" class="three-canvas"></canvas>
              </div>
            </div>
            <div class="bento-card col-span-6">
              <div class="card-title" style="margin-bottom: 12px;">ขั้นตอนการควบคุมคุณภาพ (QA/QC Protocols)</div>
              <div class="fragment-list">
                ${c.protocols.map(p => `
                  <div class="tech-step-item" style="padding: 10px 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--accent-amber); margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                      <div style="font-weight: 600; color: var(--text-pure); font-size: 0.88rem;">${p.title}</div>
                      <span class="card-badge" style="font-size: 0.68rem; padding: 2px 6px;">${p.code}</span>
                    </div>
                    <div style="font-family: var(--font-mono); font-size: 0.74rem; color: var(--accent-amber); margin-bottom: 4px;">${p.req}</div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">${p.desc}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
        break;

      case '3d-hse':
        bodyHTML = `
          <div class="bento-grid grid-cols-12">
            <div class="bento-card col-span-6" style="padding: 12px;">
              <div class="three-viewport-wrapper">
                <div class="three-overlay-hud">
                  <div class="three-tag"><span>●</span> SMART SITE SAFETY & ENVIRONMENT 3D</div>
                  <button id="resetHseBtn" class="three-controls-hint hud-btn">Reset View</button>
                </div>
                <canvas id="canvasHse3D" class="three-canvas"></canvas>
              </div>
            </div>
            <div class="bento-card col-span-6">
              <div class="card-title" style="margin-bottom: 12px;">แผนความปลอดภัยและสิ่งแวดล้อม (Zero Accident)</div>
              <div class="fragment-list">
                ${c.pillars.map(p => `
                  <div class="tech-step-item" style="padding: 10px 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--accent-emerald); margin-bottom: 8px;">
                    <div style="font-weight: 600; color: var(--text-pure); font-size: 0.88rem; margin-bottom: 2px;">${p.title}</div>
                    <div style="font-family: var(--font-mono); font-size: 0.74rem; color: var(--accent-emerald); margin-bottom: 4px;">${p.req}</div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">${p.desc}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
        break;

      case 'feature-grid':
        bodyHTML = `
          <div class="bento-grid grid-cols-12">
            ${c.features.map(f => `
              <div class="bento-card col-span-4">
                <div class="card-title" style="margin-bottom: 12px; font-size: 1rem;">${f.title}</div>
                <div class="fragment-list">
                  ${f.specs.map(sp => `
                    <div class="fragment-item">
                      <div class="fragment-bullet"></div>
                      <div style="font-size: 0.85rem;">${sp}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        `;
        break;

      case 'qa-grid':
        bodyHTML = `
          <div class="bento-grid grid-cols-12">
            ${c.protocols.map(p => `
              <div class="bento-card col-span-4 highlight-cyan">
                <div class="card-badge" style="color: var(--accent-cyan); align-self: flex-start; margin-bottom: 8px;">${p.code}</div>
                <div class="card-title" style="margin-bottom: 6px;">${p.title}</div>
                <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-amber); margin-bottom: 10px;">${p.req}</div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">${p.desc}</p>
              </div>
            `).join('')}
          </div>
        `;
        break;

      case 'hse-grid':
        bodyHTML = `
          <div class="bento-grid grid-cols-12">
            ${c.pillars.map(p => `
              <div class="bento-card col-span-4 highlight-amber">
                <div class="card-title" style="color: var(--accent-amber); margin-bottom: 6px;">${p.title}</div>
                <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-cyan); margin-bottom: 10px;">${p.req}</div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">${p.desc}</p>
              </div>
            `).join('')}
          </div>
        `;
        break;

      case 'cashflow-chart': {
        const low = c.chartData.reduce((a, b) => a.net < b.net ? a : b);
        const peak = c.chartData.reduce((a, b) => a.outflow > b.outflow ? a : b);
        bodyHTML = `
          <style>
            #slide-${slide.id} .slide-header{display:none}
            #slide-${slide.id} .preview-head{flex-shrink:0;color:var(--text-pure)}
            #slide-${slide.id} .preview-kicker{display:flex;justify-content:space-between;border-bottom:1px solid var(--border-subtle);padding-bottom:18px;color:var(--accent-cyan);font-size:18px}
            #slide-${slide.id} .preview-head h1{font-size:38px;line-height:1.3;margin:22px 0 10px;font-weight:600}
            #slide-${slide.id} .preview-head p{font-size:22px;color:var(--text-secondary);margin:0 0 24px}
            #slide-${slide.id} .cash-decision{display:flex;gap:50px;align-items:center;padding:22px 28px;background:var(--accent-rose-dim);border-left:5px solid var(--accent-rose);color:var(--text-pure);flex-shrink:0}
            #slide-${slide.id} .cash-decision strong{display:block;font-size:38px;line-height:1.5;color:var(--accent-rose);margin:8px 0}
            #slide-${slide.id} .cash-decision span,#slide-${slide.id} .cash-decision small{font-size:19px}
            #slide-${slide.id} .cash-decision p{font-size:22px;line-height:1.65;margin:0}
            #slide-${slide.id} #cashFlowChartContainer{flex:1;min-height:0;margin:18px 0 0;display:flex;justify-content:center}
            #slide-${slide.id} #cashFlowChartContainer svg{height:100%;width:100%;overflow:visible}
            #slide-${slide.id} .cash-legend{display:flex;gap:28px;font-size:19px;padding:10px 0 20px;flex-shrink:0}
            #slide-${slide.id} .cash-legend span:nth-child(1){color:var(--accent-emerald)}
            #slide-${slide.id} .cash-legend span:nth-child(2){color:var(--accent-amber)}
            #slide-${slide.id} .cash-legend span:nth-child(3){color:var(--text-pure)}
            #slide-${slide.id} .cash-assumptions{border-top:1px solid var(--border-subtle);padding-top:16px;font-size:17px;line-height:1.6;color:var(--text-secondary);flex-shrink:0}
            #slide-${slide.id} .cash-assumptions p{margin:0}
            body.theme-bronze-stone #slide-${slide.id} .preview-head{color:#1f343b}
            body.theme-bronze-stone #slide-${slide.id} .preview-kicker{color:#006778}
            body.theme-bronze-stone #slide-${slide.id} .cash-decision{background:#fff1ed;border-color:#b42318;color:#1f343b}
            body.theme-bronze-stone #slide-${slide.id} .cash-decision strong{color:#b42318}
            body.theme-bronze-stone #slide-${slide.id} .cash-legend span:nth-child(1){color:#165d63}
            body.theme-bronze-stone #slide-${slide.id} .cash-legend span:nth-child(2){color:#936415}
            body.theme-bronze-stone #slide-${slide.id} .cash-legend span:nth-child(3){color:#1f343b}
            body.theme-bronze-stone #slide-${slide.id} #cashFlowChartContainer svg path{stroke:#1f343b}
            body.theme-bronze-stone #slide-${slide.id} #cashFlowChartContainer svg rect:has(title){opacity:1;rx:0}
            body.theme-bronze-stone #slide-${slide.id} #cashFlowChartContainer svg rect:has(title):nth-of-type(even){fill:#165d63}
            body.theme-bronze-stone #slide-${slide.id} #cashFlowChartContainer svg rect:has(title):nth-of-type(odd){fill:#936415}
          </style>
          <header class="preview-head"><div class="preview-kicker"><span>FINANCIAL LIQUIDITY / แผนบริหารกระแสเงินสด</span><span>${String(slide.id).padStart(2, "0")} / 21</span></div><h1>แผนบริหารกระแสเงินสด 14 เดือน</h1><p>ฐานก่อน VAT · เครดิตค่างวด 30 วัน · ใช้ข้อมูลจริงชุดเดิม</p></header>
          <div class="cash-decision"><div><span>จุดต่ำสุด · ${low.m}</span><strong>${low.net.toFixed(3).replace('-', '−')} ล้านบาท</strong><small>วงเงินตามแบบจำลองอย่างน้อย ${(Math.ceil(-low.net * 1000) / 1000).toFixed(3)}M</small></div><p>เตรียมสภาพคล่องก่อนช่วงงานเหล็กและพื้น<br>รายจ่ายสูงสุด ${peak.m}: ${peak.outflow.toFixed(2)}M</p></div>
          <div id="cashFlowChartContainer" class="chart-container"></div>
          <div class="cash-legend"><span>■ เงินเข้า</span><span>■ เงินออก</span><span>━ เงินสดสะสม</span></div>
          <footer class="cash-assumptions"><p><strong>ข้อสมมติยังครบ:</strong> ${c.notes.map(n => `<span title="${n.title}">${n.desc}</span>`).join(' · ')}</p><p>${c.basisNote}</p></footer>
        `;
        break;
      }

      case 'governance-cards':
        bodyHTML = `
          <div class="gov-container">
            <div class="gov-grid">
              <!-- Tier 01: Tactical Level (Site Meeting) -->
              <div class="gov-tier-card gov-tier-cyan">
                <div class="gov-tier-header">
                  <div class="gov-tier-header-top">
                    <div class="gov-tier-badge cyan-pill">
                      <span class="gov-tier-icon">${c.siteMeeting.icon}</span>
                      <span>${c.siteMeeting.tier}</span>
                    </div>
                    <span class="gov-freq-badge cyan-freq">⏱️ ${c.siteMeeting.schedule}</span>
                  </div>
                  <div class="gov-tier-title-row">
                    <h2 class="gov-tier-title">${c.siteMeeting.name}</h2>
                    <span class="gov-badge-sub cyan-sub">${c.siteMeeting.badge}</span>
                  </div>
                  <div class="gov-tier-attendees">
                    <span class="attendee-label">👥 ผู้เข้าร่วม:</span>
                    <span class="attendee-names">${c.siteMeeting.attendees}</span>
                  </div>
                </div>

                <div class="gov-agenda-list">
                  ${c.siteMeeting.agendas.map(ag => `
                    <div class="gov-agenda-item cyan-hover">
                      <div class="gov-agenda-num cyan-num">${ag.num}</div>
                      <div class="gov-agenda-icon-wrap">${ag.icon}</div>
                      <div class="gov-agenda-content">
                        <div class="gov-agenda-header">
                          <span class="gov-agenda-title">${ag.title}</span>
                          <span class="gov-agenda-tag cyan-tag">${ag.tag}</span>
                        </div>
                        <div class="gov-agenda-desc">${ag.desc}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Tier 02: Strategic Level (HQ Review) -->
              <div class="gov-tier-card gov-tier-amber">
                <div class="gov-tier-header">
                  <div class="gov-tier-header-top">
                    <div class="gov-tier-badge amber-pill">
                      <span class="gov-tier-icon">${c.hqReview.icon}</span>
                      <span>${c.hqReview.tier}</span>
                    </div>
                    <span class="gov-freq-badge amber-freq">⏱️ ${c.hqReview.schedule}</span>
                  </div>
                  <div class="gov-tier-title-row">
                    <h2 class="gov-tier-title">${c.hqReview.name}</h2>
                    <span class="gov-badge-sub amber-sub">${c.hqReview.badge}</span>
                  </div>
                  <div class="gov-tier-attendees">
                    <span class="attendee-label">👥 ผู้เข้าร่วม:</span>
                    <span class="attendee-names">${c.hqReview.attendees}</span>
                  </div>
                </div>

                <div class="gov-agenda-list">
                  ${c.hqReview.agendas.map(ag => `
                    <div class="gov-agenda-item amber-hover">
                      <div class="gov-agenda-num amber-num">${ag.num}</div>
                      <div class="gov-agenda-icon-wrap">${ag.icon}</div>
                      <div class="gov-agenda-content">
                        <div class="gov-agenda-header">
                          <span class="gov-agenda-title">${ag.title}</span>
                          <span class="gov-agenda-tag amber-tag">${ag.tag}</span>
                        </div>
                        <div class="gov-agenda-desc">${ag.desc}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Bottom Governance SLA & Control Protocol Bar -->
            <div class="gov-sla-strip">
              <div class="gov-sla-lead">
                <span class="gov-sla-pulse"></span>
                <span class="gov-sla-lead-text">CADENCE PROTOCOL & SLA</span>
              </div>
              <div class="gov-sla-items">
                ${c.sla.map(s => `
                  <div class="gov-sla-card">
                    <span class="gov-sla-icon">${s.icon}</span>
                    <span class="gov-sla-label">${s.label}</span>
                    <span class="gov-sla-text">${s.text}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
        break;

      case 'commercial-baseline':
        bodyHTML = `
          <div class="baseline-deck">
            <!-- Top 4 KPI Metric Banners -->
            <div class="baseline-kpi-deck">
              ${c.metrics.map((m, idx) => `
                <div class="baseline-kpi-tile highlight-${m.color} anim-fade-up anim-delay-${idx + 1}">
                  <div class="kpi-tile-header">
                    <span class="kpi-tile-label">${m.label}</span>
                    <span class="kpi-tile-dot ${m.color}-dot"></span>
                  </div>
                  <div class="kpi-tile-main">
                    <span class="kpi-tile-val ${m.color}">${m.val}</span>
                    <span class="kpi-tile-sub">${m.sub}</span>
                  </div>
                  <div class="kpi-tile-note">${m.note}</div>
                </div>
              `).join('')}
            </div>

            <!-- Bottom 8 Commercial Terms Cards (2x4 Grid) -->
            <div class="baseline-terms-board">
              ${c.terms.map((t, idx) => `
                <div class="baseline-term-box anim-fade-up anim-delay-${(idx % 4) + 1}">
                  <div class="term-box-top">
                    <span class="term-box-num">${t.num}</span>
                    <span class="term-box-title">${t.title}</span>
                    <span class="term-box-badge">${t.tag}</span>
                  </div>
                  <div class="term-box-desc">${t.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        break;

      case 'handover-protocol':
        bodyHTML = `
          <div class="handover-deck">
            <!-- Left Column: 5 Handover Steps -->
            <div class="handover-main-col">
              <div class="handover-deck-header">
                <div class="deck-header-left">
                  <span class="deck-header-icon">🤝</span>
                  <div>
                    <div class="deck-header-title">5-STEP HANDOVER PROTOCOL (ESTIMATOR → PM)</div>
                    <div class="deck-header-sub">ขั้นตอนส่งมอบงบประมาณและข้อมูลสัญญาจากทีมประมาณราคาสู่หน่วยงานสนาม</div>
                  </div>
                </div>
                <span class="deck-header-badge cyan-pill">5 ขั้นตอนมาตรฐาน</span>
              </div>

              <div class="handover-trail">
                ${c.steps.map((s, idx) => `
                  <div class="handover-trail-step anim-fade-up anim-delay-${idx + 1}">
                    <div class="trail-step-left">
                      <span class="trail-step-num">${s.step}</span>
                      ${idx < c.steps.length - 1 ? '<span class="trail-step-connector"></span>' : ''}
                    </div>
                    <div class="trail-step-card">
                      <div class="trail-card-head">
                        <span class="trail-card-icon">${s.icon}</span>
                        <span class="trail-card-title">${s.title}</span>
                        <span class="trail-card-actor">${s.actor}</span>
                        <span class="trail-card-tag">${s.tag}</span>
                      </div>
                      <div class="trail-card-desc">${s.desc}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Right Column: 4 Re-Estimate Pillars -->
            <div class="reestimate-main-col">
              <div class="handover-deck-header">
                <div class="deck-header-left">
                  <span class="deck-header-icon">📐</span>
                  <div>
                    <div class="deck-header-title">ENGINEERING RE-ESTIMATE & VALUE ANALYSIS</div>
                    <div class="deck-header-sub">การทบทวนปริมาณงานวิศวกรรมเพื่อล็อกต้นทุนและลดของเสีย</div>
                  </div>
                </div>
                <span class="deck-header-badge amber-pill">4 เสาหลักประหยัดต้นทุน</span>
              </div>

              <div class="reestimate-cards-stack">
                ${c.reEstimatePillars.map((p, idx) => `
                  <div class="reestimate-tile border-${p.color} anim-fade-up anim-delay-${idx + 1}">
                    <div class="reestimate-tile-top">
                      <span class="tile-dot ${p.color}-dot"></span>
                      <span class="reestimate-tile-title text-${p.color}">${p.pillar}</span>
                    </div>
                    <div class="reestimate-tile-body">${p.desc}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
        break;

      case 'mobilization-matrix':
        bodyHTML = `
          <style>
            #slide-${slide.id} .slide-header{display:none}
            #slide-${slide.id} .preview-head{flex-shrink:0;margin-bottom:14px;color:var(--text-pure)}
            #slide-${slide.id} .preview-kicker{display:flex;justify-content:space-between;border-bottom:1px solid var(--border-subtle);padding-bottom:14px;color:var(--accent-cyan);font-size:18px;letter-spacing:1px}
            #slide-${slide.id} .preview-head h1{font-size:38px;line-height:1.25;margin:16px 0 8px;font-weight:600}
            #slide-${slide.id} .preview-head p{font-size:22px;color:var(--text-secondary);margin:0}
            #slide-${slide.id} .mob-deck-container{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden;box-sizing:border-box}
            #slide-${slide.id} .mob-matrix-legend{display:flex;gap:20px;align-items:center;padding:10px 18px;margin-bottom:14px;background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle);border-radius:10px;flex-shrink:0;font-size:17px;color:var(--text-secondary)}
            #slide-${slide.id} .mob-matrix-legend .legend-item{display:flex;align-items:center;gap:8px}
            #slide-${slide.id} .mob-matrix-legend strong{color:var(--text-pure);font-weight:600}
            #slide-${slide.id} .legend-dot{width:12px;height:12px;border-radius:50%;display:inline-block;flex-shrink:0}
            #slide-${slide.id} .dot-cyan{background:#00e5ff;box-shadow:0 0 8px rgba(0,229,255,0.4)}
            #slide-${slide.id} .dot-sky{background:#38bdf8;box-shadow:0 0 8px rgba(56,189,248,0.4)}
            #slide-${slide.id} .dot-emerald{background:#10b981;box-shadow:0 0 8px rgba(16,185,129,0.4)}
            #slide-${slide.id} .dot-amber{background:#f59e0b;box-shadow:0 0 8px rgba(245,158,11,0.4)}
            #slide-${slide.id} .legend-gate{margin-left:auto;color:var(--accent-emerald);font-weight:600}
            #slide-${slide.id} .mob-deck-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;flex:1;min-height:0}
            #slide-${slide.id} .mob-week-column{background:rgba(15,23,42,0.85);border:1px solid var(--border-subtle);border-radius:14px;padding:16px 18px;display:flex;flex-direction:column;min-height:0;backdrop-filter:blur(12px);gap:12px;box-shadow:0 4px 20px rgba(0,0,0,0.25)}
            #slide-${slide.id} .mob-col-cyan{border-top:5px solid #00e5ff}
            #slide-${slide.id} .mob-col-sky{border-top:5px solid #38bdf8}
            #slide-${slide.id} .mob-col-emerald{border-top:5px solid #10b981}
            #slide-${slide.id} .mob-col-amber{border-top:5px solid #f59e0b}
            #slide-${slide.id} .mob-col-header{display:flex;flex-direction:column;gap:8px;padding-bottom:12px;border-bottom:1px solid var(--border-subtle);flex-shrink:0}
            #slide-${slide.id} .mob-col-header-top{display:flex;align-items:center;justify-content:space-between}
            #slide-${slide.id} .mob-col-icon{font-size:26px}
            #slide-${slide.id} .mob-week-tag{font-family:var(--font-mono);font-size:16px;font-weight:700;padding:4px 12px;border-radius:8px;letter-spacing:0.5px}
            #slide-${slide.id} .mob-col-theme{font-weight:700;font-size:20px;color:var(--text-pure);line-height:1.35}
            #slide-${slide.id} .mob-tasks-stack{display:flex;flex-direction:column;gap:10px;flex:1;min-height:0;justify-content:space-between}
            #slide-${slide.id} .mob-task-box{background:rgba(255,255,255,0.035);border:1px solid var(--border-subtle);border-radius:10px;padding:10px 14px;display:flex;flex-direction:column;gap:6px;flex:1;min-height:0;justify-content:center}
            #slide-${slide.id} .mob-task-head{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
            #slide-${slide.id} .mob-task-name{font-weight:700;font-size:17px;color:var(--text-pure);line-height:1.35;flex:1}
            #slide-${slide.id} .mob-task-owner{font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--accent-cyan);background:rgba(255,255,255,0.06);padding:3px 8px;border-radius:4px;flex-shrink:0;white-space:nowrap}
            #slide-${slide.id} .mob-task-desc{font-size:15px;color:var(--text-secondary);line-height:1.45}
            #slide-${slide.id} .mob-gate-checklist{padding:10px 14px;border-radius:6px;font-size:15px;font-weight:600;display:flex;align-items:center;gap:10px;flex-shrink:0;min-height:50px;background:rgba(255,255,255,0.035);border:3px solid #10b981 !important}
            #slide-${slide.id} .checklist-check{font-weight:800;font-size:19px;flex-shrink:0;color:#10b981 !important}
            #slide-${slide.id} .checklist-text{line-height:1.4;color:var(--text-pure)}
            body.theme-bronze-stone #slide-${slide.id} .preview-head{color:#1f343b}
            body.theme-bronze-stone #slide-${slide.id} .preview-kicker{color:#006778;border-color:#e1d7c5}
            body.theme-bronze-stone #slide-${slide.id} .preview-head p{color:#52525b}
            body.theme-bronze-stone #slide-${slide.id} .mob-matrix-legend{background:#fdfcf9;border-color:#e1d7c5;color:#52525b}
            body.theme-bronze-stone #slide-${slide.id} .mob-matrix-legend strong{color:#1f343b}
            body.theme-bronze-stone #slide-${slide.id} .legend-gate{color:#165d63}
            body.theme-bronze-stone #slide-${slide.id} .mob-week-column{background:#ffffff;border-color:#e1d7c5;box-shadow:0 4px 18px rgba(38,38,38,0.06)}
            body.theme-bronze-stone #slide-${slide.id} .mob-col-header{border-color:#f0ebe1}
            body.theme-bronze-stone #slide-${slide.id} .mob-col-theme{color:#18181b}
            body.theme-bronze-stone #slide-${slide.id} .mob-task-box{background:#faf9f6;border-color:#e8e2d5}
            body.theme-bronze-stone #slide-${slide.id} .mob-task-name{color:#18181b}
            body.theme-bronze-stone #slide-${slide.id} .mob-task-owner{color:#92400e;background:rgba(180,83,9,0.08)}
            body.theme-bronze-stone #slide-${slide.id} .mob-task-desc{color:#3f3f46}
            body.theme-bronze-stone #slide-${slide.id} .mob-gate-checklist{background:#f4f0e8 !important;border:3px solid #059669 !important}
            body.theme-bronze-stone #slide-${slide.id} .checklist-check{color:#059669 !important}
            body.theme-bronze-stone #slide-${slide.id} .checklist-text{color:#18181b}
          </style>
          <header class="preview-head">
            <div class="preview-kicker"><span>SITE MOBILIZATION / แผนปฏิบัติการ 4 สัปดาห์แรก</span><span>${String(slide.id).padStart(2, "0")} / 21</span></div>
            <h1>${slide.title}</h1>
            <p>${slide.subtitle}</p>
          </header>
          <div class="mob-deck-container">
            <div class="mob-matrix-legend">
              <div class="legend-item"><span class="legend-dot dot-cyan"></span><strong>สัปดาห์ 01:</strong> สำรวจ & พื้นที่ชั่วคราว</div>
              <div class="legend-item"><span class="legend-dot dot-sky"></span><strong>สัปดาห์ 02:</strong> สำนักงานสนาม & แคมป์</div>
              <div class="legend-item"><span class="legend-dot dot-emerald"></span><strong>สัปดาห์ 03:</strong> เครื่องมือ & ความปลอดภัย</div>
              <div class="legend-item"><span class="legend-dot dot-amber"></span><strong>สัปดาห์ 04:</strong> เครื่องจักร & งานเข็มต้นแรก</div>
              <div class="legend-item legend-gate"><strong>✓ Gate Criteria:</strong> ต้องผ่านเกณฑ์ 100% ก่อนเปิดไซต์งานถัดไป</div>
            </div>
            <div class="mob-deck-grid">
              ${c.weeks.map((w, idx) => `
                <div class="mob-week-column mob-col-${w.color} anim-fade-up anim-delay-${idx + 1}">
                  <div class="mob-col-header">
                    <div class="mob-col-header-top">
                      <span class="mob-col-icon">${w.icon}</span>
                      <span class="mob-week-tag ${w.color}-pill">${w.week}</span>
                    </div>
                    <div class="mob-col-theme">${w.theme}</div>
                  </div>

                  <div class="mob-tasks-stack">
                    ${w.items.map(it => `
                      <div class="mob-task-box">
                        <div class="mob-task-head">
                          <span class="mob-task-name">${it.title}</span>
                          <span class="mob-task-owner">${it.owner}</span>
                        </div>
                        <div class="mob-task-desc">${it.desc}</div>
                      </div>
                    `).join('')}
                  </div>

                  <div class="mob-gate-checklist ${w.color}-checklist">
                    <span class="checklist-check">✓</span>
                    <span class="checklist-text">${w.checklist}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        break;

      case 'cost-lock-plan': {
        const monthOwners = [
          { owner: 'PM & Cost Controller', roleDesc: 'ฝ่ายบริหารสัญญา & ควบคุมงบดำเนินงานสนาม' },
          { owner: 'Structural Engineer & QS', roleDesc: 'ฝ่ายวิศวกรรมโครงสร้าง & จัดซื้อเหล็ก-คอนกรีต' },
          { owner: 'Lead QS & Project Director', roleDesc: 'ฝ่ายควบคุมต้นทุนสถาปัตย์ & ผู้บริหารโครงการ' }
        ];

        bodyHTML = `
          <style>
            #slide-10 .slide-header{display:none}
            #slide-10 .preview-head{flex-shrink:0;margin-bottom:10px;color:var(--text-pure)}
            #slide-10 .preview-kicker{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-subtle);padding-bottom:10px;color:var(--accent-cyan);font-size:16px;letter-spacing:0.5px}
            #slide-10 .preview-head h1{font-size:32px;line-height:1.2;margin:12px 0 4px;font-weight:600}
            #slide-10 .preview-head p{font-size:19px;color:var(--text-secondary);margin:0}
            #slide-10 .costlock-deck-container{display:flex;flex-direction:column;flex:1;min-height:0;width:100%;overflow:hidden;box-sizing:border-box}
            #slide-10 .costlock-framework-guide{display:flex;gap:16px;align-items:center;padding:7px 16px;margin-bottom:10px;background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle);border-radius:8px;flex-shrink:0;font-size:14.5px;color:var(--text-secondary)}
            #slide-10 .costlock-framework-guide strong{color:var(--text-pure);font-weight:600}
            #slide-10 .costlock-framework-guide .guide-step{display:flex;align-items:center;gap:6px}
            #slide-10 .costlock-framework-guide .step-num{display:inline-flex;align-items:center;justify-content:center;width:19px;height:19px;border-radius:50%;background:rgba(255,255,255,0.08);color:var(--accent-cyan);font-size:11.5px;font-weight:700}
            #slide-10 .costlock-framework-guide .guide-sep{color:var(--text-muted);font-size:13px}
            #slide-10 .costlock-deck-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;flex:1;min-height:0;width:100%;box-sizing:border-box}
            #slide-10 .costlock-month-col{background:rgba(15,23,42,0.85);border:1px solid var(--border-subtle);border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;min-height:0;min-width:0;max-width:100%;overflow:hidden;backdrop-filter:blur(12px);gap:8px;box-shadow:0 4px 20px rgba(0,0,0,0.25);justify-content:space-between;box-sizing:border-box}
            #slide-10 .costlock-col-cyan{border-top:4.5px solid #00e5ff}
            #slide-10 .costlock-col-amber{border-top:4.5px solid #f59e0b}
            #slide-10 .costlock-col-emerald{border-top:4.5px solid #10b981}
            #slide-10 .costlock-card-header{display:flex;flex-direction:column;gap:6px;padding-bottom:7px;border-bottom:1px solid var(--border-subtle);flex-shrink:0;min-width:0}
            #slide-10 .costlock-card-top{display:flex;align-items:center;justify-content:space-between;gap:6px;min-width:0}
            #slide-10 .costlock-icon-wrap{font-size:22px;flex-shrink:0}
            #slide-10 .costlock-month-title{font-size:18px;font-weight:700;color:var(--text-pure);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            #slide-10 .costlock-phase-badge{font-family:var(--font-mono);font-size:13px;font-weight:700;padding:2px 8px;border-radius:6px;white-space:nowrap;flex-shrink:0}
            #slide-10 .costlock-target-badge{display:flex;flex-direction:column;gap:2px;padding:5px 9px;border-radius:7px;background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle);min-width:0}
            #slide-10 .target-label{font-size:12px;color:var(--text-secondary);font-weight:500}
            #slide-10 .target-val{font-size:13.5px;color:var(--text-pure);font-weight:700;line-height:1.35;overflow-wrap:break-word;word-break:break-word}
            #slide-10 .costlock-owner-row{display:flex;align-items:center;gap:7px;padding:5px 9px;border-radius:7px;background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle);flex-shrink:0;min-width:0}
            #slide-10 .owner-pill-tag{font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.5px;padding:2px 6px;border-radius:4px;color:var(--accent-cyan);background:rgba(0,229,255,0.1);flex-shrink:0}
            #slide-10 .owner-pill-content{display:flex;align-items:baseline;gap:5px;min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
            #slide-10 .owner-name{font-size:13px;font-weight:700;color:var(--text-pure);white-space:nowrap;flex-shrink:0}
            #slide-10 .owner-desc{font-size:12px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            #slide-10 .costlock-actions-list{display:flex;flex-direction:column;gap:6px;flex:1;min-height:0;justify-content:space-between;min-width:0}
            #slide-10 .actions-list-header{display:flex;align-items:center;gap:6px;padding-bottom:1px;flex-shrink:0;min-width:0}
            #slide-10 .action-pill-tag{font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.5px;padding:2px 6px;border-radius:4px;color:var(--accent-amber);background:rgba(245,158,11,0.1);flex-shrink:0}
            #slide-10 .actions-list-title{font-size:13.5px;font-weight:700;color:var(--text-pure)}
            #slide-10 .costlock-action-row{display:flex;align-items:flex-start;gap:7px;padding:5px 9px;border-radius:7px;font-size:12.5px;line-height:1.38;box-sizing:border-box;min-width:0}
            #slide-10 .costlock-action-row.action-primary{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-left:4px solid #00e5ff}
            #slide-10 .costlock-action-row.action-primary.action-cyan{border-left-color:#00e5ff}
            #slide-10 .costlock-action-row.action-primary.action-amber{border-left-color:#f59e0b}
            #slide-10 .costlock-action-row.action-primary.action-emerald{border-left-color:#10b981}
            #slide-10 .costlock-action-row.action-standard{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-left:4px solid transparent}
            #slide-10 .action-bullet{width:6px;height:6px;border-radius:50%;margin-top:5px;flex-shrink:0}
            #slide-10 .cyan-bullet{background:#00e5ff;box-shadow:0 0 6px rgba(0,229,255,0.6)}
            #slide-10 .amber-bullet{background:#f59e0b;box-shadow:0 0 6px rgba(245,158,11,0.6)}
            #slide-10 .emerald-bullet{background:#10b981;box-shadow:0 0 6px rgba(16,185,129,0.6)}
            #slide-10 .neutral-bullet{background:rgba(255,255,255,0.3);box-shadow:none}
            #slide-10 .action-text{min-width:0;flex:1;overflow-wrap:break-word;word-break:break-word}
            #slide-10 .action-primary .action-text{color:var(--text-pure);font-weight:600}
            #slide-10 .action-standard .action-text{color:var(--text-secondary);font-weight:400}
            #slide-10 .action-tag{display:inline-block;font-size:11px;font-weight:700;padding:1px 5px;border-radius:3px;margin-right:5px;vertical-align:baseline;line-height:1.25}
            #slide-10 .cyan-tag{color:#00e5ff;background:rgba(0,229,255,0.14)}
            #slide-10 .amber-tag{color:#f59e0b;background:rgba(245,158,11,0.14)}
            #slide-10 .emerald-tag{color:#10b981;background:rgba(16,185,129,0.14)}
            #slide-10 .costlock-evidence-block{display:flex;flex-direction:column;gap:5px;padding-top:7px;border-top:1px solid var(--border-subtle);flex-shrink:0;min-width:0}
            #slide-10 .evidence-header-label{display:flex;align-items:center;gap:6px;flex-shrink:0;min-width:0}
            #slide-10 .evidence-pill-tag{font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.5px;padding:2px 6px;border-radius:4px;color:var(--accent-emerald);background:rgba(16,185,129,0.1);flex-shrink:0}
            #slide-10 .evidence-title-text{font-size:13px;font-weight:700;color:var(--text-pure)}
            #slide-10 .costlock-footer-boxes{display:flex;flex-direction:column;gap:5px;border:none;padding:0;min-width:0}
            #slide-10 .footer-box{display:flex;align-items:flex-start;gap:6px;padding:5px 9px;border-radius:7px;font-size:12.5px;line-height:1.38;min-width:0;box-sizing:border-box}
            #slide-10 .deliverable-box{background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle)}
            #slide-10 .kpi-box{background:rgba(255,255,255,0.04);border:1px solid var(--border-subtle)}
            #slide-10 .box-label{font-weight:700;font-size:12px;color:var(--text-pure);white-space:nowrap;flex-shrink:0}
            #slide-10 .box-content{font-size:12.5px;color:var(--text-secondary);font-weight:400;flex:1;min-width:0;overflow-wrap:break-word;word-break:break-word}
            body.theme-bronze-stone #slide-10 .preview-head{color:#1f343b}
            body.theme-bronze-stone #slide-10 .preview-kicker{color:#006778;border-color:#e1d7c5}
            body.theme-bronze-stone #slide-10 .preview-head p{color:#52525b}
            body.theme-bronze-stone #slide-10 .costlock-framework-guide{background:#fdfcf9;border-color:#e1d7c5;color:#52525b}
            body.theme-bronze-stone #slide-10 .costlock-framework-guide strong{color:#1f343b}
            body.theme-bronze-stone #slide-10 .costlock-framework-guide .step-num{background:#e8e2d5;color:#006778}
            body.theme-bronze-stone #slide-10 .costlock-framework-guide .guide-sep{color:#8c827a}
            body.theme-bronze-stone #slide-10 .costlock-month-col{background:#ffffff;border-color:#e1d7c5;box-shadow:0 4px 18px rgba(38,38,38,0.06)}
            body.theme-bronze-stone #slide-10 .costlock-card-header{border-color:#f0ebe1}
            body.theme-bronze-stone #slide-10 .costlock-month-title{color:#18181b}
            body.theme-bronze-stone #slide-10 .costlock-target-badge{background:#faf9f6;border-color:#e8e2d5}
            body.theme-bronze-stone #slide-10 .target-label{color:#71717a}
            body.theme-bronze-stone #slide-10 .target-val{color:#18181b}
            body.theme-bronze-stone #slide-10 .costlock-owner-row{background:#fbf9f5;border-color:#e8e2d5}
            body.theme-bronze-stone #slide-10 .owner-pill-tag{color:#006778;background:rgba(0,103,120,0.1)}
            body.theme-bronze-stone #slide-10 .owner-name{color:#18181b}
            body.theme-bronze-stone #slide-10 .owner-desc{color:#71717a}
            body.theme-bronze-stone #slide-10 .action-pill-tag{color:#92400e;background:rgba(180,83,9,0.1)}
            body.theme-bronze-stone #slide-10 .actions-list-title{color:#18181b}
            body.theme-bronze-stone #slide-10 .costlock-action-row.action-primary{background:#faf8f5;border:1px solid #e8e2d5}
            body.theme-bronze-stone #slide-10 .costlock-action-row.action-primary.action-cyan{border-left:4px solid #006778}
            body.theme-bronze-stone #slide-10 .costlock-action-row.action-primary.action-amber{border-left:4px solid #b45309}
            body.theme-bronze-stone #slide-10 .costlock-action-row.action-primary.action-emerald{border-left:4px solid #059669}
            body.theme-bronze-stone #slide-10 .costlock-action-row.action-standard{background:#fdfbf7;border:1px solid #f0ebe1;border-left:4px solid transparent}
            body.theme-bronze-stone #slide-10 .cyan-bullet{background:#006778;box-shadow:none}
            body.theme-bronze-stone #slide-10 .amber-bullet{background:#b45309;box-shadow:none}
            body.theme-bronze-stone #slide-10 .emerald-bullet{background:#059669;box-shadow:none}
            body.theme-bronze-stone #slide-10 .neutral-bullet{background:#a1a1aa;box-shadow:none}
            body.theme-bronze-stone #slide-10 .cyan-tag{color:#006778;background:rgba(0,103,120,0.08)}
            body.theme-bronze-stone #slide-10 .amber-tag{color:#92400e;background:rgba(180,83,9,0.08)}
            body.theme-bronze-stone #slide-10 .emerald-tag{color:#047857;background:rgba(5,150,105,0.08)}
            body.theme-bronze-stone #slide-10 .action-primary .action-text{color:#18181b}
            body.theme-bronze-stone #slide-10 .action-standard .action-text{color:#52525b}
            body.theme-bronze-stone #slide-10 .costlock-evidence-block{border-color:#f0ebe1}
            body.theme-bronze-stone #slide-10 .evidence-pill-tag{color:#059669;background:rgba(5,150,105,0.1)}
            body.theme-bronze-stone #slide-10 .evidence-title-text{color:#18181b}
            body.theme-bronze-stone #slide-10 .deliverable-box{background:#faf9f6;border-color:#e8e2d5}
            body.theme-bronze-stone #slide-10 .kpi-box{background:#f4f0e8 !important;border-color:#e1d7c5}
            body.theme-bronze-stone #slide-10 .box-label{color:#18181b}
            body.theme-bronze-stone #slide-10 .box-content{color:#3f3f46}
          </style>
          <header class="preview-head">
            <div class="preview-kicker"><span>COST CONTROL ACTION PLAN / แผนปฏิบัติการล็อกต้นทุน 3 เดือน</span><span>10 / 30</span></div>
            <h1>${slide.title}</h1>
            <p>${slide.subtitle}</p>
          </header>
          <div class="costlock-deck-container">
            <div class="costlock-framework-guide">
              <div class="guide-title"><strong>กรอบการอ่าน (Execution Framework):</strong></div>
              <div class="guide-step"><span class="step-num">1</span><strong>OWNER:</strong> ผู้รับผิดชอบสายงาน</div>
              <div class="guide-sep">➔</div>
              <div class="guide-step"><span class="step-num">2</span><strong>ACTION:</strong> ล็อกต้นทุน (เน้นตามลำดับความสำคัญ)</div>
              <div class="guide-sep">➔</div>
              <div class="guide-step"><span class="step-num">3</span><strong>EVIDENCE:</strong> เอกสารส่งมอบ &amp; KPI ตรวจรับ</div>
            </div>
            <div class="costlock-deck-grid">
              ${c.months.map((m, idx) => `
                <div class="costlock-month-col costlock-col-${m.color} anim-fade-up anim-delay-${idx + 1}">
                  <div class="costlock-card-header">
                    <div class="costlock-card-top">
                      <span class="costlock-icon-wrap">${m.icon}</span>
                      <span class="costlock-month-title">${m.month}</span>
                      <span class="costlock-phase-badge ${m.color}-pill">${m.badge}</span>
                    </div>
                    <div class="costlock-target-badge ${m.color}-target">
                      <span class="target-label">เป้าหมายหลัก:</span>
                      <span class="target-val">${m.target}</span>
                    </div>
                  </div>

                  <div class="costlock-owner-row">
                    <span class="owner-pill-tag">1. OWNER</span>
                    <div class="owner-pill-content">
                      <span class="owner-name">${monthOwners[idx].owner}</span>
                      <span class="owner-desc">(${monthOwners[idx].roleDesc})</span>
                    </div>
                  </div>

                  <div class="costlock-actions-list">
                    <div class="actions-list-header">
                      <span class="action-pill-tag">2. ACTION</span>
                      <span class="actions-list-title">มาตรการควบคุมต้นทุน:</span>
                    </div>
                    ${m.actions.map((act, aIdx) => {
                      const isPrimary = (idx === 0 && (aIdx === 0 || aIdx === 3)) ||
                                        (idx === 1 && (aIdx === 1 || aIdx === 3)) ||
                                        (idx === 2 && (aIdx === 0 || aIdx === 3));
                      const tag = (idx === 0 && aIdx === 0) ? 'ล็อกสัญญาเช่า' :
                                  (idx === 0 && aIdx === 3) ? 'สรุป Burn-rate' :
                                  (idx === 1 && aIdx === 1) ? 'ล็อก 8.64M' :
                                  (idx === 1 && aIdx === 3) ? 'ล็อก GP 12%' :
                                  (idx === 2 && aIdx === 0) ? 'ล็อก 6.20M' :
                                  (idx === 2 && aIdx === 3) ? 'ล็อกผลกำไร' : '';
                      return `
                        <div class="costlock-action-row ${isPrimary ? `action-primary action-${m.color}` : 'action-standard'}">
                          <span class="action-bullet ${isPrimary ? `${m.color}-bullet` : 'neutral-bullet'}"></span>
                          <span class="action-text">${isPrimary ? `<span class="action-tag ${m.color}-tag">${tag}</span>` : ''}${act}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>

                  <div class="costlock-evidence-block">
                    <div class="evidence-header-label">
                      <span class="evidence-pill-tag">3. EVIDENCE</span>
                      <span class="evidence-title-text">หลักฐานส่งมอบ &amp; เกณฑ์ชี้วัด:</span>
                    </div>
                    <div class="costlock-footer-boxes">
                      <div class="footer-box deliverable-box">
                        <span class="box-label">📁 เอกสารส่งมอบ:</span>
                        <span class="box-content">${m.deliverable}</span>
                      </div>
                      <div class="footer-box kpi-box ${m.color}-kpi-box">
                        <span class="box-label">🎯 KPI:</span>
                        <span class="box-content">${m.kpi}</span>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        break;
      }

      case 'site-logistics-method': {
        const pillars = c.pillars || [];
        bodyHTML = `
          <div class="sitelog-pres-container">
            <div class="sitelog-pres-grid">
              ${pillars.map((p, idx) => {
                const items = p.items || (p.bullets || []).map((b, bIdx) => {
                  const parts = b.split(': ');
                  return {
                    icon: ['📌', '⚙️', '🛡️'][bIdx] || '•',
                    tag: '',
                    title: parts.length > 1 ? parts[0] : `ข้อปฏิบัติ ${bIdx + 1}`,
                    desc: parts.length > 1 ? parts.slice(1).join(': ') : b
                  };
                });

                return `
                  <div class="sitelog-pillar sitelog-pillar-${p.color}">
                    <!-- Pillar Top Header -->
                    <div class="sitelog-pillar-head">
                      <div class="sitelog-head-badge badge-${p.color}">
                        <span class="sitelog-head-icon">${p.icon}</span>
                        <span class="sitelog-head-num">${p.num || `0${idx + 1}`}</span>
                      </div>
                      <div class="sitelog-head-content">
                        <div class="sitelog-head-title">${p.title}</div>
                        <div class="sitelog-head-sub">${p.subtitle}</div>
                      </div>
                    </div>

                    <!-- 3 Action Cards -->
                    <div class="sitelog-items-stack">
                      ${items.map(item => `
                        <div class="sitelog-action-card">
                          ${item.tag ? `<span class="sitelog-item-tag tag-${p.color}">${item.tag}</span>` : ''}
                          <div class="sitelog-card-header-row">
                            <span class="sitelog-item-icon">${item.icon || '🔹'}</span>
                            <span class="sitelog-item-title">${item.title}</span>
                          </div>
                          <div class="sitelog-item-desc">${item.desc}</div>
                        </div>
                      `).join('')}
                    </div>

                    <!-- Bottom Target Footer -->
                    ${p.targetPill ? `
                      <div class="sitelog-pillar-footer footer-${p.color}">
                        <span>${p.targetPill}</span>
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
        break;
      }

      case 'closeout-framework': {
        // Chronological close-out sequence: PM (M09) -> Cost Control (M11-12) -> Store (M12-14) -> Finance (M13-14)
        const orderedDepts = [
          {
            ...c.departments[1], // Project Manager
            roleTitle: 'Project Manager (ผู้จัดการโครงการ)',
            milestoneTag: 'M09 – M14 (80% ➔ 100%)',
            actionTitle: 'มาตรการตรวจรับ & ส่งมอบงาน:'
          },
          {
            ...c.departments[0], // Cost Control
            roleTitle: 'Cost Controller (ฝ่ายควบคุมต้นทุน)',
            milestoneTag: 'M11 – M12 (93% – 97%)',
            actionTitle: 'มาตรการ Cut-off & ล็อกกำไร:'
          },
          {
            ...c.departments[2], // Store & Logistics
            roleTitle: 'Store & Logistics (สโตร์และโลจิสติกส์)',
            milestoneTag: 'M12 – M14 (97% – 100%)',
            actionTitle: 'มาตรการคืนพัสดุ & ตัดค่าเช่า:'
          },
          {
            ...c.departments[3], // Finance & Contract
            roleTitle: 'Finance & Contract (การเงินและสัญญา)',
            milestoneTag: 'M13 – M14 (100% TOC)',
            actionTitle: 'มาตรการปิดงวดเงิน & ปิดบัญชี:'
          }
        ];

        bodyHTML = `
          <style>
            #slide-28 .slide-header{display:none}
            #slide-28 .preview-head{flex-shrink:0;margin-bottom:8px;color:var(--text-pure)}
            #slide-28 .preview-kicker{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-subtle);padding-bottom:8px;color:var(--accent-cyan);font-size:15px;letter-spacing:0.5px}
            #slide-28 .preview-head h1{font-size:28px;line-height:1.2;margin:10px 0 3px;font-weight:600}
            #slide-28 .preview-head p{font-size:17px;color:var(--text-secondary);margin:0}
            #slide-28 .closeout-deck-container{display:flex;flex-direction:column;flex:1;min-height:0;width:100%;overflow:hidden;box-sizing:border-box}
            #slide-28 .closeout-timeline-ribbon{display:flex;flex-direction:column;gap:5px;padding:6px 12px;margin-bottom:8px;background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle);border-radius:8px;flex-shrink:0}
            #slide-28 .ribbon-head{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--text-secondary)}
            #slide-28 .ribbon-pulse{width:7px;height:7px;border-radius:50%;background:#38bdf8;box-shadow:0 0 8px #38bdf8;flex-shrink:0}
            #slide-28 .ribbon-head strong{color:var(--text-pure);font-weight:700}
            #slide-28 .ribbon-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;align-items:stretch}
            #slide-28 .ribbon-gate-card{display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:6px;background:rgba(255,255,255,0.02);border:1px solid var(--border-subtle)}
            #slide-28 .gate-badge{font-family:var(--font-mono);font-size:11px;font-weight:700;padding:2px 6px;border-radius:4px;white-space:nowrap;flex-shrink:0}
            #slide-28 .gate-info{display:flex;flex-direction:column;min-width:0;overflow:hidden}
            #slide-28 .gate-title{font-size:12px;font-weight:700;color:var(--text-pure);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            #slide-28 .gate-sub{font-size:10.5px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            #slide-28 .closeout-deck-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;flex:1;min-height:0;width:100%;box-sizing:border-box}
            #slide-28 .closeout-col{background:rgba(15,23,42,0.88);border:1px solid var(--border-subtle);border-radius:12px;padding:10px 11px;display:flex;flex-direction:column;min-height:0;min-width:0;max-width:100%;overflow:hidden;backdrop-filter:blur(12px);gap:7px;box-shadow:0 4px 18px rgba(0,0,0,0.22);justify-content:space-between;box-sizing:border-box}
            #slide-28 .closeout-col-sky{border-top:4px solid #38bdf8}
            #slide-28 .closeout-col-cyan{border-top:4px solid #00e5ff}
            #slide-28 .closeout-col-amber{border-top:4px solid #f59e0b}
            #slide-28 .closeout-col-emerald{border-top:4px solid #10b981}
            #slide-28 .closeout-col-header{display:flex;flex-direction:column;gap:4px;padding-bottom:6px;border-bottom:1px solid var(--border-subtle);flex-shrink:0;min-width:0}
            #slide-28 .closeout-col-top{display:flex;align-items:center;justify-content:space-between;gap:6px;min-width:0}
            #slide-28 .closeout-col-icon{font-size:19px;flex-shrink:0}
            #slide-28 .closeout-period-tag{font-family:var(--font-mono);font-size:11px;font-weight:700;padding:2px 6px;border-radius:4px;white-space:nowrap;flex-shrink:0}
            #slide-28 .closeout-col-dept{font-size:13.5px;font-weight:700;color:var(--text-pure);line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            #slide-28 .closeout-owner-row{display:flex;align-items:center;gap:6px;padding:4px 7px;border-radius:6px;background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle);flex-shrink:0;min-width:0}
            #slide-28 .owner-pill-tag{font-family:var(--font-mono);font-size:10.5px;font-weight:700;letter-spacing:0.5px;padding:1px 5px;border-radius:3px;color:var(--accent-cyan);background:rgba(0,229,255,0.1);flex-shrink:0}
            #slide-28 .owner-role-text{font-size:11.5px;color:var(--text-pure);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            #slide-28 .closeout-actions-stack{display:flex;flex-direction:column;gap:5px;flex:1;min-height:0;justify-content:space-between;min-width:0}
            #slide-28 .actions-stack-header{display:flex;align-items:center;gap:5px;padding-bottom:1px;flex-shrink:0;min-width:0}
            #slide-28 .action-pill-tag{font-family:var(--font-mono);font-size:10.5px;font-weight:700;letter-spacing:0.5px;padding:1px 5px;border-radius:3px;color:var(--accent-amber);background:rgba(245,158,11,0.1);flex-shrink:0}
            #slide-28 .actions-stack-title{font-size:12px;font-weight:700;color:var(--text-pure)}
            #slide-28 .closeout-act-row{display:flex;align-items:flex-start;gap:6px;padding:4px 7px;border-radius:6px;font-size:11.5px;line-height:1.35;box-sizing:border-box;min-width:0}
            #slide-28 .closeout-act-row.action-primary{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-left:3.5px solid #00e5ff}
            #slide-28 .closeout-act-row.action-primary.action-sky{border-left-color:#38bdf8}
            #slide-28 .closeout-act-row.action-primary.action-cyan{border-left-color:#00e5ff}
            #slide-28 .closeout-act-row.action-primary.action-amber{border-left-color:#f59e0b}
            #slide-28 .closeout-act-row.action-primary.action-emerald{border-left-color:#10b981}
            #slide-28 .closeout-act-row.action-standard{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-left:3.5px solid transparent}
            #slide-28 .closeout-bullet{width:5px;height:5px;border-radius:50%;margin-top:5px;flex-shrink:0}
            #slide-28 .sky-bullet{background:#38bdf8;box-shadow:0 0 5px rgba(56,189,248,0.6)}
            #slide-28 .cyan-bullet{background:#00e5ff;box-shadow:0 0 5px rgba(0,229,255,0.6)}
            #slide-28 .amber-bullet{background:#f59e0b;box-shadow:0 0 5px rgba(245,158,11,0.6)}
            #slide-28 .emerald-bullet{background:#10b981;box-shadow:0 0 5px rgba(16,185,129,0.6)}
            #slide-28 .neutral-bullet{background:rgba(255,255,255,0.3);box-shadow:none}
            #slide-28 .closeout-act-text{min-width:0;flex:1;overflow-wrap:break-word;word-break:break-word}
            #slide-28 .action-primary .closeout-act-text{color:var(--text-pure);font-weight:600}
            #slide-28 .action-standard .closeout-act-text{color:var(--text-secondary);font-weight:400}
            #slide-28 .action-tag{display:inline-block;font-size:10px;font-weight:700;padding:1px 4px;border-radius:3px;margin-right:4px;vertical-align:baseline;line-height:1.2}
            #slide-28 .sky-tag{color:#38bdf8;background:rgba(56,189,248,0.14)}
            #slide-28 .cyan-tag{color:#00e5ff;background:rgba(0,229,255,0.14)}
            #slide-28 .amber-tag{color:#f59e0b;background:rgba(245,158,11,0.14)}
            #slide-28 .emerald-tag{color:#10b981;background:rgba(16,185,129,0.14)}
            #slide-28 .closeout-footer-deck{display:flex;flex-direction:column;gap:4px;padding-top:6px;border-top:1px solid var(--border-subtle);flex-shrink:0;min-width:0}
            #slide-28 .closeout-foot-item{display:flex;align-items:flex-start;gap:5px;padding:4px 7px;border-radius:6px;font-size:11.5px;line-height:1.32;min-width:0;box-sizing:border-box}
            #slide-28 .deliverable-foot{background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle)}
            #slide-28 .kpi-foot{background:rgba(255,255,255,0.04);border:1px solid var(--border-subtle)}
            #slide-28 .foot-label{font-weight:700;font-size:11px;color:var(--text-pure);white-space:nowrap;flex-shrink:0}
            #slide-28 .foot-val{font-size:11.5px;color:var(--text-secondary);font-weight:400;flex:1;min-width:0;overflow-wrap:break-word;word-break:break-word}
            body.theme-bronze-stone #slide-28 .preview-head{color:#1f343b}
            body.theme-bronze-stone #slide-28 .preview-kicker{color:#006778;border-color:#e1d7c5}
            body.theme-bronze-stone #slide-28 .preview-head p{color:#52525b}
            body.theme-bronze-stone #slide-28 .closeout-timeline-ribbon{background:#fdfcf9;border-color:#e1d7c5}
            body.theme-bronze-stone #slide-28 .ribbon-head{color:#52525b}
            body.theme-bronze-stone #slide-28 .ribbon-head strong{color:#1f343b}
            body.theme-bronze-stone #slide-28 .ribbon-gate-card{background:#ffffff;border-color:#e1d7c5}
            body.theme-bronze-stone #slide-28 .gate-title{color:#18181b}
            body.theme-bronze-stone #slide-28 .gate-sub{color:#71717a}
            body.theme-bronze-stone #slide-28 .closeout-col{background:#ffffff;border-color:#e1d7c5;box-shadow:0 4px 18px rgba(38,38,38,0.06)}
            body.theme-bronze-stone #slide-28 .closeout-col-header{border-color:#f0ebe1}
            body.theme-bronze-stone #slide-28 .closeout-col-dept{color:#18181b}
            body.theme-bronze-stone #slide-28 .closeout-owner-row{background:#fbf9f5;border-color:#e8e2d5}
            body.theme-bronze-stone #slide-28 .owner-pill-tag{color:#006778;background:rgba(0,103,120,0.1)}
            body.theme-bronze-stone #slide-28 .owner-role-text{color:#18181b}
            body.theme-bronze-stone #slide-28 .action-pill-tag{color:#92400e;background:rgba(180,83,9,0.1)}
            body.theme-bronze-stone #slide-28 .actions-stack-title{color:#18181b}
            body.theme-bronze-stone #slide-28 .closeout-act-row.action-primary{background:#faf8f5;border:1px solid #e8e2d5}
            body.theme-bronze-stone #slide-28 .closeout-act-row.action-primary.action-sky{border-left:3.5px solid #0284c7}
            body.theme-bronze-stone #slide-28 .closeout-act-row.action-primary.action-cyan{border-left:3.5px solid #006778}
            body.theme-bronze-stone #slide-28 .closeout-act-row.action-primary.action-amber{border-left:3.5px solid #b45309}
            body.theme-bronze-stone #slide-28 .closeout-act-row.action-primary.action-emerald{border-left:3.5px solid #059669}
            body.theme-bronze-stone #slide-28 .closeout-act-row.action-standard{background:#fdfbf7;border:1px solid #f0ebe1;border-left:3.5px solid transparent}
            body.theme-bronze-stone #slide-28 .sky-bullet{background:#0284c7;box-shadow:none}
            body.theme-bronze-stone #slide-28 .cyan-bullet{background:#006778;box-shadow:none}
            body.theme-bronze-stone #slide-28 .amber-bullet{background:#b45309;box-shadow:none}
            body.theme-bronze-stone #slide-28 .emerald-bullet{background:#059669;box-shadow:none}
            body.theme-bronze-stone #slide-28 .neutral-bullet{background:#a1a1aa;box-shadow:none}
            body.theme-bronze-stone #slide-28 .sky-tag{color:#0284c7;background:rgba(2,132,199,0.08)}
            body.theme-bronze-stone #slide-28 .cyan-tag{color:#006778;background:rgba(0,103,120,0.08)}
            body.theme-bronze-stone #slide-28 .amber-tag{color:#92400e;background:rgba(180,83,9,0.08)}
            body.theme-bronze-stone #slide-28 .emerald-tag{color:#047857;background:rgba(5,150,105,0.08)}
            body.theme-bronze-stone #slide-28 .action-primary .closeout-act-text{color:#18181b}
            body.theme-bronze-stone #slide-28 .action-standard .closeout-act-text{color:#52525b}
            body.theme-bronze-stone #slide-28 .closeout-footer-deck{border-color:#f0ebe1}
            body.theme-bronze-stone #slide-28 .deliverable-foot{background:#faf9f6;border-color:#e8e2d5}
            body.theme-bronze-stone #slide-28 .kpi-foot{background:#f4f0e8 !important;border-color:#e1d7c5}
            body.theme-bronze-stone #slide-28 .foot-label{color:#18181b}
            body.theme-bronze-stone #slide-28 .foot-val{color:#3f3f46}
          </style>
          <header class="preview-head">
            <div class="preview-kicker"><span>PROJECT CLOSE-OUT MODEL / แผนปฏิบัติการปิดโครงการ 4 สายงาน (80% - 100%)</span><span>28 / 30</span></div>
            <h1>${slide.title}</h1>
            <p>${slide.subtitle}</p>
          </header>
          <div class="closeout-deck-container">
            <div class="closeout-timeline-ribbon">
              <div class="ribbon-head">
                <span class="ribbon-pulse"></span>
                <strong>CLOSE-OUT TIMELINE &amp; MILESTONE GATES (M09 – M14):</strong>
                <span>${c.timeline}</span>
              </div>
              <div class="ribbon-grid">
                <div class="ribbon-gate-card">
                  <span class="gate-badge sky-pill">GATE 1 • M09</span>
                  <div class="gate-info">
                    <span class="gate-title">เริ่มเตรียมปิดงาน (80% S-Curve)</span>
                    <span class="gate-sub">PM Walkthrough &amp; ทำ Punch List หมวด A/B</span>
                  </div>
                </div>
                <div class="ribbon-gate-card">
                  <span class="gate-badge cyan-pill">GATE 2 • M11–M12</span>
                  <div class="gate-info">
                    <span class="gate-title">Cut-off PR/PO (93%–97%)</span>
                    <span class="gate-sub">De-commit งบส่วนเกิน &amp; ล็อกกำไร 18.61%</span>
                  </div>
                </div>
                <div class="ribbon-gate-card">
                  <span class="gate-badge amber-pill">GATE 3 • M12–M14</span>
                  <div class="gate-info">
                    <span class="gate-title">คืนพัสดุ &amp; ตัดหยุดค่าเช่า</span>
                    <span class="gate-sub">Off-hire เครน/นั่งร้าน &amp; เคลียร์สำนักงานสนาม</span>
                  </div>
                </div>
                <div class="ribbon-gate-card">
                  <span class="gate-badge emerald-pill">GATE 4 • M13–M14</span>
                  <div class="gate-info">
                    <span class="gate-title">ส่งมอบ &amp; ปิดบัญชี (100% TOC)</span>
                    <span class="gate-sub">เบิกเงินงวดสุดท้าย 7.88M &amp; แลก BG 5% คืน Retention</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="closeout-deck-grid">
              ${orderedDepts.map((d, idx) => `
                <div class="closeout-col closeout-col-${d.color} anim-fade-up anim-delay-${idx + 1}">
                  <div class="closeout-col-header">
                    <div class="closeout-col-top">
                      <span class="closeout-col-icon">${d.icon}</span>
                      <span class="closeout-period-tag ${d.color}-pill">${d.period}</span>
                    </div>
                    <div class="closeout-col-dept">${d.dept}</div>
                  </div>

                  <div class="closeout-owner-row">
                    <span class="owner-pill-tag">1. OWNER</span>
                    <span class="owner-role-text">${d.roleTitle}</span>
                  </div>

                  <div class="closeout-actions-stack">
                    <div class="actions-stack-header">
                      <span class="action-pill-tag">2. ACTION</span>
                      <span class="actions-stack-title">${d.actionTitle}</span>
                    </div>
                    ${d.actions.map((act, aIdx) => {
                      const isPrimary = (idx === 0 && (aIdx === 0 || aIdx === 3)) ||
                                        (idx === 1 && (aIdx === 0 || aIdx === 1)) ||
                                        (idx === 2 && (aIdx === 0 || aIdx === 3)) ||
                                        (idx === 3 && (aIdx === 0 || aIdx === 1));
                      const tag = (idx === 0 && aIdx === 0) ? 'M09 Punch List' :
                                  (idx === 0 && aIdx === 1) ? 'หมวด A/B' :
                                  (idx === 0 && aIdx === 2) ? 'M13-14 Burn-rate' :
                                  (idx === 0 && aIdx === 3) ? 'M14 เซ็น TOC' :
                                  (idx === 1 && aIdx === 0) ? 'M11 Cut-off PO' :
                                  (idx === 1 && aIdx === 1) ? 'M11 ล็อกกำไร' :
                                  (idx === 1 && aIdx === 2) ? 'M12 Final Audit' :
                                  (idx === 1 && aIdx === 3) ? 'PO ข้อยกเว้น' :
                                  (idx === 2 && aIdx === 0) ? 'M12 Off-hire' :
                                  (idx === 2 && aIdx === 1) ? 'M13 คืนสโตร์' :
                                  (idx === 2 && aIdx === 2) ? 'M13 ตรวจสภาพ' :
                                  (idx === 2 && aIdx === 3) ? 'M14 รื้อถอนแคมป์' :
                                  (idx === 3 && aIdx === 0) ? 'M13-14 งวดท้าย' :
                                  (idx === 3 && aIdx === 1) ? 'M14 แลก BG 5%' :
                                  (idx === 3 && aIdx === 2) ? 'M14 ปิดงบโครงการ' :
                                  (idx === 3 && aIdx === 3) ? 'M14 As-built' : '';
                      return `
                        <div class="closeout-act-row ${isPrimary ? `action-primary action-${d.color}` : 'action-standard'}">
                          <span class="closeout-bullet ${isPrimary ? `${d.color}-bullet` : 'neutral-bullet'}"></span>
                          <span class="closeout-act-text">${isPrimary ? `<span class="action-tag ${d.color}-tag">${tag}</span>` : ''}${act}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>

                  <div class="closeout-footer-deck">
                    <div class="closeout-foot-item deliverable-foot">
                      <span class="foot-label">📁 เอกสารส่งมอบ:</span>
                      <span class="foot-val">${d.deliverable}</span>
                    </div>
                    <div class="closeout-foot-item kpi-foot ${d.color}-kpi-foot">
                      <span class="foot-label">🎯 เป้าหมาย:</span>
                      <span class="foot-val">${d.kpi}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        break;
      }

      case 'lesson-learned':
        bodyHTML = `
          <div class="lesson-deck-container">
            <div class="lesson-deck-grid">
              ${c.pillars.map((p, idx) => `
                <div class="lesson-col lesson-col-${p.color} anim-fade-up anim-delay-${idx + 1}">
                  <div class="lesson-col-header">
                    <span class="lesson-col-icon">${p.icon}</span>
                    <div>
                      <div class="lesson-col-title">${p.pillar}</div>
                      <div class="lesson-col-sub">${p.subtitle}</div>
                    </div>
                  </div>

                  <div class="lesson-cards-stack">
                    <div class="lesson-card-item issue-item">
                      <div class="lesson-item-head text-rose">
                        <span>⚠️</span> ปัญหาและความท้าทาย (Issues)
                      </div>
                      <div class="lesson-item-desc">${p.issue}</div>
                    </div>

                    <div class="lesson-card-item practice-item">
                      <div class="lesson-item-head text-emerald">
                        <span>💡</span> แนวทางปฏิบัติที่ดี (Best Practices)
                      </div>
                      <div class="lesson-item-desc">${p.practice}</div>
                    </div>

                    <div class="lesson-card-item future-item">
                      <div class="lesson-item-head text-cyan">
                        <span>🚀</span> การปรับปรุงในอนาคต (Improvements)
                      </div>
                      <div class="lesson-item-desc">${p.future}</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        break;

      case 'team-list':
        bodyHTML = `
          <div class="bento-grid grid-cols-12 team-showcase-grid" style="height: calc(100% - 70px); min-height: 0; gap: 24px;">
            <!-- Left VIP Director Showcase -->
            <div class="bento-card col-span-5 highlight-cyan anim-fade-up anim-delay-1 lead-profile-card" style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; padding: 24px 28px;">
              <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                <div class="lead-badge-row" style="display: flex; justify-content: center; align-items: center; gap: 12px; margin-bottom: 16px; width: 100%;">
                  <div class="card-badge lead-badge-director" style="color: var(--accent-cyan); font-weight: 800; font-size: 0.88rem; letter-spacing: 0.08em; padding: 6px 14px; border-radius: var(--radius-sm);">
                    👑 PROJECT DIRECTOR
                  </div>
                  <div class="card-badge lead-badge-presenter" style="color: var(--accent-amber); font-weight: 700; font-size: 0.85rem; padding: 6px 12px; border-radius: var(--radius-sm);">
                    🎤 LEAD PRESENTER
                  </div>
                </div>

                ${c.lead.avatar ? `
                  <div class="lead-avatar-wrap" style="display: flex; justify-content: center; align-items: center; width: 100%; margin: 8px 0 16px 0;">
                    <img src="${c.lead.avatar}" alt="${c.lead.name}" class="lead-avatar-img">
                  </div>
                ` : ''}

                <div class="lead-info-block" style="display: flex; flex-direction: column; align-items: center; text-align: center; width: 100%; margin-top: 10px;">
                  <div class="lead-name-text" style="text-align: center;">
                    ${c.lead.name}
                  </div>
                  <div class="lead-id-tag" style="margin: 8px auto;">
                    <span>รหัสนักศึกษา:</span>
                    <strong>${c.lead.id}</strong>
                  </div>
                  <div class="lead-role-text" style="text-align: center;">
                    ${c.lead.role}
                  </div>
                  <div class="lead-faculty-text" style="text-align: center;">
                    🏛️ ${c.lead.faculty}
                  </div>
                </div>
              </div>

              <div class="lead-thankyou-box" style="width: 100%;">
                <span style="font-size: 1.15rem; margin-right: 6px;">🤝</span>
                <span>${c.thankYou}</span>
              </div>
            </div>

            <!-- Right Team Members List -->
            <div class="bento-card col-span-7 anim-fade-up anim-delay-2 team-members-container" style="display: flex; flex-direction: column; min-height: 0; padding: 24px 28px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <span class="card-title" style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary);">คณะทำงานและวิศวกรประจำโครงการ</span>
                <span style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--accent-cyan); font-weight: 700; background: rgba(180,83,9,0.08); padding: 4px 10px; border-radius: 999px;">5 ตำแหน่งหลัก</span>
              </div>
              <div class="team-members-stack" style="display: flex; flex-direction: column; gap: 10px; flex: 1; min-height: 0; justify-content: space-around;">
                ${c.members.map((m, idx) => `
                  <div class="team-member-card anim-fade-up anim-delay-${(idx % 4) + 1}">
                    ${m.avatar ? `
                      <img src="${m.avatar}" alt="${m.name}" class="team-avatar-img">
                    ` : `
                      <div class="team-avatar">${idx + 1}</div>
                    `}
                    <div style="flex: 1; min-width: 0;">
                      <div class="team-member-name">${m.name}</div>
                      <div class="team-member-role">${m.role}</div>
                    </div>
                    <div class="team-member-id">${m.id}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
        break;

      default:
        bodyHTML = `<div>Content placeholder</div>`;
    }

    const noScrollTypes = [
      'hero', '3d-warehouse', 'commercial-flow', 'scope-interactive',
      'commercial-baseline', 'handover-protocol', 'mobilization-matrix',
      'org-chart', 'cost-breakdown', 'cost-lock-plan', 'prelim-table',
      'burn-chart', 'burn-rate-chart', 'gantt-weight', 'interactive-scurve',
      'shop-drawings', 'supply-gantt', 'material-part1', 'material-part2',
      'site-logistics-method', '3d-pile', '3d-foundation', '3d-steel', '3d-cellular',
      '3d-floor', '3d-roof', '3d-mep-road', '3d-road', '3d-qaqc', '3d-quality',
      '3d-hse', '3d-safety', 'cashflow-chart', 'governance-cards',
      'closeout-framework', 'lesson-learned', 'team-list'
    ];
    const isNoScroll = noScrollTypes.includes(slide.type);

    return `
      <div id="slide-${slide.id}" data-slide-id="${slide.originalId || slide.id}" class="slide-panel slide-orig-${slide.originalId || slide.id} ${isNoScroll ? 'slide-no-scroll' : ''}">
        <div class="slide-header">
          <div>
            <span class="slide-tag">${slide.tag}</span>
            <h1 class="slide-title">${slide.title}</h1>
            <div class="slide-subtitle">${slide.subtitle}</div>
          </div>
          <div class="slide-meta-badge">${slide.badge}</div>
        </div>
        ${bodyHTML}
      </div>
    `;
}
