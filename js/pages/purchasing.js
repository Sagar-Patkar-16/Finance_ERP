// import { dataTable, chip, icon, toast, formModal, confirmDialog, stepper } from '../components.js';
// import {
//   db, createPR, approvePR, createRFQFromPR, createPOFromRFQ,
//   approvePO, createGRN, passQC, threeWayMatch,
//   createVendorInvoice, approveVendorInvoice
// } from '../state.js';
// import { logContract } from '../api-contract.js';
// import { navigate } from '../router.js';
// import { fmtCurrencyINR, fmtDate } from '../format.js';

// export function register(route) {
//   route('purchasing/prs',   renderPRs);
//   route('purchasing/rfq',   renderRFQ);
//   route('purchasing/po',    renderPOs);
//   route('purchasing/grn',   renderGRN);
//   route('purchasing/vi',    renderVI);
//   route('purchasing/match', renderMatch);
// }

// /* ============ PURCHASE REQUISITIONS ============ */
// function renderPRs() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Purchase Requisitions</div>
//         <div class="page-subtitle">Dept → PR → Approval → RFQ</div>
//       </div>
//       <div class="page-actions">
//         <button class="btn btn-primary" id="btn-new-pr" data-perm="create.pr">${icon('plus', 16)} New PR</button>
//       </div>
//     </div>
//     <div class="card"><div class="card-body">${renderPRTable()}</div></div>`;
//   setTimeout(bindPRHandlers, 0);
//   return html;
// }

// function renderPRTable() {
//   return dataTable({
//     columns: [
//       { label: 'PR #', key: 'id', mono: true },
//       { label: 'Dept', key: 'dept' },
//       { label: 'Item', key: 'item' },
//       { label: 'Qty', key: 'qty', align: 'right', num: true },
//       { label: 'Amount', align: 'right', num: true, render: r => fmtCurrencyINR(r.amount) },
//       { label: 'Requested', render: r => fmtDate(r.date) },
//       { label: 'Status', render: r => {
//           const m = { Pending: 'warning', Approved: 'success', Rejected: 'critical', 'Converted to RFQ': 'info' };
//           return chip(m[r.status] || 'neutral', r.status);
//       }},
//       { label: 'Actions', render: r => `
//           ${r.status === 'Pending'  ? `<button class="btn btn-primary btn-sm" data-approve-pr="${r.id}" data-perm="approve.pr">Approve</button>` : ''}
//           ${r.status === 'Approved' ? `<button class="btn btn-primary btn-sm" data-rfq="${r.id}" data-perm="create.rfq">Create RFQ</button>` : ''}
//       `},
//     ],
//     rows: db.purchaseRequisitions,
//   });
// }

// function bindPRHandlers() {
//   document.getElementById('btn-new-pr')?.addEventListener('click', () => {
//     formModal({
//       title: 'New Purchase Requisition',
//       fields: [
//         { name: 'dept', label: 'Department', type: 'select', required: true, options: [
//           { value: 'Production', label: 'Production' },
//           { value: 'Maintenance', label: 'Maintenance' },
//           { value: 'Admin', label: 'Admin' },
//         ]},
//         { name: 'itemCode', label: 'Item', type: 'select', required: true,
//           options: db.items.map(i => ({ value: i.code, label: `${i.code} — ${i.name}` })) },
//         { name: 'qty', label: 'Quantity', type: 'number', required: true, placeholder: 'e.g. 500' },
//       ],
//       submitLabel: 'Create PR',
//       onSubmit: (data) => {
//         const pr = createPR(data);
//         logContract({ method: 'POST', path: '/api/purchase-requisitions', body: data, response: pr, role: window.__session.role });
//         toast('PR created', `${pr.id} for ${pr.item}`, 'success');
//         window.dispatchEvent(new HashChangeEvent('hashchange'));
//       }
//     });
//   });

//   document.querySelectorAll('[data-approve-pr]').forEach(b => {
//     b.addEventListener('click', async () => {
//       const id = b.dataset.approvePr;
//       const ok = await confirmDialog({ title: `Approve ${id}?`, message: 'This will route the PR to the RFQ stage.' });
//       if (!ok) return;
//       const pr = approvePR(id);
//       logContract({ method: 'PATCH', path: `/api/purchase-requisitions/${id}/approve`, response: pr, role: window.__session.role });
//       toast('PR approved', `${id} is now Approved`, 'success');
//       window.dispatchEvent(new HashChangeEvent('hashchange'));
//     });
//   });

//   document.querySelectorAll('[data-rfq]').forEach(b => {
//     b.addEventListener('click', () => {
//       const id = b.dataset.rfq;
//       const rfq = createRFQFromPR(id);
//       logContract({ method: 'POST', path: '/api/rfqs', body: { prId: id }, response: rfq, role: window.__session.role });
//       toast('RFQ created', `${rfq.id} from ${id}`, 'success');
//       navigate('purchasing/rfq');
//     });
//   });
// }

// /* ============ RFQ ============ */
// function renderRFQ() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">RFQ Comparison</div>
//         <div class="page-subtitle">Vendor responses side-by-side · award creates PO</div>
//       </div>
//     </div>
//     ${db.rfqs.length === 0 ? `<div class="card"><div class="card-body"><div class="empty"><div class="empty-title">No open RFQs</div><div class="empty-desc">Create one from an approved PR.</div></div></div></div>` : ''}
//     ${db.rfqs.map(rfq => renderRFQCard(rfq)).join('')}`;
//   setTimeout(bindRFQHandlers, 0);
//   return html;
// }

// function renderRFQCard(rfq) {
//   const bestPrice = Math.min(...rfq.responses.map(r => r.price));
//   const bestDel = Math.min(...rfq.responses.map(r => r.delivery));
  
