import { dataTable, chip, icon, toast, formModal, confirmDialog } from '../components.js';
import { db, createPR } from '../state.js';
import { logContract } from '../api-contract.js';
import { fmtCurrencyINR, fmtNumber } from '../format.js';

export function register(route) {
  route('supply-chain/forecast',      renderForecast);
  route('supply-chain/mrp',           renderMRP);
  route('supply-chain/replenishment', renderReplenishment);
  route('supply-chain/lead-time',     renderLeadTime);
}

/* ============ DEMAND FORECAST ============ */
function renderForecast() {
  const avgAccuracy = db.demandForecast.filter(r => r.accuracy).reduce((s, r) => s + r.accuracy, 0) /
                      db.demandForecast.filter(r => r.accuracy).length;

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Demand Forecast</div>
        <div class="page-subtitle">Sales history + seasonality → predicted demand</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" id="btn-retrain">Retrain Model</button>
      </div>
    </div>
    <div class="grid grid-kpi">
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Forecast Accuracy</span></div><div class="kpi-value">${avgAccuracy.toFixed(1)}%</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Demand vs Forecast</span></div><div class="kpi-value">+3.8%</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Seasonal Peak</span></div><div class="kpi-value">Nov</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Variance (σ)</span></div><div class="kpi-value">4.2%</div></div>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><div class="card-title">Actual vs Forecast (₹ Cr)</div></div>
      <div class="card-body" style="height:340px"><canvas id="forecastChart"></canvas></div>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><div class="card-title">Month Detail</div></div>
      <div class="card-body">${dataTable({
        columns: [
          { label: 'Month', key: 'month' },
          { label: 'Actual', align: 'right', num: true, render: r => r.actual ? r.actual.toFixed(1) : '—' },
          { label: 'Forecast', align: 'right', num: true, render: r => r.forecast.toFixed(1) },
          { label: 'Accuracy', align: 'right', num: true, render: r => r.accuracy ? `${r.accuracy}%` : '—' },
          { label: 'Status', render: r => !r.accuracy ? chip('info', 'Pending') : r.accuracy >= 95 ? chip('success', 'On track') : chip('warning', 'Watch') },
        ],
        rows: db.demandForecast,
      })}</div>
    </div>`;
}

document.addEventListener('route-rendered', (e) => {
  if (e.detail.path !== 'supply-chain/forecast') return;
  const canvas = document.getElementById('forecastChart');
  if (!canvas || !window.Chart) return;
  new Chart(canvas, {
    type: 'line',
    data: {
      labels: db.demandForecast.map(r => r.month),
      datasets: [
        { label: 'Actual',   data: db.demandForecast.map(r => r.actual),   borderColor: '#4F46E5', backgroundColor: '#4F46E520', fill: true, tension: 0.35, pointRadius: 3 },
        { label: 'Forecast', data: db.demandForecast.map(r => r.forecast), borderColor: '#06B6D4', borderDash: [5, 5], tension: 0.35, pointRadius: 3 },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });
  document.getElementById('btn-retrain')?.addEventListener('click', () => {
    toast('Model retraining', 'Recalculating across last 12 months…', 'info');
    setTimeout(() => toast('Model updated', 'Accuracy improved to 94.8%', 'success'), 1500);
  });
});

/* ============ MRP ============ */
function renderMRP() {
  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">Material Requirements Planning</div>
        <div class="page-subtitle">Demand + BOM → purchase & production needs</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" id="btn-run-mrp">${icon('play', 16)} Run MRP</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Replenishment Recommendations</div></div>
      <div class="card-body">${dataTable({
        columns: [
          { label: 'ID', key: 'id', mono: true },
          { label: 'Item', key: 'itemCode', mono: true },
          { label: 'Name', key: 'name' },
          { label: 'Required', align: 'right', num: true, key: 'required' },
          { label: 'Available', align: 'right', num: true, key: 'available' },
          { label: 'Gap', align: 'right', num: true, render: r => r.gap > 0 ? `<span style="color:var(--critical)">${fmtNumber(r.gap)}</span>` : '—' },
          { label: 'Recommended Action', key: 'action' },
          { label: 'Vendor', key: 'vendor' },
          { label: 'Status', render: r => chip(r.status === 'OK' ? 'success' : r.status === 'Suggested' ? 'warning' : 'info', r.status) },
          { label: '', render: r => r.gap > 0 ? `<button class="btn btn-primary btn-sm" data-approve-mrp="${r.itemCode}|${r.gap}">Approve & PR</button>` : '' },
        ],
        rows: db.mrpRuns,
      })}</div>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><div class="card-title">Worked Example</div></div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;font-size:13px">
          <div><div class="text-muted">Current Stock</div><div style="font-weight:600;font-size:20px">80</div></div>
          <div><div class="text-muted">Safety Stock</div><div style="font-weight:600;font-size:20px">100</div></div>
          <div><div class="text-muted">Demand</div><div style="font-weight:600;font-size:20px">150</div></div>
          <div><div class="text-muted">Lead Time</div><div style="font-weight:600;font-size:20px">15 days</div></div>
          <div><div class="text-muted">Recommended</div><div style="font-weight:600;font-size:20px;color:var(--brand-primary)">170 units</div></div>
        </div>
      </div>
    </div>`;
  setTimeout(() => {
    document.getElementById('btn-run-mrp')?.addEventListener('click', () => {
      toast('MRP run started', 'Recalculating across all BOMs…', 'info');
      logContract({ method: 'POST', path: '/api/mrp/run', role: window.__session.role });
      setTimeout(() => toast('MRP complete', `${db.mrpRuns.filter(r => r.gap > 0).length} items need replenishment`, 'success'), 1400);
    });
    document.querySelectorAll('[data-approve-mrp]').forEach(b => {
      b.addEventListener('click', async () => {
        const [code, gap] = b.dataset.approveMrp.split('|');
        const ok = await confirmDialog({
          title: `Create Purchase Requisition?`,
          message: `Draft PR for ${code} × ${gap} units will be created and routed to Purchase Manager.`,
          confirmText: 'Create PR',
        });
        if (!ok) return;
        const pr = createPR({ dept: 'MRP', itemCode: code, qty: Number(gap) });
        logContract({ method: 'POST', path: '/api/purchase-requisitions', body: { from: 'mrp', itemCode: code, qty: Number(gap) }, response: pr, role: window.__session.role });
        toast('PR created', `${pr.id} for ${pr.item}`, 'success');
      });
    });
  }, 0);
  return html;
}

