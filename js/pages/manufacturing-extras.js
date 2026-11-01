import { dataTable, chip, icon, toast } from '../components.js';
import { db } from '../state.js';

export function register(route) {
  route('manufacturing/routing', renderRouting);
  route('manufacturing/machines', renderMachines);
  route('manufacturing/qc',      renderQC);
  route('manufacturing/oee',     renderOEE);
}

/* ============ ROUTING ============ */
function renderRouting() {
  const ops = [
    { op: '10', name: 'Raw material issue', wc: 'WC-01 Lathe',    setup: 15, run: 10, cost: 200 },
    { op: '20', name: 'Turning',            wc: 'WC-01 Lathe',    setup: 30, run: 25, cost: 850 },
    { op: '30', name: 'Milling',            wc: 'WC-02 Milling',  setup: 45, run: 18, cost: 1100 },
    { op: '40', name: 'CNC finishing',      wc: 'WC-03 CNC',      setup: 20, run: 12, cost: 950 },
    { op: '50', name: 'Welding',            wc: 'WC-04 Welding',  setup: 25, run: 20, cost: 720 },
    { op: '60', name: 'Assembly',           wc: 'WC-05 Assembly', setup: 10, run: 30, cost: 400 },
    { op: '70', name: 'Quality inspection', wc: 'QC Lab',         setup: 0,  run: 15, cost: 180 },
  ];
  return `
    <div class="page-header">
      <div><div class="page-title">Routing</div><div class="page-subtitle">Operations sequence · work centers · time & cost</div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Routing RT-001 — Pump Assembly A</div><span class="chip chip-success">Active</span></div>
      <div class="card-body">
        ${ops.map(o => `
          <div style="display:flex;gap:16px;padding:14px 0;border-bottom:1px solid var(--border)">
            <div style="width:40px;height:40px;border-radius:50%;background:var(--brand-primary-soft);color:var(--brand-primary);display:grid;place-items:center;font-weight:600;font-size:13px;flex-shrink:0">${o.op}</div>
            <div style="flex:1">
              <div style="font-weight:600;font-size:14px">${o.name}</div>
              <div class="text-muted" style="font-size:12px">${o.wc}</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,80px);gap:8px;font-size:12px">
              <div><div class="text-muted">Setup</div><div class="num">${o.setup} min</div></div>
              <div><div class="text-muted">Run</div><div class="num">${o.run} min</div></div>
              <div><div class="text-muted">Cost</div><div class="num">₹${o.cost}</div></div>
            </div>
          </div>`).join('')}
      </div>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><div class="card-title">Routing Library</div></div>
      <div class="card-body">${dataTable({
        columns: [
          { label: 'Routing #', key: 'id', mono: true },
          { label: 'Product', key: 'product' },
          { label: 'Operations', align: 'right', num: true, key: 'ops' },
          { label: 'Work Centers', key: 'wcs' },
          { label: 'Version', key: 'ver', mono: true },
          { label: 'Status', render: r => chip(r.status === 'Active' ? 'success' : 'warning', r.status) },
        ],
        rows: db.routings,
      })}</div>
    </div>`;
}

/* ============ MACHINES ============ */
function renderMachines() {
  return `
    <div class="page-header">
      <div><div class="page-title">Machines</div><div class="page-subtitle">Asset register · maintenance · runtime</div></div>
    </div>
    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'ID', key: 'id', mono: true },
        { label: 'Name', key: 'name' },
        { label: 'Work Center', key: 'wc', mono: true },
        { label: 'Make', key: 'make' },
        { label: 'Runtime', align: 'right', num: true, render: r => `${r.runtime.toLocaleString('en-IN')} hrs` },
        { label: 'MTBF', align: 'right', num: true, render: r => `${r.mtbf} hrs` },
        { label: 'Last Maint.', key: 'lastMaint' },
        { label: 'Status', render: r => r.status === 'Running' ? chip('success', 'Running') : chip('warning', 'Maintenance') },
      ],
      rows: db.machines,
    })}</div></div>`;
}

/* ============ QUALITY CONTROL ============ */
function renderQC() {
  return `
    <div class="page-header">
      <div><div class="page-title">Quality Control</div><div class="page-subtitle">Inspections · defects · NCR</div></div>
    </div>
    <div class="grid grid-kpi">
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Inspections Today</span></div><div class="kpi-value">${db.qualityChecks.length}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Pass Rate</span></div><div class="kpi-value" style="color:var(--success)">96.4%</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Open NCRs</span></div><div class="kpi-value" style="color:var(--warning)">2</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Scrap Value MTD</span></div><div class="kpi-value">₹42,800</div></div>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><div class="card-title">Recent Inspections</div></div>
      <div class="card-body">${dataTable({
        columns: [
          { label: 'QC #', key: 'id', mono: true },
          { label: 'Order', key: 'order', mono: true },
          { label: 'Item', key: 'item' },
          { label: 'Sampled', align: 'right', num: true, key: 'sampled' },
          { label: 'Passed', align: 'right', num: true, key: 'passed' },
          { label: 'Defects', align: 'right', num: true, render: r => r.defects ? `<span style="color:var(--critical)">${r.defects}</span>` : '—' },
          { label: 'Inspector', key: 'insp' },
          { label: 'Result', render: r => chip(r.result === 'Passed' ? 'success' : r.result === 'Conditional' ? 'warning' : 'critical', r.result) },
        ],
        rows: db.qualityChecks,
      })}</div>
    </div>`;
}

/* ============ OEE MONITOR ============ */
function renderOEE() {
  const o = db.oeeData;
  return `
    <div class="page-header">
      <div><div class="page-title">OEE Monitor</div><div class="page-subtitle">Availability × Performance × Quality</div></div>
    </div>
    <div class="grid grid-kpi">
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Overall OEE</span></div><div class="kpi-value" style="color:var(--success)">${o.overall}%</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Availability</span></div><div class="kpi-value">${o.availability}%</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Performance</span></div><div class="kpi-value">${o.performance}%</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Quality</span></div><div class="kpi-value">${o.quality}%</div></div>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><div class="card-title">OEE by Work Center</div></div>
      <div class="card-body" style="height:340px"><canvas id="oeeChart"></canvas></div>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><div class="card-title">Downtime Reasons (this week)</div></div>
      <div class="card-body">${dataTable({
        columns: [
          { label: 'Reason', key: 'reason' },
          { label: 'Machine', key: 'machine', mono: true },
          { label: 'Hours', align: 'right', num: true, key: 'hours' },
          { label: 'Impact', render: r => chip(r.impact === 'High' ? 'critical' : r.impact === 'Medium' ? 'warning' : 'success', r.impact) },
        ],
        rows: o.downtime,
      })}</div>
    </div>`;
}

document.addEventListener('route-rendered', (e) => {
  if (e.detail.path !== 'manufacturing/oee') return;
  const canvas = document.getElementById('oeeChart');
  if (!canvas || !window.Chart) return;
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: db.oeeData.byWc.map(w => w.wc),
      datasets: [
        { label: 'Availability', data: db.oeeData.byWc.map(w => w.availability), backgroundColor: '#4F46E5', borderRadius: 6 },
        { label: 'Performance',  data: db.oeeData.byWc.map(w => w.performance),  backgroundColor: '#06B6D4', borderRadius: 6 },
        { label: 'Quality',      data: db.oeeData.byWc.map(w => w.quality),      backgroundColor: '#10B981', borderRadius: 6 },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });
});