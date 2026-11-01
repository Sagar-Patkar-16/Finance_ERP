// import { dataTable, chip, icon, toast, formModal, confirmDialog } from '../components.js';
// import { db, createJournal, approveVendorInvoice, recordPayment, capitalizeAsset, fileTaxReturn, session } from '../state.js';
// import { logContract } from '../api-contract.js';
// import { fmtCurrencyINR, fmtDate } from '../format.js';

// export function register(route) {
//   route('finance/gl',         renderGL);
//   route('finance/ap',         renderAP);
//   route('finance/ar',         renderAR);
//   route('finance/bank-recon', renderBankRecon);
//   route('finance/assets',     renderAssets);
//   route('finance/cash-flow',  renderCashFlow);
//   route('finance/tax',        renderTax);
// }

// /* ============ GENERAL LEDGER ============ */
// function renderGL() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">General Ledger</div>
//         <div class="page-subtitle">Journal entries · Chart of Accounts</div>
//       </div>
//       <div class="page-actions">
//         <button class="btn btn-secondary" id="btn-coa">${icon('layers', 16)} Chart of Accounts</button>
//         <button class="btn btn-primary" id="btn-new-je" data-perm="create.journal">${icon('plus', 16)} New Journal Entry</button>
//       </div>
//     </div>
//     <div class="card"><div class="card-body">${dataTable({
//       columns: [
//         { label: 'JE #', key: 'id', mono: true },
//         { label: 'Date', render: r => fmtDate(r.date) },
//         { label: 'Ref', key: 'ref', mono: true },
//         { label: 'Narrative', key: 'narrative' },
//         { label: 'Account', key: 'account', mono: true },
//         { label: 'Debit', align: 'right', num: true, render: r => r.debit ? fmtCurrencyINR(r.debit) : '—' },
//         { label: 'Credit', align: 'right', num: true, render: r => r.credit ? fmtCurrencyINR(r.credit) : '—' },
//         { label: 'Status', render: r => chip('success', r.status) },
//       ],
//       rows: db.journals,
//     })}</div></div>`;
//   setTimeout(() => {
//     document.getElementById('btn-coa')?.addEventListener('click', () => {
//       const modalRoot = document.getElementById('modal-root') || document.body;
//       const backdrop = document.createElement('div');
//       backdrop.className = 'modal-backdrop open';
//       backdrop.innerHTML = `
//         <div class="modal" style="max-width:600px">
//           <div class="modal-header">
//             <span class="modal-title">Chart of Accounts</span>
//             <button class="btn-ghost btn-icon" onclick="this.closest('.modal-backdrop').remove()">${icon('x', 16)}</button>
//           </div>
//           <div class="modal-body">${dataTable({
//             columns: [
//               { label: 'Code', key: 'code', mono: true },
//               { label: 'Account Name', key: 'name' },
//               { label: 'Type', key: 'type' },
//             ],
//             rows: db.chartOfAccounts,
//           })}</div>
//         </div>`;
//       modalRoot.appendChild(backdrop);
//     });
//     document.getElementById('btn-new-je')?.addEventListener('click', () => {
//       formModal({
//         title: 'New Journal Entry',
//         fields: [
//           { name: 'date', label: 'Date', type: 'date', required: true, value: new Date().toISOString().slice(0,10) },
//           { name: 'ref', label: 'Reference', type: 'text', required: true },
//           { name: 'narrative', label: 'Narrative', type: 'text', required: true },
//           { name: 'account', label: 'Account', type: 'select', required: true, options: [
//             { value: '1000 · Cash', label: '1000 · Cash' },
//             { value: '1100 · Receivables', label: '1100 · Receivables' },
//             { value: '2000 · Payables', label: '2000 · Payables' },
//             { value: '4000 · Revenue', label: '4000 · Revenue' },
//           ]},
//           { name: 'debit', label: 'Debit (₹)', type: 'number', value: '0' },
//           { name: 'credit', label: 'Credit (₹)', type: 'number', value: '0' },
//         ],
//         submitLabel: 'Post Journal',
//         onSubmit: (data) => {
//           const je = createJournal(data);
//           logContract({ method: 'POST', path: '/api/journals', body: data, response: je, role: window.__session.role });
//           toast('Journal posted', `${je.id}`, 'success');
//           window.dispatchEvent(new HashChangeEvent('hashchange'));
//         }
//       });
//     });
//   }, 0);
//   return html;
// }

// /* ============ ACCOUNTS PAYABLE ============ */
// function renderAP() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Accounts Payable</div>
//         <div class="page-subtitle">Vendor invoices · 3-way match status · payment</div>
//       </div>
//       <div class="page-actions">
//         <button class="btn btn-secondary" id="btn-export-ap">Export</button>
//       </div>
//     </div>
//     <div class="card"><div class="card-body">${dataTable({
//       columns: [
//         { label: 'Invoice', key: 'id', mono: true },
//         { label: 'Vendor', key: 'vendor' },
//         { label: 'Amount', align: 'right', num: true, render: r => fmtCurrencyINR(r.amount) },
//         { label: 'Due', render: r => fmtDate(r.due) },
//         { label: 'Match', key: 'match' },
//         { label: 'Status', render: r => chip(r.status === 'Approved' ? 'success' : r.status === 'Paid' ? 'success' : 'warning', r.status) },
//         { label: 'Actions', render: r => `
//             ${r.status === 'Pending' ? `<button class="btn btn-primary btn-sm" data-approve="${r.id}" data-perm="approve.vendor_invoice">Approve</button>` : ''}
//             ${r.status === 'Approved' ? `<button class="btn btn-success btn-sm" data-pay="${r.id}" data-perm="create.payment">Pay</button>` : ''}
//         ` },
//       ],
//       rows: db.vendorInvoices,
//     })}</div></div>`;
//   setTimeout(() => {
//     document.querySelectorAll('[data-approve]').forEach(b => {
//       b.addEventListener('click', async () => {
//         const id = b.dataset.approve;
//         const vi = db.vendorInvoices.find(v => v.id === id);
//         const ok = await confirmDialog({ title: `Approve ${id}?`, message: `${fmtCurrencyINR(vi.amount)} → will post to GL` });
//         if (!ok) return;
//         approveVendorInvoice(id);
//         logContract({ method: 'PATCH', path: `/api/vendor-invoices/${id}/approve`, role: window.__session.role });
//         toast('Invoice approved', `${id} → GL`, 'success');
//         window.dispatchEvent(new HashChangeEvent('hashchange'));
//       });
//     });
//     document.querySelectorAll('[data-pay]').forEach(b => {
//       b.addEventListener('click', () => {
//         const id = b.dataset.pay;
//         formModal({
//           title: `Record Payment — ${id}`,
//           fields: [
//             { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
//             { name: 'mode', label: 'Mode', type: 'select', required: true, options: [
//               { value: 'NEFT', label: 'NEFT' },
//               { value: 'RTGS', label: 'RTGS' },
//               { value: 'Cheque', label: 'Cheque' },
//             ]},
//           ],
//           submitLabel: 'Record Payment',
//           onSubmit: (data) => {
//             const pmt = recordPayment({ type: 'vendor', refId: id, ...data });
//             logContract({ method: 'POST', path: '/api/payments', body: { type: 'vendor', refId: id, ...data }, response: pmt, role: window.__session.role });
//             toast('Payment recorded', `${fmtCurrencyINR(data.amount)} to ${id}`, 'success');
//             window.dispatchEvent(new HashChangeEvent('hashchange'));
//           }
//         });
//       });
//     });
//     document.getElementById('btn-export-ap')?.addEventListener('click', () => toast('Export queued', 'AP register will be emailed', 'info'));
//   }, 0);
//   return html;
// }

