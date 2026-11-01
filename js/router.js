/* ============================================================
   ROUTER — hash-based SPA routing
   ============================================================ */
const routes = new Map();
let notFoundHandler = () => '<div class="empty"><div class="empty-title">Page not found</div></div>';

export function route(path, handler) {
  console.log('[router] register:', path);
  routes.set(path, handler);
}
export function setNotFound(fn) { notFoundHandler = fn; }

export function navigate(path) {
  if (location.hash === '#/' + path) return;
  location.hash = '#/' + path;
}

export function currentPath() {
  const h = location.hash.slice(2) || 'dashboard';
  return h;
}

export async function renderRoute() {
  const path = currentPath();
  console.log('[router] renderRoute, path =', path);
  console.log('[router] registered routes =', [...routes.keys()]);

  const container = document.getElementById('content-area');
  if (!container) { console.error('[router] #content-area not found'); return; }

  const parts = path.split('/');
  let handler = routes.get(path);
  if (!handler) {
    for (let i = parts.length - 1; i > 0; i--) {
      const parent = parts.slice(0, i).join('/');
      if (routes.has(parent)) {
        handler = routes.get(parent);
        break;
      }
    }
  }
  if (!handler) {
    console.warn('[router] no handler for', path);
    container.innerHTML = notFoundHandler(path);
    return;
  }
  try {
    const html = await handler(path, ...parts.slice(1));
    container.innerHTML = html || '';
    const evt = new CustomEvent('route-rendered', { detail: { path } });
    document.dispatchEvent(evt);
  } catch (e) {
    console.error('Route error:', e);
    container.innerHTML = `<div class="empty"><div class="empty-title">Error loading page</div><div class="empty-desc">${e.message}</div></div>`;
  }
}

export function initRouter() {
  if (!location.hash) location.hash = '#/dashboard';
  window.addEventListener('hashchange', renderRoute);
}