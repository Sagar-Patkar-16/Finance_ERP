/* ============================================================
   PERMISSIONS — Role → capability matrix.
   Drives which buttons render. Backend should enforce the same.
   ============================================================ */

export const PERMISSIONS = {
  'CEO': {
    view: ['*'],
    create: [],
    approve: ['po.high_value', 'payment.high_value', 'discount.high'],
    post_financial: false,
    delete: [],
  },
  'CFO': {
    view: ['*'],
    create: ['journal', 'vendor_invoice', 'asset', 'payment'],
    approve: ['vendor_invoice', 'payment', 'po.high_value', 'po.low_value', 'pr'],
    post_financial: true,
    delete: ['journal.draft', 'vendor_invoice.draft'],
  },
  'Purchase Manager': {
    view: ['purchasing.*', 'inventory.read', 'vendors.*', 'reports.*'],
    create: ['pr', 'rfq', 'po'],
    approve: ['pr', 'po.low_value'],
    post_financial: false,
    delete: ['po.draft'],
  },
  'Purchase Executive': {
    view: ['purchasing.read', 'vendors.read'],
    create: ['pr', 'rfq'],
    approve: [],
    post_financial: false,
    delete: [],
  },
  'Warehouse Manager': {
    view: ['inventory.*', 'purchasing.grn', 'barcode.*'],
    create: ['grn', 'stock_adjust', 'stock_transfer', 'cycle_count'],
    approve: ['stock_adjust.low_value'],
    post_financial: false,
    delete: [],
  },
  'Production Manager': {
    view: ['manufacturing.*', 'inventory.read'],
    create: ['production_order', 'bom', 'routing'],
    approve: ['production_order', 'qc'],
    post_financial: false,
    delete: ['bom.draft'],
  },
  'HR Manager': {
    view: ['hrms.*', 'payroll.*', 'recruitment.*'],
    create: ['employee', 'leave_rule', 'training', 'recruitment'],
    approve: ['leave_request', 'payroll'],
    post_financial: false,
    delete: [],
  },
  'Sales Manager': {
    view: ['sales.*', 'crm.*', 'customers.*'],
    create: ['lead', 'quotation', 'sales_order', 'deal'],
    approve: ['quotation', 'discount.low'],
    post_financial: false,
    delete: ['quotation.draft'],
  },
};

export function can(action) {
  const u = window.__session;
  if (!u) return false;
  const p = PERMISSIONS[u.role];
  if (!p) return false;

  const [ns, op] = action.split('.');

  const check = (list) => list.some(a => {
    if (a === '*') return true;
    if (a === action) return true;
    if (a.endsWith('.*') && a.startsWith(ns + '.')) return true;
    if (a === ns) return true;
    return false;
  });

  if (op === 'read' || op === 'view') return check(p.view);
  if (['create', 'add'].includes(op)) return check(p.create);
  if (['approve', 'post'].includes(op)) {
    if (op === 'post') return p.post_financial;
    return check(p.approve);
  }
  if (['delete', 'remove'].includes(op)) return check(p.delete);

  // default: check view
  return check(p.view);
}

/* Hide all elements with data-perm that current role lacks */
export function applyPermissions(root = document) {
  root.querySelectorAll('[data-perm]').forEach(el => {
    const perm = el.dataset.perm;
    if (!can(perm)) {
      el.setAttribute('disabled', 'disabled');
      el.classList.add('perm-disabled');
      el.title = `Your role (${window.__session?.role}) cannot perform this action`;
    } else {
      el.removeAttribute('disabled');
      el.classList.remove('perm-disabled');
      el.removeAttribute('title');
    }
  });
}