//   return `
//     <div class="card" style="margin-bottom:16px">
//       <div class="card-header">
//         <div class="card-title">${rfq.id} · ${rfq.item} (Qty: ${rfq.qty})</div>
//       </div>
//       <div class="card-body" style="display:flex;gap:16px;overflow-x:auto;padding:20px">
//         ${rfq.responses.map(r => `
//           <div class="card" style="flex:1;min-width:240px;border-color:${r.price === bestPrice ? 'var(--success)' : 'var(--border)'}">
//             <div class="card-header" style="justify-content:center;background:var(--surface-alt)">
//               <div style="font-weight:600;font-size:16px">${r.vendor}</div>
//             </div>
//             <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
//               <div>
//                 <div class="text-muted" style="font-size:11px;text-transform:uppercase">Price</div>
//                 <div style="font-size:24px;font-weight:600;color:${r.price === bestPrice ? 'var(--success)' : 'var(--text)'}">₹${r.price}</div>
//               </div>
//               <div style="display:flex;gap:16px">
//                 <div><div class="text-muted" style="font-size:11px;text-transform:uppercase">Delivery</div><div style="font-weight:600;color:${r.delivery === bestDel ? 'var(--success)' : 'var(--text)'}">${r.delivery} days</div></div>
//                 <div><div class="text-muted" style="font-size:11px;text-transform:uppercase">Terms</div><div style="font-weight:600">${r.payTerms}</div></div>
//               </div>
//               <div><div class="text-muted" style="font-size:11px;text-transform:uppercase">Rating</div><div style="font-weight:600">${r.rating} ★</div></div>
//               <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:auto">
//                 <div class="text-muted" style="font-size:11px;text-transform:uppercase">Total Value</div>
//                 <div style="font-size:18px;font-weight:600">${fmtCurrencyINR(r.price * rfq.qty)}</div>
//               </div>
//               ${rfq.status !== 'Awarded' ? `<button class="btn btn-primary" style="width:100%;margin-top:8px" data-award="${rfq.id}|${r.vendorId}">Award PO</button>` : ''}
//             </div>
//           </div>
//         `).join('')}
//       </div>
//     </div>`;
// }

// function bindRFQHandlers() {
//   document.querySelectorAll('[data-award]').forEach(b => {
//     b.addEventListener('click', async () => {
//       const [rfqId, vendorId] = b.dataset.award.split('|');
//       const ok = await confirmDialog({ title: 'Award this vendor?', message: 'A Purchase Order will be created in Pending state.' });
//       if (!ok) return;
//       const po = createPOFromRFQ(rfqId, vendorId);
//       logContract({ method: 'POST', path: '/api/purchase-orders', body: { rfqId, vendorId }, response: po, role: window.__session.role });
//       toast('PO created', `${po.id} for ${po.vendor}`, 'success');
//       navigate('purchasing/po');
//     });
//   });
// }

// /* ============ PURCHASE ORDERS ============ */
// function renderPOs() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Purchase Orders</div>
//         <div class="page-subtitle">Approval → send → receive</div>
//       </div>
//       <div class="page-actions">
//         <button class="btn btn-primary" id="btn-new-po" data-perm="create.po">${icon('plus', 16)} New PO</button>
//       </div>
//     </div>
//     <div class="card"><div class="card-body">${renderPOTable()}</div></div>`;
//   setTimeout(bindPOHandlers, 0);
//   return html;
// }

// function renderPOTable() {
//   return dataTable({
//     columns: [
//       { label: 'PO #', key: 'id', mono: true },
//       { label: 'Vendor', key: 'vendor' },
//       { label: 'Date', render: r => fmtDate(r.date) },
//       { label: 'Amount', align: 'right', num: true, render: r => fmtCurrencyINR(r.amount) },
//       { label: 'Expected', render: r => fmtDate(r.expected) },
//       { label: 'Status', render: r => {
//           const m = { Approved: 'success', Sent: 'info', Draft: 'neutral', Pending: 'warning', Received: 'success' };
//           return chip(m[r.status] || 'neutral', r.status);
//       }},
//       { label: 'Actions', render: r => `
//           ${r.status === 'Pending' || r.status === 'Draft' ? `<button class="btn btn-primary btn-sm" data-approve-po="${r.id}" data-perm="approve.po">Approve</button>` : ''}
//           ${r.status === 'Approved' ? `<button class="btn btn-primary btn-sm" data-create-grn="${r.id}" data-perm="create.grn">Receive (GRN)</button>` : ''}
//       `},
//     ],
//     rows: db.purchaseOrders,
//   });
// }

// function bindPOHandlers() {
//   document.getElementById('btn-new-po')?.addEventListener('click', () => {
//     formModal({
//       title: 'New Purchase Order',
//       fields: [
//         { name: 'vendorId', label: 'Vendor', type: 'select', required: true,
//           options: db.vendors.map(v => ({ value: v.id, label: `${v.id} — ${v.name}` })) },
//         { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
//         { name: 'expected', label: 'Expected delivery', type: 'date', required: true },
//         { name: 'items', label: 'Line items', type: 'number', required: true, placeholder: 'e.g. 3' },
//       ],
//       submitLabel: 'Create PO',
//       onSubmit: (data) => {
//         const vendor = db.vendors.find(v => v.id === data.vendorId);
//         const po = {
//           id: `PO-${1000 + db.purchaseOrders.length + 1}`,
//           vendorId: data.vendorId,
//           vendor: vendor.name,
//           date: new Date().toISOString().slice(0, 10),
//           amount: Number(data.amount),
//           expected: data.expected,
//           items: Number(data.items),
//           status: 'Pending',
//         };
//         db.purchaseOrders.unshift(po);
//         logContract({ method: 'POST', path: '/api/purchase-orders', body: data, response: po, role: window.__session.role });
//         toast('PO created', `${po.id} for ${vendor.name}`, 'success');
//         window.dispatchEvent(new HashChangeEvent('hashchange'));
//       }
//     });
//   });