// /* ============ ACCOUNTS RECEIVABLE ============ */
// function renderAR() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Accounts Receivable</div>
//         <div class="page-subtitle">Customer invoices · ageing · collections</div>
//       </div>
//     </div>
//     <div class="grid grid-kpi">
//       <div class="kpi"><div class="kpi-header"><span class="kpi-label">Total Receivable</span></div><div class="kpi-value">₹1.80 Cr</div></div>
//       <div class="kpi"><div class="kpi-header"><span class="kpi-label">Overdue</span></div><div class="kpi-value" style="color:var(--critical)">₹12.4 L</div></div>
//       <div class="kpi"><div class="kpi-header"><span class="kpi-label">Avg Collection</span></div><div class="kpi-value">34 days</div></div>
//     </div>
//     <div class="card" style="margin-top:20px"><div class="card-body">${dataTable({
//       columns: [
//         { label: 'Invoice', key: 'id', mono: true },
//         { label: 'Customer', key: 'customer' },
//         { label: 'Amount', align: 'right', num: true, render: r => fmtCurrencyINR(r.amount) },
//         { label: 'Due', render: r => fmtDate(r.due) },
//         { label: 'Status', render: r => chip(r.status === 'Paid' ? 'success' : r.status === 'Overdue' ? 'critical' : 'warning', r.status) },
//         { label: 'Actions', render: r => r.status !== 'Paid'
//             ? `<button class="btn btn-success btn-sm" data-receipt="${r.id}" data-perm="create.payment">Record Receipt</button>` : '' },
//       ],
//       rows: db.customerInvoices,
//     })}</div></div>`;
//   setTimeout(() => {
//     document.querySelectorAll('[data-receipt]').forEach(b => {
//       b.addEventListener('click', () => {
//         const id = b.dataset.receipt;
//         const inv = db.customerInvoices.find(i => i.id === id);
//         formModal({
//           title: `Record Receipt — ${id}`,
//           fields: [
//             { name: 'amount', label: 'Amount received (₹)', type: 'number', required: true, value: inv.amount },
//             { name: 'mode', label: 'Mode', type: 'select', required: true, options: [
//               { value: 'NEFT', label: 'NEFT' },
//               { value: 'RTGS', label: 'RTGS' },
//               { value: 'UPI', label: 'UPI' },
//             ]},
//           ],
//           submitLabel: 'Record',
//           onSubmit: (data) => {
//             const pmt = recordPayment({ type: 'customer', refId: id, ...data });
//             logContract({ method: 'POST', path: '/api/payments', body: { type: 'customer', refId: id, ...data }, response: pmt, role: session.role });
//             toast('Receipt recorded', `${id} marked Paid`, 'success');
//             window.dispatchEvent(new HashChangeEvent('hashchange'));
//           }
//         });
//       });
//     });
//   }, 0);
//   return html;
// }

// /* ============ BANK RECON ============ */
// function renderBankRecon() {
//   const r = db.bankRecon;
//   const cols = [
//     { label: 'Date', render: x => fmtDate(x.date) },
//     { label: 'Ref', key: 'ref', mono: true },
//     { label: 'Description', key: 'desc' },
//     { label: 'Amount', align: 'right', num: true, render: x => fmtCurrencyINR(x.amount) },
//   ];
//   return `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Bank Reconciliation</div>
//         <div class="page-subtitle">4-bucket triage</div>
//       </div>
//     </div>
//     <div class="tabs">
//       <div class="tab active" data-tab="matched">Matched (${r.matched.length})</div>
//       <div class="tab" data-tab="unmatched">Unmatched (${r.unmatched.length})</div>
//       <div class="tab" data-tab="partial">Partial (${r.partial.length})</div>
//       <div class="tab" data-tab="exceptions">Exceptions (${r.exceptions.length})</div>
//     </div>
//     <div class="tab-panel active" data-panel="matched"><div class="card"><div class="card-body">${dataTable({ columns: cols, rows: r.matched })}</div></div></div>
//     <div class="tab-panel" data-panel="unmatched"><div class="card"><div class="card-body">${dataTable({ columns: cols, rows: r.unmatched })}</div></div></div>
//     <div class="tab-panel" data-panel="partial"><div class="card"><div class="card-body">${dataTable({ columns: cols, rows: r.partial })}</div></div></div>
//     <div class="tab-panel" data-panel="exceptions"><div class="card"><div class="card-body">${dataTable({ columns: cols, rows: r.exceptions })}</div></div></div>`;
// }

// /* ============ FIXED ASSETS ============ */
// function renderAssets() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Fixed Assets</div>
//         <div class="page-subtitle">Register · depreciation · NBV</div>
//       </div>
//       <div class="page-actions">
//         <button class="btn btn-primary" id="btn-new-fa" data-perm="create.asset">${icon('plus', 16)} Capitalize Asset</button>
//       </div>
//     </div>
//     <div class="card"><div class="card-body">${dataTable({
//       columns: [
//         { label: 'Asset #', key: 'id', mono: true },
//         { label: 'Name', key: 'name' },
//         { label: 'Category', key: 'category' },
//         { label: 'Location', key: 'loc' },
//         { label: 'Cost', align: 'right', num: true, render: r => fmtCurrencyINR(r.cost) },
//         { label: 'Depreciation', align: 'right', num: true, render: r => fmtCurrencyINR(r.dep) },
//         { label: 'NBV', align: 'right', num: true, render: r => `<b>${fmtCurrencyINR(r.nbv)}</b>` },
//         { label: 'Custodian', key: 'custodian' },
//       ],
//       rows: db.fixedAssets,
//     })}</div></div>`;
//   setTimeout(() => {
//     document.getElementById('btn-new-fa')?.addEventListener('click', () => {
//       formModal({
//         title: 'Capitalize Fixed Asset',
//         fields: [
//           { name: 'name', label: 'Asset name', type: 'text', required: true },
//           { name: 'category', label: 'Category', type: 'select', required: true, options: [
//             { value: 'Plant & Machinery', label: 'Plant & Machinery' },
//             { value: 'Buildings', label: 'Buildings' },
//             { value: 'Vehicles', label: 'Vehicles' },
//             { value: 'IT Equipment', label: 'IT Equipment' },
//           ]},
//           { name: 'loc', label: 'Location', type: 'text', required: true },
//           { name: 'cost', label: 'Cost (₹)', type: 'number', required: true },
//           { name: 'life', label: 'Life (years)', type: 'number', required: true },
//           { name: 'acquired', label: 'Acquired date', type: 'date', required: true, value: new Date().toISOString().slice(0,10) },
//           { name: 'custodian', label: 'Custodian', type: 'text', required: true },
//         ],
//         submitLabel: 'Capitalize',
//         onSubmit: (data) => {
//           const fa = capitalizeAsset(data);
//           logContract({ method: 'POST', path: '/api/fixed-assets', body: data, response: fa, role: session.role });
//           toast('Asset capitalized', `${fa.id} added to register`, 'success');
//           window.dispatchEvent(new HashChangeEvent('hashchange'));
//         }
//       });
//     });
//   }, 0);
//   return html;
// }

