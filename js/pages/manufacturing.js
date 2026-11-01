import { dataTable, chip, icon, toast, formModal, confirmDialog } from '../components.js';
import {
  db, createProductionOrder, releaseProductionOrder, completeProductionOrder
} from '../state.js';
import { logContract } from '../api-contract.js';
import { fmtNumber, fmtDate } from '../format.js';

export function register(route) {
  route('manufacturing/bom',        renderBOM);
  route('manufacturing/production', renderProduction);
  route('manufacturing/wc',         renderWC);
  route('manufacturing/capacity',   renderCapacity);
}

// function renderBOM() {
//   const html = `
//     <div class="page-header">
//       <div><div class="page-title">Bill of Materials</div><div class="page-subtitle">Multi-level BOM · versioning</div></div>
//       <div class="page-actions"><button class="btn btn-primary" id="btn-new-bom" data-perm="create.bom">${icon('plus', 16)} New BOM</button></div>
//     </div>
//     <div class="card"><div class="card-body">${dataTable({
//       columns: [
//         { label: 'BOM #', key: 'id', mono: true },
//         { label: 'Product', key: 'product' },
//         { label: 'Levels', align: 'right', num: true, key: 'level' },
//         { label: 'Components', align: 'right', num: true, key: 'components' },
//         { label: 'Version', key: 'ver', mono: true },
//         { label: 'Effective', render: r => fmtDate(r.effective) },
//         { label: 'Status', render: r => chip(r.status === 'Active' ? 'success' : 'warning', r.status) },
//       ],
//       rows: db.boms,
//     })}</div></div>`;
//   setTimeout(() => {
//     document.getElementById('btn-new-bom')?.addEventListener('click', () => {
//       formModal({
//         title: 'New BOM',
//         fields: [
//           { name: 'product', label: 'Product name', type: 'text', required: true },
//           { name: 'level', label: 'Levels', type: 'number', required: true, value: '2' },
//           { name: 'components', label: 'Components', type: 'number', required: true, value: '5' },
//           { name: 'effective', label: 'Effective date', type: 'date', required: true, value: new Date().toISOString().slice(0,10) },
//         ],
//         submitLabel: 'Create BOM',
//         onSubmit: (data) => {
//           const bom = { id: `BOM-${String(db.boms.length + 1).padStart(3, '0')}`, product: data.product, level: Number(data.level), components: Number(data.components), ver: 'v1', effective: data.effective, status: 'Active' };
//           db.boms.unshift(bom);
//           logContract({ method: 'POST', path: '/api/boms', body: data, response: bom, role: window.__session.role });
//           toast('BOM created', bom.id, 'success');
//           window.dispatchEvent(new HashChangeEvent('hashchange'));
//         }
//       });
//     });
//   }, 0);
//   return html;
// }


function renderBOM() {
  return `
    <div class="page-header">
      <div><div class="page-title">Bill of Materials</div><div class="page-subtitle">Visual Multi-level BOM</div></div>
    </div>
    
    <div class="card">
      <div class="card-header"><div class="card-title">Pump Assembly A (FG-PUMP)</div></div>
      <div class="card-body" style="font-family:var(--font-mono);font-size:13px">
        ${db.bomTree.map(n => `
          <div style="display:flex;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
            <div style="width:${n.level * 32}px;flex-shrink:0"></div>
            ${n.level > 0 ? `<span style="color:var(--text-faint);margin-right:8px">└─</span>` : ''}
            <span style="color:var(--brand-primary);font-weight:600;margin-right:12px">${n.code}</span>
            <span style="flex:1">${n.name}</span>
            <span style="font-weight:600;background:var(--surface-alt);padding:2px 8px;border-radius:4px">${n.qty} ${n.uom}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
}


