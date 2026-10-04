// Financial basis: BOQ FINAL - sheet.pdf, pages 2, 4 and 7.
// The cash-flow model excludes VAT and corporate overhead/tax settlements.
const roundMoney = value => Math.round((value + Number.EPSILON) * 100) / 100;

export const PROJECT_FINANCIALS = Object.freeze({
  sumSell: roundMoney(85000000 * 1.08 / 0.88),
  directMaterial: 53350000,
  directLabor: 23100000,
  preliminary: 8450000,
  workingBudget: 84900000,
  vatRate: 0.07,
  advanceRate: 0.10,
  retentionRate: 0.05,
  // Monthly material purchases from the source BOQ cash-flow model.
  materialWeights: Object.freeze([2, 6, 9, 10, 14, 15, 13, 11, 8, 5, 4, 2, 1, 0])
});

export function formatBaht(value) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatMillion(value, digits = 2) {
  return (value / 1000000).toFixed(digits);
}

// Allocate in satang, assigning rounding residual to the final period.
function allocate(total, weights) {
  const result = weights.map(weight => roundMoney(total * weight / 100));
  result[result.length - 1] = roundMoney(total - result.slice(0, -1).reduce((sum, value) => sum + value, 0));
  return result;
}

export function buildCashFlow(milestones, burnData) {
  const f = PROJECT_FINANCIALS;
  if (milestones.length !== 14 || burnData.length !== 14) throw new Error('Cash flow requires 14 months');
  if (Math.abs(milestones.reduce((sum, m) => sum + m.monthly, 0) - 100) > 0.00001) throw new Error('Progress weights must total 100%');
  if (burnData.reduce((sum, m) => sum + m.monthly * 1000, 0) !== f.preliminary) throw new Error('Preliminary allocation does not match budget');
  if (burnData.some((m, i) => m.m !== milestones[i].month)) throw new Error('Cash-flow month order mismatch');

  const advance = roundMoney(f.sumSell * f.advanceRate);
  const retention = roundMoney(f.sumSell * f.retentionRate);
  const netPayments = allocate(roundMoney(f.sumSell - advance - retention), milestones.map(m => m.monthly));
  const materials = allocate(f.directMaterial, f.materialWeights);
  const labor = allocate(f.directLabor, milestones.map(m => m.monthly));
  let net = 0;
  return milestones.map((m, i) => {
    // 30-day credit: prior month's certified work is received next month.
    // The final two progress payments are settled at M14 with retention,
    // assuming final acceptance and a replacement defect-liability BG.
    const progressPayment = i === 0 ? 0 : i === 13 ? roundMoney(netPayments[12] + netPayments[13]) : netPayments[i - 1];
    const advanceReceived = i === 0 ? advance : 0;
    const retentionReceived = i === 13 ? retention : 0;
    const prelim = burnData[i].monthly * 1000;
    const inflowBaht = roundMoney(progressPayment + advanceReceived + retentionReceived);
    const outflowBaht = roundMoney(materials[i] + labor[i] + prelim);
    net = roundMoney(net + inflowBaht - outflowBaht);
    return {
      m: m.month, inflow: inflowBaht / 1000000, outflow: outflowBaht / 1000000, net: net / 1000000,
      inflowBaht, outflowBaht, netBaht: net, progressPayment, advanceReceived, retentionReceived,
      materials: materials[i], labor: labor[i], prelim
    };
  });
}
