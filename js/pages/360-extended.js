// import { dataTable, chip, icon, toast } from '../components.js';
// import { db } from '../state.js';
// import { fmtCurrencyINR, fmtDate, fmtNumber, initials } from '../format.js';

// export function register(route) {
//   route('views/item-360',     renderItem360);
//   route('views/employee-360', renderEmployee360);
//   route('views/machine-360',  renderMachine360);
// }

// /* ============ ITEM 360 ============ */
// function renderItem360() {
//   const html = `
//     <div class="page-header">
//       <div><div class="page-title">Item 360°</div><div class="page-subtitle">Stock · movements · POs · BOM usage</div></div>
//     </div>
//     <div class="table-toolbar">
//       <select class="select" id="itemPick" style="max-width:340px">
//         ${db.items.map(i => `<option value="${i.code}">${i.code} — ${i.name}</option>`).join('')}
//       </select>
//     </div>
//     <div id="itemContent"></div>`;
//   setTimeout(() => {
//     const sel = document.getElementById('itemPick');
//     const render = (code) => {
//       const i = db.items.find(x => x.code === code);
//       if (!i) return;
//       const pos = db.purchaseOrders.filter(p => p.id.includes('2011') || p.id.includes('2014')).slice(0, 3);
//       const grns = db.goodsReceipts.filter(g => g.bin === 'A-12-B-01' || g.bin === 'A-12-B-02').slice(0, 3);
//       document.getElementById('itemContent').innerHTML = `
//         <div class="entity-header">
//           <div class="entity-title-row">
//             <div class="entity-avatar">${i.name.slice(0,1)}</div>
//             <div style="flex:1">
//               <div class="entity-name">${i.name}</div>
//               <div class="entity-meta">${i.code} · ${i.category} · UOM: ${i.uom}</div>
//             </div>
//             ${i.stock < i.safety ? chip('critical', 'Below safety') : chip('success', 'In stock')}
//           </div>
//           <div class="entity-stats">
//             <div class="entity-stat"><span class="label">On Hand</span><span class="value">${fmtNumber(i.stock)} ${i.uom}</span></div>
//             <div class="entity-stat"><span class="label">Safety</span><span class="value">${i.safety}</span></div>
//             <div class="entity-stat"><span class="label">Reorder</span><span class="value">${i.reorder}</span></div>
//             <div class="entity-stat"><span class="label">Lead Time</span><span class="value">${i.leadTime} days</span></div>
//             <div class="entity-stat"><span class="label">Value</span><span class="value">${fmtCurrencyINR(i.value)}</span></div>
//           </div>
//         </div>
//         <div class="grid grid-2" style="margin-top:20px">
//           <div class="card">
//             <div class="card-header"><div class="card-title">Recent Goods Receipts</div></div>
//             <div class="card-body">${dataTable({
//               columns: [
//                 { label: 'GRN #', key: 'id', mono: true },
//                 { label: 'Qty', align: 'right', num: true, key: 'qty' },
//                 { label: 'Bin', key: 'bin', mono: true },
//                 { label: 'QC', render: r => chip(r.qc === 'Passed' ? 'success' : 'warning', r.qc) },
//               ],
//               rows: grns,
//             })}</div>
//           </div>
//           <div class="card">
//             <div class="card-header"><div class="card-title">Recent POs</div></div>
//             <div class="card-body">${dataTable({
//               columns: [
//                 { label: 'PO #', key: 'id', mono: true },
//                 { label: 'Amount', align: 'right', num: true, render: r => fmtCurrencyINR(r.amount) },
//                 { label: 'Status', render: r => chip(r.status === 'Approved' ? 'success' : 'info', r.status) },
//               ],
//               rows: pos,
//             })}</div>
//           </div>
//         </div>
//         <div class="card" style="margin-top:20px">
//           <div class="card-header"><div class="card-title">Used In BOMs</div></div>
//           <div class="card-body">${dataTable({
//             columns: [
//               { label: 'BOM #', key: 'id', mono: true },
//               { label: 'Product', key: 'product' },
//               { label: 'Level', align: 'right', num: true, key: 'level' },
//               { label: 'Status', render: r => chip(r.status === 'Active' ? 'success' : 'warning', r.status) },
//             ],
//             rows: db.boms.slice(0, 2),
//           })}</div>
//         </div>`;
//     };
//     render(sel.value);
//     sel.addEventListener('change', e => render(e.target.value));
//   }, 0);
//   return html;
// }

