import { kpiCard, chip, icon } from '../components.js';
import { db } from '../state.js';
import { fmtCurrencyINR } from '../format.js';

export function register(route) {
  route('dashboard', render);
}

const ROLE_KPIS = {
  'CEO':               ['revenue', 'profit', 'cash', 'inventory', 'receivable', 'payable'],
  'CFO':               ['receivable', 'payable', 'cash', 'inventory'],
  'Purchase Manager':  ['payable', 'inventory'],
  'Purchase Executive':['payable'],
  'Warehouse Manager': ['inventory'],
  'Production Manager':['inventory'],
  'HR Manager':        [],
  'Sales Manager':     ['revenue', 'receivable'],
};

const KPI_DEFS = {
  revenue:    { label: 'Revenue',     value: 124000000, delta:  12.4, icon: 'trending-up' },
  profit:     { label: 'Profit',      value: 28000000,  delta:   8.2, icon: 'wallet' },
  cash:       { label: 'Cash',        value: 41000000,  delta:  -3.1, icon: 'banknote' },
  inventory:  { label: 'Inventory',   value: 32000000,  delta:   1.8, icon: 'package' },
  receivable: { label: 'Receivable',  value: 18000000,  delta:   4.5, icon: 'arrow-down-left' },
  payable:    { label: 'Payable',     value: 11000000,  delta:  -2.2, icon: 'arrow-up-right' },
};

// function render() {
//   const s = window.__session || {};
//   const role = s.role;
//   const kpiKeys = ROLE_KPIS[role] || [];
//   const kpis = kpiKeys.map(k => kpiCard(KPI_DEFS[k])).join('');

//   const alerts = db.aiAlerts.slice(0, 4).map(a => `
//     <div style="display:flex;gap:10px;padding:10px;border-radius:8px;margin-bottom:6px">
//       <span style="color:var(--${a.level})">${icon(a.level === 'critical' ? 'alert-circle' : a.level === 'warning' ? 'alert-triangle' : 'info', 18)}</span>
//       <div style="flex:1">
//         <div style="font-size:13px;font-weight:600">${a.title}</div>
//         <div style="font-size:12px;color:var(--text-muted)">${a.msg}</div>
//       </div>
//     </div>`).join('');

//   return `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Good day, ${(s.name || 'User').split(' ')[0]}</div>
//         <div class="page-subtitle">${s.role || ''} · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
//       </div>
//       <div class="page-actions">
//         <button class="btn btn-secondary" onclick="window.__navigate('ai/copilot')">${icon('bot', 16)} Ask Copilot</button>
//       </div>
//     </div>
//     ${kpis ? `<div class="grid grid-kpi">${kpis}</div>` : ''}
//     <div class="grid grid-charts" style="margin-top:20px">
//       <div class="card">
//         <div class="card-header"><div class="card-title">Sales vs Forecast</div><div class="card-subtitle">Last 12 months · ₹ in Crores</div></div>
//         <div class="card-body" style="height:300px"><canvas id="salesTrendChart"></canvas></div>
//       </div>
//       <div class="card">
//         <div class="card-header"><div class="card-title">AI Alerts</div>
//           <button class="btn btn-ghost btn-sm" onclick="window.__navigate('ai/alerts')">View all</button>
//         </div>
//         <div class="card-body">${alerts}</div>
//       </div>
//     </div>
//     <div class="card" style="margin-top:20px">
//       <div class="card-header"><div class="card-title">Quick actions</div></div>
//       <div class="card-body">
//         <div style="display:flex;gap:8px;flex-wrap:wrap">
//           <button class="btn btn-secondary" onclick="window.__navigate('purchasing/prs')">New PR</button>
//           <button class="btn btn-secondary" onclick="window.__navigate('sales/orders')">New Sales Order</button>
//           <button class="btn btn-secondary" onclick="window.__navigate('inventory/items')">Adjust Stock</button>
//           <button class="btn btn-secondary" onclick="window.__navigate('hrms/leave')">Approve Leave</button>
//         </div>
//       </div>
//     </div>`;
// }