// document.querySelectorAll('[data-approve-po]').forEach(b => {
//   b.addEventListener('click', async () => {
//     const id = b.dataset.approvePo;
//     const po = db.purchaseOrders.find(p => p.id === id);
//     await gateApproval({
//       action: `PO ${id} (${po.vendor})`,
//       amount: po.amount,
//       onConfirm: () => {
//         approvePO(id);
//         logContract({ method: 'PATCH', path: `/api/purchase-orders/${id}/approve`, role: window.__session.role });
//         toast('PO approved', `${id} approved`, 'success');
//         window.dispatchEvent(new HashChangeEvent('hashchange'));
//       }
//     });
//   });
// });


//   document.querySelectorAll('[data-create-grn]').forEach(b => {
//     b.addEventListener('click', () => {
//       const id = b.dataset.createGrn;
//       formModal({
//         title: `Receive goods against ${id}`,
//         fields: [
//           { name: 'qty', label: 'Quantity received', type: 'number', required: true, value: '500' },
//           { name: 'bin', label: 'Bin location', type: 'text', required: true, value: 'A-12-B-01' },
//         ],
//         submitLabel: 'Create GRN',
//         onSubmit: (data) => {
//           const grn = createGRN(id, data);
//           logContract({ method: 'POST', path: '/api/goods-receipts', body: { poId: id, ...data }, response: grn, role: window.__session.role });
//           toast('GRN created', `${grn.id} · stock updated`, 'success');
//           navigate('purchasing/grn');
//         }
//       });
//     });
//   });
// }

// /* ============ GOODS RECEIPT ============ */
// function renderGRN() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Goods Receipt (GRN)</div>
//         <div class="page-subtitle">Physical receipt · QC · put-away</div>
//       </div>
//     </div>
//     <div class="card"><div class="card-body">${dataTable({
//       columns: [
//         { label: 'GRN #', key: 'id', mono: true },
//         { label: 'PO #', key: 'poId', mono: true },
//         { label: 'Vendor', key: 'vendor' },
//         { label: 'Date', render: r => fmtDate(r.date) },
//         { label: 'Qty', key: 'qty', align: 'right', num: true },
//         { label: 'Bin', key: 'bin', mono: true },
//         { label: 'QC', render: r => {
//             const m = { Passed: 'success', Pending: 'warning', Rejected: 'critical' };
//             return chip(m[r.qc] || 'neutral', r.qc);
//         }},
//         { label: 'Status', render: r => `<span class="chip chip-neutral">${r.status}</span>` },
//         { label: 'Actions', render: r => `
//             ${r.qc === 'Pending' ? `<button class="btn btn-primary btn-sm" data-qc="${r.id}" data-perm="approve.qc">Pass QC</button>` : ''}
//         `},
//       ],
//       rows: db.goodsReceipts,
//     })}</div></div>`;
//   setTimeout(() => {
//     document.querySelectorAll('[data-qc]').forEach(b => {
//       b.addEventListener('click', () => {
//         const grn = passQC(b.dataset.qc);
//         logContract({ method: 'PATCH', path: `/api/goods-receipts/${grn.id}/qc-pass`, role: window.__session.role });
//         toast('QC passed', `${grn.id} ready for put-away`, 'success');
//         window.dispatchEvent(new HashChangeEvent('hashchange'));
//       });
//     });
//   }, 0);
//   return html;
// }

// /* ============ VENDOR INVOICES ============ */
// function renderVI() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Vendor Invoices</div>
//         <div class="page-subtitle">Capture · match · approve → posts to GL</div>
//       </div>
//       <div class="page-actions">
//         <button class="btn btn-primary" id="btn-new-vi" data-perm="create.vendor_invoice">${icon('plus', 16)} Record Invoice</button>
//       </div>
//     </div>
//     <div class="card"><div class="card-body">${dataTable({
//       columns: [
//         { label: 'Invoice', key: 'id', mono: true },
//         { label: 'Vendor', key: 'vendor' },
//         { label: 'PO', key: 'po', mono: true },
//         { label: 'GRN', key: 'grn', mono: true },
//         { label: 'Amount', align: 'right', num: true, render: r => fmtCurrencyINR(r.amount) },
//         { label: 'Due', render: r => fmtDate(r.due) },
//         { label: 'Match', render: r => chip(r.match === '3-Way' ? 'success' : r.match === '2-Way' ? 'info' : 'critical', r.match) },
//         { label: 'Status', render: r => chip(r.status === 'Approved' ? 'success' : r.status === 'Paid' ? 'success' : r.status === 'Pending' ? 'warning' : 'critical', r.status) },
//         { label: 'Actions', render: r => r.status === 'Pending'
//             ? `<button class="btn btn-primary btn-sm" data-approve-vi="${r.id}" data-perm="approve.vendor_invoice">Approve & Post</button>`
//             : '' },
//       ],
//       rows: db.vendorInvoices,
//     })}</div></div>`;
//   setTimeout(() => {
//     document.getElementById('btn-new-vi')?.addEventListener('click', () => {
//       formModal({
//         title: 'Record Vendor Invoice',
//         fields: [
//           { name: 'vendorId', label: 'Vendor', type: 'select', required: true,
//             options: db.vendors.map(v => ({ value: v.id, label: `${v.id} — ${v.name}` })) },
//           { name: 'po', label: 'Against PO', type: 'select', required: true,
//             options: db.purchaseOrders.map(p => ({ value: p.id, label: p.id })) },
//           { name: 'grn', label: 'Against GRN', type: 'select',
//             options: db.goodsReceipts.map(g => ({ value: g.id, label: g.id })) },
//           { name: 'amount', label: 'Invoice amount (₹)', type: 'number', required: true },
//           { name: 'due', label: 'Due date', type: 'date', required: true },
//         ],
//         submitLabel: 'Record',
//         onSubmit: (data) => {
//           const vi = createVendorInvoice(data);
//           logContract({ method: 'POST', path: '/api/vendor-invoices', body: data, response: vi, role: window.__session.role });
//           toast('Invoice recorded', `${vi.id} · pending approval`, 'success');
//           window.dispatchEvent(new HashChangeEvent('hashchange'));
//         }
//       });
//     });

