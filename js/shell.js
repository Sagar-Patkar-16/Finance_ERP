/* ============================================================
   SHELL — sidebar + topbar + role switcher + notifications
   ============================================================ */
import { icon, toast, openModal, confirmDialog } from './components.js';
import { navigate, currentPath } from './router.js';
import { db, clearSession, setSession, getDemoUsers } from './state.js';
import { applyPermissions } from './permissions.js';

export const NAV = [
  { group: 'Home', items: [
    { label: 'Dashboard', icon: 'home', path: 'dashboard' },
  ]},
//   { group: 'Finance', items: [
//     { label: 'General Ledger',      icon: 'file-text',       path: 'finance/gl' },
//     { label: 'Accounts Payable',    icon: 'arrow-up-right',  path: 'finance/ap' },
//     { label: 'Accounts Receivable', icon: 'arrow-down-left', path: 'finance/ar' },
//     { label: 'Bank Reconciliation', icon: 'building',        path: 'finance/bank-recon' },
//     { label: 'Fixed Assets',        icon: 'layers',          path: 'finance/assets' },
//     { label: 'Cash Flow',           icon: 'dollar-sign',     path: 'finance/cash-flow' },
//     { label: 'Tax & Compliance',    icon: 'clipboard',       path: 'finance/tax' },
//     { label: 'Bank Recon Live', icon: 'building',      path: 'finance/bank-recon-live' },
// { label: 'Cash Flow Chart', icon: 'trending-down', path: 'finance/cash-flow-chart' },


//   ]},


{ group: 'Finance', items: [
    { label: 'Finance Dashboard',   icon: 'activity',        path: 'finance/dashboard' },
    { label: 'General Ledger',      icon: 'file-text',       path: 'finance/gl' },
    { label: 'Statements (P&L, BS)',icon: 'book',            path: 'finance/statements' },
    { label: 'Accounts Payable',    icon: 'arrow-up-right',  path: 'finance/ap' },
    { label: 'Accounts Receivable', icon: 'arrow-down-left', path: 'finance/ar' },
    { label: 'Bank Reconciliation', icon: 'building',        path: 'finance/bank-recon' },
    { label: 'Fixed Assets',        icon: 'layers',          path: 'finance/assets' },
    { label: 'Cash Flow Bridge',    icon: 'dollar-sign',     path: 'finance/cash-flow' },
    { label: 'Tax & Compliance',    icon: 'clipboard',       path: 'finance/tax' },
  ]},

  
  { group: 'Sales & CRM', items: [
    { label: 'Pipeline',      icon: 'grid',       path: 'sales/pipeline' },
    { label: 'Customers',     icon: 'users',      path: 'sales/customers' },
    { label: 'Quotations',    icon: 'file-text',  path: 'sales/quotations' },
    { label: 'Sales Orders',  icon: 'clipboard',  path: 'sales/orders' },
  ]},
  // { group: 'Purchasing', items: [
  //   { label: 'Requisitions',    icon: 'file-text',    path: 'purchasing/prs' },
  //   { label: 'RFQ Comparison',  icon: 'layers',       path: 'purchasing/rfq' },
  //   { label: 'Purchase Orders', icon: 'clipboard',    path: 'purchasing/po' },
  //   { label: 'Goods Receipt',   icon: 'package',      path: 'purchasing/grn' },
  //   { label: 'Vendor Invoices', icon: 'dollar-sign',  path: 'purchasing/vi' },
  //   { label: '3-Way Match',     icon: 'check-circle', path: 'purchasing/match' },
  //   { label: '3-Way Match Live', icon: 'check-circle', path: 'finance/three-way-live' },
  // ]},
  { group: 'Purchasing', items: [
    { label: 'Purchase Dashboard', icon: 'activity',     path: 'purchasing/dashboard' },
    { label: 'Requisitions (PR)',  icon: 'file-text',    path: 'purchasing/prs' },
    { label: 'RFQ Comparison',     icon: 'layers',       path: 'purchasing/rfq' },
    { label: 'Purchase Orders',    icon: 'clipboard',    path: 'purchasing/po' },
    { label: 'Goods Receipt (GRN)',icon: 'package',      path: 'purchasing/grn' },
    { label: 'Vendor Directory',   icon: 'briefcase',    path: 'purchasing/vendors' },
    { label: 'Vendor 360°',        icon: 'users',        path: 'views/vendor-360' },
  ]},

//   { group: 'Inventory', items: [
//     { label: 'Items & Stock',   icon: 'package',    path: 'inventory/items' },
//     { label: 'Barcode / QR',    icon: 'scan',       path: 'inventory/barcode' },
//     { label: 'Warehouses',      icon: 'building',   path: 'inventory/warehouses' },
//     { label: 'Barcode Scanner', icon: 'scan',        path: 'inventory/barcode-scan' },
// { label: 'Batch & Serial',  icon: 'layers',      path: 'inventory/batch-serial' },
// { label: 'Cycle Count',     icon: 'refresh-cw',  path: 'inventory/cycle-count' },


//  ]},

{ group: 'Inventory', items: [
    { label: 'Inventory Dashboard', icon: 'activity',   path: 'inventory/dashboard' },
    { label: 'Items & Stock',       icon: 'package',    path: 'inventory/items' },
    { label: 'Warehouses & Bins',   icon: 'building',   path: 'inventory/warehouses' },
    { label: 'Stock Movements',     icon: 'refresh-cw', path: 'inventory/movements' },
    { label: 'Barcode Scanner',     icon: 'scan',       path: 'inventory/barcode' },
    { label: 'Item 360°',           icon: 'layers',     path: 'views/item-360' },
  ]},

  { group: 'Manufacturing', items: [
    { label: 'BOM',               icon: 'layers',    path: 'manufacturing/bom' },
    { label: 'Production Orders', icon: 'factory',   path: 'manufacturing/production' },
    { label: 'Work Centers',      icon: 'settings',  path: 'manufacturing/wc' },
    { label: 'Capacity',          icon: 'activity',  path: 'manufacturing/capacity' },
    { label: 'Routing',         icon: 'cpu',        path: 'manufacturing/routing' },
    { label: 'Machines',        icon: 'cpu',        path: 'manufacturing/machines' },
    { label: 'Quality Control', icon: 'check-circle', path: 'manufacturing/qc' },
    { label: 'OEE Monitor',     icon: 'pie-chart',  path: 'manufacturing/oee' },

  ]},
  { group: 'HRMS', items: [
    { label: 'Employees',    icon: 'users',      path: 'hrms/employees' },
    { label: 'Recruitment',  icon: 'briefcase',  path: 'hrms/recruitment' },
    { label: 'Attendance',   icon: 'clock',      path: 'hrms/attendance' },
    { label: 'Leave',        icon: 'activity',   path: 'hrms/leave' },
    { label: 'Payroll',         icon: 'dollar-sign', path: 'hrms/payroll' },
      { label: 'Performance',     icon: 'trending-up', path: 'hrms/performance' },
      { label: 'Training',        icon: 'clipboard',   path: 'hrms/training' },
  ]},
  { group: 'Intelligence', items: [
    { label: 'AI Copilot',  icon: 'bot',            path: 'ai/copilot' },
    { label: 'Alerts',      icon: 'alert-triangle', path: 'ai/alerts' },
    { label: 'Automation',  icon: 'zap',            path: 'ai/automation' },
    { label: 'Insights',    icon: 'sparkles',       path: 'ai/insights' },
  ]},

  { group: 'Admin', items: [
    { label: 'Audit Trail', icon: 'eye',      path: 'admin/audit' },
    { label: 'Permissions', icon: 'settings', path: 'admin/permissions' },
    { label: 'Users',           icon: 'users',    path: 'admin/users' },
    { label: 'Integrations',    icon: 'layers',   path: 'admin/integrations' },
    { label: 'System Settings', icon: 'settings', path: 'admin/settings' },
    { label: 'Roles Matrix',    icon: 'shield',   path: 'admin/roles-matrix' },

  ]},

  { group: 'Views', items: [
  { label: 'Customer 360',  icon: 'users',     path: 'views/customer-360' },
  { label: 'Vendor 360',    icon: 'briefcase', path: 'views/vendor-360' },
  { label: 'Item 360',      icon: 'package',  path: 'views/item-360' },
{ label: 'Employee 360',  icon: 'users',    path: 'views/employee-360' },
{ label: 'Machine 360',   icon: 'cpu',      path: 'views/machine-360' },

]},


{group: 'Supply Chain', items: [
  { label: 'Demand Forecast', icon: 'activity',   path: 'supply-chain/forecast' },
{ label: 'MRP',             icon: 'cpu',        path: 'supply-chain/mrp' },
{ label: 'Replenishment',   icon: 'refresh-cw', path: 'supply-chain/replenishment' },
{ label: 'Supplier Lead',   icon: 'clock',      path: 'supply-chain/lead-time' },
]}


];

