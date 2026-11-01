/* ============================================================
   API CONTRACT LOGGER — every mutation logs to the dev panel.
   Backend dev sees exactly what to build.
   ============================================================ */

let panel;
const logs = [];
let expanded = true;

export function initDevConsole() {
  panel = document.getElementById('dev-console');
  if (!panel) return;
  panel.innerHTML = `
    <div id="dc-toggle" style="
      position:fixed;bottom:20px;right:20px;z-index:9999;
      width:56px;height:56px;border-radius:50%;
      background:var(--brand-primary);color:#fff;
      display:grid;place-items:center;cursor:pointer;
      box-shadow:0 4px 16px rgba(0,0,0,0.2);font-weight:700;font-size:11px;
    " title="Backend Contract Log">API</div>
    <div id="dc-panel" style="
      position:fixed;bottom:88px;right:20px;z-index:9998;
      width:520px;max-height:60vh;background:#0B1220;color:#E2E8F0;
      border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.5);
      font-family:'JetBrains Mono',monospace;font-size:12px;
      display:flex;flex-direction:column;overflow:hidden;
    ">
      <div style="padding:10px 14px;background:#111827;border-bottom:1px solid #1F2937;display:flex;justify-content:space-between;align-items:center">
        <span style="font-weight:600;color:#60A5FA">▲ Backend Contract Log</span>
        <div style="display:flex;gap:8px">
          <button id="dc-clear" style="background:none;border:1px solid #374151;color:#94A3B8;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px">Clear</button>
          <button id="dc-hide" style="background:none;border:1px solid #374151;color:#94A3B8;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px">Hide</button>
        </div>
      </div>
      <div id="dc-log" style="padding:8px;overflow-y:auto;flex:1"></div>
    </div>`;

  document.getElementById('dc-toggle').onclick = () => {
    expanded = !expanded;
    document.getElementById('dc-panel').style.display = expanded ? 'flex' : 'none';
  };
  document.getElementById('dc-hide').onclick = (e) => {
    e.stopPropagation();
    document.getElementById('dc-panel').style.display = 'none';
    expanded = false;
  };
  document.getElementById('dc-clear').onclick = (e) => {
    e.stopPropagation();
    logs.length = 0;
    renderLog();
  };
  renderLog();
}

export function logContract({ method, path, body, response, auth, role }) {
  const entry = {
    ts: new Date().toLocaleTimeString(),
    method: method || 'POST',
    path,
    body,
    response,
    auth: auth !== false,
    role,
  };
  logs.unshift(entry);
  if (logs.length > 30) logs.pop();
  renderLog();
}

function renderLog() {
  const el = document.getElementById('dc-log');
  if (!el) return;
  if (logs.length === 0) {
    el.innerHTML = `<div style="padding:20px;text-align:center;color:#475569">
      Click any button in the app.<br>
      Every action logs the <b>exact API call</b> the backend must implement.
    </div>`;
    return;
  }
  el.innerHTML = logs.map(l => `
    <div style="padding:8px 10px;border-bottom:1px solid #1F2937">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px">
        <span style="background:#1E40AF;color:#93C5FD;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:700">${l.method}</span>
        <span style="color:#60A5FA;font-weight:600">${l.path}</span>
        <span style="color:#475569;margin-left:auto;font-size:10px">${l.ts}</span>
      </div>
      ${l.body ? `<div style="color:#94A3B8;font-size:10px;line-height:1.5">Body: ${JSON.stringify(l.body, null, 0)}</div>` : ''}
      ${l.response ? `<div style="color:#10B981;font-size:10px;line-height:1.5">Returns: ${JSON.stringify(l.response, null, 0)}</div>` : ''}
      <div style="color:#64748B;font-size:10px;margin-top:2px">
        ${l.auth ? '🔒 Bearer JWT' : ''} ${l.role ? `· Role: <b>${l.role}</b>` : ''}
      </div>
    </div>`).join('');
}