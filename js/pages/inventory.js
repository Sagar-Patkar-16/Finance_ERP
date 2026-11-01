// import { dataTable, chip, icon, toast, formModal, confirmDialog } from '../components.js';
// import { db, adjustStock, transferStock, session } from '../state.js';
// import { logContract } from '../api-contract.js';
// import { fmtCurrencyINR, fmtNumber, fmtDate } from '../format.js';

// export function register(route) {
//   route('inventory/items',      renderItems);
//   route('inventory/barcode',    renderBarcode);
//   route('inventory/warehouses', renderWarehouses);
// }

// function renderItems() {
//   const html = `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Items & Stock</div>
//         <div class="page-subtitle">On-hand · safety stock · valuation</div>
//       </div>
//       <div class="page-actions">
//         <button class="btn btn-primary" id="btn-adjust" data-perm="create.stock_adjust">${icon('plus', 16)} Adjust Stock</button>
//       </div>
//     </div>
//     <div class="card"><div class="card-body">${dataTable({
//       columns: [
//         { label: 'Code', key: 'code', mono: true },
//         { label: 'Name', key: 'name' },
//         { label: 'Category', key: 'category' },
//         { label: 'On Hand', align: 'right', num: true, render: r => {
//             const below = r.stock < r.safety;
//             return `<span style="${below ? 'color:var(--critical);font-weight:600' : ''}">${fmtNumber(r.stock)} ${r.uom}</span>`;
//         }},
//         { label: 'Safety', align: 'right', num: true, render: r => fmtNumber(r.safety) },
//         { label: 'Value', align: 'right', num: true, render: r => fmtCurrencyINR(r.value) },
//         { label: 'Status', render: r => r.stock < r.safety ? chip('critical', 'Below safety') : chip('success', 'OK') },
//         { label: 'Actions', render: r => `
//             <button class="btn btn-ghost btn-sm" data-adjust="${r.code}">Adjust</button>
//             <button class="btn btn-ghost btn-sm" data-transfer="${r.code}">Transfer</button>
//         ` },
//       ],
//       rows: db.items,
//     })}</div></div>`;
//   setTimeout(() => {
//     document.getElementById('btn-adjust')?.addEventListener('click', () => openAdjustModal());
//     document.querySelectorAll('[data-adjust]').forEach(b => b.addEventListener('click', () => openAdjustModal(b.dataset.adjust)));
//     document.querySelectorAll('[data-transfer]').forEach(b => b.addEventListener('click', () => openTransferModal(b.dataset.transfer)));
//   }, 0);
//   return html;
// }

// function openAdjustModal(preCode) {
//   formModal({
//     title: 'Adjust Stock',
//     fields: [
//       { name: 'itemCode', label: 'Item', type: 'select', required: true, value: preCode || '',
//         options: db.items.map(i => ({ value: i.code, label: `${i.code} — ${i.name}` })) },
//       { name: 'delta', label: 'Adjustment (+/−)', type: 'number', required: true, placeholder: 'e.g. 25 or -12' },
//       { name: 'reason', label: 'Reason', type: 'text', required: true, placeholder: 'Cycle count variance' },
//     ],
//     submitLabel: 'Post Adjustment',
//     onSubmit: (data) => {
//       const item = adjustStock(data.itemCode, data.delta, data.reason);
//       logContract({ method: 'POST', path: '/api/inventory/adjust', body: data, response: { code: item.code, stock: item.stock }, role: session.role });
//       toast('Stock adjusted', `${item.name} → ${item.stock} ${item.uom}`, 'success');
//       window.dispatchEvent(new HashChangeEvent('hashchange'));
//     }
//   });
// }

// function openTransferModal(preCode) {
//   formModal({
//     title: 'Transfer Stock',
//     fields: [
//       { name: 'itemCode', label: 'Item', type: 'select', required: true, value: preCode || '',
//         options: db.items.map(i => ({ value: i.code, label: `${i.code} — ${i.name}` })) },
//       { name: 'fromBin', label: 'From bin', type: 'text', required: true, value: 'A-12-B-01' },
//       { name: 'toBin', label: 'To bin', type: 'text', required: true, value: 'A-13-B-01' },
//       { name: 'qty', label: 'Quantity', type: 'number', required: true },
//     ],
//     submitLabel: 'Transfer',
//     onSubmit: (data) => {
//       transferStock(data.itemCode, data.fromBin, data.toBin, data.qty);
//       logContract({ method: 'POST', path: '/api/inventory/transfer', body: data, response: { ok: true }, role: session.role });
//       toast('Transfer complete', `${data.qty} ${data.itemCode} from ${data.fromBin} → ${data.toBin}`, 'success');
//     }
//   });
// }