// /* ============ CASH FLOW ============ */
// function renderCashFlow() {
//   return `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Cash Flow Forecast</div>
//         <div class="page-subtitle">Waterfall · next 90 days</div>
//       </div>
//     </div>
//     <div class="card">
//       <div class="card-header"><div class="card-title">Cash Flow Bridge</div></div>
//       <div class="card-body" style="height:340px"><canvas id="cf-chart"></canvas></div>
//     </div>`;
// }

// /* ============ TAX ============ */
// function renderTax() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Tax & Compliance</div>
//         <div class="page-subtitle">GST · TDS · filing calendar</div>
//       </div>
//     </div>
//     <div class="card"><div class="card-body">${dataTable({
//       columns: [
//         { label: 'Form', key: 'form', mono: true },
//         { label: 'Period', key: 'period' },
//         { label: 'Due', render: r => fmtDate(r.due) },
//         { label: 'Status', render: r => chip(r.status === 'Filed' ? 'success' : 'warning', r.status) },
//         { label: 'Actions', render: r => r.status !== 'Filed'
//             ? `<button class="btn btn-primary btn-sm" data-file="${r.id}" data-perm="create.journal">File Now</button>` : '' },
//       ],
//       rows: db.taxFilings,
//     })}</div></div>`;
//   setTimeout(() => {
//     document.querySelectorAll('[data-file]').forEach(b => {
//       b.addEventListener('click', async () => {
//         const ok = await confirmDialog({ title: 'File return?', message: 'Status will be set to Filed.' });
//         if (!ok) return;
//         const t = fileTaxReturn(b.dataset.file);
//         logContract({ method: 'POST', path: `/api/tax-filings/${t.id}/file`, role: session.role });
//         toast('Filed', `${t.form} for ${t.period}`, 'success');
//         window.dispatchEvent(new HashChangeEvent('hashchange'));
//       });
//     });
//   }, 0);
//   return html;
// }

/* ============================================================
   MODULE 1: FINANCIAL MANAGEMENT (Full Enterprise Suite)
   Scope Alignment: §5.1.A - §5.1.F, Priority Screens 6, 7, 8, 9, 10
   ============================================================ */

import { dataTable, chip, icon, toast, formModal, confirmDialog, kpiCard } from '../components.js';
import { db, createJournal, approveVendorInvoice, recordPayment, capitalizeAsset, fileTaxReturn, session } from '../state.js';
import { logContract } from '../api-contract.js';
import { fmtCurrency, fmtDate, fmtNumber } from '../format.js';

export function register(route) {
  route('finance/dashboard',  renderFinanceDashboard);
  route('finance/gl',         renderGL);
  route('finance/statements', renderStatements);
  route('finance/ap',         renderAP);
  route('finance/ar',         renderAR);
  route('finance/bank-recon', renderBankRecon);
  route('finance/assets',     renderAssets);
  route('finance/cash-flow',  renderCashFlow);
  route('finance/tax',        renderTax);
}

/* ============================================================
   1. FINANCE OVERVIEW DASHBOARD (Screen #6)
   ============================================================ */