//     document.querySelectorAll('[data-approve-vi]').forEach(b => {
//       b.addEventListener('click', async () => {
//         const id = b.dataset.approveVi;
//         const vi = db.vendorInvoices.find(v => v.id === id);
//         const ok = await confirmDialog({ title: `Approve ${id}?`, message: `${vi.vendor} · ${fmtCurrencyINR(vi.amount)}. Will post to GL as journal entry.` });
//         if (!ok) return;
//         const v = approveVendorInvoice(id);
//         logContract({ method: 'POST', path: `/api/vendor-invoices/${id}/approve`, response: v, role: window.__session.role });
//         toast('Invoice approved', `${id} → GL journal posted`, 'success');
//         window.dispatchEvent(new HashChangeEvent('hashchange'));
//       });
//     });
//   }, 0);
//   return html;
// }

// /* ============ 3-WAY MATCH ============ */
// function renderMatch() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">3-Way Match</div>
//         <div class="page-subtitle">PO ↔ GRN ↔ Invoice verification</div>
//       </div>
//       <div class="page-actions">
//         <button class="btn btn-primary" id="btn-run-match">${icon('check-circle', 16)} Run Match</button>
//       </div>
//     </div>
//     ${stepper(['PO Created', 'GRN Received', 'Invoice Captured', 'Match & Approve', 'Payment'], 3)}
//     <div class="card" style="margin-bottom:16px">
//       <div class="card-header"><div class="card-title">Match Summary</div></div>
//       <div class="card-body" id="match-result">
//         <div class="empty"><div class="empty-title">Click Run Match to verify against sample documents</div></div>
//       </div>
//     </div>
//     <div class="grid grid-3">
//       <div class="card">
//         <div class="card-header"><div class="card-title">PO — PO-2011</div></div>
//         <div class="card-body">
//           <div class="text-muted" style="font-size:12px;margin-bottom:8px">Vendor A · ₹4,80,000</div>
//           <table class="data-table"><thead><tr><th>Item</th><th class="text-right">Qty</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr></thead>
//             <tbody><tr><td>IT-100 Steel Plate</td><td class="text-right num">500</td><td class="text-right num">₹100</td><td class="text-right num">₹50,000</td></tr>
//             <tr><td>IT-205 Aluminium</td><td class="text-right num">100</td><td class="text-right num">₹220</td><td class="text-right num">₹22,000</td></tr></tbody>
//           </table>
//         </div>
//       </div>
//       <div class="card">
//         <div class="card-header"><div class="card-title">GRN — GRN-2011</div></div>
//         <div class="card-body">
//           <div class="text-muted" style="font-size:12px;margin-bottom:8px">Received 24 Aug 2026 · 500 KG</div>
//           <table class="data-table"><thead><tr><th>Item</th><th class="text-right">Recd</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr></thead>
//             <tbody><tr><td>IT-100</td><td class="text-right num">500</td><td class="text-right num">₹100</td><td class="text-right num">₹50,000</td></tr>
//             <tr><td>IT-205</td><td class="text-right num">100</td><td class="text-right num">₹220</td><td class="text-right num">₹22,000</td></tr></tbody>
//           </table>
//         </div>
//       </div>
//       <div class="card">
//         <div class="card-header"><div class="card-title">Invoice — VI-3001</div></div>
//         <div class="card-body">
//           <div class="text-muted" style="font-size:12px;margin-bottom:8px">Vendor A · ₹4,80,000</div>
//           <table class="data-table"><thead><tr><th>Item</th><th class="text-right">Qty</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr></thead>
//             <tbody><tr><td>IT-100</td><td class="text-right num">500</td><td class="text-right num" style="color:var(--critical);font-weight:600">₹102.9</td><td class="text-right num">₹51,450</td></tr>
//             <tr><td>IT-205</td><td class="text-right num">100</td><td class="text-right num">₹220</td><td class="text-right num">₹22,000</td></tr></tbody>
//           </table>
//         </div>
//       </div>
//     </div>`;

//   setTimeout(() => {
//     document.getElementById('btn-run-match').onclick = () => {
//       const result = threeWayMatch('PO-2011', 'GRN-2011', 'VI-3001');
//       const variance = result.variance;
//       const level = result.status === 'Matched' ? 'success' : 'critical';
//       document.getElementById('match-result').innerHTML = `
//         <div style="display:flex;align-items:center;gap:16px">
//           <div style="width:48px;height:48px;border-radius:50%;background:var(--${level}-bg);color:var(--${level});display:grid;place-items:center;font-size:22px">${result.status === 'Matched' ? '✓' : '!'}</div>
//           <div style="flex:1">
//             <div style="font-weight:600;font-size:16px">Match ${result.status} — Variance ${variance > 0 ? '+' : ''}${fmtCurrencyINR(variance)}</div>
//             <div class="text-muted" style="font-size:13px">Tolerance threshold: 2% of PO value</div>
//           </div>
//           <div style="display:flex;gap:8px">
//             <button class="btn btn-secondary" data-act="hold">Hold</button>
//             <button class="btn btn-primary" data-act="approve" data-perm="approve.vendor_invoice">Approve Override</button>
//           </div>
//         </div>`;
//       logContract({ method: 'POST', path: '/api/match/three-way', body: { poId: 'PO-2011', grnId: 'GRN-2011', invoiceId: 'VI-3001' }, response: result, role: window.__session.role });

