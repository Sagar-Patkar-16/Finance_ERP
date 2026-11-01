// import { dataTable, chip, icon, toast } from '../components.js';
// import { db } from '../state.js';
// import { fmtCurrencyINR, fmtDate } from '../format.js';
// import { navigate } from '../router.js';

// export function register(route) {
//   route('views/customer-360', renderCustomer360);
//   route('views/vendor-360',   renderVendor360);
// }

// /* ============ CUSTOMER 360 ============ */
// // function renderCustomer360() {
// //   const html = `
// //     <div class="page-header">
// //       <div><div class="page-title">Customer 360°</div><div class="page-subtitle">Full profile across all modules</div></div>
// //     </div>
// //     <div class="table-toolbar">
// //       <select class="select" id="custPick" style="max-width:340px">
// //         ${db.customers.map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join('')}
// //       </select>
// //     </div>
// //     <div id="custContent"></div>`;
// //   setTimeout(() => {
// //     const sel = document.getElementById('custPick');
// //     const render = (id) => {
// //       const c = db.customers.find(x => x.id === id);
// //       if (!c) return;
// //       const invs = db.customerInvoices.filter(i => i.customerId === id);
// //       const sos = db.salesOrders.filter(s => s.customerId === id);
// //       document.getElementById('custContent').innerHTML = `
// //         <div class="entity-header">
// //           <div class="entity-title-row">
// //             <div class="entity-avatar">${c.name.slice(0,1)}</div>
// //             <div style="flex:1">
// //               <div class="entity-name">${c.name}</div>
// //               <div class="entity-meta">${c.id} · ${c.gst} · ${c.contact}</div>
// //             </div>
// //             ${chip(c.status === 'Active' ? 'success' : 'neutral', c.status)}
// //           </div>
// //           <div class="entity-stats">
// //             <div class="entity-stat"><span class="label">Revenue</span><span class="value">${fmtCurrencyINR(c.revenue)}</span></div>
// //             <div class="entity-stat"><span class="label">Outstanding</span><span class="value">${fmtCurrencyINR(c.outstanding)}</span></div>
// //             <div class="entity-stat"><span class="label">Orders</span><span class="value">${c.orders}</span></div>
// //             <div class="entity-stat"><span class="label">Avg Payment</span><span class="value">${c.avgPaymentDays} days</span></div>
// //             <div class="entity-stat"><span class="label">Credit Limit</span><span class="value">${fmtCurrencyINR(c.creditLimit)}</span></div>
// //           </div>
// //         </div>
// //         <div class="grid grid-2" style="margin-top:20px">
// //           <div class="card">
// //             <div class="card-header"><div class="card-title">Sales Orders</div></div>
// //             <div class="card-body">${dataTable({
// //               columns: [
// //                 { label: 'SO #', key: 'id', mono: true },
// //                 { label: 'Value', align: 'right', num: true, render: r => fmtCurrencyINR(r.value) },
// //                 { label: 'Status', render: r => chip(r.status === 'Delivered' || r.status === 'Invoiced' ? 'success' : 'info', r.status) },
// //               ],
// //               rows: sos,
// //             })}</div>
// //           </div>
// //           <div class="card">
// //             <div class="card-header"><div class="card-title">Invoices</div></div>
// //             <div class="card-body">${dataTable({
// //               columns: [
// //                 { label: 'Invoice #', key: 'id', mono: true },
// //                 { label: 'Amount', align: 'right', num: true, render: r => fmtCurrencyINR(r.amount) },
// //                 { label: 'Status', render: r => chip(r.status === 'Paid' ? 'success' : r.status === 'Overdue' ? 'critical' : 'warning', r.status) },
// //               ],
// //               rows: invs,
// //             })}</div>
// //           </div>
// //         </div>`;
// //     };
// //     render(sel.value);
// //     sel.addEventListener('change', e => render(e.target.value));
// //   }, 0);
// //   return html;
// // }


// /* ============================================================
//    CUSTOMER 360° PROFILE (§10.4, Screen #12)
//    Layout: Header + Stat Strip + Direct Tab Bar (Overview, Orders, Invoices, Statements, CRM)
//    ============================================================ */
// function renderCustomer360() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Customer 360° Consolidated Profile</div>
//         <div class="page-subtitle">Standardized Enterprise Entity View (§10.4) · Cross-Module Relationship History</div>
//       </div>
//       <div class="page-actions">
//         <select class="select" id="custPick" style="max-width:320px">
//           ${db.customers.map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join('')}
//         </select>
//         <button class="btn btn-primary" onclick="alert('Export account master statement')">${icon('download', 16)} Export Statement</button>
//       </div>
//     </div>
//     <div id="custContent"></div>`;

//   setTimeout(() => {
//     const sel = document.getElementById('custPick');
//     const render = (id) => {
//       const c = db.customers.find(x => x.id === id);
//       if (!c) return;
//       const invs = db.customerInvoices.filter(i => i.customerId === id);
//       const sos = db.salesOrders.filter(s => s.customerId === id);
//       const complaints = (db.customerComplaints || []).filter(comp => comp.customerId === id);
//       const activities = (db.customerActivities || []).filter(act => act.customerId === id);

