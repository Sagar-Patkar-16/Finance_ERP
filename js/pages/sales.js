// import { dataTable, chip, icon, toast, formModal, confirmDialog } from '../components.js';
// import { db, createCustomer, createQuotation, convertQuotationToSO, createSalesOrder, moveDeal, session } from '../state.js';
// import { logContract } from '../api-contract.js';
// import { fmtCurrencyINR, fmtDate } from '../format.js';

// export function register(route) {
//   route('sales/pipeline',   renderPipeline);
//   route('sales/customers',  renderCustomers);
//   route('sales/quotations', renderQuotations);
//   route('sales/orders',     renderOrders);
// }

// /* PIPELINE — drag-and-drop kanban */
// const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won / Lost'];

// function renderPipeline() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Sales Pipeline</div>
//         <div class="page-subtitle">Drag cards to change stage</div>
//       </div>
//       <div class="page-actions">
//         <button class="btn btn-primary" id="btn-new-deal" data-perm="create.deal">${icon('plus', 16)} New Deal</button>
//       </div>
//     </div>
//     <div class="kanban" id="kanban">${renderKanban()}</div>`;
//   setTimeout(bindKanban, 0);
//   return html;
// }

// function renderKanban() {
//   return STAGES.map(stage => {
//     const cards = db.deals.filter(d => d.stage === stage);
//     return `
//       <div class="kanban-col" data-stage="${stage}">
//         <div class="kanban-col-header"><span>${stage}</span><span class="kanban-col-count">${cards.length}</span></div>
//         ${cards.map(c => `
//           <div class="kanban-card" draggable="true" data-id="${c.id}">
//             <div class="title">${c.title}</div>
//             <div class="meta"><span>${fmtCurrencyINR(c.value)}</span><span>${c.days}d</span></div>
//           </div>`).join('')}
//       </div>`;
//   }).join('');
// }

// function bindKanban() {
//   let draggedId = null;
//   document.querySelectorAll('.kanban-card').forEach(card => {
//     card.addEventListener('dragstart', () => { draggedId = card.dataset.id; card.classList.add('dragging'); });
//     card.addEventListener('dragend', () => card.classList.remove('dragging'));
//   });
//   document.querySelectorAll('.kanban-col').forEach(col => {
//     col.addEventListener('dragover', e => e.preventDefault());
//     col.addEventListener('drop', e => {
//       e.preventDefault();
//       if (!draggedId) return;
//       const target = col.dataset.stage;
//       const d = moveDeal(draggedId, target);
//       logContract({ method: 'PATCH', path: `/api/deals/${draggedId}`, body: { stage: target }, response: d, role: session.role });
//       toast('Deal moved', `${d.title} → ${target}`, 'success', 1500);
//       document.getElementById('kanban').innerHTML = renderKanban();
//       bindKanban();
//     });
//   });

//   document.getElementById('btn-new-deal')?.addEventListener('click', () => {
//     formModal({
//       title: 'New Deal',
//       fields: [
//         { name: 'title', label: 'Deal title', type: 'text', required: true },
//         { name: 'value', label: 'Value (₹)', type: 'number', required: true },
//         { name: 'stage', label: 'Stage', type: 'select', required: true,
//           options: STAGES.map(s => ({ value: s, label: s })) },
//       ],
//       submitLabel: 'Create Deal',
//       onSubmit: (data) => {
//         const deal = { id: `D-${db.deals.length + 1}`, title: data.title, value: Number(data.value), owner: session.name, stage: data.stage, days: 0 };
//         db.deals.unshift(deal);
//         logContract({ method: 'POST', path: '/api/deals', body: data, response: deal, role: session.role });
//         toast('Deal created', deal.title, 'success');
//         document.getElementById('kanban').innerHTML = renderKanban();
//         bindKanban();
//       }
//     });
//   });
// }