function renderProduction() {
  const html = `
    <div class="page-header">
      <div><div class="page-title">Production Orders</div><div class="page-subtitle">Planned → In Progress → Completed</div></div>
      <div class="page-actions"><button class="btn btn-primary" id="btn-new-prod" data-perm="create.production_order">${icon('plus', 16)} New Order</button></div>
    </div>
    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'Order', key: 'id', mono: true },
        { label: 'Product', key: 'product' },
        { label: 'Qty', align: 'right', num: true, key: 'qty' },
        { label: 'Progress', render: r => `<div class="progress" style="width:100px"><div class="progress-bar ${r.progress === 100 ? 'success' : ''}" style="width:${r.progress}%"></div></div>` },
        { label: 'Due', render: r => fmtDate(r.due) },
        { label: 'Status', render: r => chip(r.status === 'Completed' ? 'success' : r.status === 'In Progress' ? 'info' : 'neutral', r.status) },
        { label: 'Actions', render: r => `
            ${r.status === 'Planned'     ? `<button class="btn btn-primary btn-sm" data-release="${r.id}" data-perm="approve.production_order">Release</button>` : ''}
            ${r.status === 'In Progress' ? `<button class="btn btn-success btn-sm" data-complete="${r.id}" data-perm="approve.production_order">Complete</button>` : ''}
        ` },
      ],
      rows: db.productionOrders,
    })}</div></div>`;
  setTimeout(() => {
    document.getElementById('btn-new-prod')?.addEventListener('click', () => {
      formModal({
        title: 'New Production Order',
        fields: [
          { name: 'product', label: 'Product', type: 'text', required: true },
          { name: 'qty', label: 'Quantity', type: 'number', required: true },
          { name: 'due', label: 'Due date', type: 'date', required: true },
        ],
        submitLabel: 'Create',
        onSubmit: (data) => {
          const po = createProductionOrder(data);
          logContract({ method: 'POST', path: '/api/production-orders', body: data, response: po, role: window.__session.role });
          toast('Order created', po.id, 'success');
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      });
    });
    document.querySelectorAll('[data-release]').forEach(b => {
      b.addEventListener('click', async () => {
        const ok = await confirmDialog({ title: 'Release order?', message: 'Material reservation will be triggered.' });
        if (!ok) return;
        const po = releaseProductionOrder(b.dataset.release);
        logContract({ method: 'PATCH', path: `/api/production-orders/${po.id}/release`, role: window.__session.role });
        toast('Order released', po.id, 'success');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });
    document.querySelectorAll('[data-complete]').forEach(b => {
      b.addEventListener('click', async () => {
        const ok = await confirmDialog({ title: 'Mark complete?', message: 'Finished goods will be added to stock.' });
        if (!ok) return;
        const po = completeProductionOrder(b.dataset.complete);
        logContract({ method: 'PATCH', path: `/api/production-orders/${po.id}/complete`, role: window.__session.role });
        toast('Completed', `${po.id} → FG receipt`, 'success');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });
  }, 0);
  return html;
}

function renderWC() {
  return `
    <div class="page-header"><div><div class="page-title">Work Centers</div><div class="page-subtitle">Capacity · utilization</div></div></div>
    <div class="grid grid-3">
      ${db.workCenters.map(w => {
        const pct = Math.round(w.used / w.capacity * 100);
        const lvl = pct >= 90 ? 'critical' : pct >= 75 ? 'warning' : 'success';
        return `
          <div class="kpi">
            <div class="kpi-header"><span class="kpi-label">${w.id} · ${w.name}</span>${chip(lvl, `${pct}%`)}</div>
            <div style="margin-top:8px;font-size:13px" class="num">${w.used} / ${w.capacity} hrs</div>
            <div class="progress" style="margin-top:8px"><div class="progress-bar ${lvl}" style="width:${pct}%"></div></div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:6px" class="num">₹${w.rate}/hr</div>
          </div>`;
      }).join('')}
    </div>`;
}

function renderCapacity() {
  return `
    <div class="page-header"><div><div class="page-title">Capacity Planning</div><div class="page-subtitle">Available · Planned · Overload</div></div></div>
    
    <div style="display:flex;gap:16px;margin-bottom:20px;font-size:12px">
      <div style="display:flex;align-items:center;gap:6px"><div style="width:12px;height:12px;background:var(--chart-1);border-radius:2px"></div>Available</div>
      <div style="display:flex;align-items:center;gap:6px"><div style="width:12px;height:12px;background:var(--chart-2);border-radius:2px"></div>Planned</div>
      <div style="display:flex;align-items:center;gap:6px"><div style="width:12px;height:12px;background:var(--critical);border-radius:2px"></div>Overload</div>
    </div>

    <div class="card">
      <div class="card-body">
        ${db.workCenters.map(w => {
          const total = 100; // scale to 100%
          const plannedPct = Math.min(100, (w.used / w.capacity) * 100);
          const availPct = 100 - plannedPct;
          const overloadPct = w.used > w.capacity ? ((w.used - w.capacity) / w.capacity) * 100 : 0;
          
          return `
            <div style="margin-bottom:24px">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px">
                <b>${w.id} · ${w.name}</b>
                <span class="num">${w.used} / ${w.capacity} hrs</span>
              </div>
              <!-- The 3 Stacked Bars -->
              <div style="display:flex;height:24px;border-radius:6px;overflow:hidden;background:var(--surface-alt);position:relative">
                <div style="width:${availPct}%;background:var(--chart-1);transition:width 0.3s"></div>
                <div style="width:${plannedPct}%;background:var(--chart-2);transition:width 0.3s"></div>
                ${overloadPct > 0 ? `<div style="width:${overloadPct}%;background:var(--critical);transition:width 0.3s;position:absolute;right:0;top:0;bottom:0;opacity:0.8"></div>` : ''}
              </div>
              <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:11px;color:var(--text-muted)">
                <span>Available: ${w.capacity - w.used} hrs</span>
                ${overloadPct > 0 ? `<span style="color:var(--critical);font-weight:600">OVERLOADED by ${w.used - w.capacity} hrs</span>` : `<span>Planned: ${w.used} hrs</span>`}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}