//       document.getElementById('custContent').innerHTML = `
//         <!-- 1. ENTITY HEADER & STAT STRIP (§10.4) -->
//         <div class="entity-header" style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:20px">
//           <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
//             <div style="display:flex;gap:16px;align-items:center">
//               <div style="width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,var(--brand-primary),var(--brand-accent));color:#fff;display:grid;place-items:center;font-size:24px;font-weight:700">
//                 ${c.name.slice(0, 1)}
//               </div>
//               <div>
//                 <div style="font-size:20px;font-weight:700">${c.name}</div>
//                 <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
//                   ${c.id} · Primary Contact: <b>${c.contact}</b> · ${c.email} · Tax ID: <span class="mono">${c.gst}</span>
//                 </div>
//               </div>
//             </div>
//             ${chip(c.status === 'Active' ? 'success' : 'neutral', c.status)}
//           </div>

//           <!-- Reusable 4-Stat Strip Required by Section 10.4 -->
//           <div class="grid grid-4" style="border-top:1px solid var(--border);padding-top:16px">
//             <div>
//               <div class="text-muted" style="font-size:12px">Total Revenue</div>
//               <div style="font-size:24px;font-weight:700;color:var(--success)">${fmtCurrency(c.revenue)}</div>
//             </div>
//             <div>
//               <div class="text-muted" style="font-size:12px">Current Outstanding</div>
//               <div style="font-size:24px;font-weight:700;color:${c.outstanding > c.creditLimit * 0.8 ? 'var(--critical)' : 'var(--text)'}">${fmtCurrency(c.outstanding)}</div>
//             </div>
//             <div>
//               <div class="text-muted" style="font-size:12px">Total Orders</div>
//               <div style="font-size:24px;font-weight:700">${c.orders}</div>
//             </div>
//             <div>
//               <div class="text-muted" style="font-size:12px">Average Payment Period</div>
//               <div style="font-size:24px;font-weight:700">${c.avgPaymentDays} Days</div>
//             </div>
//           </div>
//         </div>

//         <!-- 2. DIRECT TAB BAR (§10.4) -->
//         <div class="tabs" style="margin-bottom:20px">
//           <div class="tab active" data-cust-tab="orders">Sales Orders (${sos.length})</div>
//           <div class="tab" data-cust-tab="invoices">Invoices & AR (${invs.length})</div>
//           <div class="tab" data-cust-tab="credit">Credit & Exposure</div>
//           <div class="tab" data-cust-tab="crm">CRM & Activity (${activities.length + complaints.length})</div>
//         </div>

//         <!-- TAB 1: SALES ORDERS -->
//         <div class="tab-panel active" data-cust-panel="orders">
//           <div class="card"><div class="card-body">${dataTable({
//             columns: [
//               { label: 'SO #', key: 'id', mono: true },
//               { label: 'Order Value', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.value)}</b>` },
//               { label: 'Order Date', render: r => fmtDate(r.date) },
//               { label: 'Committed Delivery', render: r => fmtDate(r.delivery) },
//               { label: 'Items', align: 'right', num: true, key: 'items' },
//               { label: 'Fulfillment Status', render: r => chip(r.status === 'Delivered' || r.status === 'Invoiced' ? 'success' : 'info', r.status) },
//             ],
//             rows: sos,
//             empty: 'No sales orders found for this customer.',
//           })}</div></div>
//         </div>

//         <!-- TAB 2: INVOICES & AR -->
//         <div class="tab-panel" data-cust-panel="invoices">
//           <div class="card"><div class="card-body">${dataTable({
//             columns: [
//               { label: 'Invoice #', key: 'id', mono: true },
//               { label: 'Billed Amount', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.amount)}</b>` },
//               { label: 'Due Date', render: r => fmtDate(r.due) },
//               { label: 'Payment Status', render: r => chip(r.status === 'Paid' ? 'success' : r.status === 'Overdue' ? 'critical' : 'warning', r.status) },
//             ],
//             rows: invs,
//             empty: 'No invoices billed to this customer.',
//           })}</div></div>
//         </div>

