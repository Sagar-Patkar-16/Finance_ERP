import { dataTable, chip, icon, toast, formModal, confirmDialog } from '../components.js';
import { db, adjustStock } from '../state.js';
import { logContract } from '../api-contract.js';
import { fmtDate, fmtNumber, fmtCurrencyINR } from '../format.js';

export function register(route) {
  route('inventory/barcode-scan',  renderBarcodeScan);
  route('inventory/batch-serial',  renderBatchSerial);
  route('inventory/cycle-count',   renderCycleCount);
}

function renderBarcodeScan() {
  return `
    <div class="page-header">
      <div><div class="page-title">Barcode / QR Scanner</div><div class="page-subtitle">Scan · lookup · pick confirmation</div></div>
    </div>
    <div class="grid grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">Scanner Input</div></div>
        <div class="card-body">
          <div style="border:2px dashed var(--border-strong);border-radius:12px;padding:40px 20px;text-align:center;background:var(--surface-alt)">
            <div style="font-size:44px;color:var(--brand-primary)">⌗</div>
            <div style="font-weight:600;margin-top:12px">Ready to scan</div>
            <div class="text-muted" style="font-size:13px;margin-bottom:16px">Point at barcode or enter code below</div>
            <button class="btn btn-primary" id="btn-camera">Activate Camera</button>
          </div>
          <div class="field" style="margin-top:16px">
            <label>Or enter code manually</label>
            <div style="display:flex;gap:8px">
              <input class="input mono" id="bc-code" placeholder="IT-100">
              <button class="btn btn-primary" id="bc-lookup">Lookup</button>
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Result</div></div>
        <div class="card-body" id="bc-result">
          <div class="empty"><div class="empty-title">Scan a code to see details</div></div>
        </div>
      </div>
    </div>`;
}

document.addEventListener('route-rendered', (e) => {
  if (e.detail.path !== 'inventory/barcode-scan') return;
  document.getElementById('btn-camera')?.addEventListener('click', () => toast('Camera', 'Point at a barcode to scan', 'info'));
  document.getElementById('bc-lookup')?.addEventListener('click', () => {
    const code = document.getElementById('bc-code').value.trim().toUpperCase();
    const item = db.items.find(i => i.code === code);
    if (!item) { toast('Not found', `No item matches ${code}`, 'error'); return; }
    document.getElementById('bc-result').innerHTML = `
      <div style="display:grid;gap:14px">
        <div><div class="text-muted" style="font-size:11px;text-transform:uppercase">Item</div><div style="font-weight:600;font-size:16px">${item.code} · ${item.name}</div></div>
        <div><div class="text-muted" style="font-size:11px;text-transform:uppercase">On Hand</div><div style="font-weight:600;font-size:28px">${fmtNumber(item.stock)} ${item.uom}</div></div>
        <div><div class="text-muted" style="font-size:11px;text-transform:uppercase">Bin</div><div class="mono">A-12-B-01</div></div>
        ${item.stock < item.safety ? chip('critical', 'Below safety stock') : chip('success', 'In stock')}
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn btn-primary btn-sm" data-act="pick">Pick</button>
          <button class="btn btn-secondary btn-sm" data-act="adjust">Adjust</button>
        </div>
      </div>`;
    logContract({ method: 'GET', path: `/api/items/${code}/lookup`, response: item, role: window.__session.role });
    document.querySelector('[data-act="pick"]').onclick = () => {
      logContract({ method: 'POST', path: `/api/items/${code}/pick`, body: { qty: 1 }, role: window.__session.role });
      toast('Pick recorded', `${code} · 1 ${item.uom}`, 'success');
    };
    document.querySelector('[data-act="adjust"]').onclick = () => {
      formModal({
        title: `Adjust ${code}`,
        fields: [
          { name: 'delta', label: 'Delta (+/-)', type: 'number', required: true },
          { name: 'reason', label: 'Reason', type: 'text', required: true },
        ],
        submitLabel: 'Post Adjustment',
        onSubmit: (data) => {
          const item2 = adjustStock(code, data.delta, data.reason);
          logContract({ method: 'POST', path: '/api/inventory/adjust', body: { itemCode: code, ...data }, response: { stock: item2.stock }, role: window.__session.role });
          toast('Adjusted', `${code} → ${item2.stock} ${item2.uom}`, 'success');
        }
      });
    };
  });
});