function render() {
  const s = window.__session || {};
  const role = s.role;
  const kpiKeys = ROLE_KPIS[role] || [];
  const kpis = kpiKeys.map(k => kpiCard(KPI_DEFS[k])).join('');

  const isCEO = role === 'CEO';
  
  // Custom layout just for the CEO Scorecard
  if (isCEO) {
    return `
      <div class="page-header" style="margin-bottom:32px">
        <div>
          <div class="page-title" style="font-size:32px">Executive Scorecard</div>
          <div class="page-subtitle">${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="window.__navigate('ai/copilot')">${icon('bot', 16)} Ask AI Copilot</button>
        </div>
      </div>
      
      <div class="grid grid-3" style="gap:24px">
        ${KPI_DEFS.revenue ? `<div class="kpi" style="padding:32px;background:linear-gradient(135deg,var(--surface),var(--surface-alt))"><div class="kpi-label">Total Revenue</div><div class="kpi-value" style="font-size:40px;color:var(--success)">₹12.4 Cr</div></div>` : ''}
        ${KPI_DEFS.profit ? `<div class="kpi" style="padding:32px;background:linear-gradient(135deg,var(--surface),var(--surface-alt))"><div class="kpi-label">Net Profit</div><div class="kpi-value" style="font-size:40px">₹2.8 Cr</div></div>` : ''}
        ${KPI_DEFS.cash ? `<div class="kpi" style="padding:32px;background:linear-gradient(135deg,var(--surface),var(--surface-alt))"><div class="kpi-label">Available Cash</div><div class="kpi-value" style="font-size:40px">₹4.1 Cr</div></div>` : ''}
        ${KPI_DEFS.inventory ? `<div class="kpi" style="padding:24px"><div class="kpi-header"><span class="kpi-label">Inventory Value</span></div><div class="kpi-value">₹3.2 Cr</div></div>` : ''}
        ${KPI_DEFS.receivable ? `<div class="kpi" style="padding:24px"><div class="kpi-header"><span class="kpi-label">Receivables</span></div><div class="kpi-value">₹1.8 Cr</div></div>` : ''}
        ${KPI_DEFS.payable ? `<div class="kpi" style="padding:24px"><div class="kpi-header"><span class="kpi-label">Payables</span></div><div class="kpi-value">₹1.1 Cr</div></div>` : ''}
      </div>
      
      <div class="grid grid-charts" style="margin-top:32px">
        <div class="card"><div class="card-header"><div class="card-title">Revenue Trend</div></div><div class="card-body" style="height:320px"><canvas id="salesTrendChart"></canvas></div></div>
        <div class="card"><div class="card-header"><div class="card-title">AI Alert Centre</div></div><div class="card-body">${db.aiAlerts.map(a => `<div style="padding:12px;border-bottom:1px solid var(--border)"><b>${a.title}</b><div style="font-size:12px;color:var(--text-muted)">${a.msg}</div></div>`).join('')}</div></div>
      </div>`;
  }

  // Standard dashboard for everyone else
  return `
    <div class="page-header">
      <div><div class="page-title">Dashboard</div><div class="page-subtitle">${s.role}</div></div>
    </div>
    ${kpis ? `<div class="grid grid-kpi">${kpis}</div>` : ''}
    <div class="grid grid-charts" style="margin-top:20px">
      <div class="card"><div class="card-body" style="height:300px"><canvas id="salesTrendChart"></canvas></div></div>
      <div class="card"><div class="card-body">${db.aiAlerts.map(a => `<div style="padding:12px;border-bottom:1px solid var(--border)"><b>${a.title}</b><div style="font-size:12px;color:var(--text-muted)">${a.msg}</div></div>`).join('')}</div></div>
    </div>`;
}

document.addEventListener('route-rendered', (e) => {
  if (e.detail.path !== 'dashboard') return;
  const canvas = document.getElementById('salesTrendChart');
  if (!canvas || !window.Chart) return;
  new Chart(canvas, {
    type: 'line',
    data: {
      labels: ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'],
      datasets: [
        { label: 'Actual',   data: [8.2,8.9,9.4,10.1,10.8,11.2,11.8,12.1,12.4,null,null,null], borderColor: '#4F46E5', backgroundColor: '#4F46E520', fill: true, tension: 0.35, pointRadius: 0 },
        { label: 'Forecast', data: [null,null,null,null,null,null,null,null,12.4,12.1,12.9,13.6], borderColor: '#06B6D4', borderDash: [5,5], tension: 0.35, pointRadius: 0 },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });
});