//         <!-- TAB 3: CREDIT & EXPOSURE -->
//         <div class="tab-panel" data-cust-panel="credit">
//           <div class="grid grid-2">
//             <div class="card">
//               <div class="card-header"><div class="card-title">Credit Utilization Gauge</div></div>
//               <div class="card-body">
//                 <div style="margin-bottom:12px;display:flex;justify-content:space-between">
//                   <span>Credit Limit: <b>${fmtCurrency(c.creditLimit)}</b></span>
//                   <span>Utilized: <b>${Math.round((c.outstanding / c.creditLimit) * 100)}%</b></span>
//                 </div>
//                 <div class="progress" style="height:12px">
//                   <div class="progress-bar ${c.outstanding > c.creditLimit * 0.8 ? 'critical' : 'success'}" style="width:${Math.min(100, (c.outstanding / c.creditLimit) * 100)}%"></div>
//                 </div>
//                 <div style="font-size:12px;color:var(--text-muted);margin-top:12px">
//                   Available Open Credit: <b>${fmtCurrency(Math.max(0, c.creditLimit - c.outstanding))}</b>
//                 </div>
//               </div>
//             </div>
//             <div class="card">
//               <div class="card-header"><div class="card-title">Payment Terms & Banking</div></div>
//               <div class="card-body" style="font-size:13px;line-height:2">
//                 <div style="display:flex;justify-content:space-between"><span>Payment Terms:</span><b>Net 30 Days</b></div>
//                 <div style="display:flex;justify-content:space-between"><span>Currency Account:</span><b>USD ($)</b></div>
//                 <div style="display:flex;justify-content:space-between"><span>Auto-Reminder Escalation:</span><span class="chip chip-success">Enabled</span></div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <!-- TAB 4: CRM & COMPLAINTS -->
//         <div class="tab-panel" data-cust-panel="crm">
//           <div class="grid grid-2">
//             <div class="card">
//               <div class="card-header"><div class="card-title">Customer Complaints & Tickets</div></div>
//               <div class="card-body">${dataTable({
//                 columns: [
//                   { label: 'Ticket', key: 'id', mono: true },
//                   { label: 'Issue', key: 'title' },
//                   { label: 'Severity', render: r => chip(r.severity === 'High' ? 'critical' : 'warning', r.severity) },
//                   { label: 'Status', render: r => chip(r.status === 'Resolved' ? 'success' : 'info', r.status) },
//                 ],
//                 rows: complaints,
//                 empty: 'No complaints logged. High customer satisfaction.',
//               })}</div>
//             </div>
//             <div class="card">
//               <div class="card-header"><div class="card-title">Account Activity & Interactions</div></div>
//               <div class="card-body">
//                 ${activities.map(a => `
//                   <div style="padding:10px 0;border-bottom:1px solid var(--border)">
//                     <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
//                       <b>${a.type}: ${a.title}</b>
//                       <span class="text-muted">${fmtDate(a.date)}</span>
//                     </div>
//                     <div style="font-size:12px;color:var(--text-muted)">${a.notes}</div>
//                   </div>`).join('')}
//               </div>
//             </div>
//           </div>
//         </div>`;

//       // Bind local tab listeners
//       document.querySelectorAll('[data-cust-tab]').forEach(tab => {
//         tab.addEventListener('click', () => {
//           document.querySelectorAll('[data-cust-tab]').forEach(t => t.classList.remove('active'));
//           document.querySelectorAll('[data-cust-panel]').forEach(p => p.classList.remove('active'));
//           tab.classList.add('active');
//           document.querySelector(`[data-cust-panel="${tab.dataset.custTab}"]`).classList.add('active');
//         });
//       });
//     };

//     render(sel.value);
//     sel.addEventListener('change', e => render(e.target.value));
//   }, 0);

//   return html;
// }


// /* ============ VENDOR 360 ============ */
// // function renderVendor360() {
// //   const html = `
// //     <div class="page-header">
// //       <div><div class="page-title">Vendor 360°</div><div class="page-subtitle">Full profile across all modules</div></div>
// //     </div>
// //     <div class="table-toolbar">
// //       <select class="select" id="vendorPick" style="max-width:340px">
// //         ${db.vendors.map(v => `<option value="${v.id}">${v.name} (${v.id})</option>`).join('')}
// //       </select>
// //     </div>
// //     <div id="vendorContent"></div>`;
// //   setTimeout(() => {
// //     const sel = document.getElementById('vendorPick');
// //     const render = (id) => {
// //       const v = db.vendors.find(x => x.id === id);
// //       if (!v) return;
// //       const pos = db.purchaseOrders.filter(p => p.vendorId === id);
// //       const invs = db.vendorInvoices.filter(i => i.vendorId === id);
// //       const perfs = [
// //         { label: 'On-time', val: 90 - Math.floor((5 - v.rating) * 10) },
// //         { label: 'Quality', val: Math.round(v.rating * 20) },
// //         { label: 'Response', val: Math.round(v.rating * 19) },
// //       ];
// //       document.getElementById('vendorContent').innerHTML = `
// //         <div class="entity-header">
// //           <div class="entity-title-row">
// //             <div class="entity-avatar" style="background:var(--info-bg);color:var(--info)">${v.name.slice(0,1)}</div>
// //             <div style="flex:1">
// //               <div class="entity-name">${v.name}</div>
// //               <div class="entity-meta">${v.id} · ${v.category} · ${v.contact}</div>
// //             </div>
// //             ${chip(v.rating >= 4.5 ? 'success' : v.rating >= 4 ? 'info' : 'warning', v.rating + ' ★')}
// //           </div>
// //           <div class="entity-stats">
// //             <div class="entity-stat"><span class="label">Total Spend</span><span class="value">${fmtCurrencyINR(v.spend)}</span></div>
// //             <div class="entity-stat"><span class="label">Outstanding</span><span class="value">${fmtCurrencyINR(v.outstanding)}</span></div>
// //             <div class="entity-stat"><span class="label">Orders</span><span class="value">${Math.floor(v.spend/500000)}</span></div>
// //             <div class="entity-stat"><span class="label">Avg Delivery</span><span class="value">${v.delivery} days</span></div>
// //             <div class="entity-stat"><span class="label">Rating</span><span class="value">${v.rating} ★</span></div>
// //           </div>
// //         </div>
// //         <div class="grid grid-2" style="margin-top:20px">
// //           <div class="card">
// //             <div class="card-header"><div class="card-title">Purchase Orders</div></div>
// //             <div class="card-body">${dataTable({
// //               columns: [
// //                 { label: 'PO #', key: 'id', mono: true },
// //                 { label: 'Amount', align: 'right', num: true, render: r => fmtCurrencyINR(r.amount) },
// //                 { label: 'Status', render: r => chip(r.status === 'Approved' ? 'success' : 'info', r.status) },
// //               ],
// //               rows: pos,
// //             })}</div>
// //           </div>
// //           <div class="card">
// //             <div class="card-header"><div class="card-title">Delivery Performance</div></div>
// //             <div class="card-body">
// //               ${perfs.map(p => `
// //                 <div style="margin-bottom:14px">
// //                   <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span>${p.label}</span><b>${p.val}%</b></div>
// //                   <div class="progress"><div class="progress-bar ${p.val >= 85 ? 'success' : p.val >= 65 ? '' : 'warning'}" style="width:${p.val}%"></div></div>
// //                 </div>`).join('')}
// //             </div>
// //           </div>
// //         </div>`;
// //     };
// //     render(sel.value);
// //     sel.addEventListener('change', e => render(e.target.value));
// //   }, 0);
// //   return html;
// // }