export function renderShell() {
  const s = window.__session || {};
  const app = document.getElementById('app');
  app.className = 'app';
  app.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-logo">E</div>
        <div class="sidebar-brand-name">ERP Platform</div>
      </div>
      <nav class="sidebar-nav">
        ${NAV.map(g => `
          <div class="nav-group">
            <div class="nav-group-title">${g.group}</div>
            ${g.items.map(it => `
              <a class="nav-item" href="#/${it.path}" data-path="${it.path}" data-tooltip="${it.label}">
                <span class="nav-icon">${icon(it.icon, 18)}</span>
                <span class="nav-label">${it.label}</span>
              </a>
            `).join('')}
          </div>`).join('')}
      </nav>
      <div class="sidebar-footer">
        <a class="nav-item" id="themeToggle" data-tooltip="Toggle theme">
          <span class="nav-icon">${icon('moon', 18)}</span>
          <span class="nav-label">Theme</span>
        </a>
      </div>
    </aside>
    <div class="mobile-backdrop" id="mobileBackdrop"></div>
    <header class="topbar">
      <div class="topbar-left">
        <button class="icon-btn" id="sidebarToggle" aria-label="Collapse">${icon('menu', 18)}</button>
        <div class="breadcrumb" id="breadcrumb"></div>
      </div>
      <button class="search-trigger" id="globalSearch">
        ${icon('search', 16)} <span>Search…</span> <kbd>⌘K</kbd>
      </button>
      <div class="topbar-right">
        <select id="roleSwitcher" class="select" style="width:auto;font-size:12px;padding:4px 8px;background:var(--surface-alt);border-color:var(--border)" title="Demo: switch role">
          ${getDemoUsers().map(u => `<option value="${u.email}" ${u.email === s.email ? 'selected' : ''}>${u.role}</option>`).join('')}
        </select>
        <button class="icon-btn" id="themeToggleTop">${icon('sun', 18)}</button>
        <button class="icon-btn" id="notifBtn" style="position:relative">
          ${icon('bell', 18)}
          ${db.notifications.filter(n => !n.read).length ? `<span class="badge-dot pulse"></span>` : ''}
        </button>
        <button class="icon-btn" id="densityToggleTop" title="Toggle table density">${icon('list', 18)}</button>

        <div class="user-chip" id="userChip">
          <div class="avatar">${(s.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
          <div class="user-meta">
            <span class="name">${s.name || 'User'}</span>
            <span class="role">${s.role || ''}</span>
          </div>
        </div>
      </div>
    </header>
    <main class="content" id="content-area"></main>
  `;

  function updateActive() {
    const cur = currentPath();
    document.querySelectorAll('.nav-item[data-path]').forEach(a => {
      a.classList.toggle('active', a.dataset.path === cur);
    });
  }
  document.addEventListener('route-rendered', () => { updateActive(); applyPermissions(); });
  updateActive();

  document.getElementById('densityToggleTop')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-density') || 'comfortable';
    const next = cur === 'comfortable' ? 'compact' : 'comfortable';
    document.documentElement.setAttribute('data-density', next);
    toast('Density mode', `Switched to ${next}`, 'info', 1500);
  });

  document.getElementById('sidebarToggle').onclick = () => {
    if (window.matchMedia('(max-width: 768px)').matches) {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('mobileBackdrop').classList.toggle('open');
    } else {
      app.classList.toggle('sidebar-collapsed');
    }
  };
  document.getElementById('mobileBackdrop').onclick = () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('mobileBackdrop').classList.remove('open');
  };

  const setTheme = (dark) => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('erp-theme', dark ? 'dark' : 'light');
    document.getElementById('themeToggleTop').innerHTML = icon(dark ? 'moon' : 'sun', 18);
  };
  setTheme(localStorage.getItem('erp-theme') === 'dark');
  ['themeToggle', 'themeToggleTop'].forEach(id => {
    document.getElementById(id).onclick = () => {
      const cur = document.documentElement.getAttribute('data-theme');
      setTheme(cur !== 'dark');
      toast('Theme', `Switched to ${cur === 'dark' ? 'light' : 'dark'} mode`, 'info', 1200);
    };
  });

  document.getElementById('roleSwitcher').onchange = (e) => {
    const u = getDemoUsers().find(x => x.email === e.target.value);
    if (u) {
      setSession(u);       // → syncs window.__session
      localStorage.setItem('erp-session', JSON.stringify(u));
      toast('Role switched', `Now viewing as ${u.role}`, 'success', 1800);
      renderShell();
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  };

  document.getElementById('notifBtn').onclick = () => {
    const unread = db.notifications.filter(n => !n.read);
    const body = unread.length === 0
      ? `<div style="padding:24px;text-align:center;color:var(--text-muted)">No new notifications</div>`
      : unread.map(n => `
          <div style="padding:12px;border-radius:8px;background:var(--surface-alt);margin-bottom:8px">
            <div style="display:flex;gap:8px;align-items:flex-start">
              <span style="color:var(--${n.level})">${icon('alert-circle', 16)}</span>
              <div>
                <div style="font-weight:600;font-size:13px">${n.title}</div>
                <div style="font-size:12px;color:var(--text-muted)">${n.msg}</div>
              </div>
            </div>
          </div>`).join('');
    const m = openModal({
      title: 'Notifications',
      body,
      footer: `<button class="btn btn-secondary" data-mark>Mark all read</button>`,
      size: '440px',
    });
    m.el.querySelector('[data-mark]').onclick = () => {
      db.notifications.forEach(n => n.read = true);
      m.close();
      renderShell();
      toast('Done', 'All notifications marked read', 'success');
    };
  };

  document.getElementById('userChip').onclick = async () => {
    const ok = await confirmDialog({ title: 'Sign out?', message: 'You will return to login.', confirmText: 'Sign out', variant: 'danger' });
    if (ok) {
      clearSession();                          // → clears window.__session
      localStorage.removeItem('erp-session');
      location.reload();
    }
  };

  document.getElementById('globalSearch').onclick = openSearch;
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
  });
}

function openSearch() {
  const body = `
    <input class="input" id="gs-input" placeholder="Search customers, vendors, items, POs…" style="margin-bottom:12px">
    <div id="gs-results" style="min-height:80px">
      <div class="text-muted" style="font-size:12px;padding:8px">Type at least 2 characters</div>
    </div>`;
  const m = openModal({ title: 'Global Search', body, size: '540px' });

  const input = m.el.querySelector('#gs-input');
  const results = m.el.querySelector('#gs-results');
  setTimeout(() => input.focus(), 50);

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) {
      results.innerHTML = `<div class="text-muted" style="font-size:12px;padding:8px">Type at least 2 characters</div>`;
      return;
    }
    const hits = [];
    db.customers.forEach(c => { if (c.name.toLowerCase().includes(q)) hits.push({ type: 'Customer', label: c.name, meta: c.id, path: 'sales/customers' }); });
    db.vendors.forEach(v => { if (v.name.toLowerCase().includes(q)) hits.push({ type: 'Vendor', label: v.name, meta: v.id, path: 'purchasing/prs' }); });
    db.items.forEach(i => { if (i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)) hits.push({ type: 'Item', label: i.name, meta: i.code, path: 'inventory/items' }); });
    db.purchaseOrders.forEach(p => { if (p.id.toLowerCase().includes(q)) hits.push({ type: 'PO', label: p.id, meta: p.vendor, path: 'purchasing/po' }); });

    if (hits.length === 0) {
      results.innerHTML = `<div class="text-muted" style="font-size:12px;padding:8px">No results</div>`;
      return;
    }
    results.innerHTML = hits.slice(0, 8).map(h => `
      <div style="display:flex;justify-content:space-between;padding:10px;cursor:pointer;border-radius:6px" data-goto="${h.path}" class="gs-result">
        <span><b>${h.label}</b> <span class="text-muted" style="font-size:12px">· ${h.meta}</span></span>
        <span class="chip chip-neutral">${h.type}</span>
      </div>`).join('');
    results.querySelectorAll('.gs-result').forEach(el => {
      el.onmouseover = () => el.style.background = 'var(--surface-alt)';
      el.onmouseout = () => el.style.background = 'transparent';
      el.onclick = () => { m.close(); navigate(el.dataset.goto); };
    });
  });
}