function renderFinanceDashboard() {
  const totalReceivables = db.customerInvoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0);
  const totalPayables = db.vendorInvoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0);
  const liquidCash = 41000000;
  const monthlyBurn = 8500000;
  const runwayMonths = (liquidCash / monthlyBurn).toFixed(1);

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Financial Management Dashboard</div>
        <div class="page-subtitle">Consolidated Financial Position · Multi-Entity & Multi-Currency Treasury</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="window.__navigate('finance/statements')">${icon('book', 16)} Financial Statements</button>
        <button class="btn btn-primary" onclick="window.__navigate('finance/cash-flow')">${icon('trending-up', 16)} Cash Flow Forecast</button>
      </div>
    </div>

    <div class="grid grid-kpi">
      ${kpiCard({ label: 'Liquid Cash & Equivalents', value: liquidCash, delta: 4.8, icon: 'wallet' })}
      ${kpiCard({ label: 'Accounts Receivable (AR)', value: totalReceivables, delta: -2.1, icon: 'arrow-down-left' })}
      ${kpiCard({ label: 'Accounts Payable (AP)', value: totalPayables, delta: 3.5, icon: 'arrow-up-right' })}
      <div class="kpi">
        <div class="kpi-header"><span class="kpi-label">Cash Runway</span><span class="kpi-icon">${icon('clock', 16)}</span></div>
        <div class="kpi-value">${runwayMonths} Months</div>
        <div class="kpi-delta up">${icon('check-circle', 12)} Stable at ${fmtCurrency(monthlyBurn)}/mo burn</div>
      </div>
    </div>

    <div class="grid grid-charts" style="margin-top:24px">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Working Capital & Liquidity Run-Rate</div>
          <div class="card-subtitle">Last 6 Months Actual vs Projected (Assets vs Liabilities)</div>
        </div>
        <div class="card-body" style="height:300px"><canvas id="finLiquidityChart"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">Cost Center Budget Utilization</div>
          <div class="card-subtitle">FY26 Department Budget Tracking</div>
        </div>
        <div class="card-body">
          ${db.costCenters.map(cc => {
            const pct = Math.round((cc.spent / cc.budget) * 100);
            const level = pct >= 90 ? 'critical' : pct >= 75 ? 'warning' : 'success';
            return `
              <div style="margin-bottom:16px">
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
                  <b>${cc.code} · ${cc.name}</b>
                  <span>${fmtCurrency(cc.spent)} / ${fmtCurrency(cc.budget)} (${pct}%)</span>
                </div>
                <div class="progress"><div class="progress-bar ${level}" style="width:${pct}%"></div></div>
              </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
}

document.addEventListener('route-rendered', (e) => {
  if (e.detail.path !== 'finance/dashboard') return;
  const canvas = document.getElementById('finLiquidityChart');
  if (!canvas || !window.Chart) return;
  new Chart(canvas, {
    type: 'line',
    data: {
      labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct (Proj)'],
      datasets: [
        { label: 'Current Assets', data: [58000000, 61000000, 64000000, 63000000, 65000000, 67000000], borderColor: '#10B981', tension: 0.35 },
        { label: 'Current Liabilities', data: [22000000, 24000000, 23500000, 26000000, 25000000, 24500000], borderColor: '#EF4444', tension: 0.35 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });
});

/* ============================================================
   2. GENERAL LEDGER (Screen #7)
   ============================================================ */
function renderGL() {
  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">General Ledger</div>
        <div class="page-subtitle">Double-Entry Journals · Cost Center Tracking · Period Controls</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" id="btn-period-close">${icon('shield', 16)} Period Close Control</button>
        <button class="btn btn-secondary" id="btn-coa">${icon('layers', 16)} Chart of Accounts</button>
        <button class="btn btn-secondary" id="btn-recurring-je">${icon('refresh-cw', 16)} Recurring Schedules</button>
        <button class="btn btn-primary" id="btn-new-je" data-perm="create.journal">${icon('plus', 16)} New Multi-Line Journal</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Posted General Ledger Transactions</div>
        <div class="card-subtitle">Real-time audit-verified journal log</div>
      </div>
      <div class="card-body">${dataTable({
        columns: [
          { label: 'Journal ID', key: 'id', mono: true },
          { label: 'Date', render: r => fmtDate(r.date) },
          { label: 'Voucher Ref', key: 'ref', mono: true },
          { label: 'Description', key: 'narrative' },
          { label: 'Account Code', key: 'account', mono: true },
          { label: 'Debit', align: 'right', num: true, render: r => r.debit ? `<b>${fmtCurrency(r.debit)}</b>` : '—' },
          { label: 'Credit', align: 'right', num: true, render: r => r.credit ? `<b>${fmtCurrency(r.credit)}</b>` : '—' },
          { label: 'Status', render: r => chip('success', r.status) },
        ],
        rows: db.journals,
      })}</div>
    </div>`;

  setTimeout(() => {
    // Chart of Accounts Hierarchical View Modal
    document.getElementById('btn-coa')?.addEventListener('click', () => {
      const modalRoot = document.getElementById('modal-root') || document.body;
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop open';
      backdrop.innerHTML = `
        <div class="modal" style="max-width:850px">
          <div class="modal-header">
            <div>
              <span class="modal-title">Chart of Accounts Hierarchy</span>
              <div style="font-size:12px;color:var(--text-muted)">4-Tier Account Structure · Assets, Liabilities, Equity, Revenue, Expense</div>
            </div>
            <button class="btn-ghost btn-icon" onclick="this.closest('.modal-backdrop').remove()">${icon('x', 16)}</button>
          </div>
          <div class="modal-body" style="max-height:65vh;overflow-y:auto">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Account Code</th>
                  <th>Account Description</th>
                  <th>Classification</th>
                  <th class="text-right">Balance</th>
                  <th>Posting Status</th>
                </tr>
              </thead>
              <tbody>
                ${db.chartOfAccountsHierarchical.map(acc => `
                  <tr style="${acc.level === 0 ? 'background:var(--surface-alt);font-weight:700;' : ''}">
                    <td class="mono" style="padding-left:${acc.level * 20 + 8}px">${acc.code}</td>
                    <td>${acc.name}</td>
                    <td><span class="chip chip-${acc.type === 'Asset' ? 'info' : acc.type === 'Liability' ? 'warning' : acc.type === 'Revenue' ? 'success' : 'neutral'}">${acc.type}</span></td>
                    <td class="text-right num">${fmtCurrency(acc.balance)}</td>
                    <td>${acc.postable ? chip('success', 'Active') : '<span class="text-muted" style="font-size:11px">Header</span>'}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>`;
      modalRoot.appendChild(backdrop);
    });

    // Period Close Control Modal
    document.getElementById('btn-period-close')?.addEventListener('click', () => {
      const modalRoot = document.getElementById('modal-root') || document.body;
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop open';
      backdrop.innerHTML = `
        <div class="modal" style="max-width:720px">
          <div class="modal-header">
            <span class="modal-title">Fiscal Year & Period Close Controls</span>
            <button class="btn-ghost btn-icon" onclick="this.closest('.modal-backdrop').remove()">${icon('x', 16)}</button>
          </div>
          <div class="modal-body">
            <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">
              Locking fiscal periods seals accounting records against backdated postings and updates retained earnings.
            </p>
            ${dataTable({
              columns: [
                { label: 'Period', key: 'period', mono: true },
                { label: 'Quarter Name', key: 'name' },
                { label: 'Start Date', render: r => fmtDate(r.start) },
                { label: 'End Date', render: r => fmtDate(r.end) },
                { label: 'State', render: r => chip(r.status === 'Hard Closed' ? 'critical' : r.status === 'Open' ? 'success' : 'neutral', r.status) },
                { label: 'Locked By', key: 'lockedBy' },
                { label: 'Control', render: r => r.status === 'Open' ? `<button class="btn btn-secondary btn-sm" onclick="alert('Period locked. Journal entries sealed.');this.closest('.modal-backdrop').remove()">Lock Period</button>` : '—' }
              ],
              rows: db.fiscalPeriods,
            })}
          </div>
        </div>`;
      modalRoot.appendChild(backdrop);
    });

    // Recurring Schedules Modal
    document.getElementById('btn-recurring-je')?.addEventListener('click', () => {
      const modalRoot = document.getElementById('modal-root') || document.body;
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop open';
      backdrop.innerHTML = `
        <div class="modal" style="max-width:780px">
          <div class="modal-header">
            <span class="modal-title">Recurring Journal Schedules</span>
            <button class="btn-ghost btn-icon" onclick="this.closest('.modal-backdrop').remove()">${icon('x', 16)}</button>
          </div>
          <div class="modal-body">
            ${dataTable({
              columns: [
                { label: 'Schedule ID', key: 'id', mono: true },
                { label: 'Title', key: 'title' },
                { label: 'Frequency', key: 'schedule' },
                { label: 'Debit Account', key: 'debitAccount' },
                { label: 'Credit Account', key: 'creditAccount' },
                { label: 'Amount', align: 'right', num: true, render: r => fmtCurrency(r.amount) },
                { label: 'Next Run', render: r => fmtDate(r.nextRun) },
                { label: 'Status', render: r => chip('success', r.status) },
              ],
              rows: db.recurringJournals,
            })}
          </div>
        </div>`;
      modalRoot.appendChild(backdrop);
    });

    // Multi-Line Journal Entry Modal
    document.getElementById('btn-new-je')?.addEventListener('click', () => {
      const modalRoot = document.getElementById('modal-root') || document.body;
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop open';
      backdrop.innerHTML = `
        <div class="modal" style="max-width:850px">
          <div class="modal-header">
            <div>
              <span class="modal-title">Post Double-Entry Journal Voucher</span>
              <div style="font-size:12px;color:var(--text-muted)">Total Debits must equal Total Credits before posting</div>
            </div>
            <button class="btn-ghost btn-icon" onclick="this.closest('.modal-backdrop').remove()">${icon('x', 16)}</button>
          </div>
          <div class="modal-body">
            <div class="grid grid-3" style="margin-bottom:16px">
              <div class="field"><label>Posting Date</label><input class="input" type="date" id="je-date" value="${new Date().toISOString().slice(0,10)}"></div>
              <div class="field"><label>Reference #</label><input class="input" id="je-ref" placeholder="JV-2026-009"></div>
              <div class="field"><label>Currency</label><select class="select" id="je-curr"><option>USD</option><option>EUR</option><option>GBP</option><option>INR</option></select></div>
            </div>
            <div class="field" style="margin-bottom:16px">
              <label>Journal Narrative / Justification</label>
              <input class="input" id="je-desc" placeholder="e.g. Allocation of corporate facilities expense">
            </div>

            <!-- Line Distribution Table -->
            <table class="data-table" id="je-lines-table">
              <thead>
                <tr>
                  <th style="width:35%">Account</th>
                  <th style="width:25%">Cost Center</th>
                  <th style="width:20%">Debit</th>
                  <th style="width:20%">Credit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <select class="select je-acc">
                      <option value="6200 · Facilities Expense">6200 · Facilities Expense</option>
                      <option value="1111 · Cash & Bank">1111 · Cash & Bank</option>
                      <option value="1120 · Accounts Receivable">1120 · Accounts Receivable</option>
                      <option value="2110 · Accounts Payable">2110 · Accounts Payable</option>
                    </select>
                  </td>
                  <td>
                    <select class="select je-cc">
                      ${db.costCenters.map(cc => `<option value="${cc.code}">${cc.code} - ${cc.name}</option>`).join('')}
                    </select>
                  </td>
                  <td><input class="input num je-debit" type="number" value="50000" oninput="window.__calcJE()"></td>
                  <td><input class="input num je-credit" type="number" value="0" oninput="window.__calcJE()"></td>
                </tr>
                <tr>
                  <td>
                    <select class="select je-acc">
                      <option value="1111 · Cash & Bank">1111 · Cash & Bank</option>
                      <option value="6200 · Facilities Expense">6200 · Facilities Expense</option>
                      <option value="2110 · Accounts Payable">2110 · Accounts Payable</option>
                    </select>
                  </td>
                  <td>
                    <select class="select je-cc">
                      ${db.costCenters.map(cc => `<option value="${cc.code}">${cc.code} - ${cc.name}</option>`).join('')}
                    </select>
                  </td>
                  <td><input class="input num je-debit" type="number" value="0" oninput="window.__calcJE()"></td>
                  <td><input class="input num je-credit" type="number" value="50000" oninput="window.__calcJE()"></td>
                </tr>
              </tbody>
            </table>

            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding:12px;background:var(--surface-alt);border-radius:8px">
              <span id="je-balance-status" class="chip chip-success">Balanced (Difference: 0.00)</span>
              <div style="font-size:13px">
                Total Debit: <b id="je-sum-debit">$50,000</b> | Total Credit: <b id="je-sum-credit">$50,000</b>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Cancel</button>
            <button class="btn btn-primary" id="btn-post-voucher">Post to General Ledger</button>
          </div>
        </div>`;
      modalRoot.appendChild(backdrop);

      window.__calcJE = () => {
        let debits = 0; let credits = 0;
        document.querySelectorAll('.je-debit').forEach(i => debits += Number(i.value || 0));
        document.querySelectorAll('.je-credit').forEach(i => credits += Number(i.value || 0));
        const diff = debits - credits;
        document.getElementById('je-sum-debit').textContent = fmtCurrency(debits);
        document.getElementById('je-sum-credit').textContent = fmtCurrency(credits);
        const statusEl = document.getElementById('je-balance-status');
        if (Math.abs(diff) < 0.01 && debits > 0) {
          statusEl.className = 'chip chip-success';
          statusEl.textContent = 'Balanced (Difference: 0.00)';
        } else {
          statusEl.className = 'chip chip-critical';
          statusEl.textContent = `Unbalanced (Difference: ${fmtCurrency(diff)})`;
        }
      };

      document.getElementById('btn-post-voucher')?.addEventListener('click', () => {
        let debits = 0; let credits = 0;
        document.querySelectorAll('.je-debit').forEach(i => debits += Number(i.value || 0));
        document.querySelectorAll('.je-credit').forEach(i => credits += Number(i.value || 0));
        if (debits !== credits || debits === 0) {
          toast('Validation Error', 'Journal debits and credits must balance to zero.', 'error');
          return;
        }
        const je = createJournal({
          date: document.getElementById('je-date').value,
          ref: document.getElementById('je-ref').value || 'JV-AUTO',
          narrative: document.getElementById('je-desc').value || 'General expense allocation',
          account: document.querySelector('.je-acc').value,
          debit: debits,
          credit: credits,
        });
        logContract({ method: 'POST', path: '/api/journals', body: { debits, credits }, response: je, role: window.__session?.role });
        toast('Voucher Posted', `${je.id} posted to General Ledger`, 'success');
        backdrop.remove();
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });
  }, 0);

  return html;
}

/* ============================================================
   3. FINANCIAL STATEMENTS: TRIAL BALANCE, BALANCE SHEET, P&L
   ============================================================ */
function renderStatements() {
  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">Financial Statements & Reporting</div>
        <div class="page-subtitle">Real-Time Consolidated Trial Balance · Profit & Loss · Balance Sheet</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="alert('Exporting to Excel / PDF')">${icon('download', 16)} Export Statements</button>
      </div>
    </div>

    <div class="tabs" style="margin-bottom:20px">
      <div class="tab active" data-tab="tb">Trial Balance</div>
      <div class="tab" data-tab="pnl">Profit & Loss (Income Statement)</div>
      <div class="tab" data-tab="bs">Balance Sheet</div>
    </div>

    <!-- TAB 1: TRIAL BALANCE -->
    <div class="tab-panel active" data-panel="tb">
      <div class="card">
        <div class="card-header"><div class="card-title">Consolidated Trial Balance (FY26)</div></div>
        <div class="card-body">
          <table class="data-table">
            <thead>
              <tr>
                <th>Account Code</th>
                <th>Account Description</th>
                <th class="text-right">Debit Balance</th>
                <th class="text-right">Credit Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="mono">1111</td><td>Corporate Bank Treasury</td><td class="text-right num">${fmtCurrency(35000000)}</td><td class="text-right num">—</td></tr>
              <tr><td class="mono">1120</td><td>Accounts Receivable (Trade Debtors)</td><td class="text-right num">${fmtCurrency(18300000)}</td><td class="text-right num">—</td></tr>
              <tr><td class="mono">1210</td><td>Property, Plant & Machinery</td><td class="text-right num">${fmtCurrency(15400000)}</td><td class="text-right num">—</td></tr>
              <tr><td class="mono">2110</td><td>Accounts Payable (Trade Creditors)</td><td class="text-right num">—</td><td class="text-right num">${fmtCurrency(22400000)}</td></tr>
              <tr><td class="mono">2120</td><td>Statutory VAT / Taxes Payable</td><td class="text-right num">—</td><td class="text-right num">${fmtCurrency(4800000)}</td></tr>
              <tr><td class="mono">3100</td><td>Common Share Capital</td><td class="text-right num">—</td><td class="text-right num">${fmtCurrency(20000000)}</td></tr>
              <tr><td class="mono">4100</td><td>Sales Revenues</td><td class="text-right num">—</td><td class="text-right num">${fmtCurrency(124000000)}</td></tr>
              <tr><td class="mono">5100</td><td>Cost of Goods Sold (COGS)</td><td class="text-right num">${fmtCurrency(68000000)}</td><td class="text-right num">—</td></tr>
              <tr><td class="mono">6100</td><td>Operating Operating Expenses (OPEX)</td><td class="text-right num">${fmtCurrency(34500000)}</td><td class="text-right num">—</td></tr>
              <tr style="background:var(--surface-alt);font-weight:700">
                <td colspan="2">TOTAL CONSOLIDATED TRIAL BALANCE</td>
                <td class="text-right num">${fmtCurrency(171200000)}</td>
                <td class="text-right num">${fmtCurrency(171200000)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: P&L -->
    <div class="tab-panel" data-panel="pnl">
      <div class="card">
        <div class="card-header"><div class="card-title">Profit & Loss Statement (Fiscal Year 2026)</div></div>
        <div class="card-body" style="font-size:14px;line-height:2">
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border)">
            <b>Revenue from Operations</b><b class="num">${fmtCurrency(124000000)}</b>
          </div>
          <div style="display:flex;justify-content:space-between;padding-left:16px;color:var(--text-muted)">
            <span>Cost of Goods Sold (COGS)</span><span class="num">−${fmtCurrency(68000000)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-bottom:2px solid var(--border);padding:4px 0;font-weight:700;color:var(--success)">
            <span>GROSS PROFIT</span><span class="num">${fmtCurrency(56000000)} (45.1%)</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding-left:16px;color:var(--text-muted);margin-top:8px">
            <span>Operating Expenses (OPEX)</span><span class="num">−${fmtCurrency(28000000)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-bottom:2px solid var(--border);padding:4px 0;font-weight:700">
            <span>OPERATING PROFIT (EBITDA)</span><span class="num">${fmtCurrency(28000000)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding-left:16px;color:var(--text-muted);margin-top:8px">
            <span>Corporate Income Tax Provision</span><span class="num">−${fmtCurrency(5600000)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-bottom:3px double var(--brand-primary);padding:8px 0;font-size:16px;font-weight:700;color:var(--brand-primary)">
            <span>NET PROFIT AFTER TAX</span><span class="num">${fmtCurrency(22400000)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: BALANCE SHEET -->
    <div class="tab-panel" data-panel="bs">
      <div class="card">
        <div class="card-header"><div class="card-title">Balance Sheet Statement (As of October 2026)</div></div>
        <div class="card-body" style="font-size:14px;line-height:2">
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);font-weight:700">
            <span>TOTAL ASSETS</span><span class="num">${fmtCurrency(74500000)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding-left:16px;color:var(--text-muted)">
            <span>Current Assets (Cash, Receivables, Inventory)</span><span class="num">${fmtCurrency(59300000)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding-left:16px;color:var(--text-muted)">
            <span>Non-Current Assets (Net Fixed Assets)</span><span class="num">${fmtCurrency(15200000)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);font-weight:700;margin-top:16px">
            <span>TOTAL LIABILITIES</span><span class="num">${fmtCurrency(38200000)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding-left:16px;color:var(--text-muted)">
            <span>Current Liabilities (Accounts Payable, Taxes)</span><span class="num">${fmtCurrency(38200000)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);font-weight:700;margin-top:16px">
            <span>SHAREHOLDERS' EQUITY</span><span class="num">${fmtCurrency(36300000)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-bottom:3px double var(--brand-primary);padding:8px 0;font-size:16px;font-weight:700">
            <span>TOTAL LIABILITIES & EQUITY</span><span class="num">${fmtCurrency(74500000)}</span>
          </div>
        </div>
      </div>
    </div>`;

  setTimeout(() => {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add('active');
      });
    });
  }, 0);

  return html;
}

/* ============================================================
   4. ACCOUNTS PAYABLE (AP) HUB (Screen #8)
   ============================================================ */
function renderAP() {
  const aging = {
    current: 480000,
    days30: 1250000,
    days60: 320000,
    days90Plus: 180000,
  };

  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">Accounts Payable (AP) Hub</div>
        <div class="page-subtitle">Vendor Invoices · 3-Way Verification Status · Aging Schedule</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="window.__navigate('finance/three-way-live')">${icon('check-circle', 16)} 3-Way Match Live</button>
        <button class="btn btn-primary" id="btn-batch-pay">${icon('dollar-sign', 16)} Schedule Batch Pay</button>
      </div>
    </div>

    <!-- Aging Schedule Buckets (§5.1.B) -->
    <div class="grid grid-kpi">
      <div class="kpi">
        <div class="kpi-header"><span class="kpi-label">Current (0–30 Days)</span></div>
        <div class="kpi-value">${fmtCurrency(aging.current)}</div>
        <div class="kpi-delta flat">${icon('info', 12)} On schedule</div>
      </div>
      <div class="kpi">
        <div class="kpi-header"><span class="kpi-label">31–60 Days</span></div>
        <div class="kpi-value" style="color:var(--warning)">${fmtCurrency(aging.days30)}</div>
        <div class="kpi-delta down">${icon('clock', 12)} Approaching due date</div>
      </div>
      <div class="kpi">
        <div class="kpi-header"><span class="kpi-label">61–90 Days</span></div>
        <div class="kpi-value" style="color:var(--warning)">${fmtCurrency(aging.days60)}</div>
        <div class="kpi-delta down">${icon('alert-triangle', 12)} Exception hold</div>
      </div>
      <div class="kpi">
        <div class="kpi-header"><span class="kpi-label">90+ Days Overdue</span></div>
        <div class="kpi-value" style="color:var(--critical)">${fmtCurrency(aging.days90Plus)}</div>
        <div class="kpi-delta down">${icon('alert-circle', 12)} Immediate action required</div>
      </div>
    </div>

    <div class="card" style="margin-top:24px">
      <div class="card-header">
        <div class="card-title">Vendor Invoices Register</div>
        <div class="card-subtitle">Showing pending, matched and approved vouchers</div>
      </div>
      <div class="card-body">${dataTable({
        columns: [
          { label: 'Invoice #', key: 'id', mono: true },
          { label: 'Vendor Name', key: 'vendor' },
          { label: 'PO Ref', key: 'po', mono: true },
          { label: 'GRN Ref', key: 'grn', mono: true },
          { label: 'Invoice Total', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.amount)}</b>` },
          { label: 'Payment Due', render: r => fmtDate(r.due) },
          { label: 'Audit Match', render: r => chip(r.match === '3-Way' ? 'success' : r.match === '2-Way' ? 'info' : 'critical', r.match) },
          { label: 'Status', render: r => chip(r.status === 'Approved' ? 'success' : r.status === 'Paid' ? 'success' : r.status === 'Exception' ? 'critical' : 'warning', r.status) },
          { label: 'Actions', render: r => `
            ${r.status === 'Pending' || r.status === 'Exception' ? `<button class="btn btn-primary btn-sm" data-approve="${r.id}" data-perm="approve.vendor_invoice">Approve</button>` : ''}
            ${r.status === 'Approved' ? `<button class="btn btn-success btn-sm" data-pay="${r.id}" data-perm="create.payment">Pay Now</button>` : ''}
          `},
        ],
        rows: db.vendorInvoices,
      })}</div>
    </div>`;

  setTimeout(() => {
    document.querySelectorAll('[data-approve]').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.dataset.approve;
        const vi = db.vendorInvoices.find(v => v.id === id);
        const ok = await confirmDialog({
          title: `Approve Vendor Invoice ${id}?`,
          message: `Authorize payment release of ${fmtCurrency(vi.amount)} to ${vi.vendor}. This transaction will post a Credit to Payables.`,
          confirmText: 'Approve & Post'
        });
        if (!ok) return;
        approveVendorInvoice(id);
        logContract({ method: 'PATCH', path: `/api/vendor-invoices/${id}/approve`, role: window.__session?.role });
        toast('Invoice Approved', `${id} approved for payment release`, 'success');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });

    document.querySelectorAll('[data-pay]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.pay;
        const vi = db.vendorInvoices.find(v => v.id === id);
        formModal({
          title: `Execute Payment Disbursement — ${id}`,
          fields: [
            { name: 'amount', label: 'Payment Amount', type: 'number', required: true, value: vi.amount },
            { name: 'mode', label: 'Disbursement Method', type: 'select', required: true, options: [
              { value: 'Wire / SWIFT', label: 'Wire Transfer / SWIFT' },
              { value: 'SEPA / ACH', label: 'SEPA Direct Debit / ACH' },
              { value: 'NEFT / RTGS', label: 'NEFT / RTGS' },
              { value: 'Corporate Card', label: 'Corporate Card' },
            ]},
            { name: 'notes', label: 'Remittance Reference', type: 'text', placeholder: 'Vendor payment remittance ref' },
          ],
          submitLabel: 'Release Payment',
          onSubmit: (data) => {
            const pmt = recordPayment({ type: 'vendor', refId: id, ...data });
            logContract({ method: 'POST', path: '/api/payments', body: { type: 'vendor', refId: id, ...data }, response: pmt, role: window.__session?.role });
            toast('Payment Completed', `Disbursed ${fmtCurrency(data.amount)} to ${vi.vendor}`, 'success');
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          }
        });
      });
    });
  }, 0);

  return html;
}

