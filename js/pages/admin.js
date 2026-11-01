import { dataTable, chip, icon, toast, formModal } from '../components.js';
import { db, getAuditLog, session } from '../state.js';
import { PERMISSIONS } from '../permissions.js';
import { logContract } from '../api-contract.js';
import { fmtDate } from '../format.js';

export function register(route) {
  route('admin/audit',       renderAudit);
  route('admin/permissions', renderPermissions);
}

function renderAudit() {
  return `
    <div class="page-header">
      <div><div class="page-title">Audit Trail</div><div class="page-subtitle">Every mutation, in order · ${db.auditLog.length} entries</div></div>
    </div>
    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'Audit ID', key: 'id', mono: true },
        { label: 'When', render: r => new Date(r.ts).toLocaleString('en-IN') },
        { label: 'User', key: 'user' },
        { label: 'Action', render: r => chip('info', r.action) },
        { label: 'Entity', key: 'entity' },
        { label: 'Entity ID', key: 'entityId', mono: true },
        { label: 'Prev', render: r => r.prev ? JSON.stringify(r.prev).slice(0, 30) : '—' },
        { label: 'Next', render: r => r.next ? JSON.stringify(r.next).slice(0, 40) : '—' },
      ],
      rows: db.auditLog,
      empty: 'No actions yet. Every button you click will log here.',
    })}</div></div>`;
}

function renderPermissions() {
  const roles = Object.keys(PERMISSIONS);
  return `
    <div class="page-header">
      <div><div class="page-title">Roles & Permissions</div><div class="page-subtitle">RBAC matrix — buttons hide/disable based on this</div></div>
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
                  <td><b>${r}</b>${r === session.role ? ' ' + chip('success', 'you') : ''}</td>
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