// function renderBarcode() {
//   return `
//     <div class="page-header">
//       <div>
//         <div class="page-title">Barcode / QR</div>
//         <div class="page-subtitle">Scan · lookup · pick</div>
//       </div>
//     </div>
//     <div class="grid grid-2">
//       <div class="card">
//         <div class="card-header"><div class="card-title">Scanner</div></div>
//         <div class="card-body">
//           <div class="field">
//             <label>Enter code manually</label>
//             <div style="display:flex;gap:8px">
//               <input class="input mono" id="bc-input" placeholder="e.g. IT-100">
//               <button class="btn btn-primary" id="bc-lookup">Lookup</button>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div class="card">
//         <div class="card-header"><div class="card-title">Result</div></div>
//         <div class="card-body" id="bc-result">
//           <div class="empty"><div class="empty-title">Scan a code to see details</div></div>
//         </div>
//       </div>
//     </div>`;
// }

// document.addEventListener('route-rendered', (e) => {
//   if (e.detail.path !== 'inventory/barcode') return;
//   document.getElementById('bc-lookup')?.addEventListener('click', () => {
//     const code = document.getElementById('bc-input').value.trim().toUpperCase();
//     const item = db.items.find(i => i.code === code);
//     if (!item) { toast('Not found', `No item matches ${code}`, 'error'); return; }
//     document.getElementById('bc-result').innerHTML = `
//       <div style="display:grid;gap:12px">
//         <div><div class="text-muted" style="font-size:11px;text-transform:uppercase">Item</div><div style="font-weight:600">${item.code} · ${item.name}</div></div>
//         <div><div class="text-muted" style="font-size:11px;text-transform:uppercase">On Hand</div><div style="font-weight:600;font-size:20px">${item.stock} ${item.uom}</div></div>
//         <div>${item.stock < item.safety ? chip('critical', 'Below safety') : chip('success', 'In stock')}</div>
//         <div style="display:flex;gap:8px">
//           <button class="btn btn-primary btn-sm" onclick="alert('Pick recorded')">Pick</button>
//           <button class="btn btn-secondary btn-sm" onclick="alert('Adjustment opened')">Adjust</button>
//         </div>
//       </div>`;
//     logContract({ method: 'GET', path: `/api/items/${code}/lookup`, response: item, role: session.role });
//   });
// });

// function renderWarehouses() {
//   const bins = [
//     { code: 'A-12-B-01', item: 'Steel Plate 5mm', qty: 80, cap: 500, level: 'warning' },
//     { code: 'A-12-B-02', item: 'Aluminium Sheet', qty: 420, cap: 500, level: 'success' },
//     { code: 'A-12-B-03', item: 'Bearing SKF-6205', qty: 45, cap: 200, level: 'critical' },
//     { code: 'A-13-B-01', item: 'Motor 5HP', qty: 12, cap: 50, level: 'warning' },
//   ];
//   return `
//     <div class="page-header"><div><div class="page-title">Warehouses / Bins</div><div class="page-subtitle">Company → Warehouse → Zone → Rack → Shelf → Bin</div></div></div>
//     <div class="grid grid-4">
//       ${bins.map(b => `
//         <div class="kpi">
//           <div class="kpi-header"><span class="kpi-label">${b.code}</span>${chip(b.level, b.level === 'success' ? 'Healthy' : b.level === 'warning' ? 'Low' : 'Critical')}</div>
//           <div style="font-size:13px;font-weight:600;margin:4px 0">${b.item}</div>
//           <div class="progress"><div class="progress-bar ${b.level}" style="width:${(b.qty/b.cap)*100}%"></div></div>
//           <div style="font-size:12px;color:var(--text-muted);margin-top:4px">${b.qty} / ${b.cap}</div>
//         </div>`).join('')}
//     </div>`;
// }