// /* ============ EMPLOYEE 360 ============ */
// function renderEmployee360() {
//   const html = `
//     <div class="page-header">
//       <div><div class="page-title">Employee 360°</div><div class="page-subtitle">Attendance · leave · payroll · performance</div></div>
//     </div>
//     <div class="table-toolbar">
//       <select class="select" id="empPick" style="max-width:340px">
//         ${db.employees.map(e => `<option value="${e.id}">${e.name} (${e.id})</option>`).join('')}
//       </select>
//     </div>
//     <div id="empContent"></div>`;
//   setTimeout(() => {
//     const sel = document.getElementById('empPick');
//     const render = (id) => {
//       const e = db.employees.find(x => x.id === id);
//       if (!e) return;
//       const att = db.attendance.filter(a => a.empId === id);
//       const leaves = db.leaveRequests.filter(l => l.empId === id);
//       const perf = db.performance.find(p => p.name === e.name);
//       document.getElementById('empContent').innerHTML = `
//         <div class="entity-header">
//           <div class="entity-title-row">
//             <div class="avatar" style="width:56px;height:56px;font-size:20px">${initials(e.name)}</div>
//             <div style="flex:1">
//               <div class="entity-name">${e.name}</div>
//               <div class="entity-meta">${e.id} · ${e.designation} · ${e.dept}</div>
//             </div>
//             ${chip(e.status === 'Active' ? 'success' : 'warning', e.status)}
//           </div>
//           <div class="entity-stats">
//             <div class="entity-stat"><span class="label">Joined</span><span class="value">${fmtDate(e.joined)}</span></div>
//             <div class="entity-stat"><span class="label">CTC</span><span class="value">${fmtCurrencyINR(e.ctc)}</span></div>
//             <div class="entity-stat"><span class="label">Email</span><span class="value" style="font-size:12px">${e.email}</span></div>
//             ${perf && perf.rating ? `<div class="entity-stat"><span class="label">Rating</span><span class="value">${perf.rating} ★</span></div>` : ''}
//             <div class="entity-stat"><span class="label">Dept</span><span class="value">${e.dept}</span></div>
//           </div>
//         </div>
//         <div class="grid grid-3" style="margin-top:20px">
//           <div class="card">
//             <div class="card-header"><div class="card-title">Recent Attendance</div></div>
//             <div class="card-body">${dataTable({
//               columns: [
//                 { label: 'In', key: 'in', mono: true },
//                 { label: 'Out', key: 'out', mono: true },
//                 { label: 'Hrs', align: 'right', num: true, key: 'hrs' },
//                 { label: 'Status', render: r => chip(r.status === 'Present' ? 'success' : r.status === 'Late' ? 'warning' : 'critical', r.status) },
//               ],
//               rows: att,
//               empty: 'No attendance recorded.',
//             })}</div>
//           </div>
//           <div class="card">
//             <div class="card-header"><div class="card-title">Leave History</div></div>
//             <div class="card-body">${dataTable({
//               columns: [
//                 { label: 'Type', key: 'type' },
//                 { label: 'Days', align: 'right', num: true, key: 'days' },
//                 { label: 'Status', render: r => chip(r.status === 'Approved' ? 'success' : r.status === 'Rejected' ? 'critical' : 'warning', r.status) },
//               ],
//               rows: leaves,
//               empty: 'No leave requests.',
//             })}</div>
//           </div>
//           <div class="card">
//             <div class="card-header"><div class="card-title">Payroll History</div></div>
//             <div class="card-body">
//               <div style="font-size:13px;line-height:2">
//                 <div style="display:flex;justify-content:space-between"><span class="text-muted">Last Gross</span><b>${fmtCurrencyINR(Math.round(e.ctc/12))}</b></div>
//                 <div style="display:flex;justify-content:space-between"><span class="text-muted">Last Net</span><b>${fmtCurrencyINR(Math.round(e.ctc/12*0.85))}</b></div>
//                 <div style="display:flex;justify-content:space-between"><span class="text-muted">YTD Paid</span><b>${fmtCurrencyINR(Math.round(e.ctc/12*7))}</b></div>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         // Add this inside the Employee 360 layout, right below the basic stats:
//         <div class="grid grid-3" style="margin-top:20px">
//           <div class="card">
//             <div class="card-header"><div class="card-title">Skills & Certifications</div></div>
//             <div class="card-body">
//               <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
//                 ${chip('info', 'CNC Programming')} ${chip('info', 'Six Sigma')} ${chip('info', 'Safety Lead')}
//               </div>
//               <div style="font-size:13px"><b>Cert:</b> AWS D1.1 Welding <br><span style="color:var(--warning)">Expires in 18 days</span></div>
//             </div>
//           </div>
//           <div class="card">
//             <div class="card-header"><div class="card-title">Emergency Contact</div></div>
//             <div class="card-body" style="font-size:13px">
//               <div><b>Name:</b> Sunita Kumar (Spouse)</div>
//               <div><b>Phone:</b> +91 99887 76655</div>
//               <div><b>Blood Group:</b> O+</div>
//             </div>
//           </div>
//           <div class="card">
//             <div class="card-header"><div class="card-title">Employment History</div></div>
//             <div class="card-body" style="font-size:13px;line-height:1.8">
//               <div style="display:flex;justify-content:space-between"><span>Sr. Engineer</span><b>2022 - Present</b></div>
//               <div style="display:flex;justify-content:space-between"><span>Engineer</span><b>2019 - 2022</b></div>
//             </div>
//           </div>
//         </div>`;