// /* CUSTOMERS */
// function renderCustomers() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Customers</div>
//         <div class="page-subtitle">Full customer lifecycle</div>
//       </div>
//       <div class="page-actions">
//         <button class="btn btn-primary" id="btn-new-cust" data-perm="create.lead">${icon('plus', 16)} New Customer</button>
//       </div>
//     </div>
//     <div class="card"><div class="card-body">${dataTable({
//       columns: [
//         { label: 'ID', key: 'id', mono: true },
//         { label: 'Name', key: 'name' },
//         { label: 'Contact', key: 'contact' },
//         { label: 'Revenue', align: 'right', num: true, render: r => fmtCurrencyINR(r.revenue) },
//         { label: 'Outstanding', align: 'right', num: true, render: r => fmtCurrencyINR(r.outstanding) },
//         { label: 'Orders', align: 'right', num: true, key: 'orders' },
//         { label: 'Status', render: r => chip(r.status === 'Active' ? 'success' : 'neutral', r.status) },
//       ],
//       rows: db.customers,
//     })}</div></div>`;
//   setTimeout(() => {
//     document.getElementById('btn-new-cust')?.addEventListener('click', () => {
//       formModal({
//         title: 'New Customer',
//         fields: [
//           { name: 'name', label: 'Company name', type: 'text', required: true },
//           { name: 'contact', label: 'Primary contact', type: 'text', required: true },
//           { name: 'phone', label: 'Phone', type: 'text', required: true },
//           { name: 'email', label: 'Email', type: 'email', required: true },
//           { name: 'gst', label: 'GSTIN', type: 'text' },
//           { name: 'creditLimit', label: 'Credit limit (₹)', type: 'number', required: true },
//         ],
//         submitLabel: 'Create',
//         onSubmit: (data) => {
//           const c = createCustomer(data);
//           logContract({ method: 'POST', path: '/api/customers', body: data, response: c, role: session.role });
//           toast('Customer created', c.name, 'success');
//           window.dispatchEvent(new HashChangeEvent('hashchange'));
//         }
//       });
//     });
//   }, 0);
//   return html;
// }

// /* QUOTATIONS */
// function renderQuotations() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Quotations</div>
//         <div class="page-subtitle">Opportunity → Quote → SO</div>
//       </div>
//       <div class="page-actions">
//         <button class="btn btn-primary" id="btn-new-q" data-perm="create.quotation">${icon('plus', 16)} New Quote</button>
//       </div>
//     </div>
//     <div class="card"><div class="card-body">${dataTable({
//       columns: [
//         { label: 'Quote #', key: 'id', mono: true },
//         { label: 'Customer', key: 'customer' },
//         { label: 'Value', align: 'right', num: true, render: r => fmtCurrencyINR(r.value) },
//         { label: 'Expiry', render: r => fmtDate(r.expiry) },
//         { label: 'Status', render: r => chip(r.status === 'Accepted' ? 'success' : r.status === 'Pending Approval' ? 'warning' : 'info', r.status) },
//         { label: 'Actions', render: r => r.status === 'Sent' || r.status === 'Draft'
//             ? `<button class="btn btn-primary btn-sm" data-convert="${r.id}" data-perm="create.sales_order">Convert to SO</button>` : '' },
//       ],
//       rows: db.quotations,
//     })}</div></div>`;
//   setTimeout(() => {
//     document.getElementById('btn-new-q')?.addEventListener('click', () => {
//       formModal({
//         title: 'New Quotation',
//         fields: [
//           { name: 'customerId', label: 'Customer', type: 'select', required: true,
//             options: db.customers.map(c => ({ value: c.id, label: c.name })) },
//           { name: 'value', label: 'Value (₹)', type: 'number', required: true },
//           { name: 'expiry', label: 'Valid until', type: 'date', required: true },
//         ],
//         submitLabel: 'Create',
//         onSubmit: (data) => {
//           const q = createQuotation(data);
//           logContract({ method: 'POST', path: '/api/quotations', body: data, response: q, role: session.role });
//           toast('Quotation created', q.id, 'success');
//           window.dispatchEvent(new HashChangeEvent('hashchange'));
//         }
//       });
//     });
//     document.querySelectorAll('[data-convert]').forEach(b => {
//       b.addEventListener('click', async () => {
//         const ok = await confirmDialog({ title: 'Convert to Sales Order?', message: 'A new SO will be created.' });
//         if (!ok) return;
//         const so = convertQuotationToSO(b.dataset.convert);
//         logContract({ method: 'POST', path: '/api/sales-orders', body: { fromQuote: b.dataset.convert }, response: so, role: session.role });
//         toast('SO created', so.id, 'success');
//         window.dispatchEvent(new HashChangeEvent('hashchange'));
//       });
//     });
//   }, 0);
//   return html;
// }