// /* ============================================================
//    VENDOR 360° PROFILE (§10.4, Screen #16)
//    Layout: Header + Stat Strip + Direct Tab Bar (POs, GRNs, Invoices, Delivery & Contracts)
//    ============================================================ */
// function renderVendor360() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Vendor 360° Consolidated Profile</div>
//         <div class="page-subtitle">Standardized Enterprise Entity View (§10.4) · Sourcing SLA Performance</div>
//       </div>
//       <div class="page-actions">
//         <select class="select" id="vendorPick" style="max-width:320px">
//           ${db.vendors.map(v => `<option value="${v.id}">${v.name} (${v.id})</option>`).join('')}
//         </select>
//         <button class="btn btn-primary" onclick="alert('Export vendor compliance evaluation')">${icon('download', 16)} Export Dossier</button>
//       </div>
//     </div>
//     <div id="vendorContent"></div>`;

//   setTimeout(() => {
//     const sel = document.getElementById('vendorPick');
//     const render = (id) => {
//       const v = db.vendors.find(x => x.id === id);
//       if (!v) return;
//       const pos = db.purchaseOrders.filter(p => p.vendorId === id);
//       const invs = db.vendorInvoices.filter(i => i.vendorId === id);
//       const contracts = (db.vendorContracts || []).filter(c => c.vendorId === id);
//       const evalData = (db.vendorEvaluations || []).find(e => e.vendorId === id) || { qualityScore: 95, onTimeDelivery: 90 };

//       document.getElementById('vendorContent').innerHTML = `
//         <!-- 1. ENTITY HEADER & STAT STRIP (§10.4) -->
//         <div class="entity-header" style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:20px">
//           <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
//             <div style="display:flex;gap:16px;align-items:center">
//               <div style="width:56px;height:56px;border-radius:12px;background:var(--info-bg);color:var(--brand-primary);display:grid;place-items:center;font-size:24px;font-weight:700">
//                 ${v.name.slice(0, 1)}
//               </div>
//               <div>
//                 <div style="font-size:20px;font-weight:700">${v.name}</div>
//                 <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
//                   ${v.id} · Category: <b>${v.category}</b> · Terms: Net ${v.terms} · Contact: ${v.contact} (${v.email})
//                 </div>
//               </div>
//             </div>
//             ${chip(v.rating >= 4.5 ? 'success' : 'info', `${v.rating} ★ Tier-1`)}
//           </div>

//           <!-- Reusable 4-Stat Strip Required by Section 10.4 -->
//           <div class="grid grid-4" style="border-top:1px solid var(--border);padding-top:16px">
//             <div>
//               <div class="text-muted" style="font-size:12px">Total YTD Spend</div>
//               <div style="font-size:24px;font-weight:700;color:var(--brand-primary)">${fmtCurrency(v.spend)}</div>
//             </div>
//             <div>
//               <div class="text-muted" style="font-size:12px">Accounts Payable Outstanding</div>
//               <div style="font-size:24px;font-weight:700">${fmtCurrency(v.outstanding)}</div>
//             </div>
//             <div>
//               <div class="text-muted" style="font-size:12px">Committed POs</div>
//               <div style="font-size:24px;font-weight:700">${pos.length} Orders</div>
//             </div>
//             <div>
//               <div class="text-muted" style="font-size:12px">Avg Delivery Lead Time</div>
//               <div style="font-size:24px;font-weight:700">${v.delivery} Days</div>
//             </div>
//           </div>
//         </div>

//         <!-- 2. DIRECT TAB BAR (§10.4) -->
//         <div class="tabs" style="margin-bottom:20px">
//           <div class="tab active" data-v-tab="pos">Purchase Orders (${pos.length})</div>
//           <div class="tab" data-v-tab="invoices">Invoices & Matching (${invs.length})</div>
//           <div class="tab" data-v-tab="performance">SLA & Performance (${evalData.qualityScore}%)</div>
//           <div class="tab" data-v-tab="contracts">Contracts & Compliance (${contracts.length})</div>
//         </div>

