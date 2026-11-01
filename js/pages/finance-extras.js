import { dataTable, chip, toast, confirmDialog } from '../components.js';
import { db, fileTaxReturn } from '../state.js';
import { logContract } from '../api-contract.js';
import { fmtCurrencyINR, fmtDate } from '../format.js';


export function register(route) {
  route('finance/cash-flow-chart', renderCashFlow);
}

function renderCashFlow() {
  return `
    <div class="page-header">
      <div><div class="page-title">Cash Flow Forecast</div><div class="page-subtitle">Waterfall · next 90 days</div></div>
    </div>
    <div class="grid grid-kpi">
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Opening Cash</span></div><div class="kpi-value">₹4.10 Cr</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Expected Inflow</span></div><div class="kpi-value" style="color:var(--success)">+₹2.40 Cr</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Expected Outflow</span></div><div class="kpi-value" style="color:var(--critical)">−₹2.85 Cr</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Projected Closing</span></div><div class="kpi-value">₹3.65 Cr</div></div>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><div class="card-title">Cash Flow Bridge</div></div>
      <div class="card-body" style="height:360px"><canvas id="cfChart"></canvas></div>
    </div>`;
}

// document.addEventListener('route-rendered', (e) => {
//   if (e.detail.path !== 'finance/cash-flow-chart') return;
//   const canvas = document.getElementById('cfChart');
//   if (!canvas || !window.Chart) return;
//   const labels = ['Opening', 'Receivables', 'Payables', 'Payroll', 'Taxes', 'CAPEX', 'Closing'];
//   const values = [41000000, 24000000, -18000000, -4500000, -3200000, -2800000, 36500000];
//   let cum = 0;
//   const base = [], up = [], down = [];
//   values.forEach((v, i) => {
//     const isTotal = i === 0 || i === values.length - 1;
//     if (isTotal) { base.push(0); up.push(v); down.push(0); cum = v; }
//     else {
//       if (v >= 0) { base.push(cum); up.push(v); down.push(0); }
//       else { base.push(cum + v); up.push(0); down.push(-v); }
//       cum += v;
//     }
//   });
//   new Chart(canvas, {
//     type: 'bar',
//     data: {
//       labels,
//       datasets: [
//         { label: 'base',      data: base, backgroundColor: 'transparent', stack: 'w' },
//         { label: 'Increase',  data: up,   backgroundColor: '#16A34A',      stack: 'w', borderRadius: 4 },
//         { label: 'Decrease',  data: down, backgroundColor: '#DC2626',      stack: 'w', borderRadius: 4 },
//       ],
//     },
//     options: {
//       responsive: true, maintainAspectRatio: false,
//       plugins: { legend: { display: false } },
//       scales: { y: { ticks: { callback: v => (v/1e7).toFixed(1) + ' Cr' } } },
//     },
//   });
// });

document.addEventListener('route-rendered', (e) => {
  if (e.detail.path !== 'finance/cash-flow-chart') return;
  const canvas = document.getElementById('cfChart');
  if (!canvas || !window.Chart) return;
  
  const labels = db.cashFlowWaterfall.map(c => c.label);
  const base = [], up = [], down = [];
  let cum = 0;
  
  db.cashFlowWaterfall.forEach((v, i) => {
    if (v.type === 'total') {
      base.push(0); up.push(v.value); down.push(0); cum = v.value;
    } else {
      if (v.value >= 0) { base.push(cum); up.push(v.value); down.push(0); }
      else { base.push(cum + v.value); up.push(0); down.push(-v.value); }
      cum += v.value;
    }
  });

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'base', data: base, backgroundColor: 'transparent', stack: 'w' },
        { label: 'Inflow', data: up, backgroundColor: '#16A34A', stack: 'w', borderRadius: 4 },
        { label: 'Outflow', data: down, backgroundColor: '#DC2626', stack: 'w', borderRadius: 4 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { y: { ticks: { callback: v => (v/1e7).toFixed(1) + ' Cr' } } },
    },
  });
});