// /* SALES ORDERS */
// function renderOrders() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Sales Orders</div>
//         <div class="page-subtitle">Confirmed · delivery · invoiced</div>
//       </div>
//       <div class="page-actions">
//         <button class="btn btn-primary" id="btn-new-so" data-perm="create.sales_order">${icon('plus', 16)} New SO</button>
//       </div>
//     </div>
//     <div class="card"><div class="card-body">${dataTable({
//       columns: [
//         { label: 'SO #', key: 'id', mono: true },
//         { label: 'Customer', key: 'customer' },
//         { label: 'Value', align: 'right', num: true, render: r => fmtCurrencyINR(r.value) },
//         { label: 'Date', render: r => fmtDate(r.date) },
//         { label: 'Delivery', render: r => fmtDate(r.delivery) },
//         { label: 'Status', render: r => chip(r.status === 'Delivered' || r.status === 'Invoiced' ? 'success' : 'info', r.status) },
//       ],
//       rows: db.salesOrders,
//     })}</div></div>`;
//   setTimeout(() => {
//     document.getElementById('btn-new-so')?.addEventListener('click', () => {
//       formModal({
//         title: 'New Sales Order',
//         fields: [
//           { name: 'customerId', label: 'Customer', type: 'select', required: true,
//             options: db.customers.map(c => ({ value: c.id, label: c.name })) },
//           { name: 'value', label: 'Value (₹)', type: 'number', required: true },
//           { name: 'delivery', label: 'Delivery date', type: 'date', required: true },
//           { name: 'items', label: 'Line items', type: 'number', required: true, value: '1' },
//         ],
//         submitLabel: 'Create',
//         onSubmit: (data) => {
//           const so = createSalesOrder(data);
//           logContract({ method: 'POST', path: '/api/sales-orders', body: data, response: so, role: session.role });
//           toast('Sales Order created', so.id, 'success');
//           window.dispatchEvent(new HashChangeEvent('hashchange'));
//         }
//       });
//     });
//   }, 0);
//   return html;
// }



/* ============================================================
   MODULE 2: SALES & CRM (Enterprise Suite)
   Scope Alignment: §5.2, §6.2 Order-to-Cash, Priority Screens 11, 12, 13, 14
   ============================================================ */

import { dataTable, chip, icon, toast, formModal, confirmDialog, kpiCard, stepper } from '../components.js';
import {
  db, createCustomer, createQuotation, convertQuotationToSO, createSalesOrder, moveDeal, session
} from '../state.js';
import { logContract } from '../api-contract.js';
import { fmtCurrency, fmtDate, fmtNumber } from '../format.js';

export function register(route) {
  route('sales/pipeline',   renderPipeline);
  route('sales/customers',  renderCustomers);
  route('sales/quotations', renderQuotations);
  route('sales/orders',     renderOrders);
}

/* ============================================================
   1. SALES PIPELINE & CRM KANBAN (§5.2, Screen #11)
   Stages: New → Contacted → Qualified → Proposal → Negotiation → Won / Lost
   ============================================================ */
const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won / Lost'];

