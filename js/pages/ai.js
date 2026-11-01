import { chip, icon, toast, openModal, confirmDialog } from '../components.js';
import { db, toggleAutomationRule, acknowledgeAlert, createPR, session } from '../state.js';
import { logContract } from '../api-contract.js';
import { fmtCurrencyINR } from '../format.js';

export function register(route) {
  route('ai/copilot',    renderCopilot);
  route('ai/alerts',     renderAlerts);
  route('ai/automation', renderAutomation);
  route('ai/insights',   renderInsights);
}

function renderCopilot() {
  return `
    <div class="page-header">
      <div><div class="page-title">AI Copilot</div><div class="page-subtitle">Ask across Finance, Operations, People · Guardrail: prepares actions, you approve</div></div>
    </div>
    <div class="grid" style="grid-template-columns:1fr 320px;gap:0;height:calc(100vh - 240px);border:1px solid var(--border);border-radius:12px;overflow:hidden">
      <div style="display:flex;flex-direction:column;background:var(--surface)">
        <div id="chat-scroll" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px"></div>
        <div style="display:flex;gap:8px;padding:12px;border-top:1px solid var(--border)">
          <input class="input" id="chat-input" placeholder="Ask anything…">
          <button class="btn btn-primary" id="chat-send">${icon('send', 16)}</button>
        </div>
      </div>
      <aside style="background:var(--surface-alt);padding:16px;overflow-y:auto;border-left:1px solid var(--border)">
        <div style="font-size:12px;text-transform:uppercase;color:var(--text-muted);font-weight:600;margin-bottom:8px">Suggested</div>
        <div id="chat-prompts" style="display:flex;flex-direction:column;gap:6px">
          ${['Which materials may go out of stock?',
             'Show unpaid invoices above ₹5 lakh.',
             'Create purchase requisition for the shortage.',
             'Which products have declining sales?']
            .map(p => `<button class="btn btn-secondary btn-sm" style="text-align:left;justify-content:flex-start" data-prompt="${p}">${p}</button>`).join('')}
        </div>
        <div style="margin-top:20px;padding:12px;background:var(--warning-bg);border-radius:8px;font-size:11px;color:var(--warning)">
          <b>Guardrail</b><br>AI prepares actions; human approves financial transactions.
        </div>
      </aside>
    </div>`;
}

document.addEventListener('route-rendered', (e) => {
  if (e.detail.path !== 'ai/copilot') return;
  const scroll = document.getElementById('chat-scroll');
  const input = document.getElementById('chat-input');

  function addMsg(role, html) {
    const el = document.createElement('div');
    el.style.cssText = `display:flex;gap:8px;${role === 'user' ? 'flex-direction:row-reverse;align-self:flex-end' : ''};max-width:80%`;
    const av = role === 'user'
      ? `<div class="avatar" style="width:32px;height:32px;font-size:11px">${session.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>`
      : `<div class="avatar" style="width:32px;height:32px;background:var(--brand-primary-soft);color:var(--brand-primary)">${icon('bot', 16)}</div>`;
    el.innerHTML = `${av}<div style="background:${role === 'user' ? 'var(--brand-primary)' : 'var(--surface-alt)'};color:${role === 'user' ? '#fff' : 'inherit'};padding:10px 14px;border-radius:10px;font-size:13px;line-height:1.55">${html}</div>`;
    scroll.appendChild(el);
    scroll.scrollTop = scroll.scrollHeight;
    return el;
  }

  addMsg('ai', `<b>Hi ${session.name.split(' ')[0]}.</b> I can see Finance, Operations, and People data.<br>Ask a question or pick a suggested prompt.`);

  async function send(text) {
    if (!text.trim()) return;
    addMsg('user', text);
    input.value = '';
    const thinking = addMsg('ai', '<span class="text-muted">Thinking…</span>');
    setTimeout(() => {
      const t = text.toLowerCase();
      let res;
      if (t.includes('stock')) {
        res = { text: '7 materials projected below safety stock in 14 days. Highest risk: <b>IT-100 Steel Plate</b> (12 days).', source: 'Inventory + MRP', action: { title: 'Create Purchase Requisition', meta: 'PR for IT-100 × 500 units', type: 'PR' } };
      } else if (t.includes('invoice') || t.includes('unpaid')) {
        res = { text: '12 invoices match. Total outstanding: <b>₹1.86 Cr</b>.', source: 'AR module' };
      } else if (t.includes('purchase requisition') || t.includes('create pr')) {
        res = { text: 'Draft PR-105 created for IT-100 × 500 units (₹50,000). Awaiting your approval.', source: 'Workflow Engine', action: { title: 'Approve PR-105', meta: 'Routes to Purchase Manager', type: 'APPROVE_PR' } };
      } else if (t.includes('declin')) {
        res = { text: 'Product A sales decreased 18% over the last 3 months, primarily in Customer Segment X.', source: 'Sales · last 90 days' };
      } else {
        res = { text: `I read "${text}". Try a suggested prompt for a working demo.`, source: 'AI (demo)' };
      }
      thinking.innerHTML = `<div>${res.text}</div><div style="font-size:11px;color:var(--text-muted);margin-top:6px">${res.source}</div>`;
      logContract({ method: 'POST', path: '/api/ai/copilot', body: { question: text }, response: res, role: session.role });
      if (res.action) {
        const card = document.createElement('div');
        card.style.cssText = 'margin-top:8px;padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:8px';
        card.innerHTML = `
          <div style="font-weight:600;font-size:13px;margin-bottom:4px">${icon('sparkles', 14)} ${res.action.title}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">${res.action.meta}</div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-primary btn-sm" data-act="approve">Approve</button>
            <button class="btn btn-ghost btn-sm" data-act="reject">Reject</button>
          </div>`;
        scroll.appendChild(card);
        scroll.scrollTop = scroll.scrollHeight;
        card.querySelector('[data-act="approve"]').onclick = () => {
          if (res.action.type === 'PR') {
            const pr = createPR({ dept: 'AI Copilot', itemCode: 'IT-100', qty: 500 });
            logContract({ method: 'POST', path: '/api/purchase-requisitions', body: { from: 'ai-copilot', itemCode: 'IT-100', qty: 500 }, response: pr, role: session.role });
            toast('PR created', `${pr.id} routed to Purchase Manager`, 'success');
          } else {
            toast('Approved', 'Action cleared through normal approval path', 'success');
          }
          card.remove();
        };
        card.querySelector('[data-act="reject"]').onclick = () => { toast('Rejected', 'Action discarded', 'warning'); card.remove(); };
      }
    }, 700);
  }

  document.getElementById('chat-send').onclick = () => send(input.value);
  input.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); send(input.value); } });
  document.querySelectorAll('[data-prompt]').forEach(b => b.onclick = () => send(b.dataset.prompt));
});

