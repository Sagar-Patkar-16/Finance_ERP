import { dataTable, chip } from '../components.js';
import { PERMISSIONS } from '../permissions.js';

export function register(route) {
  route('admin/roles-matrix', renderMatrix);
}

function renderMatrix() {
  const roles = Object.keys(PERMISSIONS);
  return `
    <div class="page-header">
      <div><div class="page-title">Roles & Permissions Matrix</div><div class="page-subtitle">Full RBAC grid — every action per role</div></div>
    </div>
    <div class="card">
      <div class="card-body" style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Can View</th>
              <th>Can Create</th>
              <th>Can Approve</th>
              <th>Post Financial</th>
              <th>Can Delete</th>
            </tr>
          </thead>
          <tbody>
            ${roles.map(r => {
              const p = PERMISSIONS[r];
              return `
                <tr>
                  <td><b>${r}</b>${r === window.__session?.role ? ' ' + chip('success', 'you') : ''}</td>
                  <td style="font-size:12px">${p.view.join(', ') || '—'}</td>
                  <td style="font-size:12px">${p.create.join(', ') || '—'}</td>
                  <td style="font-size:12px">${p.approve.join(', ') || '—'}</td>
                  <td>${p.post_financial ? chip('success', 'Yes') : chip('neutral', 'No')}</td>
                  <td style="font-size:12px">${p.delete.join(', ') || '—'}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}