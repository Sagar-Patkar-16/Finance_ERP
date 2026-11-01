import { dataTable, chip, icon, toast, confirmDialog } from '../components.js';
import { db } from '../state.js';
import { logContract } from '../api-contract.js';
import { fmtCurrencyINR, fmtDate } from '../format.js';

export function register(route) {
  route('finance/bank-recon-live', renderBankRecon);
  route('finance/three-way-live',  renderThreeWayLive);
}

function renderBankRecon() {
  const buckets = {
    Matched:   db.bankStatements.filter(s => s.status === 'Matched'),
    Unmatched: db.bankStatements.filter(s => s.status === 'Unmatched'),
    Partial:   db.bankStatements.filter(s => s.status === 'Partial'),
    Exception: db.bankStatements.filter(s => s.status === 'Exception'),
  };
  
  const cardHtml = (title, color, items) => `
    <div style="background:var(--surface-alt);border-radius:8px;padding:12px;min-height:400px;border-top:3px solid var(--${color})">
      <div style="font-weight:600;font-size:13px;margin-bottom:12px;display:flex;justify-content:space-between">
        <span>${title}</span> <span class="chip chip-neutral">${items.length}</span>
      </div>
      ${items.map(r => `
        <div class="card" style="margin-bottom:8px;box-shadow:var(--shadow-sm)">
          <div class="card-body" style="padding:12px">
            <div style="font-size:11px;color:var(--text-muted)">${fmtDate(r.date)} · ${r.ref}</div>
            <div style="font-size:13px;font-weight:600;margin:4px 0">${r.desc}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
              <span style="font-weight:600;color:${r.type === 'credit' ? 'var(--success)' : 'var(--critical)'}">${r.type === 'credit' ? '+' : '−'}${fmtCurrencyINR(r.amount)}</span>
              ${r.status !== 'Matched' ? `<button class="btn btn-primary btn-sm" data-match="${r.ref}">Match</button>` : chip('success', 'Done')}
            </div>
          </div>
        </div>`).join('')}
    </div>`;

  const html = `
    <div class="page-header">
      <div><div class="page-title">Bank Reconciliation</div><div class="page-subtitle">Triage Board · HDFC Oct 2026</div></div>
      <div class="page-actions"><button class="btn btn-primary" id="btn-automatch">Auto-Match</button></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;overflow-x:auto;padding-bottom:20px;">
      ${cardHtml('Matched', 'success', buckets.Matched)}
      ${cardHtml('Unmatched', 'info', buckets.Unmatched)}
      ${cardHtml('Partially Matched', 'warning', buckets.Partial)}
      ${cardHtml('Exceptions', 'critical', buckets.Exception)}
    </div>`;
    
  setTimeout(() => {
    // Keep your existing auto-match and data-match click listeners here
    document.getElementById('btn-automatch')?.addEventListener('click', () => { /* ... */ });
    document.querySelectorAll('[data-match]').forEach(b => { /* ... */ });
  }, 0);
  return html;
}

function renderThreeWayLive() {
  const candidates = db.vendorInvoices.filter(v => v.status === 'Pending' || v.status === 'Exception');
  const html = `
    <div class="page-header">
      <div><div class="page-title">3-Way Match — Live</div><div class="page-subtitle">Select invoice · compare PO/GRN/Invoice · approve</div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Select Invoice to Match</div></div>
      <div class="card-body">${dataTable({
        columns: [
          { label: 'Invoice', key: 'id', mono: true },
          { label: 'Vendor', key: 'vendor' },
          { label: 'PO', key: 'po', mono: true },
          { label: 'GRN', key: 'grn', mono: true },
          { label: 'Amount', align: 'right', num: true, render: r => fmtCurrencyINR(r.amount) },
          { label: 'Status', render: r => chip(r.status === 'Pending' ? 'warning' : 'critical', r.status) },
          { label: '', render: r => `<button class="btn btn-primary btn-sm" data-match="${r.id}">Run Match</button>` },
        ],
        rows: candidates,
      })}</div>
    </div>
    <div id="matchDetail"></div>`;
  setTimeout(() => {
    document.querySelectorAll('[data-match]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.match;
        const vi = db.vendorInvoices.find(v => v.id === id);
        const po = db.purchaseOrders.find(p => p.id === vi.po) || { amount: vi.amount, vendor: vi.vendor };
        const grn = db.goodsReceipts.find(g => g.id === vi.grn) || { qty: '—', bin: '—' };
        const variance = vi.amount - po.amount;
        const pct = ((variance / po.amount) * 100).toFixed(2);
        const pass = Math.abs(variance) <= 0.02 * po.amount;
        logContract({ method: 'POST', path: '/api/match/three-way', body: { poId: po.id, grnId: grn.id, invoiceId: id }, response: { status: pass ? 'Matched' : 'Exception', variance }, role: window.__session.role });
        document.getElementById('matchDetail').innerHTML = `
          <div class="card" style="border-left:4px solid var(--${pass ? 'success' : 'critical'});margin-top:20px">
            <div class="card-body" style="display:flex;align-items:center;gap:16px">
              <div style="width:48px;height:48px;border-radius:50%;background:var(--${pass ? 'success' : 'critical'}-bg);color:var(--${pass ? 'success' : 'critical'});display:grid;place-items:center;font-size:22px">${pass ? '✓' : '!'}</div>
              <div style="flex:1">
                <div style="font-weight:600;font-size:16px">Match ${pass ? 'Passed' : 'Failed'} — Variance ₹${Math.abs(variance).toLocaleString('en-IN')} (${pct}%)</div>
                <div class="text-muted" style="font-size:13px">Tolerance: 2% of PO value. ${pass ? 'Ready to approve.' : 'Requires override with reason.'}</div>
              </div>
              <div style="display:flex;gap:8px">
                <button class="btn btn-secondary" data-act="hold">Hold</button>
                <button class="btn btn-primary" data-act="approve">${pass ? 'Approve' : 'Approve Override'}</button>
              </div>
            </div>
          </div>
          <div class="grid grid-3" style="margin-top:20px">
            <div class="card"><div class="card-header"><div class="card-title">PO — ${po.id || '—'}</div></div><div class="card-body"><div class="text-muted" style="font-size:12px">Total</div><div style="font-size:24px;font-weight:600">${fmtCurrencyINR(po.amount)}</div></div></div>
            <div class="card"><div class="card-header"><div class="card-title">GRN — ${grn.id || '—'}</div></div><div class="card-body"><div class="text-muted" style="font-size:12px">Qty Received</div><div style="font-size:24px;font-weight:600">${grn.qty || '—'} units</div></div></div>
            <div class="card"><div class="card-header"><div class="card-title">Invoice — ${vi.id}</div></div><div class="card-body"><div class="text-muted" style="font-size:12px">Total</div><div style="font-size:24px;font-weight:600">${fmtCurrencyINR(vi.amount)}</div></div></div>
          </div>`;
        document.querySelector('[data-act="hold"]').onclick = () => toast('Held', 'Moved to exception queue', 'warning');
        document.querySelector('[data-act="approve"]').onclick = async () => {
          const reason = pass ? 'auto-approved' : 'variance override';
          const ok = await confirmDialog({ title: 'Approve?', message: `Reason: ${reason}`, confirmText: 'Approve', variant: pass ? 'primary' : 'danger' });
          if (!ok) return;
          vi.status = 'Approved';
          logContract({ method: 'POST', path: `/api/vendor-invoices/${id}/approve`, body: { reason, variance }, role: window.__session.role });
          toast('Approved', `${id} → GL journal posted`, 'success');
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        };
      });
    });
  }, 0);
  return html;
}