/* ============================================================
   MODULE 4: INVENTORY & WAREHOUSE (Enterprise Suite)
   Scope Alignment: §5.4, Priority Screens 19, 20, 21
   ============================================================ */

import { dataTable, chip, icon, toast, formModal, confirmDialog, kpiCard } from '../components.js';
import { db, adjustStock, transferStock, session } from '../state.js';
import { logContract } from '../api-contract.js';
import { fmtCurrency, fmtDate, fmtNumber } from '../format.js';

export function register(route) {
  route('inventory/dashboard',  renderInventoryDashboard);
  route('inventory/items',      renderItems);
  route('inventory/warehouses', renderWarehouses);
  route('inventory/movements',  renderStockMovements);
  route('inventory/barcode',    renderBarcodeTerminal);
}

/* ============================================================
   1. INVENTORY COMMAND DASHBOARD (Screen #19)
   ============================================================ */
function renderInventoryDashboard() {
  const totalValuation = db.items.reduce((s, i) => s + (i.value || 0), 0);
  const belowSafety = db.items.filter(i => i.stock < i.safety);
  const totalStockUnits = db.items.reduce((s, i) => s + (i.stock || 0), 0);
  const warehouseCount = (db.warehouses || []).length;

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Inventory & Logistics Command Hub</div>
        <div class="page-subtitle">Real-Time Stock Valuation · Safety Stock Monitoring · Warehouse Capacity (§5.4)</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="window.__navigate('inventory/movements')">${icon('refresh-cw', 16)} Stock Movements</button>
        <button class="btn btn-primary" onclick="window.__navigate('inventory/items')">${icon('package', 16)} Item Master</button>
      </div>
    </div>

    <div class="grid grid-kpi">
      ${kpiCard({ label: 'Total Inventory Valuation', value: totalValuation, delta: 2.4, icon: 'dollar-sign' })}
      <div class="kpi">
        <div class="kpi-header"><span class="kpi-label">Stockout Risk Alerts</span><span class="kpi-icon">${icon('alert-circle', 16)}</span></div>
        <div class="kpi-value" style="color:${belowSafety.length > 0 ? 'var(--critical)' : 'var(--success)'}">${belowSafety.length} SKUs</div>
        <div class="kpi-delta down">${icon('alert-triangle', 12)} Below configured safety stock</div>
      </div>
      <div class="kpi">
        <div class="kpi-header"><span class="kpi-label">Total Stock Units</span><span class="kpi-icon">${icon('package', 16)}</span></div>
        <div class="kpi-value">${fmtNumber(totalStockUnits)} Units</div>
        <div class="kpi-delta flat">${icon('info', 12)} Across 5 active product classes</div>
      </div>
      <div class="kpi">
        <div class="kpi-header"><span class="kpi-label">Active Warehouse Facilities</span><span class="kpi-icon">${icon('building', 16)}</span></div>
        <div class="kpi-value">${warehouseCount} Hubs</div>
        <div class="kpi-delta up">${icon('check-circle', 12)} Average 68% space utilization</div>
      </div>
    </div>

    <div class="grid grid-charts" style="margin-top:24px">
      <!-- Valuation by Item Category -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Inventory Valuation Distribution</div>
          <div class="card-subtitle">Raw Materials vs Precision Components</div>
        </div>
        <div class="card-body" style="height:280px"><canvas id="invValuationChart"></canvas></div>
      </div>

      <!-- Critical Shortages Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Safety Stock Replenishment Triggers</div>
          <div class="card-subtitle">Items requiring immediate Purchase Requisitions</div>
        </div>
        <div class="card-body">
          ${belowSafety.length === 0 ? '<div class="text-muted" style="padding:20px;text-align:center">All item inventory healthy</div>' : ''}
          ${belowSafety.map(i => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)">
              <div>
                <b style="font-size:14px">${i.code} — ${i.name}</b>
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
                  On Hand: <span style="color:var(--critical);font-weight:700">${fmtNumber(i.stock)} ${i.uom}</span> (Min Safety: ${i.safety} ${i.uom})
                </div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="window.__quickPRFromInv('${i.code}')">
                Raise PR
              </button>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

document.addEventListener('route-rendered', (e) => {
  if (e.detail.path !== 'inventory/dashboard') return;
  const canvas = document.getElementById('invValuationChart');
  if (!canvas || !window.Chart) return;
  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Raw Materials', 'Precision Components'],
      datasets: [{
        data: [1310000, 495000],
        backgroundColor: ['#4F46E5', '#06B6D4'],
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

  window.__quickPRFromInv = (code) => {
    toast('Triggering Sourcing', `Opening Purchase Requisition for ${code}`, 'info');
    window.__navigate('purchasing/prs');
  };
});

/* ============================================================
   2. ITEM MASTER REGISTER (§5.4)
   ============================================================ */
function renderItems() {
  const html = `
    <div class="page-header">
      <div>
        <div class="page-title">Item Master Register & Valuation</div>
        <div class="page-subtitle">On-Hand Inventory · Safety Thresholds · Reorder Points · Valuations</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="window.__navigate('views/item-360')">${icon('layers', 16)} Item 360° Profile</button>
        <button class="btn btn-primary" id="btn-adjust-inv" data-perm="create.stock_adjust">${icon('plus', 16)} Adjust Stock</button>
      </div>
    </div>

    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'Item Code', key: 'code', mono: true },
        { label: 'Material Description', key: 'name' },
        { label: 'Category', key: 'category' },
        { label: 'On Hand', align: 'right', num: true, render: r => {
          const below = r.stock < r.safety;
          return `<span style="font-weight:700;color:${below ? 'var(--critical)' : 'var(--text)'}">${fmtNumber(r.stock)} ${r.uom}</span>`;
        }},
        { label: 'Safety Stock', align: 'right', num: true, render: r => `${fmtNumber(r.safety)} ${r.uom}` },
        { label: 'Reorder Level', align: 'right', num: true, render: r => `${fmtNumber(r.reorder)} ${r.uom}` },
        { label: 'Inventory Valuation', align: 'right', num: true, render: r => `<b>${fmtCurrency(r.value)}</b>` },
        { label: 'Status', render: r => r.stock < r.safety ? chip('critical', 'Below Safety') : chip('success', 'In Stock') },
        { label: 'Actions', render: r => `
          <button class="btn btn-secondary btn-sm" data-quick-360="${r.code}">360°</button>
          <button class="btn btn-ghost btn-sm" data-adjust-btn="${r.code}">Adjust</button>
        `},
      ],
      rows: db.items,
    })}</div></div>`;

  setTimeout(() => {
    document.querySelectorAll('[data-quick-360]').forEach(b => {
      b.onclick = () => {
        window.__selectedItemCode = b.dataset.quick360;
        window.__navigate('views/item-360');
      };
    });

    document.querySelectorAll('[data-adjust-btn]').forEach(b => {
      b.onclick = () => openAdjustModal(b.dataset.adjustBtn);
    });

    document.getElementById('btn-adjust-inv')?.addEventListener('click', () => openAdjustModal());
  }, 0);

  return html;
}

function openAdjustModal(preCode) {
  formModal({
    title: 'Post Inventory Physical Adjustment',
    fields: [
      { name: 'itemCode', label: 'Material Item', type: 'select', required: true, value: preCode || '',
        options: db.items.map(i => ({ value: i.code, label: `${i.code} — ${i.name} (Current: ${i.stock} ${i.uom})` })) },
      { name: 'delta', label: 'Stock Adjustment Delta (+/-)', type: 'number', required: true, placeholder: 'e.g. 25 or -10' },
      { name: 'reason', label: 'Reason for Adjustment', type: 'select', required: true, options: [
        { value: 'Cycle count physical variance', label: 'Cycle count physical count variance' },
        { value: 'Damaged during material handling', label: 'Damaged during material handling' },
        { value: 'Scrap return from manufacturing', label: 'Scrap return from manufacturing' },
      ]},
    ],
    submitLabel: 'Record Adjustment to GL',
    onSubmit: (data) => {
      const item = adjustStock(data.itemCode, data.delta, data.reason);
      logContract({ method: 'POST', path: '/api/inventory/adjust', body: data, response: { code: item.code, stock: item.stock }, role: session.role });
      toast('Stock Adjusted', `${item.name} updated to ${item.stock} ${item.uom}`, 'success');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  });
}

/* ============================================================
   3. WAREHOUSE HIERARCHY & BIN MAP (§5.4, Screen #20)
   Company → Warehouse → Zone → Rack → Shelf → Bin
   ============================================================ */
function renderWarehouses() {
  const bins = [
    { code: 'A-12-B-01', item: 'Steel Plate 5mm', qty: 80, cap: 500, zone: 'ZONE-A', status: 'Optimal' },
    { code: 'A-12-B-02', item: 'Aluminium Sheet', qty: 420, cap: 500, zone: 'ZONE-A', status: 'Nearing Full' },
    { code: 'A-12-B-03', item: 'Bearing SKF-6205', qty: 45, cap: 200, zone: 'ZONE-B', status: 'Low Capacity' },
    { code: 'A-13-B-01', item: 'Motor 5HP', qty: 12, cap: 50, zone: 'ZONE-B', status: 'Optimal' },
    { code: 'B-01-A-01', item: 'Copper Wire 2mm', qty: 1200, cap: 2000, zone: 'ZONE-C', status: 'Optimal' },
    { code: 'B-01-A-02', item: 'Finished Pump Assembly A', qty: 50, cap: 100, zone: 'ZONE-C', status: 'Optimal' },
  ];

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Warehouse Infrastructure & Bin Management</div>
        <div class="page-subtitle">Multi-Tier Hierarchy: Company → Warehouse → Zone → Rack → Shelf → Bin (§5.4)</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="alert('Warehouse layout reconfiguration modal')">${icon('settings', 16)} Configure Racks</button>
      </div>
    </div>

    <!-- Active Facilities Overview -->
    <div class="grid grid-2" style="margin-bottom:24px">
      ${(db.warehouses || []).map(wh => `
        <div class="card" style="border-left:4px solid var(--brand-primary)">
          <div class="card-header">
            <div>
              <span class="card-title">${wh.name}</span>
              <div style="font-size:12px;color:var(--text-muted)">${wh.code} · ${wh.loc}</div>
            </div>
            <span class="chip chip-success">Operational</span>
          </div>
          <div class="card-body">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
              <span>Overall Volumetric Utilization:</span><b>${wh.utilizedPct}% of ${fmtNumber(wh.capacityM3)} m³</b>
            </div>
            <div class="progress" style="height:10px">
              <div class="progress-bar ${wh.utilizedPct >= 85 ? 'critical' : 'success'}" style="width:${wh.utilizedPct}%"></div>
            </div>
            <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
              ${wh.zones.map(z => `<span class="chip chip-neutral" style="font-size:11px">${z.code}: ${z.name}</span>`).join('')}
            </div>
          </div>
        </div>`).join('')}
    </div>

    <!-- Visual Bin Map Grid -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Live Bin Space Utilization & Material Staging</div>
        <div class="card-subtitle">Real-time status of active pick and put-away storage locations</div>
      </div>
      <div class="card-body" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">
        ${bins.map(b => {
          const pct = Math.round((b.qty / b.cap) * 100);
          const level = pct >= 80 ? 'warning' : pct <= 25 ? 'info' : 'success';

          return `
            <div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:10px;padding:16px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <span class="mono" style="font-weight:700;font-size:14px;color:var(--brand-primary)">${b.code}</span>
                <span class="chip chip-neutral" style="font-size:11px">${b.zone}</span>
              </div>
              <div style="font-size:13px;font-weight:600;margin-bottom:8px">${b.item}</div>
              <div class="progress" style="height:8px">
                <div class="progress-bar ${level}" style="width:${pct}%"></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-top:8px">
                <span>Stored: <b>${b.qty}</b></span>
                <span>Max: <b>${b.cap} units</b> (${pct}%)</span>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

/* ============================================================
   4. STOCK MOVEMENTS REGISTER (§5.4, Screen #21)
   ============================================================ */
function renderStockMovements() {
  return `
    <div class="page-header">
      <div>
        <div class="page-title">Stock Movements & Transfer Audit</div>
        <div class="page-subtitle">Comprehensive Material Transaction Ledger: Inbound, Production Issues, Bin Transfers (§5.4)</div>
      </div>
    </div>

    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'Movement #', key: 'id', mono: true },
        { label: 'Date', render: r => fmtDate(r.date) },
        { label: 'Transaction Type', render: r => chip(r.type.includes('Receipt') ? 'success' : r.type.includes('Issue') ? 'info' : 'neutral', r.type) },
        { label: 'Material', key: 'item' },
        { label: 'Quantity', align: 'right', num: true, render: r => `<b>${r.qty > 0 ? '+' : ''}${fmtNumber(r.qty)}</b>` },
        { label: 'Source Bin / Origin', key: 'from' },
        { label: 'Destination / Destination Bin', key: 'to', mono: true },
        { label: 'Document Ref', key: 'ref', mono: true },
        { label: 'Operator User', key: 'user' },
      ],
      rows: db.stockMovements || [],
      empty: 'No recorded stock movements.',
    })}</div></div>`;
}

/* ============================================================
   5. BARCODE / QR SCANNING TERMINAL (§5.4)
   ============================================================ */
function renderBarcodeTerminal() {
  return `
    <div class="page-header">
      <div>
        <div class="page-title">Barcode & QR Mobile Scanner Terminal</div>
        <div class="page-subtitle">Instant Item Lookup · Bin Pick Confirmation · Rapid Put-Away (§5.4)</div>
      </div>
    </div>

    <div class="grid grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">Scanner Input</div></div>
        <div class="card-body">
          <div style="border:2px dashed var(--border-strong);border-radius:12px;padding:36px 20px;text-align:center;background:var(--surface-alt)">
            <div style="font-size:44px;color:var(--brand-primary);margin-bottom:8px">⌗</div>
            <div style="font-weight:700;font-size:16px">Camera / Hardware Laser Ready</div>
            <div class="text-muted" style="font-size:13px;margin:8px 0 16px">Point scanner at QR code or SKU barcode label</div>
            <button class="btn btn-primary" onclick="toast('Scanner Hardware', 'Active listening on camera / Bluetooth scanner', 'info')">
              Activate Camera Scan
            </button>
          </div>
          <div class="field" style="margin-top:20px">
            <label>Or enter barcode/SKU manually</label>
            <div style="display:flex;gap:8px">
              <input class="input mono" id="bc-terminal-code" placeholder="e.g. IT-100 or BATCH-2026-08-15">
              <button class="btn btn-primary" id="btn-bc-terminal-lookup">Lookup</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Scan Verification Result</div></div>
        <div class="card-body" id="bc-terminal-result">
          <div class="empty">
            <div class="empty-title">Awaiting Scanner Input</div>
            <div class="empty-desc">Enter code or scan label to pull inventory live profile.</div>
          </div>
        </div>
      </div>
    </div>`;
}

document.addEventListener('route-rendered', (e) => {
  if (e.detail.path !== 'inventory/barcode') return;
  document.getElementById('btn-bc-terminal-lookup')?.addEventListener('click', () => {
    const code = document.getElementById('bc-terminal-code').value.trim().toUpperCase();
    const item = db.items.find(i => i.code === code);
    const container = document.getElementById('bc-terminal-result');

    if (!item) {
      toast('Item Not Found', `No item record matches ${code}`, 'error');
      container.innerHTML = '<div class="empty"><div class="empty-title">Item not found in master catalog</div></div>';
      return;
    }

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div>
          <div class="text-muted" style="font-size:11px;text-transform:uppercase">Identified Material</div>
          <div style="font-weight:700;font-size:18px">${item.code} — ${item.name}</div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:12px;background:var(--surface-alt);border-radius:8px">
          <div><div class="text-muted" style="font-size:11px">On Hand Stock</div><div style="font-size:22px;font-weight:700">${fmtNumber(item.stock)} ${item.uom}</div></div>
          <div><div class="text-muted" style="font-size:11px">Assigned Primary Bin</div><div class="mono" style="font-size:18px;font-weight:700">A-12-B-01</div></div>
        </div>
        <div>
          ${item.stock < item.safety ? chip('critical', 'Below Safety Stock') : chip('success', 'Stock Level Healthy')}
        </div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <button class="btn btn-primary" onclick="toast('Pick Confirmed', '1 unit picked from A-12-B-01', 'success')">Confirm Pick</button>
          <button class="btn btn-secondary" onclick="toast('Put-Away Complete', 'Item registered in primary bin', 'success')">Confirm Put-Away</button>
        </div>
      </div>`;
    logContract({ method: 'GET', path: `/api/items/${code}/lookup`, response: item, role: session.role });
  });
});