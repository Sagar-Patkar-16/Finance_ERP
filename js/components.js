/* ============================================================
   Reusable UI Components — pure renderers, no state
   ============================================================ */
import { fmtCurrencyINR, fmtNumber, initials } from './format.js';

/* ---------- Icon helper (Lucide via inline SVG lookup) ----------
   We ship a compact set of paths so no external CDN is required. */
const ICONS = {
  'home':'M3 12l9-9 9 9M5 10v10h14V10',
  'trending-up':'M22 7l-8.5 8.5-5-5L2 17M16 7h6v6',
  'trending-down':'M22 17l-8.5-8.5-5 5L2 7M16 17h6v-6',
  'wallet':'M3 7h18v10H3zM3 11h18',
  'banknote':'M2 6h20v12H2zM12 12a2 2 0 100-4 2 2 0 000 4z',
  'package':'M21 16V8l-9-5-9 5v8l9 5 9-5zM3.3 7l8.7 5 8.7-5M12 22V12',
  'arrow-down-left':'M17 17L7 7M17 7v10H7',
  'arrow-up-right':'M7 17L17 7M17 17H7V7',
  'bell':'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0',
  'search':'M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-3.5-3.5',
  'sun':'M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4L7 17M17 7l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z',
  'moon':'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',
  'menu':'M3 6h18M3 12h18M3 18h18',
  'chevron-down':'M6 9l6 6 6-6',
  'chevron-right':'M9 6l6 6-6 6',
  'x':'M18 6L6 18M6 6l12 12',
  'check':'M20 6L9 17l-5-5',
  'alert-circle':'M12 8v4M12 16h.01M12 22a10 10 0 100-20 10 10 0 000 20z',
  'alert-triangle':'M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.7 3.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01',
  'info':'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01',
  'check-circle':'M22 11.1V12a10 10 0 11-5.9-9.1M22 4L12 14l-3-3',
  'plus':'M12 5v14M5 12h14',
  'download':'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  'filter':'M22 3H2l8 9.5V19l4 2v-8.5L22 3z',
  'refresh-cw':'M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0114.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0020.5 15',
  'sparkles':'M12 3l1.9 5.8L20 10.7l-5.4 3.9L16.2 20 12 16.6 7.8 20l1.6-5.4L4 10.7l6.1-1.9z',
  'bot':'M12 2v3M8 5h8a3 3 0 013 3v8a3 3 0 01-3 3H8a3 3 0 01-3-3V8a3 3 0 013-3zM9 12h.01M15 12h.01M9 16h6',
  'send':'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  'settings':'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-2.9 1.2V21a2 2 0 11-4 0v-.1A1.7 1.7 0 007 19.4a1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00-1.2-2.9H1a2 2 0 110-4h.1A1.7 1.7 0 002.6 7a1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H7a1.7 1.7 0 001-1.5V1a2 2 0 114 0v.1A1.7 1.7 0 0014 2.6a1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V7a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z',
  'users':'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8',
  'briefcase':'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16',
  'factory':'M2 20h20M4 20V8l6 4V8l6 4V4l4 4v12',
  'truck':'M1 3h15v13H1zM16 8h4l3 3v5h-7M5.5 19a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 19a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  'building':'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4',
  'dollar-sign':'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  'clipboard':'M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M9 2h6a1 1 0 011 1v3H8V3a1 1 0 011-1z',
  'file-text':'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  'clock':'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
  'activity':'M22 12h-4l-3 9L9 3l-3 9H2',
  'log-out':'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  'grid':'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  'bar-chart':'M12 20V10M18 20V4M6 20v-4',
  'pie-chart':'M21.2 15.9A10 10 0 118.1 2.8M22 12A10 10 0 0012 2v10z',
  'layers':'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  'cpu':'M4 4h16v16H4zM9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3',
  'zap':'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  'eye':'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 100-6 3 3 0 000 6z',
  'edit':'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  'trash':'M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6',
  /* Add to ICONS in components.js */
'upload':'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12',
'shield':'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
'percent':'M19 5L5 19M6.5 6.5a.5.5 0 100 1 .5.5 0 000-1zM17.5 17.5a.5.5 0 100 1 .5.5 0 000-1z',
'calendar':'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
'award':'M12 15a6 6 0 100-12 6 6 0 000 12zM8.2 13.9L7 22l5-3 5 3-1.2-8.1',
'book':'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V6a2 2 0 012-2h14v13H6.5A2.5 2.5 0 004 19.5z',
'play':'M5 3l14 9-14 9V3z',
'pause':'M6 4h4v16H6zM14 4h4v16h-4z',
'target':'M12 22a10 10 0 100-20 10 10 0 000 20zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z',
'globe':'M12 22a10 10 0 100-20 10 10 0 000 20zM2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20',
'link':'M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1',
'flag':'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',
'star':'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
'scan':'M4 7V4h3M20 7V4h-3M4 17v3h3M20 17v3h-3M7 12h10',
'database':'M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6',
'git-branch':'M6 3v12M18 9a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zM18 9a9 9 0 01-9 9',
'sliders':'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
};