/* ============================================================
   5. ACCOUNTS RECEIVABLE (AR) HUB (Screen #9)
   ============================================================ */
function renderAR() {
  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">Accounts Receivable (AR) Hub</div>
        <div class="page-subtitle">Customer Invoicing · Aging Schedule · Days Sales Outstanding (DSO)</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="window.__navigate('sales/orders')">${icon('clipboard', 16)} View Sales Orders</button>
      </div>
    </div>

    <div class="grid grid-kpi">
      <div class="kpi">
        <div class="kpi-header"><span class="kpi-label">Days Sales Outstanding (DSO)</span><span class="kpi-icon">${icon('clock', 16)}</span></div>
        <div class="kpi-value">34.2 Days</div>
        <div class="kpi-delta up">${icon('trending-down', 12)} 8.4 days faster than industry average</div>
      </div>
      <div class="kpi">
        <div class="kpi-header"><span class="kpi-label">Total Outstanding</span><span class="kpi-icon">${icon('arrow-down-left', 16)}</span></div>
        <div class="kpi-value">${fmtCurrency(2510000)}</div>
        <div class="kpi-delta flat">${icon('info', 12)} Across 4 tier-1 accounts</div>
      </div>
      <div class="kpi">
        <div class="kpi-header"><span class="kpi-label">Overdue Exposure</span><span class="kpi-icon">${icon('alert-circle', 16)}</span></div>
        <div class="kpi-value" style="color:var(--critical)">${fmtCurrency(1240000)}</div>
        <div class="kpi-delta down">${icon('alert-triangle', 12)} 1 invoice past 30 days</div>
      </div>
    </div>

    <div class="card" style="margin-top:24px">
      <div class="card-header">
        <div class="card-title">Customer Invoices Aging Register</div>
        <div class="card-subtitle">Live collection pipeline with direct receipt matching</div>
      </div>
      <div class="card-body">${dataTable({
        columns: [
          { label: 'Invoice #', key: 'id', mono: true },
          { label: 'Customer Name', key: 'customer' },
          { label: 'Amount Billed', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.amount)}</b>` },
          { label: 'Due Date', render: r => fmtDate(r.due) },
          { label: 'Collection Status', render: r => chip(r.status === 'Paid' ? 'success' : r.status === 'Overdue' ? 'critical' : 'warning', r.status) },
          { label: 'Action', render: r => r.status !== 'Paid'
            ? `<button class="btn btn-success btn-sm" data-receipt="${r.id}" data-perm="create.payment">Record Receipt</button>`
            : '<span class="text-muted" style="font-size:12px">Reconciled</span>' },
        ],
        rows: db.customerInvoices,
      })}</div>
    </div>`;

  setTimeout(() => {
    document.querySelectorAll('[data-receipt]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.receipt;
        const inv = db.customerInvoices.find(i => i.id === id);
        formModal({
          title: `Capture Customer Receipt — ${id}`,
          fields: [
            { name: 'amount', label: 'Received Amount', type: 'number', required: true, value: inv.amount },
            { name: 'mode', label: 'Payment Method', type: 'select', required: true, options: [
              { value: 'Wire Transfer / ACH', label: 'Wire Transfer / ACH' },
              { value: 'Credit Card / Gateway', label: 'Credit Card / Gateway' },
              { value: 'Check / Cheque', label: 'Check / Cheque' },
            ]},
            { name: 'ref', label: 'Bank Transaction Reference', type: 'text', required: true, placeholder: 'e.g. TXN-88291' },
          ],
          submitLabel: 'Post Customer Payment',
          onSubmit: (data) => {
            const pmt = recordPayment({ type: 'customer', refId: id, ...data });
            logContract({ method: 'POST', path: '/api/payments', body: { type: 'customer', refId: id, ...data }, response: pmt, role: session.role });
            toast('Receipt Processed', `${id} successfully marked as Paid`, 'success');
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          }
        });
      });
    });
  }, 0);

  return html;
}

