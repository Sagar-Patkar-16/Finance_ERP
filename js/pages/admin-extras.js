import { dataTable, chip, icon, toast, formModal } from '../components.js';
import { db } from '../state.js';
import { logContract } from '../api-contract.js';
import { initials } from '../format.js';

export function register(route) {
  route('admin/users',        renderUsers);
  route('admin/integrations', renderIntegrations);
  route('admin/settings',     renderSettings);
}

function renderUsers() {
  const html = `
    <div class="page-header">
      <div><div class="page-title">Users</div><div class="page-subtitle">Accounts · roles · status</div></div>
      <div class="page-actions">
        <button class="btn btn-secondary">Import Users</button>
        <button class="btn btn-primary" id="btn-invite">Invite User</button>
      </div>
    </div>
    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: '', render: r => `<div class="avatar" style="width:30px;height:30px;font-size:11px">${initials(r.name)}</div>` },
        { label: 'Name', key: 'name' },
        { label: 'Email', key: 'email', mono: true },
        { label: 'Role', render: r => `<span class="chip chip-info">${r.role}</span>` },
        { label: 'Status', render: r => chip(r.status === 'Active' ? 'success' : r.status === 'Invited' ? 'warning' : 'critical', r.status) },
        { label: 'Last Login', key: 'lastLogin', mono: true },
      ],
      rows: db.users,
    })}</div></div>`;
  setTimeout(() => {
    document.getElementById('btn-invite')?.addEventListener('click', () => {
      formModal({
        title: 'Invite User',
        fields: [
          { name: 'name', label: 'Full name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'role', label: 'Role', type: 'select', required: true, options: [
            { value: 'CEO', label: 'CEO' },
            { value: 'CFO', label: 'CFO' },
            { value: 'Purchase Manager', label: 'Purchase Manager' },
            { value: 'Warehouse Manager', label: 'Warehouse Manager' },
            { value: 'Production Manager', label: 'Production Manager' },
            { value: 'HR Manager', label: 'HR Manager' },
            { value: 'Sales Manager', label: 'Sales Manager' },
          ]},
        ],
        submitLabel: 'Send Invite',
        onSubmit: (data) => {
          const u = { ...data, status: 'Invited', lastLogin: '—' };
          db.users.push(u);
          logContract({ method: 'POST', path: '/api/users/invite', body: data, response: u, role: window.__session.role });
          toast('Invite sent', data.email, 'success');
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      });
    });
  }, 0);
  return html;
}

function renderIntegrations() {
  return `
    <div class="page-header">
      <div><div class="page-title">Integrations</div><div class="page-subtitle">External systems · APIs · webhooks</div></div>
    </div>
    <div class="grid grid-3">
      ${db.integrations.map(i => `
        <div class="card">
          <div class="card-body">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
              <div class="kpi-icon">${icon(i.icon, 16)}</div>
              <div style="flex:1">
                <div style="font-weight:600;font-size:14px">${i.name}</div>
                <div class="text-muted" style="font-size:12px">${i.desc}</div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              ${i.status === 'Connected' ? chip('success', 'Connected') : chip('neutral', 'Available')}
              <button class="btn ${i.status === 'Connected' ? 'btn-ghost' : 'btn-primary'} btn-sm" data-int="${i.name}">
                ${i.status === 'Connected' ? 'Configure' : 'Connect'}
              </button>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
}

document.addEventListener('route-rendered', (e) => {
  if (e.detail.path !== 'admin/integrations') return;
  document.querySelectorAll('[data-int]').forEach(b => {
    b.addEventListener('click', () => toast(b.textContent, b.dataset.int, 'info'));
  });
});

function renderSettings() {
  return `
    <div class="page-header">
      <div><div class="page-title">System Settings</div><div class="page-subtitle">Company · defaults · notifications</div></div>
      <div class="page-actions"><button class="btn btn-primary" id="btn-save">Save Changes</button></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Company Profile</div></div>
      <div class="card-body">
        <div class="grid grid-2">
          <div class="field"><label>Legal Name</label><input class="input" value="Acme Industries Pvt Ltd"></div>
          <div class="field"><label>GSTIN</label><input class="input mono" value="27AAACA1234B1Z5"></div>
          <div class="field"><label>PAN</label><input class="input mono" value="AAACA1234B"></div>
          <div class="field"><label>Financial Year Start</label><input class="input" type="date" value="2026-04-01"></div>
          <div class="field"><label>Default Currency</label><select class="select"><option>INR</option><option>USD</option></select></div>
          <div class="field"><label>Approval Threshold (PO)</label><input class="input" value="₹10,00,000"></div>
        </div>
      </div>
    </div>`;
}
document.addEventListener('route-rendered', (e) => {
  if (e.detail.path !== 'admin/settings') return;
  document.getElementById('btn-save')?.addEventListener('click', () => toast('Settings saved', 'Applied across all modules', 'success'));
});