function renderAlerts() {
  const html = `
    <div class="page-header">
      <div><div class="page-title">AI Alert Centre</div><div class="page-subtitle">Anomalies across all modules</div></div>
    </div>
    ${db.aiAlerts.map(a => `
      <div class="card" style="margin-bottom:12px">
        <div class="card-body" style="display:flex;gap:14px;align-items:flex-start">
          <span style="color:var(--${a.level});flex-shrink:0;margin-top:2px">${icon(a.level === 'critical' ? 'alert-circle' : a.level === 'warning' ? 'alert-triangle' : 'info', 20)}</span>
          <div style="flex:1">
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px">
              <b>${a.title}</b>${chip(a.level, a.level)}
            </div>
            <div style="font-size:13px;color:var(--text-muted)">${a.msg}</div>
            <div style="font-size:11px;color:var(--text-faint);margin-top:4px">${a.module}</div>
          </div>
          <button class="btn btn-secondary btn-sm" data-ack="${a.id}" ${a.acknowledged ? 'disabled' : ''}>${a.acknowledged ? 'Acknowledged' : 'Acknowledge'}</button>
        </div>
      </div>`).join('')}`;
  setTimeout(() => {
    document.querySelectorAll('[data-ack]').forEach(b => {
      b.addEventListener('click', () => {
        acknowledgeAlert(b.dataset.ack);
        logContract({ method: 'POST', path: `/api/alerts/${b.dataset.ack}/ack`, role: session.role });
        toast('Acknowledged', 'Alert marked reviewed', 'success');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });
  }, 0);
  return html;
}

function renderAutomation() {
  const html = `
    <div class="page-header">
      <div><div class="page-title">No-Code Automation</div><div class="page-subtitle">WHEN / IF / THEN rules</div></div>
    </div>
    ${db.automationRules.map(r => `
      <div class="card" style="margin-bottom:12px">
        <div class="card-body" style="display:flex;align-items:center;gap:16px">
          <div style="flex:1;font-size:13px">
            <span class="chip chip-info">WHEN</span> ${r.when}
            ${r.if_ ? ` <span class="chip chip-attention">IF</span> ${r.if_}` : ''}
            <span class="chip chip-success">THEN</span> ${r.then}
          </div>
          <button class="btn ${r.active ? 'btn-success' : 'btn-secondary'} btn-sm" data-toggle-rule="${r.id}">${r.active ? 'Active' : 'Paused'}</button>
        </div>
      </div>`).join('')}`;
  setTimeout(() => {
    document.querySelectorAll('[data-toggle-rule]').forEach(b => {
      b.addEventListener('click', () => {
        const r = toggleAutomationRule(b.dataset.toggleRule);
        logContract({ method: 'PATCH', path: `/api/automation/rules/${r.id}`, body: { active: r.active }, role: session.role });
        toast(r.active ? 'Rule activated' : 'Rule paused', '', r.active ? 'success' : 'info');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });
  }, 0);
  return html;
}

function renderInsights() {
  const insights = [
    { level: 'warning', title: 'Cash flow tight in 45–60 days', body: 'Projected balance below ₹2 Cr — vendor payout overlapping with delayed collections.' },
    { level: 'critical', title: 'Steel Plate stockout in 12 days', body: 'Recommend raising PR for 500 KG now; lead time is 15 days.' },
    { level: 'attention', title: 'WC-03 CNC approaching overload', body: 'Next 2 weeks pushes CNC cell to 96% utilization.' },
    { level: 'success', title: 'Receivables improving', body: 'DSO reduced from 42 to 34 days QoQ.' },
  ];
  return `
    <div class="page-header"><div><div class="page-title">AI Insights</div><div class="page-subtitle">Cross-module intelligence</div></div></div>
    ${insights.map(i => `
      <div class="card" style="margin-bottom:12px">
        <div class="card-body" style="display:flex;gap:14px">
          <span style="color:var(--${i.level})">${icon('sparkles', 20)}</span>
          <div style="flex:1">
            <div style="display:flex;gap:8px;align-items:center"><b>${i.title}</b>${chip(i.level, i.level)}</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:4px">${i.body}</div>
          </div>
        </div>
      </div>`).join('')}`;
}