/* ============================================================
   6. BANK RECONCILIATION — 4-BUCKET TRIAGE (Screen #10)
   ============================================================ */
function renderBankRecon() {
  const buckets = {
    Matched: db.bankStatements.filter(s => s.status === 'Matched'),
    Unmatched: db.bankStatements.filter(s => s.status === 'Unmatched'),
    Partial: db.bankStatements.filter(s => s.status === 'Partial'),
    Exception: db.bankStatements.filter(s => s.status === 'Exception'),
  };

  const bucketCard = (title, color, items) => `
    <div style="background:var(--surface-alt);border-radius:10px;padding:14px;min-height:440px;border-top:3px solid var(--${color})">
      <div style="font-weight:600;font-size:13px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
        <span>${title}</span>
        <span class="chip chip-neutral">${items.length} records</span>
      </div>
      ${items.length === 0 ? '<div class="text-muted" style="font-size:12px;padding:16px 0;text-align:center">No transactions</div>' : ''}
      ${items.map(r => `
        <div class="card" style="margin-bottom:10px;box-shadow:var(--shadow-sm)">
          <div class="card-body" style="padding:12px">
            <div style="font-size:11px;color:var(--text-muted);display:flex;justify-content:space-between">
              <span>${fmtDate(r.date)}</span>
              <span class="mono">${r.ref}</span>
            </div>
            <div style="font-size:13px;font-weight:600;margin:6px 0">${r.desc}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
              <span style="font-weight:700;color:${r.type === 'credit' ? 'var(--success)' : 'var(--critical)'}">
                ${r.type === 'credit' ? '+' : '−'}${fmtCurrency(r.amount)}
              </span>
              ${r.status !== 'Matched' ? `<button class="btn btn-primary btn-sm" data-recon-match="${r.ref}">Match</button>` : chip('success', 'Matched')}
            </div>
          </div>
        </div>`).join('')}
    </div>`;

  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">Bank Reconciliation Command Center</div>
        <div class="page-subtitle">Automatic 4-Bucket Triage · Corporate Treasury Account</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="alert('Import statement dialog opens')">${icon('upload', 16)} Import Statement (MT940/OFX)</button>
        <button class="btn btn-primary" id="btn-automatch">${icon('refresh-cw', 16)} Run Auto-Match Engine</button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;overflow-x:auto;padding-bottom:16px">
      ${bucketCard('Matched', 'success', buckets.Matched)}
      ${bucketCard('Unmatched', 'info', buckets.Unmatched)}
      ${bucketCard('Partial Matches', 'warning', buckets.Partial)}
      ${bucketCard('Audit Exceptions', 'critical', buckets.Exception)}
    </div>`;

  setTimeout(() => {
    document.getElementById('btn-automatch')?.addEventListener('click', () => {
      toast('Running AI Match', 'Reconciling GL ledger entries against bank feeds…', 'info');
      setTimeout(() => {
        toast('Reconciliation Complete', 'Matched 1 pending receipt with zero variance', 'success');
      }, 1200);
    });

    document.querySelectorAll('[data-recon-match]').forEach(b => {
      b.addEventListener('click', () => {
        toast('Match Voucher', `Pairing transaction ${b.dataset.reconMatch} with Open AR item`, 'info');
      });
    });
  }, 0);

  return html;
}

/* ============================================================
   7. FIXED ASSETS REGISTER (§5.1.E)
   ============================================================ */
function renderAssets() {
  const totalCost = db.fixedAssets.reduce((s, a) => s + a.cost, 0);
  const totalDep = db.fixedAssets.reduce((s, a) => s + a.dep, 0);
  const netBookValue = totalCost - totalDep;

  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">Fixed Asset Register & Depreciation</div>
        <div class="page-subtitle">Capitalization · Straight-Line Depreciation · Net Book Value (NBV)</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" id="btn-new-fa" data-perm="create.asset">${icon('plus', 16)} Capitalize Fixed Asset</button>
      </div>
    </div>

    <div class="grid grid-kpi">
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Gross Asset Value</span></div><div class="kpi-value">${fmtCurrency(totalCost)}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Accumulated Depreciation</span></div><div class="kpi-value" style="color:var(--critical)">−${fmtCurrency(totalDep)}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Net Book Value (NBV)</span></div><div class="kpi-value" style="color:var(--success)">${fmtCurrency(netBookValue)}</div></div>
    </div>

    <div class="card" style="margin-top:24px"><div class="card-body">${dataTable({
      columns: [
        { label: 'Asset Code', key: 'id', mono: true },
        { label: 'Asset Description', key: 'name' },
        { label: 'Asset Class', key: 'category' },
        { label: 'Facility Location', key: 'loc' },
        { label: 'Acquisition Cost', align: 'right', num: true, render: r => fmtCurrency(r.cost) },
        { label: 'Depreciation', align: 'right', num: true, render: r => fmtCurrency(r.dep) },
        { label: 'Net Book Value', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.nbv)}</b>` },
        { label: 'Useful Life', align: 'right', num: true, render: r => `${r.life} yrs` },
        { label: 'Designated Custodian', key: 'custodian' },
      ],
      rows: db.fixedAssets,
    })}</div></div>`;

  setTimeout(() => {
    document.getElementById('btn-new-fa')?.addEventListener('click', () => {
      formModal({
        title: 'Capitalize New Fixed Asset',
        fields: [
          { name: 'name', label: 'Asset Description', type: 'text', required: true },
          { name: 'category', label: 'Asset Class', type: 'select', required: true, options: [
            { value: 'Plant & Machinery', label: 'Plant & Heavy Machinery' },
            { value: 'Buildings', label: 'Buildings & Real Estate' },
            { value: 'IT Infrastructure', label: 'IT Infrastructure & Data Center' },
            { value: 'Vehicles', label: 'Commercial Vehicles' },
          ]},
          { name: 'loc', label: 'Physical Facility / Site', type: 'text', required: true },
          { name: 'cost', label: 'Total Capitalized Cost', type: 'number', required: true },
          { name: 'life', label: 'Useful Life (Years)', type: 'number', required: true, value: '10' },
          { name: 'acquired', label: 'Commissioning Date', type: 'date', required: true, value: new Date().toISOString().slice(0, 10) },
          { name: 'custodian', label: 'Assigned Custodian', type: 'text', required: true },
        ],
        submitLabel: 'Capitalize Asset',
        onSubmit: (data) => {
          const fa = capitalizeAsset(data);
          logContract({ method: 'POST', path: '/api/fixed-assets', body: data, response: fa, role: session.role });
          toast('Asset Capitalized', `${fa.id} added to corporate balance sheet`, 'success');
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      });
    });
  }, 0);

  return html;
}

/* ============================================================
   8. CASH FLOW FORECAST BRIDGE (§5.1.F)
   ============================================================ */
function renderCashFlow() {
  return `
    <div class="page-header">
      <div>
        <div class="page-title">Cash Flow Forecast & Working Capital Bridge</div>
        <div class="page-subtitle">90-Day Liquidity Projections (Inflow, Outflow & Capital Allocation)</div>
      </div>
    </div>

    <div class="grid grid-kpi">
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Opening Cash</span></div><div class="kpi-value">${fmtCurrency(41000000)}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Forecast Inflow (AR)</span></div><div class="kpi-value" style="color:var(--success)">+${fmtCurrency(24000000)}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Forecast Outflows</span></div><div class="kpi-value" style="color:var(--critical)">−${fmtCurrency(28500000)}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Closing Run-Rate</span></div><div class="kpi-value" style="color:var(--brand-primary)">${fmtCurrency(36500000)}</div></div>
    </div>

    <div class="card" style="margin-top:24px">
      <div class="card-header">
        <div class="card-title">90-Day Cash Flow Waterfall Bridge</div>
        <div class="card-subtitle">Detailed breakdown of operating inflows vs obligations</div>
      </div>
      <div class="card-body" style="height:360px"><canvas id="cfBridgeCanvas"></canvas></div>
    </div>`;
}

document.addEventListener('route-rendered', (e) => {
  if (e.detail.path !== 'finance/cash-flow') return;
  const canvas = document.getElementById('cfBridgeCanvas');
  if (!canvas || !window.Chart) return;

  const labels = db.cashFlowWaterfall.map(c => c.label);
  const base = [], up = [], down = [];
  let cum = 0;

  db.cashFlowWaterfall.forEach((v) => {
    if (v.type === 'total') {
      base.push(0); up.push(v.value); down.push(0); cum = v.value;
    } else {
      if (v.value >= 0) {
        base.push(cum); up.push(v.value); down.push(0);
      } else {
        base.push(cum + v.value); up.push(0); down.push(-v.value);
      }
      cum += v.value;
    }
  });

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'base', data: base, backgroundColor: 'transparent', stack: 'w' },
        { label: 'Inflow', data: up, backgroundColor: '#10B981', stack: 'w', borderRadius: 4 },
        { label: 'Outflow', data: down, backgroundColor: '#EF4444', stack: 'w', borderRadius: 4 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
    },
  });
});

/* ============================================================
   9. TAX & STATUTORY COMPLIANCE
   ============================================================ */
function renderTax() {
  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">Multi-Jurisdiction Tax & Compliance</div>
        <div class="page-subtitle">VAT (UK/EU) · US Sales & Use Tax · Statutory Audit Calendar</div>
      </div>
    </div>

    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'Statutory Return', key: 'form', mono: true },
        { label: 'Tax Jurisdiction', key: 'jurisdiction' },
        { label: 'Reporting Period', key: 'period' },
        { label: 'Statutory Due Date', render: r => fmtDate(r.due) },
        { label: 'Tax Liability', align: 'right', num: true, render: r => fmtCurrency(r.amount) },
        { label: 'Filing Status', render: r => chip(r.status === 'Filed' ? 'success' : 'warning', r.status) },
        { label: 'Action', render: r => r.status !== 'Filed'
          ? `<button class="btn btn-primary btn-sm" data-tax-file="${r.id}">Transmit Return</button>`
          : '<span class="text-muted" style="font-size:12px">Transmission Confirmed</span>' },
      ],
      rows: db.taxFilings,
    })}</div></div>`;

  setTimeout(() => {
    document.querySelectorAll('[data-tax-file]').forEach(b => {
      b.addEventListener('click', async () => {
        const ok = await confirmDialog({
          title: 'Transmit Statutory Filing?',
          message: 'The return will be electronically generated, hashed, and marked as Filed in the compliance ledger.'
        });
        if (!ok) return;
        const t = fileTaxReturn(b.dataset.taxFile);
        logContract({ method: 'POST', path: `/api/tax-filings/${t.id}/file`, role: session.role });
        toast('Return Filed', `${t.form} officially recorded as Filed`, 'success');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });
  }, 0);

  return html;
}