function renderBatchSerial() {
  return `
    <div class="page-header">
      <div><div class="page-title">Batch & Serial Tracking</div><div class="page-subtitle">Traceability · expiry · recalls</div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Active Batches</div></div>
      <div class="card-body">${dataTable({
        columns: [
          { label: 'Batch #', key: 'id', mono: true },
          { label: 'Item', key: 'item' },
          { label: 'Mfg', render: r => fmtDate(r.mfg) },
          { label: 'Expiry', render: r => fmtDate(r.exp) },
          { label: 'Qty', align: 'right', num: true, key: 'qty' },
          { label: 'Bin', key: 'bin', mono: true },
          { label: 'Days Left', align: 'right', num: true, render: r => `<span style="color:${r.daysLeft < 30 ? 'var(--critical)' : r.daysLeft < 90 ? 'var(--warning)' : 'var(--text)'}">${r.daysLeft}</span>` },
          { label: 'Status', render: r => r.daysLeft < 30 ? chip('critical', 'Expiring soon') : r.daysLeft < 90 ? chip('warning', 'Watch') : chip('success', 'OK') },
        ],
        rows: db.batchSerials,
      })}</div>
    </div>`;
}

function renderCycleCount() {
  const html = `
    <div class="page-header">
      <div><div class="page-title">Cycle Count</div><div class="page-subtitle">Physical count · variance · adjustment</div></div>
      <div class="page-actions"><button class="btn btn-primary" id="btn-start">Start New Count</button></div>
    </div>
    <div class="grid grid-kpi">
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Counts This Month</span></div><div class="kpi-value">${db.cycleCounts.length}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Variance Items</span></div><div class="kpi-value" style="color:var(--warning)">${db.cycleCounts.filter(c => c.diff !== 0).length}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Variance Value</span></div><div class="kpi-value" style="color:var(--critical)">${fmtCurrencyINR(db.cycleCounts.reduce((s, c) => s + c.value, 0))}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Accuracy</span></div><div class="kpi-value">98.7%</div></div>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><div class="card-title">Recent Counts</div></div>
      <div class="card-body">${dataTable({
        columns: [
          { label: 'Count #', key: 'id', mono: true },
          { label: 'Date', render: r => fmtDate(r.date) },
          { label: 'Item', key: 'item' },
          { label: 'System', align: 'right', num: true, key: 'system' },
          { label: 'Physical', align: 'right', num: true, key: 'physical' },
          { label: 'Diff', align: 'right', num: true, render: r => r.diff === 0 ? '—' : `<span style="color:${r.diff < 0 ? 'var(--critical)' : 'var(--success)'}">${r.diff > 0 ? '+' : ''}${r.diff}</span>` },
          { label: 'Value', align: 'right', num: true, render: r => r.value ? fmtCurrencyINR(r.value) : '—' },
          { label: 'Status', render: r => r.status === 'Matched' ? chip('success', 'Matched') : chip('warning', 'Pending adjustment') },
          { label: '', render: r => r.status !== 'Matched' ? `<button class="btn btn-primary btn-sm" data-post="${r.id}">Post</button>` : '' },
        ],
        rows: db.cycleCounts,
      })}</div>
    </div>`;
  setTimeout(() => {
    document.getElementById('btn-start')?.addEventListener('click', () => toast('New Count', 'Enter physical quantity for items', 'info'));
    document.querySelectorAll('[data-post]').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.dataset.post;
        const cc = db.cycleCounts.find(c => c.id === id);
        const ok = await confirmDialog({ title: `Post adjustment for ${cc.item}?`, message: `Variance of ${cc.diff} units (${fmtCurrencyINR(cc.value)}) will be posted to GL.`, confirmText: 'Post' });
        if (!ok) return;
        cc.status = 'Matched';
        logContract({ method: 'POST', path: `/api/cycle-counts/${id}/post`, body: { item: cc.item, diff: cc.diff, value: cc.value }, role: window.__session.role });
        toast('Adjustment posted', 'GL entry created, audit logged', 'success');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });
  }, 0);
  return html;
}