//       document.querySelector('[data-act="hold"]').onclick = () => toast('Held', 'Invoice moved to exceptions', 'warning');
//       document.querySelector('[data-act="approve"]').onclick = async () => {
//         const ok = await confirmDialog({ title: 'Approve with override?', message: 'This variance will be logged against your user ID.', confirmText: 'Approve & log', variant: 'danger' });
//         if (ok) {
//           logContract({ method: 'POST', path: '/api/match/three-way/override', body: { invoiceId: 'VI-3001', reason: 'price variance approved' }, role: window.__session.role });
//           toast('Override approved', 'Invoice cleared, GL will post', 'success');
//         }
//       };
//     };
//   }, 0);

//   return html;
// }


/* ============================================================
   MODULE 3: PURCHASING & PAYABLES (Enterprise Suite)
   Scope Alignment: §5.3, §6.1 Procure-to-Pay, Priority Screens 15, 16, 17, 18
   ============================================================ */

import { dataTable, chip, icon, toast, formModal, confirmDialog, kpiCard, stepper } from '../components.js';
import {
  db, createPR, approvePR, createRFQFromPR, createPOFromRFQ,
  approvePO, createGRN, passQC, threeWayMatch, session
} from '../state.js';
import { canApprovePO, gateApproval } from './approvals.js';
import { logContract } from '../api-contract.js';
import { fmtCurrency, fmtDate, fmtNumber } from '../format.js';

export function register(route) {
  route('purchasing/dashboard', renderPurchaseDashboard);
  route('purchasing/prs',       renderPRs);
  route('purchasing/rfq',       renderRFQ);
  route('purchasing/po',        renderPOs);
  route('purchasing/grn',       renderGRN);
  route('purchasing/vendors',   renderVendors);
}

/* ============================================================
   1. PURCHASE DASHBOARD (§5.3, Screen #15)
   ============================================================ */