export function icon(name, size = 18) {
  const d = ICONS[name] || ICONS['info'];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
}

/* ---------- KPI card (§10.1) ---------- */
export function kpiCard({ label, value, delta, icon: ic = 'activity', currency = true, unit = '' }) {
  const deltaClass = delta == null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const deltaIcon = delta > 0 ? 'trending-up' : delta < 0 ? 'trending-down' : 'activity';
  const deltaText = delta == null ? '' : `${delta > 0 ? '+' : ''}${delta}% vs last month`;
  const displayValue = currency ? fmtCurrencyINR(value) : fmtNumber(value) + (unit ? ' ' + unit : '');
  return `
    <div class="kpi">
      <div class="kpi-header">
        <span class="kpi-label">${label}</span>
        <span class="kpi-icon">${icon(ic, 16)}</span>
      </div>
      <div class="kpi-value">${displayValue}</div>
      ${deltaText ? `<div class="kpi-delta ${deltaClass}">${icon(deltaIcon, 12)} ${deltaText}</div>` : ''}
    </div>`;
}

/* ---------- Status chip (5-level) ---------- */
export function statusChip(level, label) {
  const iconName = { critical:'alert-circle', warning:'alert-triangle', attention:'clock', info:'info', success:'check-circle', neutral:'info' }[level] || 'info';
  return `<span class="chip chip-${level}">${icon(iconName, 12)} ${label}</span>`;
}
export const chip = statusChip;

/* ---------- Data table ---------- */
export function dataTable({ columns, rows, rowKey = 'id', empty = 'No records yet.' }) {
  if (!rows || rows.length === 0) {
    return `<div class="table-wrap"><div class="empty">
      <div class="empty-icon">${icon('file-text', 24)}</div>
      <div class="empty-title">Nothing here yet</div>
      <div class="empty-desc">${empty}</div>
    </div></div>`;
  }
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>${columns.map(c => `<th class="${c.sortable ? 'sortable' : ''} ${c.align === 'right' ? 'text-right' : ''}">${c.label}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(r => `<tr data-id="${r[rowKey]}">
            ${columns.map(c => `<td class="${c.align === 'right' ? 'text-right ' : ''}${c.mono ? 'mono ' : ''}${c.num ? 'num' : ''}">${c.render ? c.render(r) : (r[c.key] ?? '—')}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ---------- Toast ---------- */
let toastStack;
export function toast(title, msg = '', type = 'info', duration = 3500) {
  if (!toastStack) {
    toastStack = document.createElement('div');
    toastStack.className = 'toast-stack';
    document.body.appendChild(toastStack);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const ic = { success:'check-circle', error:'alert-circle', warning:'alert-triangle', info:'info' }[type] || 'info';
  el.innerHTML = `
    <span style="color:var(--${type === 'error' ? 'critical' : type});flex-shrink:0">${icon(ic, 18)}</span>
    <div style="flex:1">
      <div class="toast-title">${title}</div>
      ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
    </div>
    <button class="btn-ghost btn-icon" style="padding:2px" aria-label="Dismiss">${icon('x', 14)}</button>
  `;
  toastStack.appendChild(el);
  const close = () => { el.classList.add('leaving'); setTimeout(() => el.remove(), 200); };
  el.querySelector('button').addEventListener('click', close);
  setTimeout(close, duration);
}

/* ---------- Confirmation modal ---------- */
export function confirmDialog({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'primary' }) {
  return new Promise(resolve => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop open';
    backdrop.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <span class="modal-title">${title}</span>
          <button class="btn-ghost btn-icon" data-close aria-label="Close">${icon('x', 16)}</button>
        </div>
        <div class="modal-body"><p style="margin:0;color:var(--text-muted)">${message}</p></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-cancel>${cancelText}</button>
          <button class="btn btn-${variant}" data-confirm>${confirmText}</button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    const close = (val) => { backdrop.remove(); resolve(val); };
    backdrop.querySelector('[data-confirm]').addEventListener('click', () => close(true));
    backdrop.querySelector('[data-cancel]').addEventListener('click', () => close(false));
    backdrop.querySelector('[data-close]').addEventListener('click', () => close(false));
    backdrop.addEventListener('click', e => { if (e.target === backdrop) close(false); });
  });
}

/* ---------- Modal open/close ---------- */
/* ---------- Form modal (validated modal with fields) ---------- */
let _formModalSeq = 0;

export function formModal({ title, fields, submitLabel = 'Save', onSubmit }) {
  const id = `form-modal-${++_formModalSeq}`;
  const root = document.getElementById('modal-root') || document.body;

  const fieldsHtml = fields.map(f => `
    <div class="field" data-field="${f.name}">
      <label>${f.label}${f.required ? ' *' : ''}</label>
      ${renderFormField(f)}
      <span class="error-msg">This field is required</span>
    </div>
  `).join('');

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop open';
  backdrop.id = id;
  backdrop.innerHTML = `
    <div class="modal" style="max-width:560px">
      <div class="modal-header">
        <span class="modal-title">${title}</span>
        <button class="btn-ghost btn-icon" data-close aria-label="Close">${icon('x', 16)}</button>
      </div>
      <div class="modal-body">
        <form id="fm-${id}" novalidate>${fieldsHtml}</form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-cancel>Cancel</button>
        <button class="btn btn-primary" data-submit>${submitLabel}</button>
      </div>
    </div>`;
  root.appendChild(backdrop);

  const close = () => backdrop.remove();

  backdrop.querySelector('[data-close]').addEventListener('click', close);
  backdrop.querySelector('[data-cancel]').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });

  backdrop.querySelector('[data-submit]').addEventListener('click', () => {
    const form = backdrop.querySelector(`#fm-${id}`);
    const data = {};
    let valid = true;

    fields.forEach(f => {
      const fieldEl = form.querySelector(`[data-field="${f.name}"]`);
      const input = fieldEl.querySelector('input, select, textarea');
      const val = (input.value || '').trim();

      if (f.required && !val) {
        fieldEl.classList.add('has-error');
        valid = false;
      } else {
        fieldEl.classList.remove('has-error');
      }
      data[f.name] = val;
    });

    if (!valid) return;

    try {
      onSubmit(data);
      close();
    } catch (err) {
      toast('Error', err.message, 'error');
    }
  });

  // Focus first field
  setTimeout(() => backdrop.querySelector('input, select, textarea')?.focus(), 50);

  // Return a handle so callers can close it if needed
  return { el: backdrop, close };
}

function renderFormField(f) {
  if (f.type === 'select') {
    return `<select class="select" name="${f.name}">
      <option value="">— Select —</option>
      ${(f.options || []).map(o => `
        <option value="${o.value}" ${f.value === o.value ? 'selected' : ''}>${o.label}</option>
      `).join('')}
    </select>`;
  }
  if (f.type === 'textarea') {
    return `<textarea class="textarea" name="${f.name}" placeholder="${f.placeholder || ''}">${f.value || ''}</textarea>`;
  }
  return `<input class="input" type="${f.type || 'text'}" name="${f.name}" value="${f.value || ''}" placeholder="${f.placeholder || ''}">`;
}

export function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}
export function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

/* ---------- Tabs ---------- */
export function initTabs(scope = document) {
  scope.querySelectorAll('.tabs').forEach(tabsEl => {
    tabsEl.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabsEl.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
        const container = tabsEl.parentElement;
        container.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === target));
      });
    });
  });
}

