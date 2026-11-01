/* ============================================================
   APP — bootstrap, session, routes, mount
   ============================================================ */
import { db, login, getDemoUsers, setSession } from './state.js';
import { renderShell } from './shell.js';
import { initRouter, route, renderRoute, navigate } from './router.js';
import { initDevConsole } from './api-contract.js';
import { toast, icon } from './components.js';
import { fmtCurrencyINR, fmtNumber, fmtDate, initials } from './format.js';

/* Re-export for any page still importing from '../app.js' */
export { fmtCurrencyINR, fmtNumber, fmtDate, initials };

/* ---------- Local session storage ---------- */
function getSavedSession() {
  try { return JSON.parse(localStorage.getItem('erp-session') || 'null'); }
  catch { return null; }
}
function saveSession(s) { localStorage.setItem('erp-session', JSON.stringify(s)); }
function clearSavedSession() { localStorage.removeItem('erp-session'); }

/* ---------- Login screen ---------- */
function renderLogin() {
  const users = getDemoUsers();
  const app = document.getElementById('app');
  app.className = '';
  app.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;min-height:100vh">
      <div style="display:grid;place-items:center;padding:32px;background:var(--bg)">
        <div style="width:100%;max-width:400px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,var(--brand-primary),var(--brand-accent));display:grid;place-items:center;color:#fff;font-weight:700;font-size:20px">E</div>
            <div><div style="font-weight:600">ERP Platform</div><div style="font-size:12px;color:var(--text-muted)">AI-Powered Modular ERP</div></div>
          </div>
          <h1 style="font-size:24px;margin-bottom:8px">Welcome back</h1>
          <p style="color:var(--text-muted);font-size:14px;margin-bottom:32px">Sign in to continue.</p>
          <form id="loginForm" novalidate>
            <div class="field" id="fEmail"><label>Email</label><input class="input" id="email" type="email" placeholder="you@company.com"><span class="error-msg">Valid email required</span></div>
            <div class="field" id="fPassword"><label>Password</label><input class="input" id="password" type="password" placeholder="••••••••"><span class="error-msg">Password required</span></div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Sign in</button>
          </form>
          <div style="margin-top:24px;padding:16px;background:var(--surface-alt);border-radius:10px;font-size:12px">
            <div style="font-weight:600;margin-bottom:8px">Quick demo login:</div>
            <div id="demoList"></div>
          </div>
        </div>
      </div>
      <div style="background:linear-gradient(135deg,var(--brand-primary),var(--brand-accent));color:#fff;padding:48px;display:flex;flex-direction:column;justify-content:space-between">
        <div style="font-weight:600">ERP Platform · v1.0 Prototype</div>
        <div>
          <div style="font-size:32px;font-weight:600;line-height:1.2;margin-bottom:16px">Ask Your ERP.<br>One workspace for Finance, Operations & People.</div>
          <ul style="list-style:none;padding:0;display:grid;gap:8px;font-size:14px">
            <li>✦ AI Copilot across 8 modules</li>
            <li>✦ Role-based dashboards</li>
            <li>✦ No-code workflow automation</li>
            <li>✦ Full audit trail</li>
          </ul>
        </div>
        <div style="font-size:12px;opacity:0.8">© 2026 · Mock data · No backend needed</div>
      </div>
    </div>`;

  document.getElementById('demoList').innerHTML = users.map(u => `
    <div class="demo-user" data-email="${u.email}" style="display:flex;justify-content:space-between;padding:6px 8px;cursor:pointer;border-radius:4px">
      <span>${u.email}</span><span style="color:var(--text-muted)">${u.role}</span>
    </div>`).join('');

  document.querySelectorAll('.demo-user').forEach(el => {
    el.onmouseover = () => el.style.background = 'var(--surface)';
    el.onmouseout = () => el.style.background = 'transparent';
    el.onclick = () => {
      document.getElementById('email').value = el.dataset.email;
      document.getElementById('password').value = 'demo';
    };
  });

  document.getElementById('loginForm').onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    document.getElementById('fEmail').classList.remove('has-error');
    document.getElementById('fPassword').classList.remove('has-error');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) { document.getElementById('fEmail').classList.add('has-error'); return; }
    if (!password) { document.getElementById('fPassword').classList.add('has-error'); return; }
    try {
      const u = login(email, password);
      saveSession(u);
      setSession(u);
      toast('Welcome', `Signed in as ${u.role}`, 'success');
      setTimeout(() => boot(), 400);
    } catch (err) {
      toast('Login failed', err.message, 'error');
    }
  };
}

/* ---------- Boot ---------- */
async function boot() {
  const saved = getSavedSession();
  if (!saved) { renderLogin(); return; }
  setSession(saved);

  await registerRoutes();
  renderShell();
  initDevConsole();
  initRouter();
  await renderRoute();
}

async function registerRoutes() {
  const pages = await Promise.all([
    import('./pages/dashboard.js'),
    import('./pages/finance.js'),
    import('./pages/purchasing.js'),
    import('./pages/sales.js'),
    import('./pages/inventory.js'),
    import('./pages/manufacturing.js'),
    import('./pages/hrms.js'),
    import('./pages/ai.js'),
    import('./pages/admin.js'),
    import('./pages/supply-chain.js'),
    import('./pages/manufacturing-extras.js'),
    import('./pages/hrms-extras.js'),
    import('./pages/finance-extras.js'),
    import('./pages/admin-extras.js'),
    import('./pages/admin-roles-extras.js'),
    import('./pages/360.js'),
     import('./pages/360-extended.js'),
  import('./pages/finance-bank-recon.js'),
  import('./pages/inventory-batch2.js'),
  import('./pages/supply-chain-dashboard.js'),
  import('./pages/dms.js'),
  
  ]);
  pages.forEach(mod => mod.register?.(route));
}

boot();

window.__db = db;
window.__navigate = navigate;
window.__clearSession = () => { clearSavedSession(); location.reload(); };