//     };
//     render(sel.value);
//     sel.addEventListener('change', e => render(e.target.value));
//   }, 0);
//   return html;
// }

// /* ============ MACHINE 360 ============ */
// function renderMachine360() {
//   const html = `
//     <div class="page-header">
//       <div><div class="page-title">Machine 360°</div><div class="page-subtitle">Runtime · MTBF · maintenance</div></div>
//     </div>
//     <div class="table-toolbar">
//       <select class="select" id="mchPick" style="max-width:340px">
//         ${db.machines.map(m => `<option value="${m.id}">${m.id} — ${m.name}</option>`).join('')}
//       </select>
//     </div>
//     <div id="mchContent"></div>`;
//   setTimeout(() => {
//     const sel = document.getElementById('mchPick');
//     const render = (id) => {
//       const m = db.machines.find(x => x.id === id);
//       if (!m) return;
//       document.getElementById('mchContent').innerHTML = `
//         <div class="entity-header">
//           <div class="entity-title-row">
//             <div class="entity-avatar" style="background:var(--warning-bg);color:var(--warning)">${icon('cpu', 24)}</div>
//             <div style="flex:1">
//               <div class="entity-name">${m.name}</div>
//               <div class="entity-meta">${m.id} · ${m.make} · WC ${m.wc}</div>
//             </div>
//             ${chip(m.status === 'Running' ? 'success' : 'warning', m.status)}
//           </div>
//           <div class="entity-stats">
//             <div class="entity-stat"><span class="label">Runtime</span><span class="value">${fmtNumber(m.runtime)} hrs</span></div>
//             <div class="entity-stat"><span class="label">MTBF</span><span class="value">${m.mtbf} hrs</span></div>
//             <div class="entity-stat"><span class="label">Installed</span><span class="value">${fmtDate(m.installed)}</span></div>
//             <div class="entity-stat"><span class="label">Last Maint.</span><span class="value">${fmtDate(m.lastMaint)}</span></div>
//             <div class="entity-stat"><span class="label">Work Center</span><span class="value">${m.wc}</span></div>
//           </div>
//         </div>
//         <div class="grid grid-2" style="margin-top:20px">
//           <div class="card">
//             <div class="card-header"><div class="card-title">Downtime Log</div></div>
//             <div class="card-body">
//               <div style="font-size:13px;line-height:2.2">
//                 <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding:6px 0"><span>Unplanned maintenance</span><b>5.5 hrs</b></div>
//                 <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding:6px 0"><span>Setup changeover</span><b>2.5 hrs</b></div>
//                 <div style="display:flex;justify-content:space-between;padding:6px 0"><span>Material wait</span><b>1.5 hrs</b></div>
//               </div>
//             </div>
//           </div>
//           <div class="card">
//             <div class="card-header"><div class="card-title">Recent Production Runs</div></div>
//             <div class="card-body">${dataTable({
//               columns: [
//                 { label: 'Order', key: 'id', mono: true },
//                 { label: 'Product', key: 'product' },
//                 { label: 'Qty', align: 'right', num: true, key: 'qty' },
//                 { label: 'Status', render: r => chip(r.status === 'Completed' ? 'success' : 'info', r.status) },
//               ],
//               rows: db.productionOrders,
//             })}</div>
//           </div>
//         </div>`;
//     };
//     render(sel.value);
//     sel.addEventListener('change', e => render(e.target.value));
//   }, 0);
//   return html;
// }


