import { dataTable, chip, icon, toast } from '../components.js';
import { db } from '../state.js';
import { fmtDate } from '../format.js';

export function register(route) {
  route('dms', renderDMS);
}

function renderDMS() {
  return `
    <div class="page-header">
      <div><div class="page-title">Document Management (DMS)</div><div class="page-subtitle">Central repository for contracts, certificates & SOPs</div></div>
      <div class="page-actions"><button class="btn btn-primary" onclick="toast('Upload', 'File picker opens here', 'info')">${icon('upload', 16)} Upload Document</button></div>
    </div>
    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'Doc ID', key: 'id', mono: true },
        { label: 'Document Name', render: r => `<div style="display:flex;align-items:center;gap:8px">${icon('file-text', 16)} ${r.name}</div>` },
        { label: 'Linked To', key: 'entity' },
        { label: 'Type', render: r => chip('info', r.type) },
        { label: 'Version', key: 'version', mono: true },
        { label: 'Expiry', render: r => fmtDate(r.expiry) },
        { label: 'Status', render: r => r.status === 'Expiring' ? chip('critical', 'Expiring Soon') : chip('success', 'Active') },
        { label: '', render: () => `<button class="btn btn-ghost btn-sm">View</button>` },
      ],
      rows: db.dmsDocuments,
    })}</div></div>`;
}