//         <!-- TAB 1: PURCHASE ORDERS -->
//         <div class="tab-panel active" data-v-panel="pos">
//           <div class="card"><div class="card-body">${dataTable({
//             columns: [
//               { label: 'PO #', key: 'id', mono: true },
//               { label: 'Date', render: r => fmtDate(r.date) },
//               { label: 'Order Value', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.amount)}</b>` },
//               { label: 'Expected Delivery', render: r => fmtDate(r.expected) },
//               { label: 'Line Items', align: 'right', num: true, key: 'items' },
//               { label: 'Status', render: r => chip(r.status === 'Approved' ? 'success' : 'info', r.status) },
//             ],
//             rows: pos,
//             empty: 'No purchase orders issued to this vendor.',
//           })}</div></div>
//         </div>

//         <!-- TAB 2: INVOICES & MATCHING -->
//         <div class="tab-panel" data-v-panel="invoices">
//           <div class="card"><div class="card-body">${dataTable({
//             columns: [
//               { label: 'Invoice #', key: 'id', mono: true },
//               { label: 'Amount', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.amount)}</b>` },
//               { label: 'Due Date', render: r => fmtDate(r.due) },
//               { label: 'Audit Match', render: r => chip(r.match === '3-Way' ? 'success' : 'info', r.match) },
//               { label: 'Payment State', render: r => chip(r.status === 'Paid' ? 'success' : r.status === 'Approved' ? 'info' : 'warning', r.status) },
//             ],
//             rows: invs,
//             empty: 'No invoices recorded for this vendor.',
//           })}</div></div>
//         </div>

//         <!-- TAB 3: PERFORMANCE -->
//         <div class="tab-panel" data-v-panel="performance">
//           <div class="grid grid-2">
//             <div class="card">
//               <div class="card-header"><div class="card-title">Quality & Audit Pass Rate</div></div>
//               <div class="card-body">
//                 <div style="margin-bottom:16px">
//                   <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
//                     <span>Inbound Lot QC Acceptance</span><b>${evalData.qualityScore}%</b>
//                   </div>
//                   <div class="progress" style="height:10px">
//                     <div class="progress-bar success" style="width:${evalData.qualityScore}%"></div>
//                   </div>
//                 </div>
//                 <div>
//                   <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
//                     <span>On-Time In-Full (OTIF) Delivery</span><b>${evalData.onTimeDelivery}%</b>
//                   </div>
//                   <div class="progress" style="height:10px">
//                     <div class="progress-bar ${evalData.onTimeDelivery >= 90 ? 'success' : 'warning'}" style="width:${evalData.onTimeDelivery}%"></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div class="card">
//               <div class="card-header"><div class="card-title">Commercial Sourcing Terms</div></div>
//               <div class="card-body" style="font-size:13px;line-height:2">
//                 <div style="display:flex;justify-content:space-between"><span>Payment Terms:</span><b>${v.terms}</b></div>
//                 <div style="display:flex;justify-content:space-between"><span>Settlement Currency:</span><b>${v.currency || 'USD'}</b></div>
//                 <div style="display:flex;justify-content:space-between"><span>Standard Delivery SLA:</span><b>${v.delivery} Business Days</b></div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <!-- TAB 4: CONTRACTS -->
//         <div class="tab-panel" data-v-panel="contracts">
//           <div class="card"><div class="card-body">${dataTable({
//             columns: [
//               { label: 'Contract #', key: 'id', mono: true },
//               { label: 'Agreement Title', key: 'title' },
//               { label: 'Effective Date', render: r => fmtDate(r.effective) },
//               { label: 'Expiration', render: r => fmtDate(r.expiry) },
//               { label: 'Authorized Spend Cap', align: 'right', num: true, render: r => fmtCurrency(r.spendCap) },
//               { label: 'Status', render: r => chip(r.status === 'Active' ? 'success' : 'warning', r.status) },
//             ],
//             rows: contracts,
//             empty: 'No formal contract files uploaded.',
//           })}</div></div>
//         </div>`;

//       // Bind local tab listeners
//       document.querySelectorAll('[data-v-tab]').forEach(tab => {
//         tab.addEventListener('click', () => {
//           document.querySelectorAll('[data-v-tab]').forEach(t => t.classList.remove('active'));
//           document.querySelectorAll('[data-v-panel]').forEach(p => p.classList.remove('active'));
//           tab.classList.add('active');
//           document.querySelector(`[data-v-panel="${tab.dataset.vTab}"]`).classList.add('active');
//         });
//       });
//     };

//     render(sel.value);
//     sel.addEventListener('change', e => render(e.target.value));
//   }, 0);

//   return html;
// }

import { dataTable, chip, icon, toast } from '../components.js';
import { db } from '../state.js';
import { fmtCurrency, fmtDate, fmtNumber } from '../format.js';

export function register(route) {
  route('views/customer-360', renderCustomer360);
  route('views/vendor-360',   renderVendor360);
}

/* ============================================================
   VENDOR 360° PROFILE (§10.4, Screen #16)
   ============================================================ */