/* ============================================================
   EXTENDED 360° PROFILES (§10.4, Screens #20, Employee, Machine)
   Layout: Header + Stat Strip + Direct Tab Bar
   ============================================================ */

import { dataTable, chip, icon, toast } from '../components.js';
import { db } from '../state.js';
import { fmtCurrency, fmtDate, fmtNumber, initials } from '../format.js';

export function register(route) {
  route('views/item-360',     renderItem360);
  route('views/employee-360', renderEmployee360);
  route('views/machine-360',  renderMachine360);
}

/* ============================================================
   1. ITEM 360° PROFILE
   ============================================================ */
function renderItem360() {
  const items = db.items || [];
  const defaultCode = window.__selectedItemCode || (items[0] ? items[0].code : null);

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Item 360° Consolidated Profile</div>
        <div class="page-subtitle">Standardized Enterprise Entity View (§10.4) · Lifecycle, Consumption & Traceability</div>
      </div>
      <div class="page-actions">
        <select class="select" id="itemPickSelect" style="max-width:320px">
          ${items.map(i => `<option value="${i.code}" ${i.code === defaultCode ? 'selected' : ''}>${i.code} — ${i.name}</option>`).join('')}
        </select>
        <button class="btn btn-primary" onclick="alert('Print Item Master Specification')">${icon('download', 16)} Export Spec Sheet</button>
      </div>
    </div>
    <div id="itemContentArea">
      ${defaultCode ? renderItemDetails(defaultCode) : '<div class="empty"><div class="empty-title">No items found</div></div>'}
    </div>`;
}

function renderItemDetails(code) {
  const item = (db.items || []).find(x => x.code === code);
  if (!item) return '<div class="empty"><div class="empty-title">Item not found</div></div>';

  const pos = (db.purchaseOrders || []).slice(0, 3);
  const grns = (db.goodsReceipts || []).slice(0, 3);
  const batches = (db.batchSerials || []).filter(b => b.item.includes(item.code));
  const boms = (db.boms || []).slice(0, 2);

  return `
    <div class="entity-header" style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
        <div style="display:flex;gap:16px;align-items:center">
          <div style="width:56px;height:56px;border-radius:12px;background:var(--brand-primary-soft, rgba(79,70,229,0.1));color:var(--brand-primary);display:grid;place-items:center;font-size:24px;font-weight:700">
            ${item.name.slice(0, 1)}
          </div>
          <div>
            <div style="font-size:20px;font-weight:700">${item.name}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
              SKU Code: <b class="mono">${item.code}</b> · Category: <b>${item.category}</b> · Base Unit of Measure (UOM): <b>${item.uom}</b>
            </div>
          </div>
        </div>
        ${item.stock < item.safety ? chip('critical', 'Below Safety Stock') : chip('success', 'Stock Level Healthy')}
      </div>

      <div class="grid grid-4" style="border-top:1px solid var(--border);padding-top:16px">
        <div>
          <div class="text-muted" style="font-size:12px">Current On-Hand Stock</div>
          <div style="font-size:24px;font-weight:700;color:${item.stock < item.safety ? 'var(--critical)' : 'var(--text)'}">
            ${fmtNumber(item.stock)} ${item.uom}
          </div>
        </div>
        <div>
          <div class="text-muted" style="font-size:12px">Configured Safety Stock</div>
          <div style="font-size:24px;font-weight:700">${fmtNumber(item.safety)} ${item.uom}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:12px">Reorder Point Level</div>
          <div style="font-size:24px;font-weight:700">${fmtNumber(item.reorder)} ${item.uom}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:12px">Valuation (Standard Cost)</div>
          <div style="font-size:24px;font-weight:700;color:var(--brand-primary)">${fmtCurrency(item.value)}</div>
        </div>
      </div>
    </div>

    <div class="tabs" style="margin-bottom:20px">
      <div class="tab active" data-item-tab="movements">Inbound & Receipts (${grns.length})</div>
      <div class="tab" data-item-tab="pos">Open PO Orders (${pos.length})</div>
      <div class="tab" data-item-tab="bom">Bill of Materials Usage (${boms.length})</div>
      <div class="tab" data-item-tab="batch">Batch / Serial Expiry (${batches.length})</div>
    </div>

    <div class="tab-panel active" data-item-panel="movements">
      <div class="card"><div class="card-body">${dataTable({
        columns: [
          { label: 'GRN #', key: 'id', mono: true },
          { label: 'Receipt Date', render: r => fmtDate(r.date) },
          { label: 'Quantity Received', align: 'right', num: true, render: r => `${fmtNumber(r.qty)} ${item.uom}` },
          { label: 'Storage Bin', key: 'bin', mono: true },
          { label: 'QC Inspection Status', render: r => chip(r.qc === 'Passed' ? 'success' : 'warning', r.qc) },
        ],
        rows: grns,
        empty: 'No inbound receipts recorded for this item.',
      })}</div></div>
    </div>

    <div class="tab-panel" data-item-panel="pos">
      <div class="card"><div class="card-body">${dataTable({
        columns: [
          { label: 'PO #', key: 'id', mono: true },
          { label: 'Committed Total', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.amount)}</b>` },
          { label: 'Expected Delivery', render: r => fmtDate(r.expected) },
          { label: 'Approval Status', render: r => chip(r.status === 'Approved' ? 'success' : 'info', r.status) },
        ],
        rows: pos,
        empty: 'No open purchase orders for this item.',
      })}</div></div>
    </div>

    <div class="tab-panel" data-item-panel="bom">
      <div class="card"><div class="card-body">${dataTable({
        columns: [
          { label: 'BOM Code', key: 'id', mono: true },
          { label: 'Parent Product Assembly', key: 'product' },
          { label: 'Assembly Level Tier', align: 'right', num: true, key: 'level' },
          { label: 'Component Status', render: r => chip('success', r.status) },
        ],
        rows: boms,
        empty: 'Item not consumed in any current Bill of Materials.',
      })}</div></div>
    </div>

    <div class="tab-panel" data-item-panel="batch">
      <div class="card"><div class="card-body">${dataTable({
        columns: [
          { label: 'Batch ID', key: 'id', mono: true },
          { label: 'Mfg Date', render: r => fmtDate(r.mfg) },
          { label: 'Expiry Date', render: r => fmtDate(r.exp) },
          { label: 'Quantity', align: 'right', num: true, key: 'qty' },
          { label: 'Bin Location', key: 'bin', mono: true },
          { label: 'Shelf Life Remaining', align: 'right', num: true, render: r => `${r.daysLeft} Days` },
        ],
        rows: batches,
        empty: 'No active batch lots registered for this item.',
      })}</div></div>
    </div>`;
}

/* ============================================================
   2. EMPLOYEE 360° PROFILE
   ============================================================ */
function renderEmployee360() {
  const employees = db.employees || [];
  const defaultEmp = employees[0] || null;

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Employee 360° Consolidated Profile</div>
        <div class="page-subtitle">Standardized Enterprise Entity View (§10.4) · Attendance, Payroll & Performance</div>
      </div>
      <div class="page-actions">
        <select class="select" id="empPickSelect" style="max-width:320px">
          ${employees.map(e => `<option value="${e.id}">${e.name} (${e.id})</option>`).join('')}
        </select>
        <button class="btn btn-primary" onclick="alert('Export Employee Dossier')">${icon('download', 16)} Export Dossier</button>
      </div>
    </div>
    <div id="empContentArea">
      ${defaultEmp ? renderEmployeeDetails(defaultEmp.id) : '<div class="empty"><div class="empty-title">No employees found</div></div>'}
    </div>`;
}

function renderEmployeeDetails(id) {
  const e = (db.employees || []).find(x => x.id === id);
  if (!e) return '<div class="empty"><div class="empty-title">Employee not found</div></div>';

  const att = (db.attendance || []).filter(a => a.empId === id);
  const leaves = (db.leaveRequests || []).filter(l => l.empId === id);
  const perf = (db.performance || []).find(p => p.name === e.name);

  return `
    <div class="entity-header" style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
        <div style="display:flex;gap:16px;align-items:center">
          <div style="width:56px;height:56px;border-radius:12px;background:var(--info-bg, rgba(79,70,229,0.1));color:var(--brand-primary);display:grid;place-items:center;font-size:20px;font-weight:700">
            ${initials(e.name)}
          </div>
          <div>
            <div style="font-size:20px;font-weight:700">${e.name}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
              Employee ID: <b class="mono">${e.id}</b> · Dept: <b>${e.dept}</b> · Designation: <b>${e.designation}</b> · Email: ${e.email}
            </div>
          </div>
        </div>
        ${chip(e.status === 'Active' ? 'success' : 'warning', e.status)}
      </div>

      <div class="grid grid-4" style="border-top:1px solid var(--border);padding-top:16px">
        <div>
          <div class="text-muted" style="font-size:12px">Joining Date</div>
          <div style="font-size:24px;font-weight:700">${fmtDate(e.joined)}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:12px">Total Compensation (CTC)</div>
          <div style="font-size:24px;font-weight:700;color:var(--brand-primary)">${fmtCurrency(e.ctc || 0)}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:12px">Latest Performance Rating</div>
          <div style="font-size:24px;font-weight:700">${perf && perf.rating ? `${perf.rating} ★` : '—'}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:12px">Available Leave Balance</div>
          <div style="font-size:24px;font-weight:700">14 Days</div>
        </div>
      </div>
    </div>

    <div class="tabs" style="margin-bottom:20px">
      <div class="tab active" data-emp-tab="attendance">Attendance Log (${att.length})</div>
      <div class="tab" data-emp-tab="leave">Leave History (${leaves.length})</div>
      <div class="tab" data-emp-tab="payroll">Payroll & Compensation</div>
      <div class="tab" data-emp-tab="skills">Skills & Certifications</div>
    </div>

    <div class="tab-panel active" data-emp-panel="attendance">
      <div class="card"><div class="card-body">${dataTable({
        columns: [
          { label: 'Time In', key: 'in', mono: true },
          { label: 'Time Out', key: 'out', mono: true },
          { label: 'Hours Logged', align: 'right', num: true, key: 'hrs' },
          { label: 'Status', render: r => chip(r.status === 'Present' ? 'success' : r.status === 'Late' ? 'warning' : 'critical', r.status) },
        ],
        rows: att,
        empty: 'No attendance records found.',
      })}</div></div>
    </div>

    <div class="tab-panel" data-emp-panel="leave">
      <div class="card"><div class="card-body">${dataTable({
        columns: [
          { label: 'Leave Type', key: 'type' },
          { label: 'Start Date', render: r => fmtDate(r.from) },
          { label: 'End Date', render: r => fmtDate(r.to) },
          { label: 'Duration', align: 'right', num: true, render: r => `${r.days} Days` },
          { label: 'Status', render: r => chip(r.status === 'Approved' ? 'success' : r.status === 'Rejected' ? 'critical' : 'warning', r.status) },
        ],
        rows: leaves,
        empty: 'No leave history found.',
      })}</div></div>
    </div>

    <div class="tab-panel" data-emp-panel="payroll">
      <div class="card">
        <div class="card-header"><div class="card-title">Salary Breakdown (Monthly Base)</div></div>
        <div class="card-body" style="font-size:14px;line-height:2">
          <div style="display:flex;justify-content:space-between"><span>Base Salary:</span><b class="num">${fmtCurrency((e.ctc || 0) / 12 * 0.6)}</b></div>
          <div style="display:flex;justify-content:space-between"><span>Allowances (HRA/Travel):</span><b class="num">${fmtCurrency((e.ctc || 0) / 12 * 0.4)}</b></div>
          <div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:8px"><span>Gross Monthly Pay:</span><b class="num">${fmtCurrency((e.ctc || 0) / 12)}</b></div>
          <div style="display:flex;justify-content:space-between;color:var(--critical)"><span>Standard Deductions (Tax/Provident):</span><b class="num">-${fmtCurrency((e.ctc || 0) / 12 * 0.15)}</b></div>
          <div style="display:flex;justify-content:space-between;border-top:2px solid var(--border);padding-top:8px;font-weight:700;color:var(--success)"><span>Net Monthly Take-Home:</span><b class="num">${fmtCurrency((e.ctc || 0) / 12 * 0.85)}</b></div>
        </div>
      </div>
    </div>

    <div class="tab-panel" data-emp-panel="skills">
      <div class="card">
        <div class="card-body">
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
            ${chip('info', 'CNC Programming')} ${chip('info', 'Six Sigma Green Belt')} ${chip('info', 'Safety Lead')}
          </div>
          <div style="font-size:13px;border-top:1px solid var(--border);padding-top:12px">
            <b>Active Certification:</b> AWS D1.1 Welding <br>
            <span style="color:var(--warning)">Expires in 18 days — Renewal pending</span>
          </div>
        </div>
      </div>
    </div>`;
}

/* ============================================================
   3. MACHINE 360° PROFILE
   ============================================================ */
function renderMachine360() {
  const machines = db.machines || [];
  const defaultMachine = machines[0] || null;

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Machine 360° Consolidated Profile</div>
        <div class="page-subtitle">Standardized Enterprise Entity View (§10.4) · Runtime, MTBF & Maintenance</div>
      </div>
      <div class="page-actions">
        <select class="select" id="mchPickSelect" style="max-width:320px">
          ${machines.map(m => `<option value="${m.id}">${m.id} — ${m.name}</option>`).join('')}
        </select>
        <button class="btn btn-primary" onclick="alert('Export Asset Log')">${icon('download', 16)} Export Asset Log</button>
      </div>
    </div>
    <div id="mchContentArea">
      ${defaultMachine ? renderMachineDetails(defaultMachine.id) : '<div class="empty"><div class="empty-title">No machines found</div></div>'}
    </div>`;
}

function renderMachineDetails(id) {
  const m = (db.machines || []).find(x => x.id === id);
  if (!m) return '<div class="empty"><div class="empty-title">Machine not found</div></div>';

  return `
    <div class="entity-header" style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
        <div style="display:flex;gap:16px;align-items:center">
          <div style="width:56px;height:56px;border-radius:12px;background:var(--warning-bg);color:var(--warning);display:grid;place-items:center">
            ${icon('cpu', 28)}
          </div>
          <div>
            <div style="font-size:20px;font-weight:700">${m.name}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
              Asset ID: <b class="mono">${m.id}</b> · Manufacturer: <b>${m.make}</b> · Work Center Assignment: <b>${m.wc}</b>
            </div>
          </div>
        </div>
        ${chip(m.status === 'Running' ? 'success' : 'warning', m.status)}
      </div>

      <div class="grid grid-4" style="border-top:1px solid var(--border);padding-top:16px">
        <div>
          <div class="text-muted" style="font-size:12px">Total Lifetime Runtime</div>
          <div style="font-size:24px;font-weight:700">${fmtNumber(m.runtime)} hrs</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:12px">Mean Time Between Failures (MTBF)</div>
          <div style="font-size:24px;font-weight:700">${m.mtbf} hrs</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:12px">Commissioning Date</div>
          <div style="font-size:24px;font-weight:700">${fmtDate(m.installed)}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:12px">Last Maintenance Performed</div>
          <div style="font-size:24px;font-weight:700;color:var(--brand-primary)">${fmtDate(m.lastMaint)}</div>
        </div>
      </div>
    </div>

    <div class="tabs" style="margin-bottom:20px">
      <div class="tab active" data-mch-tab="downtime">Downtime Log</div>
      <div class="tab" data-mch-tab="production">Recent Production Runs</div>
    </div>

    <div class="tab-panel active" data-mch-panel="downtime">
      <div class="card">
        <div class="card-body">
          <div style="font-size:13px;line-height:2.2">
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding:6px 0"><span>Unplanned maintenance (Sensor fault)</span><b>5.5 hrs</b></div>
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding:6px 0"><span>Tooling setup changeover</span><b>2.5 hrs</b></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0"><span>Material staging wait</span><b>1.5 hrs</b></div>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-panel" data-mch-panel="production">
      <div class="card"><div class="card-body">${dataTable({
        columns: [
          { label: 'Order #', key: 'id', mono: true },
          { label: 'Target Product', key: 'product' },
          { label: 'Order Qty', align: 'right', num: true, key: 'qty' },
          { label: 'Status', render: r => chip(r.status === 'Completed' ? 'success' : 'info', r.status) },
        ],
        rows: db.productionOrders,
      })}</div></div>
    </div>`;
}

/* ============================================================
   EVENT DELEGATION (Reliably binds clicks without timing issues)
   ============================================================ */
document.addEventListener('route-rendered', (e) => {
  if (e.detail.path === 'views/item-360') {
    const sel = document.getElementById('itemPickSelect');
    const container = document.getElementById('itemContentArea');
    if (sel && container) {
      sel.onchange = (ev) => {
        container.innerHTML = renderItemDetails(ev.target.value);
        bindTabs('item');
      };
      bindTabs('item');
    }
  }

  if (e.detail.path === 'views/employee-360') {
    const sel = document.getElementById('empPickSelect');
    const container = document.getElementById('empContentArea');
    if (sel && container) {
      sel.onchange = (ev) => {
        container.innerHTML = renderEmployeeDetails(ev.target.value);
        bindTabs('emp');
      };
      bindTabs('emp');
    }
  }

  if (e.detail.path === 'views/machine-360') {
    const sel = document.getElementById('mchPickSelect');
    const container = document.getElementById('mchContentArea');
    if (sel && container) {
      sel.onchange = (ev) => {
        container.innerHTML = renderMachineDetails(ev.target.value);
        bindTabs('mch');
      };
      bindTabs('mch');
    }
  }
});

function bindTabs(prefix) {
  document.querySelectorAll(`[data-${prefix}-tab]`).forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll(`[data-${prefix}-tab]`).forEach(t => t.classList.remove('active'));
      document.querySelectorAll(`[data-${prefix}-panel]`).forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.querySelector(`[data-${prefix}-panel="${tab.dataset[prefix + 'Tab']}"]`);
      if (target) target.classList.add('active');
    };
  });
}