function renderPurchaseDashboard() {
  const totalPOValue = db.purchaseOrders.reduce((s, p) => s + p.amount, 0);
  const pendingApprovals = db.purchaseOrders.filter(p => p.status === 'Pending').length +
                           db.purchaseRequisitions.filter(pr => pr.status === 'Pending').length;
  const criticalShortages = db.items.filter(i => i.stock < i.safety).length;
  const activeVendors = db.vendors.length;

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Procurement & Spend Dashboard</div>
        <div class="page-subtitle">Procure-to-Pay (P2P) Pipeline · Supplier Performance · Approval Queues</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="window.__navigate('purchasing/rfq')">${icon('layers', 16)} Open RFQs</button>
        <button class="btn btn-primary" onclick="window.__navigate('purchasing/prs')">${icon('plus', 16)} Create Requisition</button>
      </div>
    </div>

    <div class="grid grid-kpi">
      ${kpiCard({ label: 'Total Committed Spend (YTD)', value: totalPOValue, delta: 6.2, icon: 'dollar-sign' })}
      <div class="kpi">
        <div class="kpi-header"><span class="kpi-label">Pending Approval Requests</span><span class="kpi-icon">${icon('clock', 16)}</span></div>
        <div class="kpi-value" style="color:${pendingApprovals > 0 ? 'var(--warning)' : 'var(--text)'}">${pendingApprovals} Orders</div>
        <div class="kpi-delta down">${icon('alert-triangle', 12)} PR & PO authorization queue</div>
      </div>
      <div class="kpi">
        <div class="kpi-header"><span class="kpi-label">Inventory Shortage Alerts</span><span class="kpi-icon">${icon('alert-circle', 16)}</span></div>
        <div class="kpi-value" style="color:${criticalShortages > 0 ? 'var(--critical)' : 'var(--success)'}">${criticalShortages} Materials</div>
        <div class="kpi-delta down">${icon('alert-circle', 12)} Below configured safety stock</div>
      </div>
      <div class="kpi">
        <div class="kpi-header"><span class="kpi-label">Qualified Tier-1 Vendors</span><span class="kpi-icon">${icon('briefcase', 16)}</span></div>
        <div class="kpi-value">${activeVendors} Active</div>
        <div class="kpi-delta up">${icon('check-circle', 12)} 100% compliance certified</div>
      </div>
    </div>

    <div class="grid grid-charts" style="margin-top:24px">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Procurement Spend by Vendor Category</div>
          <div class="card-subtitle">Raw Materials vs Components vs Packaging</div>
        </div>
        <div class="card-body" style="height:280px"><canvas id="purchSpendChart"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">Supplier Quality & Delivery Rating</div>
          <div class="card-subtitle">On-Time In-Full (OTIF) Performance</div>
        </div>
        <div class="card-body">
          ${db.vendors.map(v => `
            <div style="margin-bottom:14px">
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
                <b>${v.name} (${v.category})</b>
                <span><b>${v.rating} ★</b> · Net ${v.terms}</span>
              </div>
              <div class="progress" style="height:8px">
                <div class="progress-bar ${v.rating >= 4.5 ? 'success' : v.rating >= 4.0 ? '' : 'warning'}" style="width:${(v.rating / 5) * 100}%"></div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

document.addEventListener('route-rendered', (e) => {
  if (e.detail.path !== 'purchasing/dashboard') return;
  const canvas = document.getElementById('purchSpendChart');
  if (!canvas || !window.Chart) return;
  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Raw Materials', 'Precision Components', 'Packaging & Consumables'],
      datasets: [{
        data: [14700000, 9800000, 3100000],
        backgroundColor: ['#4F46E5', '#06B6D4', '#10B981'],
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: { legend: { position: 'bottom' } }
    }
  });
});

/* ============================================================
   2. PURCHASE REQUISITIONS (PR) (§5.3)
   ============================================================ */
function renderPRs() {
  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">Purchase Requisitions (PR)</div>
        <div class="page-subtitle">Department Need → Internal Approval → Sourcing RFQ</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" id="btn-new-pr" data-perm="create.pr">${icon('plus', 16)} New Requisition</button>
      </div>
    </div>

    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'PR #', key: 'id', mono: true },
        { label: 'Requesting Dept', key: 'dept' },
        { label: 'Item Code', key: 'itemCode', mono: true },
        { label: 'Material Description', key: 'item' },
        { label: 'Required Qty', align: 'right', num: true, render: r => `${fmtNumber(r.qty)} units` },
        { label: 'Est. Amount', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.amount)}</b>` },
        { label: 'Requested By', key: 'requestedBy' },
        { label: 'Status', render: r => chip(r.status === 'Approved' ? 'success' : r.status === 'Converted to RFQ' ? 'info' : 'warning', r.status) },
        { label: 'Actions', render: r => `
          ${r.status === 'Pending' ? `<button class="btn btn-primary btn-sm" data-approve-pr="${r.id}" data-perm="approve.pr">Approve</button>` : ''}
          ${r.status === 'Approved' ? `<button class="btn btn-success btn-sm" data-create-rfq="${r.id}" data-perm="create.rfq">Create RFQ</button>` : ''}
        `},
      ],
      rows: db.purchaseRequisitions,
    })}</div></div>`;

  setTimeout(() => {
    document.getElementById('btn-new-pr')?.addEventListener('click', () => {
      formModal({
        title: 'Submit Purchase Requisition',
        fields: [
          { name: 'dept', label: 'Requesting Department', type: 'select', required: true, options: [
            { value: 'Production', label: 'Production / Manufacturing' },
            { value: 'Maintenance', label: 'Plant Maintenance' },
            { value: 'Logistics', label: 'Warehouse & Logistics' },
            { value: 'R&D', label: 'Research & Development' },
          ]},
          { name: 'itemCode', label: 'Material Item', type: 'select', required: true, options: db.items.map(i => ({ value: i.code, label: `${i.code} — ${i.name} (Stock: ${i.stock})` })) },
          { name: 'qty', label: 'Required Quantity', type: 'number', required: true, placeholder: '500' },
        ],
        submitLabel: 'Submit Requisition',
        onSubmit: (data) => {
          const pr = createPR(data);
          logContract({ method: 'POST', path: '/api/purchase-requisitions', body: data, response: pr, role: session.role });
          toast('Requisition Submitted', `${pr.id} routed to Purchase Manager`, 'success');
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      });
    });

    document.querySelectorAll('[data-approve-pr]').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.dataset.approvePr;
        const pr = db.purchaseRequisitions.find(p => p.id === id);
        const ok = await confirmDialog({
          title: `Approve Requisition ${id}?`,
          message: `Authorize procurement of ${pr.item} (${pr.qty} units). Estimated value: ${fmtCurrency(pr.amount)}.`,
          confirmText: 'Approve'
        });
        if (!ok) return;
        approvePR(id);
        logContract({ method: 'PATCH', path: `/api/purchase-requisitions/${id}/approve`, role: session.role });
        toast('PR Approved', `${id} authorized for RFQ bidding`, 'success');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });

    document.querySelectorAll('[data-create-rfq]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.createRfq;
        const rfq = createRFQFromPR(id);
        logContract({ method: 'POST', path: '/api/rfqs', body: { prId: id }, response: rfq, role: session.role });
        toast('RFQ Initialized', `${rfq.id} generated with 3 competitive quotes`, 'success');
        window.__navigate('purchasing/rfq');
      });
    });
  }, 0);

  return html;
}

/* ============================================================
   3. SIDE-BY-SIDE RFQ COMPARISON MATRIX (§5.3, Screen #17)
   ============================================================ */
function renderRFQ() {
  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">RFQ Sourcing & Vendor Comparison Matrix</div>
        <div class="page-subtitle">Multi-Supplier Bid Analysis · Side-by-Side Pricing, Lead Time & Ratings (§5.3)</div>
      </div>
    </div>

    ${db.rfqs.length === 0 ? `
      <div class="card"><div class="card-body"><div class="empty">
        <div class="empty-title">No Open RFQs</div>
        <div class="empty-desc">Approved Purchase Requisitions can be converted to competitive RFQs.</div>
      </div></div></div>` : ''}

    ${db.rfqs.map(rfq => {
      const minPrice = Math.min(...rfq.responses.map(r => r.price));
      const minDelivery = Math.min(...rfq.responses.map(r => r.delivery));

      return `
        <div class="card" style="margin-bottom:24px">
          <div class="card-header" style="background:var(--surface-alt);border-bottom:1px solid var(--border)">
            <div>
              <span class="card-title">${rfq.id} · Competitive Sourcing Matrix for: <b>${rfq.item}</b></span>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Sourced Qty: <b>${fmtNumber(rfq.qty)} units</b> · Issued: ${fmtDate(rfq.created)}</div>
            </div>
            ${chip(rfq.status === 'Awarded' ? 'success' : 'info', rfq.status)}
          </div>

          <!-- Side-by-Side Supplier Bid Cards (§5.3) -->
          <div class="card-body" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;padding:20px">
            ${rfq.responses.map(r => {
              const isBestPrice = r.price === minPrice;
              const isBestDel = r.delivery === minDelivery;
              const totalVal = r.price * rfq.qty;

              return `
                <div class="card" style="border:2px solid ${isBestPrice ? 'var(--success)' : 'var(--border)'};border-radius:10px;overflow:hidden">
                  <div style="padding:14px;background:var(--surface-alt);display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border)">
                    <b style="font-size:15px">${r.vendor}</b>
                    <span class="chip chip-${r.rating >= 4.5 ? 'success' : 'neutral'}">${r.rating} ★</span>
                  </div>
                  <div style="padding:16px;display:flex;flex-direction:column;gap:12px">
                    <div>
                      <div class="text-muted" style="font-size:11px;text-transform:uppercase">Offered Unit Price</div>
                      <div style="font-size:24px;font-weight:700;color:${isBestPrice ? 'var(--success)' : 'var(--text)'}">
                        ${fmtCurrency(r.price)} ${isBestPrice ? '<span style="font-size:11px;font-weight:600;color:var(--success)">(Lowest Bid)</span>' : ''}
                      </div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:12px">
                      <div>
                        <div class="text-muted">Lead Time</div>
                        <div style="font-weight:700;color:${isBestDel ? 'var(--success)' : 'var(--text)'}">${r.delivery} Days ${isBestDel ? '⚡' : ''}</div>
                      </div>
                      <div>
                        <div class="text-muted">Payment Terms</div>
                        <div style="font-weight:700">${r.payTerms}</div>
                      </div>
                    </div>
                    <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:4px">
                      <div class="text-muted" style="font-size:11px;text-transform:uppercase">Total Order Value</div>
                      <div style="font-size:18px;font-weight:700;color:var(--brand-primary)">${fmtCurrency(totalVal)}</div>
                    </div>
                    ${rfq.status !== 'Awarded' ? `
                      <button class="btn btn-primary" style="width:100%;margin-top:8px" data-award-po="${rfq.id}|${r.vendorId}">
                        ${icon('check', 14)} Award Purchase Order
                      </button>` : '<div class="text-muted" style="text-align:center;font-size:12px;padding:8px">Bidding Closed</div>'}
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>`;
    }).join('')}`;

  setTimeout(() => {
    document.querySelectorAll('[data-award-po]').forEach(b => {
      b.addEventListener('click', async () => {
        const [rfqId, vendorId] = b.dataset.awardPo.split('|');
        const rfq = db.rfqs.find(r => r.id === rfqId);
        const resp = rfq.responses.find(r => r.vendorId === vendorId);
        const ok = await confirmDialog({
          title: `Award Contract to ${resp.vendor}?`,
          message: `This will lock in the unit price of ${fmtCurrency(resp.price)} and generate a legally binding Purchase Order for ${fmtCurrency(resp.price * rfq.qty)}.`,
          confirmText: 'Award & Create PO'
        });
        if (!ok) return;
        const po = createPOFromRFQ(rfqId, vendorId);
        logContract({ method: 'POST', path: '/api/purchase-orders', body: { rfqId, vendorId }, response: po, role: session.role });
        toast('Purchase Order Created', `${po.id} awarded to ${po.vendor}`, 'success');
        window.__navigate('purchasing/po');
      });
    });
  }, 0);

  return html;
}

/* ============================================================
   4. PURCHASE ORDERS (PO) & APPROVAL GATES (§5.3, Screen #18)
   ============================================================ */
function renderPOs() {
  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">Purchase Orders & Governance</div>
        <div class="page-subtitle">Multi-Tier Approvals · Commitment Tracking · Warehouse Receipts</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" id="btn-manual-po" data-perm="create.po">${icon('plus', 16)} Direct PO</button>
      </div>
    </div>

    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'PO #', key: 'id', mono: true },
        { label: 'Vendor Partner', key: 'vendor' },
        { label: 'Issued Date', render: r => fmtDate(r.date) },
        { label: 'Committed Total', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.amount)}</b>` },
        { label: 'Delivery Due', render: r => fmtDate(r.expected) },
        { label: 'Line Items', align: 'right', num: true, key: 'items' },
        { label: 'Authorization', render: r => chip(r.status === 'Approved' ? 'success' : r.status === 'Sent' ? 'info' : 'warning', r.status) },
        { label: 'Actions', render: r => `
          ${r.status === 'Pending' || r.status === 'Draft' ? `<button class="btn btn-primary btn-sm" data-gate-po="${r.id}" data-perm="approve.po">Approve</button>` : ''}
          ${r.status === 'Approved' ? `<button class="btn btn-success btn-sm" data-grn-po="${r.id}" data-perm="create.grn">Receive Goods</button>` : ''}
          <button class="btn btn-ghost btn-sm" data-flow-po="${r.id}">P2P Audit</button>
        `},
      ],
      rows: db.purchaseOrders,
    })}</div></div>`;

  setTimeout(() => {
    document.getElementById('btn-manual-po')?.addEventListener('click', () => {
      formModal({
        title: 'Issue Direct Purchase Order',
        fields: [
          { name: 'vendorId', label: 'Vendor', type: 'select', required: true, options: db.vendors.map(v => ({ value: v.id, label: `${v.id} — ${v.name}` })) },
          { name: 'amount', label: 'Total Purchase Amount', type: 'number', required: true, placeholder: '480000' },
          { name: 'expected', label: 'Expected Delivery Date', type: 'date', required: true, value: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) },
          { name: 'items', label: 'Total Item Count', type: 'number', required: true, value: '2' },
        ],
        submitLabel: 'Create Purchase Order',
        onSubmit: (data) => {
          const v = db.vendors.find(vnd => vnd.id === data.vendorId);
          const po = {
            id: `PO-${2010 + db.purchaseOrders.length + 1}`,
            vendorId: data.vendorId,
            vendor: v.name,
            date: new Date().toISOString().slice(0, 10),
            amount: Number(data.amount),
            expected: data.expected,
            items: Number(data.items),
            status: 'Pending',
          };
          db.purchaseOrders.unshift(po);
          logContract({ method: 'POST', path: '/api/purchase-orders', body: data, response: po, role: session.role });
          toast('Purchase Order Issued', `${po.id} submitted for approval`, 'success');
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      });
    });

    document.querySelectorAll('[data-gate-po]').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.dataset.gatePo;
        const po = db.purchaseOrders.find(p => p.id === id);
        await gateApproval({
          action: `Purchase Order ${id} (${po.vendor})`,
          amount: po.amount,
          onConfirm: () => {
            approvePO(id);
            logContract({ method: 'PATCH', path: `/api/purchase-orders/${id}/approve`, role: session.role });
            toast('PO Authorized', `${id} approved for dispatch`, 'success');
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          }
        });
      });
    });

    document.querySelectorAll('[data-grn-po]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.grnPo;
        formModal({
          title: `Receive Goods against ${id}`,
          fields: [
            { name: 'qty', label: 'Received Quantity Units', type: 'number', required: true, value: '500' },
            { name: 'bin', label: 'Warehouse Bin Destination', type: 'text', required: true, value: 'A-12-B-01' },
          ],
          submitLabel: 'Accept Inbound Shipment',
          onSubmit: (data) => {
            const grn = createGRN(id, data);
            logContract({ method: 'POST', path: '/api/goods-receipts', body: { poId: id, ...data }, response: grn, role: session.role });
            toast('GRN Created', `${grn.id} stored in ${data.bin} · Awaiting QC`, 'success');
            window.__navigate('purchasing/grn');
          }
        });
      });
    });

    document.querySelectorAll('[data-flow-po]').forEach(b => {
      b.addEventListener('click', () => {
        const po = db.purchaseOrders.find(p => p.id === b.dataset.flowPo);
        const modalRoot = document.getElementById('modal-root') || document.body;
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop open';
        backdrop.innerHTML = `
          <div class="modal" style="max-width:760px">
            <div class="modal-header">
              <div>
                <span class="modal-title">Procure-to-Pay (P2P) Lifecycle Audit — ${po.id}</span>
                <div style="font-size:12px;color:var(--text-muted)">Cross-Module Process Verification (§6.1)</div>
              </div>
              <button class="btn-ghost btn-icon" onclick="this.closest('.modal-backdrop').remove()">${icon('x', 16)}</button>
            </div>
            <div class="modal-body">
              ${stepper(
                ['Requisition (PR)', 'RFQ Bidding', 'Purchase Order', 'Goods Receipt (GRN)', 'QC Inspection', '3-Way Match', 'GL Payment'],
                po.status === 'Approved' ? 2 : 1
              )}
              <div style="margin-top:24px;padding:16px;background:var(--surface-alt);border-radius:8px;font-size:13px;line-height:1.8">
                <div style="display:flex;justify-content:space-between"><span>Vendor Partner:</span><b>${po.vendor}</b></div>
                <div style="display:flex;justify-content:space-between"><span>Committed Value:</span><b style="color:var(--brand-primary);font-size:16px">${fmtCurrency(po.amount)}</b></div>
                <div style="display:flex;justify-content:space-between"><span>Expected Warehouse Arrival:</span><span>${fmtDate(po.expected)}</span></div>
                <div style="display:flex;justify-content:space-between"><span>Approval State:</span>${chip(po.status === 'Approved' ? 'success' : 'warning', po.status)}</div>
              </div>
            </div>
          </div>`;
        modalRoot.appendChild(backdrop);
      });
    });
  }, 0);

  return html;
}

/* ============================================================
   5. GOODS RECEIPT (GRN) & QC INSPECTION (§5.3, §5.4)
   ============================================================ */
function renderGRN() {
  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">Goods Receipt Notes (GRN) & Inbound QC</div>
        <div class="page-subtitle">Warehouse Receiving · Put-away Verification · Quality Inspection Gates</div>
      </div>
    </div>

    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'GRN #', key: 'id', mono: true },
        { label: 'Source PO', key: 'poId', mono: true },
        { label: 'Vendor', key: 'vendor' },
        { label: 'Receipt Date', render: r => fmtDate(r.date) },
        { label: 'Qty Received', align: 'right', num: true, render: r => `${fmtNumber(r.qty)} units` },
        { label: 'Put-Away Bin', key: 'bin', mono: true },
        { label: 'QC Inspection', render: r => chip(r.qc === 'Passed' ? 'success' : 'warning', r.qc) },
        { label: 'Warehouse Status', render: r => chip('info', r.status) },
        { label: 'QC Gate', render: r => r.qc === 'Pending'
          ? `<button class="btn btn-primary btn-sm" data-pass-qc="${r.id}" data-perm="approve.qc">Pass QC</button>`
          : '<span class="text-muted" style="font-size:12px">Inspection Verified</span>' },
      ],
      rows: db.goodsReceipts,
    })}</div></div>`;

  setTimeout(() => {
    document.querySelectorAll('[data-pass-qc]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.passQc;
        const grn = passQC(id);
        logContract({ method: 'PATCH', path: `/api/goods-receipts/${grn.id}/qc-pass`, role: session.role });
        toast('QC Gate Cleared', `${grn.id} cleared for production consumption`, 'success');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });
  }, 0);

  return html;
}