function renderVendor360() {
  const vendors = db.vendors || [];
  const defaultVendor = vendors[0] || null;

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Vendor 360° Consolidated Profile</div>
        <div class="page-subtitle">Standardized Enterprise Entity View (§10.4) · Sourcing SLA Performance</div>
      </div>
      <div class="page-actions">
        <select class="select" id="vendorPick" style="max-width:320px">
          ${vendors.map(v => `<option value="${v.id}">${v.name} (${v.id})</option>`).join('')}
        </select>
        <button class="btn btn-primary" onclick="alert('Export vendor compliance evaluation')">${icon('download', 16)} Export Dossier</button>
      </div>
    </div>
    <div id="vendorContent">
      ${defaultVendor ? renderVendorDetails(defaultVendor.id) : '<div class="empty"><div class="empty-title">No vendors found</div></div>'}
    </div>`;
}

function renderVendorDetails(id) {
  const v = (db.vendors || []).find(x => x.id === id);
  if (!v) return '<div class="empty"><div class="empty-title">Vendor not found</div></div>';

  const pos = (db.purchaseOrders || []).filter(p => p.vendorId === id);
  const invs = (db.vendorInvoices || []).filter(i => i.vendorId === id);
  const contracts = (db.vendorContracts || []).filter(c => c.vendorId === id);
  const evalData = (db.vendorEvaluations || []).find(e => e.vendorId === id) || { 
    qualityScore: Math.round((v.rating || 4) * 20), 
    onTimeDelivery: v.delivery ? Math.max(70, 100 - v.delivery * 2) : 90 
  };

  return `
    <!-- 1. ENTITY HEADER & STAT STRIP (§10.4) -->
    <div class="entity-header" style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
        <div style="display:flex;gap:16px;align-items:center">
          <div style="width:56px;height:56px;border-radius:12px;background:var(--info-bg, rgba(79,70,229,0.1));color:var(--brand-primary, #4F46E5);display:grid;place-items:center;font-size:24px;font-weight:700">
            ${v.name ? v.name.slice(0, 1) : 'V'}
          </div>
          <div>
            <div style="font-size:20px;font-weight:700">${v.name}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
              ${v.id} · Category: <b>${v.category || 'Supplier'}</b> · Terms: Net ${v.terms || v.payTerms || '30 Days'} · Contact: ${v.contact || '—'} (${v.email || '—'})
            </div>
          </div>
        </div>
        ${chip(v.rating >= 4.5 ? 'success' : 'info', `${v.rating || 4.0} ★ Tier-1`)}
      </div>

      <!-- Reusable 4-Stat Strip Required by Section 10.4 -->
      <div class="grid grid-4" style="border-top:1px solid var(--border);padding-top:16px">
        <div>
          <div class="text-muted" style="font-size:12px">Total YTD Spend</div>
          <div style="font-size:24px;font-weight:700;color:var(--brand-primary)">${fmtCurrency(v.spend || 0)}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:12px">Accounts Payable Outstanding</div>
          <div style="font-size:24px;font-weight:700">${fmtCurrency(v.outstanding || 0)}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:12px">Committed POs</div>
          <div style="font-size:24px;font-weight:700">${pos.length} Orders</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:12px">Avg Delivery Lead Time</div>
          <div style="font-size:24px;font-weight:700">${v.delivery || 7} Days</div>
        </div>
      </div>
    </div>

    <!-- 2. DIRECT TAB BAR (§10.4) -->
    <div class="tabs" style="margin-bottom:20px">
      <div class="tab active" data-v-tab="pos">Purchase Orders (${pos.length})</div>
      <div class="tab" data-v-tab="invoices">Invoices & Matching (${invs.length})</div>
      <div class="tab" data-v-tab="performance">SLA & Performance (${evalData.qualityScore}%)</div>
      <div class="tab" data-v-tab="contracts">Contracts & Compliance (${contracts.length})</div>
    </div>

    <!-- TAB 1: PURCHASE ORDERS -->
    <div class="tab-panel active" data-v-panel="pos">
      <div class="card"><div class="card-body">${dataTable({
        columns: [
          { label: 'PO #', key: 'id', mono: true },
          { label: 'Date', render: r => fmtDate(r.date) },
          { label: 'Order Value', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.amount)}</b>` },
          { label: 'Expected Delivery', render: r => fmtDate(r.expected) },
          { label: 'Line Items', align: 'right', num: true, key: 'items' },
          { label: 'Status', render: r => chip(r.status === 'Approved' ? 'success' : 'info', r.status) },
        ],
        rows: pos,
        empty: 'No purchase orders issued to this vendor.',
      })}</div></div>
    </div>

    <!-- TAB 2: INVOICES & MATCHING -->
    <div class="tab-panel" data-v-panel="invoices">
      <div class="card"><div class="card-body">${dataTable({
        columns: [
          { label: 'Invoice #', key: 'id', mono: true },
          { label: 'Amount', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.amount)}</b>` },
          { label: 'Due Date', render: r => fmtDate(r.due) },
          { label: 'Audit Match', render: r => chip(r.match === '3-Way' ? 'success' : 'info', r.match) },
          { label: 'Payment State', render: r => chip(r.status === 'Paid' ? 'success' : r.status === 'Approved' ? 'info' : 'warning', r.status) },
        ],
        rows: invs,
        empty: 'No invoices recorded for this vendor.',
      })}</div></div>
    </div>

    <!-- TAB 3: PERFORMANCE -->
    <div class="tab-panel" data-v-panel="performance">
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">Quality & Audit Pass Rate</div></div>
          <div class="card-body">
            <div style="margin-bottom:16px">
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
                <span>Inbound Lot QC Acceptance</span><b>${evalData.qualityScore}%</b>
              </div>
              <div class="progress" style="height:10px">
                <div class="progress-bar success" style="width:${evalData.qualityScore}%"></div>
              </div>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
                <span>On-Time In-Full (OTIF) Delivery</span><b>${evalData.onTimeDelivery}%</b>
              </div>
              <div class="progress" style="height:10px">
                <div class="progress-bar ${evalData.onTimeDelivery >= 90 ? 'success' : 'warning'}" style="width:${evalData.onTimeDelivery}%"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Commercial Sourcing Terms</div></div>
          <div class="card-body" style="font-size:13px;line-height:2">
            <div style="display:flex;justify-content:space-between"><span>Payment Terms:</span><b>${v.terms || v.payTerms || '30 Days'}</b></div>
            <div style="display:flex;justify-content:space-between"><span>Settlement Currency:</span><b>${v.currency || 'USD'}</b></div>
            <div style="display:flex;justify-content:space-between"><span>Standard Delivery SLA:</span><b>${v.delivery || 7} Business Days</b></div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 4: CONTRACTS -->
    <div class="tab-panel" data-v-panel="contracts">
      <div class="card"><div class="card-body">${dataTable({
        columns: [
          { label: 'Contract #', key: 'id', mono: true },
          { label: 'Agreement Title', key: 'title' },
          { label: 'Effective Date', render: r => fmtDate(r.effective) },
          { label: 'Expiration', render: r => fmtDate(r.expiry) },
          { label: 'Authorized Spend Cap', align: 'right', num: true, render: r => fmtCurrency(r.spendCap) },
          { label: 'Status', render: r => chip(r.status === 'Active' ? 'success' : 'warning', r.status) },
        ],
        rows: contracts,
        empty: 'No formal contract files uploaded.',
      })}</div></div>
    </div>`;
}

/* ============================================================
   CUSTOMER 360° PROFILE (§10.4, Screen #12)
   ============================================================ */
function renderCustomer360() {
  const customers = db.customers || [];
  const defaultCust = customers[0] || null;

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Customer 360° Consolidated Profile</div>
        <div class="page-subtitle">Standardized Enterprise Entity View (§10.4) · Cross-Module Relationship History</div>
      </div>
      <div class="page-actions">
        <select class="select" id="custPick" style="max-width:320px">
          ${customers.map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join('')}
        </select>
        <button class="btn btn-primary" onclick="alert('Export account master statement')">${icon('download', 16)} Export Statement</button>
      </div>
    </div>
    <div id="custContent">
      ${defaultCust ? renderCustomerDetails(defaultCust.id) : '<div class="empty"><div class="empty-title">No customers found</div></div>'}
    </div>`;
}