/* ---------- Stepper (§6) ---------- */
export function stepper(steps, activeIndex) {
  return `<div class="stepper">
    ${steps.map((s, i) => `
      <div class="step ${i < activeIndex ? 'done' : i === activeIndex ? 'active' : ''}">
        <span class="step-dot">${i < activeIndex ? icon('check', 12) : i + 1}</span>
        <span>${s}</span>
      </div>
      ${i < steps.length - 1 ? `<span class="step-sep">${icon('chevron-right', 14)}</span>` : ''}
    `).join('')}
  </div>`;
}

/* ---------- Notification centre drawer ---------- */
export async function renderNotificationDrawer(notifications) {
  const levels = { critical:'alert-circle', warning:'alert-triangle', attention:'clock', info:'info', success:'check-circle' };
  return `
    <div class="drawer-header">
      <div>
        <div style="font-weight:600">Notifications</div>
        <div style="font-size:12px;color:var(--text-muted)">${notifications.filter(n => !n.read).length} unread</div>
      </div>
      <button class="btn-ghost btn-icon" data-close-drawer aria-label="Close">${icon('x', 18)}</button>
    </div>
    <div class="drawer-body">
      ${notifications.map(n => `
        <div class="chat-msg" style="max-width:100%;padding:10px;border-radius:8px;background:${n.read ? 'transparent' : 'var(--surface-alt)'};margin-bottom:6px">
          <span style="color:var(--${n.level});flex-shrink:0">${icon(levels[n.level], 18)}</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600">${n.title}</div>
            <div style="font-size:12px;color:var(--text-muted)">${n.msg}</div>
            <div style="font-size:11px;color:var(--text-faint);margin-top:2px">${n.ts}</div>
          </div>
        </div>`).join('')}
    </div>`;
}