/* ============================================================
   6. VENDOR MASTER & 360° SHORTCUT (§5.3, Screen #16)
   ============================================================ */
function renderVendors() {
  return `
    <div class="page-header">
      <div>
        <div class="page-title">Vendor Master & 360° Partner Directory</div>
        <div class="page-subtitle">SLA Contracts · Sourcing Performance · Compliance Ratings</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="window.__navigate('views/vendor-360')">${icon('briefcase', 16)} Open Vendor 360° Profile</button>
      </div>
    </div>

    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'Vendor Code', key: 'id', mono: true },
        { label: 'Vendor Legal Name', key: 'name' },
        { label: 'Category', key: 'category' },
        { label: 'Payment Terms', key: 'terms' },
        { label: 'Performance Rating', render: r => `<span class="chip chip-${r.rating >= 4.5 ? 'success' : 'info'}">${r.rating} ★</span>` },
        { label: 'Total Spend (YTD)', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.spend)}</b>` },
        { label: 'Outstanding Balance', align: 'right', num: true, render: r => fmtCurrency(r.outstanding) },
        { label: 'Profile', render: r => `<button class="btn btn-secondary btn-sm" onclick="window.__navigate('views/vendor-360')">View 360°</button>` },
      ],
      rows: db.vendors,
    })}</div></div>`;
}