function renderCustomerDetails(id) {
  const c = (db.customers || []).find(x => x.id === id);
  if (!c) return '<div class="empty"><div class="empty-title">Customer not found</div></div>';

  const invs = (db.customerInvoices || []).filter(i => i.customerId === id);
  const sos = (db.salesOrders || []).filter(s => s.customerId === id);
  const complaints = (db.customerComplaints || []).filter(comp => comp.customerId === id);
  const activities = (db.customerActivities || []).filter(act => act.customerId === id);

  return `
    <div class="entity-header" style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
        <div style="display:flex;gap:16px;align-items:center">
          <div style="width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,var(--brand-primary),var(--brand-accent));color:#fff;display:grid;place-items:center;font-size:24px;font-weight:700">
            ${c.name.slice(0, 1)}
          </div>
          <div>
            <div style="font-size:20px;font-weight:700">${c.name}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
              ${c.id} · Primary Contact: <b>${c.contact}</b> · ${c.email} · Tax ID: <span class="mono">${c.gst}</span>
            </div>
          </div>
        </div>
        ${chip(c.status === 'Active' ? 'success' : 'neutral', c.status)}
      </div>

      <div class="grid grid-4" style="border-top:1px solid var(--border);padding-top:16px">
        <div>
          <div class="text-muted" style="font-size:12px">Total Revenue</div>
          <div style="font-size:24px;font-weight:700;color:var(--success)">${fmtCurrency(c.revenue || 0)}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:12px">Current Outstanding</div>
          <div style="font-size:24px;font-weight:700;color:${c.outstanding > c.creditLimit * 0.8 ? 'var(--critical)' : 'var(--text)'}">${fmtCurrency(c.outstanding || 0)}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:12px">Total Orders</div>
          <div style="font-size:24px;font-weight:700">${c.orders || 0}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:12px">Average Payment Period</div>
          <div style="font-size:24px;font-weight:700">${c.avgPaymentDays || 30} Days</div>
        </div>
      </div>
    </div>

    <div class="tabs" style="margin-bottom:20px">
      <div class="tab active" data-cust-tab="orders">Sales Orders (${sos.length})</div>
      <div class="tab" data-cust-tab="invoices">Invoices & AR (${invs.length})</div>
      <div class="tab" data-cust-tab="credit">Credit & Exposure</div>
      <div class="tab" data-cust-tab="crm">CRM & Activity (${activities.length + complaints.length})</div>
    </div>

    <div class="tab-panel active" data-cust-panel="orders">
      <div class="card"><div class="card-body">${dataTable({
        columns: [
          { label: 'SO #', key: 'id', mono: true },
          { label: 'Order Value', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.value)}</b>` },
          { label: 'Order Date', render: r => fmtDate(r.date) },
          { label: 'Committed Delivery', render: r => fmtDate(r.delivery) },
          { label: 'Items', align: 'right', num: true, key: 'items' },
          { label: 'Fulfillment Status', render: r => chip(r.status === 'Delivered' || r.status === 'Invoiced' ? 'success' : 'info', r.status) },
        ],
        rows: sos,
        empty: 'No sales orders found for this customer.',
      })}</div></div>
    </div>

    <div class="tab-panel" data-cust-panel="invoices">
      <div class="card"><div class="card-body">${dataTable({
        columns: [
          { label: 'Invoice #', key: 'id', mono: true },
          { label: 'Billed Amount', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.amount)}</b>` },
          { label: 'Due Date', render: r => fmtDate(r.due) },
          { label: 'Payment Status', render: r => chip(r.status === 'Paid' ? 'success' : r.status === 'Overdue' ? 'critical' : 'warning', r.status) },
        ],
        rows: invs,
        empty: 'No invoices billed to this customer.',
      })}</div></div>
    </div>

    <div class="tab-panel" data-cust-panel="credit">
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">Credit Utilization Gauge</div></div>
          <div class="card-body">
            <div style="margin-bottom:12px;display:flex;justify-content:space-between">
              <span>Credit Limit: <b>${fmtCurrency(c.creditLimit || 0)}</b></span>
              <span>Utilized: <b>${c.creditLimit ? Math.round((c.outstanding / c.creditLimit) * 100) : 0}%</b></span>
            </div>
            <div class="progress" style="height:12px">
              <div class="progress-bar ${c.outstanding > c.creditLimit * 0.8 ? 'critical' : 'success'}" style="width:${Math.min(100, c.creditLimit ? (c.outstanding / c.creditLimit) * 100 : 0)}%"></div>
            </div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:12px">
              Available Open Credit: <b>${fmtCurrency(Math.max(0, (c.creditLimit || 0) - (c.outstanding || 0)))}</b>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Payment Terms & Banking</div></div>
          <div class="card-body" style="font-size:13px;line-height:2">
            <div style="display:flex;justify-content:space-between"><span>Payment Terms:</span><b>Net 30 Days</b></div>
            <div style="display:flex;justify-content:space-between"><span>Currency Account:</span><b>USD ($)</b></div>
            <div style="display:flex;justify-content:space-between"><span>Auto-Reminder Escalation:</span><span class="chip chip-success">Enabled</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-panel" data-cust-panel="crm">
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">Customer Complaints & Tickets</div></div>
          <div class="card-body">${dataTable({
            columns: [
              { label: 'Ticket', key: 'id', mono: true },
              { label: 'Issue', key: 'title' },
              { label: 'Severity', render: r => chip(r.severity === 'High' ? 'critical' : 'warning', r.severity) },
              { label: 'Status', render: r => chip(r.status === 'Resolved' ? 'success' : 'info', r.status) },
            ],
            rows: complaints,
            empty: 'No complaints logged. High customer satisfaction.',
          })}</div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Account Activity & Interactions</div></div>
          <div class="card-body">
            ${activities.length === 0 ? '<div class="text-muted" style="font-size:12px">No recent activities</div>' : activities.map(a => `
              <div style="padding:10px 0;border-bottom:1px solid var(--border)">
                <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
                  <b>${a.type}: ${a.title}</b>
                  <span class="text-muted">${fmtDate(a.date)}</span>
                </div>
                <div style="font-size:12px;color:var(--text-muted)">${a.notes}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

/* ============================================================
   EVENT DELEGATION (Reliably binds clicks without timing issues)
   ============================================================ */
document.addEventListener('route-rendered', (e) => {
  if (e.detail.path === 'views/vendor-360') {
    const sel = document.getElementById('vendorPick');
    const container = document.getElementById('vendorContent');

    if (sel && container) {
      sel.onchange = (ev) => {
        container.innerHTML = renderVendorDetails(ev.target.value);
        bindVendorTabs();
      };
      bindVendorTabs();
    }
  }

  if (e.detail.path === 'views/customer-360') {
    const sel = document.getElementById('custPick');
    const container = document.getElementById('custContent');

    if (sel && container) {
      sel.onchange = (ev) => {
        container.innerHTML = renderCustomerDetails(ev.target.value);
        bindCustomerTabs();
      };
      bindCustomerTabs();
    }
  }
});

function bindVendorTabs() {
  document.querySelectorAll('[data-v-tab]').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('[data-v-tab]').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('[data-v-panel]').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.querySelector(`[data-v-panel="${tab.dataset.vTab}"]`);
      if (target) target.classList.add('active');
    };
  });
}

function bindCustomerTabs() {
  document.querySelectorAll('[data-cust-tab]').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('[data-cust-tab]').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('[data-cust-panel]').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.querySelector(`[data-cust-panel="${tab.dataset.custTab}"]`);
      if (target) target.classList.add('active');
    };
  });
}