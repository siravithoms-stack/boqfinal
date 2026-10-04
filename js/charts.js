// SVG charts use the active theme and retain negative cash positions.
function chartPalette() {
  const style = getComputedStyle(document.body);
  const color = name => style.getPropertyValue(name).trim();
  return {
    accent: color('--accent-cyan'), income: color('--accent-emerald'), expense: color('--accent-amber'),
    danger: color('--accent-rose'), text: color('--text-primary'), muted: color('--text-secondary'),
    background: color('--bg-main'), grid: color('--border-subtle')
  };
}

function escapeChartText(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderSCurve(containerId, milestones, selectedMonthIdx = 13) {
  const container = document.getElementById(containerId);
  if (!container || !milestones?.length) return;
  const c = chartPalette();
  const width = 1260, height = 440, left = 50, right = 40, top = 30, bottom = 40;
  const chartW = width - left - right, chartH = height - top - bottom;
  const points = milestones.map((m, i) => ({ ...m, i, x: left + i / (milestones.length - 1) * chartW, y: top + chartH * (1 - m.cum / 100) }));
  const active = points[selectedMonthIdx] || points[points.length - 1];
  const path = points.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="svg-chart" role="img" aria-label="ความก้าวหน้าสะสม 14 เดือน">
      <title>S-Curve: ${active.month} ${active.cum}%</title>
      <defs><linearGradient id="scurveGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${c.accent}" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="${c.accent}" stop-opacity="0"/>
      </linearGradient></defs>
      ${[0, 25, 50, 75, 100].map(value => {
        const y = top + chartH * (1 - value / 100);
        return `<line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="${c.grid}" stroke-dasharray="4,4"/>
          <text x="${left - 12}" y="${y + 4}" fill="${c.muted}" font-size="14" text-anchor="end">${value}%</text>`;
      }).join('')}
      <path d="${path} L ${points.at(-1).x} ${top + chartH} L ${left} ${top + chartH} Z" fill="url(#scurveGrad)"/>
      <path d="${path}" fill="none" stroke="${c.accent}" stroke-width="3.5" stroke-linejoin="round"/>
      ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="${p === active ? 7 : 4}" fill="${c.accent}" stroke="${c.background}" stroke-width="2"/>
        <text x="${p.x}" y="${top + chartH + 24}" fill="${p === active ? c.accent : c.muted}" font-size="14" text-anchor="middle">${p.month}</text>`).join('')}
      <line x1="${active.x}" y1="${top}" x2="${active.x}" y2="${top + chartH}" stroke="${c.accent}" stroke-dasharray="3,3"/>
      <g transform="translate(${Math.min(active.x + 14, width - 230)}, ${Math.max(active.y - 65, top)})">
        <rect width="215" height="58" rx="8" fill="${c.background}" stroke="${c.accent}"/>
        <text x="12" y="23" fill="${c.accent}" font-size="15" font-weight="700">${active.month}: ${active.cum}%</text>
        <text x="12" y="44" fill="${c.muted}" font-size="12">${escapeChartText(active.focus.substring(0, 24))}</text>
      </g>
    </svg>`;
}

export function renderCashFlow(containerId, chartData) {
  const container = document.getElementById(containerId);
  if (!container || !chartData?.length) return;
  const c = chartPalette();
  const width = 1400, height = 300, left = 85, right = 30, top = 35, bottom = 65;
  const chartW = width - left - right, chartH = height - top - bottom;
  const minValue = Math.min(0, ...chartData.map(d => d.net));
  const minAxis = Math.floor(minValue / 5) * 5;
  const maxAxis = Math.max(5, Math.ceil(Math.max(...chartData.flatMap(d => [d.inflow, d.outflow, d.net])) / 5) * 5);
  const y = value => top + (maxAxis - value) / (maxAxis - minAxis) * chartH;
  const zero = y(0), groupW = chartW / chartData.length, barW = groupW * 0.32;
  const low = chartData.reduce((a, b) => a.net < b.net ? a : b);
  const points = chartData.map((d, i) => ({ ...d, x: left + (i + 0.5) * groupW, y: y(d.net) }));
  const ticks = [];
  for (let value = minAxis; value <= maxAxis; value += 5) ticks.push(value);
  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="svg-chart" role="img" aria-label="กระแสเงินสดก่อน VAT รวมช่วงเงินสดติดลบ">
      <title>Cash Flow: รับ จ่าย และเงินสดสะสม หน่วยล้านบาท</title>
      ${minAxis < 0 ? `<rect x="${left}" y="${zero}" width="${chartW}" height="${y(minAxis) - zero}" fill="${c.danger}" opacity="0.06"/>` : ''}
      <text x="${left}" y="20" fill="${c.muted}" font-size="20">ล้านบาท (ก่อน VAT)</text>
      ${ticks.map(value => `<line x1="${left}" y1="${y(value)}" x2="${width - right}" y2="${y(value)}" stroke="${value === 0 ? c.muted : c.grid}" stroke-dasharray="${value === 0 ? '0' : '4,4'}"/>
        <text x="${left - 12}" y="${y(value) + 5}" fill="${value < 0 ? c.danger : c.muted}" font-size="20" text-anchor="end">${value}</text>`).join('')}
      ${points.map(p => `<rect x="${p.x - barW - 2}" y="${y(p.inflow)}" width="${barW}" height="${zero - y(p.inflow)}" rx="2" fill="${c.income}" opacity="0.75"><title>${p.m} รับ ${p.inflow.toFixed(3)} ล้านบาท</title></rect>
        <rect x="${p.x + 2}" y="${y(p.outflow)}" width="${barW}" height="${zero - y(p.outflow)}" rx="2" fill="${c.expense}" opacity="0.75"><title>${p.m} จ่าย ${p.outflow.toFixed(3)} ล้านบาท</title></rect>
        <text x="${p.x}" y="${height - 32}" fill="${c.muted}" font-size="18" text-anchor="middle">${p.m}</text>`).join('')}
      <path d="${points.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ')}" fill="none" stroke="${c.accent}" stroke-width="3"/>
      ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${p.net < 0 ? c.danger : c.accent}"><title>${p.m} สะสม ${p.net.toFixed(3)} ล้านบาท</title></circle>`).join('')}
      ${low.net < 0 ? `<text x="${points.find(p => p.m === low.m).x}" y="${height - 5}" fill="${c.danger}" font-size="19" text-anchor="middle" font-weight="700">${low.m}: ${low.net.toFixed(3)}M</text>` : ''}
    </svg>`;
}