/* ============ REPLENISHMENT ============ */
function renderReplenishment() {
  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">Automated Replenishment</div>
        <div class="page-subtitle">Reorder suggestions · auto-PR routing</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" id="btn-config">Configure Rules</button>
        <button class="btn btn-primary" id="btn-auto-pr">Auto-Create PRs</button>
      </div>
    </div>
    <div class="grid grid-kpi">
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Items to Replenish</span></div><div class="kpi-value">${db.replenishments.length}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Auto-Approved</span></div><div class="kpi-value" style="color:var(--success)">${db.replenishments.filter(r => r.auto).length}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Needs Approval</span></div><div class="kpi-value" style="color:var(--warning)">${db.replenishments.filter(r => !r.auto).length}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Est. Value</span></div><div class="kpi-value">₹18.4 L</div></div>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><div class="card-title">Replenishment Suggestions</div></div>
      <div class="card-body">${dataTable({
        columns: [
          { label: 'Item', key: 'itemCode', mono: true },
          { label: 'Name', key: 'name' },
          { label: 'Stock', align: 'right', num: true, key: 'stock' },
          { label: 'Safety', align: 'right', num: true, key: 'safety' },
          { label: 'Recommend', align: 'right', num: true, render: r => `<b>${fmtNumber(r.recommend)}</b>` },
          { label: 'Vendor', key: 'vendor' },
          { label: 'Mode', render: r => r.auto ? chip('success', 'Auto-approve') : chip('warning', 'Needs approval') },
          { label: '', render: r => `<button class="btn btn-primary btn-sm" data-pr="${r.itemCode}|${r.recommend}">Create PR</button>` },
        ],
        rows: db.replenishments,
      })}</div>
    </div>`;
  setTimeout(() => {
    document.getElementById('btn-auto-pr')?.addEventListener('click', async () => {
      const ok = await confirmDialog({
        title: 'Auto-create PRs for all auto-approve items?',
        message: `This will create ${db.replenishments.filter(r => r.auto).length} PRs and route them automatically.`,
        confirmText: 'Create All',
      });
      if (!ok) return;
      db.replenishments.filter(r => r.auto).forEach(r => {
        const pr = createPR({ dept: 'Auto-Replenish', itemCode: r.itemCode, qty: r.recommend });
        logContract({ method: 'POST', path: '/api/purchase-requisitions', body: { from: 'auto-replenish', itemCode: r.itemCode, qty: r.recommend }, response: pr, role: window.__session.role });
      });
      toast('PRs created', `${db.replenishments.filter(r => r.auto).length} requisitions routed`, 'success');
    });
    document.getElementById('btn-config')?.addEventListener('click', () => toast('Config', 'Rule builder opens here', 'info'));
    document.querySelectorAll('[data-pr]').forEach(b => {
      b.addEventListener('click', async () => {
        const [code, qty] = b.dataset.pr.split('|');
        const ok = await confirmDialog({ title: `Create PR for ${code}?`, message: `Quantity: ${qty} units.`, confirmText: 'Create PR' });
        if (!ok) return;
        const pr = createPR({ dept: 'Replenishment', itemCode: code, qty: Number(qty) });
        logContract({ method: 'POST', path: '/api/purchase-requisitions', body: { from: 'replenishment', itemCode: code, qty: Number(qty) }, response: pr, role: window.__session.role });
        toast('PR created', pr.id, 'success');
      });
    });
  }, 0);
  return html;
}

/* ============ SUPPLIER LEAD TIME ============ */
function renderLeadTime() {
  return `
    <div class="page-header">
      <div>
        <div class="page-title">Supplier Lead Time</div>
        <div class="page-subtitle">Quoted vs actual · variability analysis</div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Quoted vs Actual (days)</div></div>
      <div class="card-body" style="height:340px"><canvas id="ltChart"></canvas></div>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><div class="card-title">Vendor Detail</div></div>
      <div class="card-body">${dataTable({
        columns: [
          { label: 'Vendor', key: 'name' },
          { label: 'Quoted', align: 'right', num: true, render: r => `${r.quoted} days` },
          { label: 'Actual Avg', align: 'right', num: true, render: r => `${r.actual} days` },
          { label: 'Variance', align: 'right', num: true, render: r => `<span style="color:${r.variance > 0 ? 'var(--warning)' : 'var(--success)'}">${r.variance > 0 ? '+' : ''}${r.variance} days</span>` },
          { label: 'On-time %', align: 'right', num: true, render: r => `${r.onTime}%` },
          { label: 'Rating', align: 'right', num: true, render: r => `${r.rating} ★` },
        ],
        rows: db.suppliers,
      })}</div>
    </div>`;
}

document.addEventListener('route-rendered', (e) => {
  if (e.detail.path !== 'supply-chain/lead-time') return;
  const canvas = document.getElementById('ltChart');
  if (!canvas || !window.Chart) return;
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: db.suppliers.map(s => s.name),
      datasets: [
        { label: 'Quoted', data: db.suppliers.map(s => s.quoted), backgroundColor: '#4F46E5', borderRadius: 6 },
        { label: 'Actual', data: db.suppliers.map(s => s.actual), backgroundColor: '#F59E0B', borderRadius: 6 },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });
});