function renderPipeline() {
  const totalPipelineValue = db.deals.filter(d => d.stage !== 'Won / Lost').reduce((s, d) => s + d.value, 0);
  const activeDealsCount = db.deals.filter(d => d.stage !== 'Won / Lost').length;

  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">Sales Pipeline & Opportunity CRM</div>
        <div class="page-subtitle">Visual 6-Stage Opportunity Flow · Weighted Value: <b>${fmtCurrency(totalPipelineValue)}</b> (${activeDealsCount} Active Deals)</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="window.__navigate('sales/quotations')">${icon('file-text', 16)} View Quotes</button>
        <button class="btn btn-primary" id="btn-new-deal" data-perm="create.deal">${icon('plus', 16)} New Deal</button>
      </div>
    </div>

    <!-- Live Drag & Drop CRM Kanban Board -->
    <div class="kanban" id="kanban">${renderKanbanColumns()}</div>`;

  setTimeout(bindKanbanHandlers, 0);
  return html;
}

function renderKanbanColumns() {
  return STAGES.map(stage => {
    const cards = db.deals.filter(d => d.stage === stage);
    const stageSum = cards.reduce((s, c) => s + c.value, 0);

    return `
      <div class="kanban-col" data-stage="${stage}">
        <div class="kanban-col-header" style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:2px solid var(--border)">
          <div>
            <span style="font-weight:700;font-size:13px">${stage}</span>
            <span class="kanban-col-count" style="margin-left:6px;background:var(--surface-alt);padding:2px 8px;border-radius:12px;font-size:11px">${cards.length}</span>
          </div>
          <span style="font-size:11px;font-weight:600;color:var(--text-muted)">${fmtCurrency(stageSum)}</span>
        </div>
        <div class="kanban-cards-wrap" style="padding:10px;display:flex;flex-direction:column;gap:10px;min-height:480px">
          ${cards.map(c => `
            <div class="kanban-card" draggable="true" data-id="${c.id}" style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:14px;box-shadow:var(--shadow-sm);cursor:grab">
              <div style="font-size:11px;color:var(--brand-primary);font-weight:700;margin-bottom:4px">${c.id}</div>
              <div style="font-weight:600;font-size:13px;margin-bottom:8px">${c.title}</div>
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px">
                <span style="font-weight:700;color:var(--text)">${fmtCurrency(c.value)}</span>
                <span class="chip chip-neutral" style="font-size:10px">${c.days}d in stage</span>
              </div>
              <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--text-muted)">
                <span>${icon('users', 12)} ${c.owner}</span>
                <button class="btn btn-ghost btn-sm" style="padding:2px 6px" onclick="window.__createQuoteFromDeal('${c.id}')">Quote</button>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  }).join('');
}

function bindKanbanHandlers() {
  let draggedId = null;

  document.querySelectorAll('.kanban-card').forEach(card => {
    card.addEventListener('dragstart', () => {
      draggedId = card.dataset.id;
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  });

  document.querySelectorAll('.kanban-col').forEach(col => {
    col.addEventListener('dragover', e => e.preventDefault());
    col.addEventListener('drop', e => {
      e.preventDefault();
      if (!draggedId) return;
      const targetStage = col.dataset.stage;
      const d = moveDeal(draggedId, targetStage);
      logContract({ method: 'PATCH', path: `/api/deals/${draggedId}`, body: { stage: targetStage }, response: d, role: session.role });
      toast('Stage Updated', `${d.title} moved to ${targetStage}`, 'success', 1500);
      document.getElementById('kanban').innerHTML = renderKanbanColumns();
      bindKanbanHandlers();
    });
  });

  document.getElementById('btn-new-deal')?.addEventListener('click', () => {
    formModal({
      title: 'Create Lead / Opportunity',
      fields: [
        { name: 'title', label: 'Opportunity Title', type: 'text', required: true, placeholder: 'e.g. ABC Industries · 500kW Generator Assembly' },
        { name: 'customerId', label: 'Customer Account', type: 'select', required: true, options: db.customers.map(c => ({ value: c.id, label: `${c.id} - ${c.name}` })) },
        { name: 'value', label: 'Estimated Deal Value', type: 'number', required: true, placeholder: '480000' },
        { name: 'stage', label: 'Initial Pipeline Stage', type: 'select', required: true, options: STAGES.map(s => ({ value: s, label: s })) },
      ],
      submitLabel: 'Create Deal',
      onSubmit: (data) => {
        const deal = {
          id: `D-${String(db.deals.length + 1).padStart(2, '0')}`,
          title: data.title,
          value: Number(data.value),
          owner: session.name || 'Sales Rep',
          stage: data.stage,
          customerId: data.customerId,
          days: 0,
        };
        db.deals.unshift(deal);
        logContract({ method: 'POST', path: '/api/deals', body: data, response: deal, role: session.role });
        toast('Deal Created', deal.title, 'success');
        document.getElementById('kanban').innerHTML = renderKanbanColumns();
        bindKanbanHandlers();
      }
    });
  });

  window.__createQuoteFromDeal = (dealId) => {
    const d = db.deals.find(x => x.id === dealId);
    if (!d) return;
    const q = createQuotation({
      customerId: d.customerId,
      value: d.value,
      expiry: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    });
    logContract({ method: 'POST', path: '/api/quotations', body: { dealId, customerId: d.customerId, value: d.value }, response: q, role: session.role });
    toast('Quotation Drafted', `${q.id} generated for ${q.customer}`, 'success');
    window.__navigate('sales/quotations');
  };
}

/* ============================================================
   2. CUSTOMER DIRECTORY & 360° PROFILE (§5.2, §10.4, Screen #12)
   ============================================================ */
function renderCustomers() {
  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">Customer Master & Directory</div>
        <div class="page-subtitle">Accounts · Credit Exposure Limits · Comprehensive 360° Profiles</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="alert('Export customer directory')">${icon('download', 16)} Export Accounts</button>
        <button class="btn btn-primary" id="btn-new-cust" data-perm="create.lead">${icon('plus', 16)} New Customer</button>
      </div>
    </div>

    <!-- Quick Switcher to 360 Profile View (§10.4) -->
    <div class="card" style="margin-bottom:20px;border-left:4px solid var(--brand-primary)">
      <div class="card-body" style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <b style="font-size:14px">Jump to Standardized Customer 360° Profile</b>
          <div style="font-size:12px;color:var(--text-muted)">Inspect cross-module sales orders, invoices, payments, and complaint logs</div>
        </div>
        <select class="select" id="cust-360-picker" style="max-width:320px">
          ${db.customers.map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'Customer ID', key: 'id', mono: true },
        { label: 'Company Name', key: 'name' },
        { label: 'Contact Person', key: 'contact' },
        { label: 'Email Address', key: 'email', mono: true },
        { label: 'Credit Limit', align: 'right', num: true, render: r => fmtCurrency(r.creditLimit) },
        { label: 'Total Revenue', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.revenue)}</b>` },
        { label: 'Outstanding Balance', align: 'right', num: true, render: r => `<span style="color:${r.outstanding > r.creditLimit * 0.8 ? 'var(--critical)' : 'var(--text)'}">${fmtCurrency(r.outstanding)}</span>` },
        { label: 'Status', render: r => chip(r.status === 'Active' ? 'success' : 'neutral', r.status) },
        { label: 'Actions', render: r => `<button class="btn btn-secondary btn-sm" data-view-360="${r.id}">View 360°</button>` },
      ],
      rows: db.customers,
    })}</div></div>`;

  setTimeout(() => {
    document.getElementById('cust-360-picker')?.addEventListener('change', (e) => {
      window.__navigate('views/customer-360');
    });

    document.querySelectorAll('[data-view-360]').forEach(b => {
      b.addEventListener('click', () => {
        window.__navigate('views/customer-360');
      });
    });

    document.getElementById('btn-new-cust')?.addEventListener('click', () => {
      formModal({
        title: 'Register Corporate Customer',
        fields: [
          { name: 'name', label: 'Company Legal Name', type: 'text', required: true, placeholder: 'e.g. Zenith Global Logistics' },
          { name: 'contact', label: 'Primary Contact Person', type: 'text', required: true, placeholder: 'e.g. John Doe' },
          { name: 'phone', label: 'Phone Number', type: 'text', required: true, placeholder: '+1 415 555 2671' },
          { name: 'email', label: 'Billing Email', type: 'email', required: true, placeholder: 'ap@zenith.com' },
          { name: 'gst', label: 'Tax ID / VAT / GSTIN', type: 'text', required: true, placeholder: 'US-EIN-9876543' },
          { name: 'creditLimit', label: 'Authorized Credit Limit', type: 'number', required: true, value: '5000000' },
        ],
        submitLabel: 'Save Customer',
        onSubmit: (data) => {
          const c = createCustomer(data);
          logContract({ method: 'POST', path: '/api/customers', body: data, response: c, role: session.role });
          toast('Account Registered', c.name, 'success');
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      });
    });
  }, 0);

  return html;
}

/* ============================================================
   3. QUOTATIONS & ESTIMATIONS (§5.2, Screen #13)
   ============================================================ */
function renderQuotations() {
  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">Quotations & Estimations</div>
        <div class="page-subtitle">Multi-tier Price Lists · Version History · Convert to Confirmed Sales Orders</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" id="btn-new-q" data-perm="create.quotation">${icon('plus', 16)} New Quotation</button>
      </div>
    </div>

    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'Quote #', key: 'id', mono: true },
        { label: 'Customer Account', key: 'customer' },
        { label: 'Quotation Total', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.value)}</b>` },
        { label: 'Issuance Date', render: r => fmtDate(r.date) },
        { label: 'Validity Expiry', render: r => fmtDate(r.expiry) },
        { label: 'Version', key: 'ver', mono: true },
        { label: 'State', render: r => chip(r.status === 'Accepted' ? 'success' : r.status === 'Sent' ? 'info' : r.status === 'Pending Approval' ? 'warning' : 'neutral', r.status) },
        { label: 'Actions', render: r => `
          ${r.status === 'Sent' || r.status === 'Draft' ? `<button class="btn btn-primary btn-sm" data-convert="${r.id}" data-perm="create.sales_order">Convert to SO</button>` : ''}
          ${r.status === 'Pending Approval' ? `<button class="btn btn-secondary btn-sm" data-approve-q="${r.id}">Approve</button>` : ''}
          <button class="btn btn-ghost btn-sm" data-view-q="${r.id}">View</button>
        `},
      ],
      rows: db.quotations,
    })}</div></div>`;

  setTimeout(() => {
    document.getElementById('btn-new-q')?.addEventListener('click', () => {
      formModal({
        title: 'Draft Quotation',
        fields: [
          { name: 'customerId', label: 'Customer', type: 'select', required: true, options: db.customers.map(c => ({ value: c.id, label: `${c.id} - ${c.name}` })) },
          { name: 'value', label: 'Net Quotation Total', type: 'number', required: true, placeholder: '480000' },
          { name: 'expiry', label: 'Valid Until Date', type: 'date', required: true, value: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10) },
        ],
        submitLabel: 'Create Quotation',
        onSubmit: (data) => {
          const q = createQuotation(data);
          logContract({ method: 'POST', path: '/api/quotations', body: data, response: q, role: session.role });
          toast('Quotation Created', `${q.id} drafted for ${q.customer}`, 'success');
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      });
    });

    document.querySelectorAll('[data-convert]').forEach(b => {
      b.addEventListener('click', async () => {
        const quoteId = b.dataset.convert;
        const q = db.quotations.find(x => x.id === quoteId);
        const ok = await confirmDialog({
          title: `Convert Quote ${quoteId} to Sales Order?`,
          message: `Confirming order for ${q.customer} with net value of ${fmtCurrency(q.value)}. This will trigger inventory availability verification.`,
          confirmText: 'Generate Sales Order'
        });
        if (!ok) return;
        const so = convertQuotationToSO(quoteId);
        logContract({ method: 'POST', path: '/api/sales-orders', body: { fromQuote: quoteId }, response: so, role: session.role });
        toast('Sales Order Created', `${so.id} confirmed`, 'success');
        window.__navigate('sales/orders');
      });
    });

    document.querySelectorAll('[data-view-q]').forEach(b => {
      b.addEventListener('click', () => {
        const q = db.quotations.find(x => x.id === b.dataset.viewQ);
        const modalRoot = document.getElementById('modal-root') || document.body;
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop open';
        backdrop.innerHTML = `
          <div class="modal" style="max-width:680px">
            <div class="modal-header">
              <div>
                <span class="modal-title">Quotation Summary — ${q.id}</span>
                <div style="font-size:12px;color:var(--text-muted)">Order-to-Cash Pipeline Stepper</div>
              </div>
              <button class="btn-ghost btn-icon" onclick="this.closest('.modal-backdrop').remove()">${icon('x', 16)}</button>
            </div>
            <div class="modal-body">
              ${stepper(['Lead / Oppty', 'Quotation Draft', 'Customer Acceptance', 'Sales Order', 'Invoiced'], 1)}
              <div style="margin-top:20px;padding:16px;background:var(--surface-alt);border-radius:8px;line-height:1.8;font-size:13px">
                <div style="display:flex;justify-content:space-between"><span>Customer Account:</span><b>${q.customer}</b></div>
                <div style="display:flex;justify-content:space-between"><span>Total Quoted Amount:</span><b style="font-size:16px;color:var(--brand-primary)">${fmtCurrency(q.value)}</b></div>
                <div style="display:flex;justify-content:space-between"><span>Quote Version:</span><span class="mono">${q.ver}</span></div>
                <div style="display:flex;justify-content:space-between"><span>Expiration Date:</span><span>${fmtDate(q.expiry)}</span></div>
                <div style="display:flex;justify-content:space-between"><span>Approval Status:</span>${chip(q.status === 'Accepted' ? 'success' : 'info', q.status)}</div>
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
   4. SALES ORDERS & ORDER-TO-CASH (§5.2, §6.2, Screen #14)
   ============================================================ */
function renderOrders() {
  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">Sales Orders & Fulfillment</div>
        <div class="page-subtitle">Order Confirmation · Delivery Scheduling · Automated AR Invoicing</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" id="btn-new-so" data-perm="create.sales_order">${icon('plus', 16)} New Sales Order</button>
      </div>
    </div>

    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'SO #', key: 'id', mono: true },
        { label: 'Customer Account', key: 'customer' },
        { label: 'Order Value', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.value)}</b>` },
        { label: 'Confirmed Date', render: r => fmtDate(r.date) },
        { label: 'Target Delivery', render: r => fmtDate(r.delivery) },
        { label: 'Line Items', align: 'right', num: true, key: 'items' },
        { label: 'Fulfillment State', render: r => chip(r.status === 'Delivered' || r.status === 'Invoiced' ? 'success' : r.status === 'Confirmed' ? 'info' : 'warning', r.status) },
        { label: 'Actions', render: r => `
          ${r.status === 'Confirmed' ? `<button class="btn btn-primary btn-sm" data-dispatch-so="${r.id}">Dispatch</button>` : ''}
          ${r.status === 'Delivered' ? `<button class="btn btn-success btn-sm" data-invoice-so="${r.id}">Generate Invoice</button>` : ''}
          <button class="btn btn-ghost btn-sm" data-flow-so="${r.id}">Audit Stepper</button>
        `},
      ],
      rows: db.salesOrders,
    })}</div></div>`;

  setTimeout(() => {
    document.getElementById('btn-new-so')?.addEventListener('click', () => {
      formModal({
        title: 'New Confirmed Sales Order',
        fields: [
          { name: 'customerId', label: 'Customer Account', type: 'select', required: true, options: db.customers.map(c => ({ value: c.id, label: `${c.id} - ${c.name}` })) },
          { name: 'value', label: 'Order Value', type: 'number', required: true, placeholder: '480000' },
          { name: 'delivery', label: 'Committed Delivery Date', type: 'date', required: true, value: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) },
          { name: 'items', label: 'Number of Line Items', type: 'number', required: true, value: '3' },
        ],
        submitLabel: 'Create Sales Order',
        onSubmit: (data) => {
          const so = createSalesOrder(data);
          logContract({ method: 'POST', path: '/api/sales-orders', body: data, response: so, role: session.role });
          toast('Sales Order Created', `${so.id} registered in fulfillment queue`, 'success');
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      });
    });

    document.querySelectorAll('[data-dispatch-so]').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.dataset.dispatchSo;
        const so = db.salesOrders.find(s => s.id === id);
        const ok = await confirmDialog({
          title: `Dispatch Sales Order ${id}?`,
          message: `Goods will be picked, packed, and transferred out of warehouse inventory. Delivery status will flip to Delivered.`
        });
        if (!ok) return;
        so.status = 'Delivered';
        logContract({ method: 'PATCH', path: `/api/sales-orders/${id}/dispatch`, role: session.role });
        toast('Order Dispatched', `${id} marked Delivered`, 'success');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });

    document.querySelectorAll('[data-invoice-so]').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.dataset.invoiceSo;
        const so = db.salesOrders.find(s => s.id === id);
        const invId = `INV-${3000 + db.customerInvoices.length + 1}`;
        const newInv = {
          id: invId,
          customerId: so.customerId,
          customer: so.customer,
          amount: so.value,
          due: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          status: 'Pending',
        };
        db.customerInvoices.unshift(newInv);
        so.status = 'Invoiced';
        logContract({ method: 'POST', path: '/api/customer-invoices', body: { soId: id, ...newInv }, response: newInv, role: session.role });
        toast('Invoice Generated', `${invId} created and routed to Accounts Receivable`, 'success');
        window.__navigate('finance/ar');
      });
    });

    document.querySelectorAll('[data-flow-so]').forEach(b => {
      b.addEventListener('click', () => {
        const so = db.salesOrders.find(s => s.id === b.dataset.flowSo);
        const modalRoot = document.getElementById('modal-root') || document.body;
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop open';
        backdrop.innerHTML = `
          <div class="modal" style="max-width:720px">
            <div class="modal-header">
              <div>
                <span class="modal-title">Order-to-Cash Workflow Audit — ${so.id}</span>
                <div style="font-size:12px;color:var(--text-muted)">Visual end-to-end audit tracking (§6.2)</div>
              </div>
              <button class="btn-ghost btn-icon" onclick="this.closest('.modal-backdrop').remove()">${icon('x', 16)}</button>
            </div>
            <div class="modal-body">
              ${stepper(
                ['Opportunity', 'Quotation', 'Sales Order', 'Inventory Picking', 'Dispatched', 'AR Invoiced', 'Cash Settled'],
                so.status === 'Invoiced' ? 5 : so.status === 'Delivered' ? 4 : 2
              )}
              <div style="margin-top:24px;padding:16px;background:var(--surface-alt);border-radius:8px;font-size:13px;line-height:1.8">
                <div style="display:flex;justify-content:space-between"><span>Linked Customer:</span><b>${so.customer}</b></div>
                <div style="display:flex;justify-content:space-between"><span>Contract Order Value:</span><b style="color:var(--brand-primary);font-size:16px">${fmtCurrency(so.value)}</b></div>
                <div style="display:flex;justify-content:space-between"><span>Delivery Target:</span><span>${fmtDate(so.delivery)}</span></div>
                <div style="display:flex;justify-content:space-between"><span>Line Items Count:</span><span class="num">${so.items}</span></div>
                <div style="display:flex;justify-content:space-between"><span>Current Lifecycle State:</span>${chip('info', so.status)}</div>
              </div>
            </div>
          </div>`;
        modalRoot.appendChild(backdrop);
      });
    });
  }, 0);

  return html;
}