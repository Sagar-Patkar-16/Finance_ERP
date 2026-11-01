/* ============================================================
   STATE — Live in-memory database + every mutation.
   Every function is a candidate backend endpoint.
   ============================================================ */

const AUDIT = [];
let auditSeq = 1;

function audit({ user, action, entity, entityId, prev, next, reason = '' }) {
  const entry = {
    id: `AUD-${String(auditSeq++).padStart(4, '0')}`,
    ts: new Date().toISOString(),
    user: user || window.__session?.name || 'system',
    action, entity, entityId,
    prev: prev ?? null,
    next: next ?? null,
    reason,
  };
  AUDIT.unshift(entry);
  return entry;
}

/* ---------- Session ---------- */
export let session = null;
export function setSession(s) {
  session = s;
  window.__session = s;      // keep global in sync
}
export function clearSession() {
  session = null;
  window.__session = null;
}

/* ---------- Auth ---------- */
const DEMO_USERS = [
  { id: 'U-001', email: 'ceo@acme.com',        password: 'demo', name: 'Rahul Mehta',  role: 'CEO' },
  { id: 'U-002', email: 'cfo@acme.com',        password: 'demo', name: 'Anita Sharma', role: 'CFO' },
  { id: 'U-003', email: 'purchase@acme.com',   password: 'demo', name: 'Vikram Rao',   role: 'Purchase Manager' },
  { id: 'U-004', email: 'purch-exec@acme.com', password: 'demo', name: 'Nisha B',      role: 'Purchase Executive' },
  { id: 'U-005', email: 'warehouse@acme.com',  password: 'demo', name: 'Suresh Kumar', role: 'Warehouse Manager' },
  { id: 'U-006', email: 'production@acme.com', password: 'demo', name: 'Priya Nair',   role: 'Production Manager' },
  { id: 'U-007', email: 'hr@acme.com',         password: 'demo', name: 'Kavita Iyer',  role: 'HR Manager' },
  { id: 'U-008', email: 'sales@acme.com',      password: 'demo', name: 'Neha Singh',   role: 'Sales Manager' },
];

export function getDemoUsers() { return DEMO_USERS; }

export function login(email, password) {
  const u = DEMO_USERS.find(x => x.email === email && x.password === password);
  if (!u) throw new Error('Invalid credentials');
  return u;
}

/* ================================================================
   DATA STORE
   ================================================================ */
export const db = {
  /* -------- MASTER DATA -------- */
  customers: [
    { id: 'CU-001', name: 'ABC Industries',    contact: 'Ramesh K', phone: '+91 98xxx 11111', email: 'ramesh@abc.com', revenue: 24000000, outstanding: 1800000, orders: 142, avgPaymentDays: 34, creditLimit: 5000000, gst: '27AAACA1234B1Z5', status: 'Active' },
    { id: 'CU-002', name: 'XYZ Manufacturing', contact: 'Sunil P',  phone: '+91 98xxx 22222', email: 'sunil@xyz.com',  revenue: 18500000, outstanding: 950000,  orders: 98,  avgPaymentDays: 28, creditLimit: 4000000, gst: '27AAACX5678C1Z2', status: 'Active' },
    { id: 'CU-003', name: 'PQR Engineering',   contact: 'Meena R',  phone: '+91 98xxx 33333', email: 'meena@pqr.com',  revenue: 12000000, outstanding: 2400000, orders: 76,  avgPaymentDays: 52, creditLimit: 3000000, gst: '27AAACP9012D1Z8', status: 'Active' },
    { id: 'CU-004', name: 'LMN Pharma',        contact: 'Arjun S',  phone: '+91 98xxx 44444', email: 'arjun@lmn.com',  revenue: 31000000, outstanding: 4200000, orders: 210, avgPaymentDays: 41, creditLimit: 8000000, gst: '27AAACL3456E1Z1', status: 'Active' },
  ],

  vendors: [
    { id: 'V-001', name: 'Vendor A', contact: 'Kiran M',  phone: '+91 90xxx 11111', email: 'kiran@va.com',  category: 'Raw Material', terms: '30 Days', currency: 'INR', rating: 4.5, spend: 8500000, outstanding: 620000, price: 100, delivery: 7,  payTerms: '30 Days' },
    { id: 'V-002', name: 'Vendor B', contact: 'Farhan A', phone: '+91 90xxx 22222', email: 'farhan@vb.com', category: 'Raw Material', terms: '45 Days', currency: 'INR', rating: 4.0, spend: 6200000, outstanding: 320000, price: 95,  delivery: 15, payTerms: '45 Days' },
    { id: 'V-003', name: 'Vendor C', contact: 'Anil K',   phone: '+91 90xxx 33333', email: 'anil@vc.com',   category: 'Components',   terms: '30 Days', currency: 'INR', rating: 4.7, spend: 9800000, outstanding: 1240000, price: 110, delivery: 5,  payTerms: '30 Days' },
    { id: 'V-004', name: 'Vendor D', contact: 'Pooja S',  phone: '+91 90xxx 44444', email: 'pooja@vd.com',  category: 'Packaging',    terms: '15 Days', currency: 'INR', rating: 3.8, spend: 3100000, outstanding: 180000, price: 65,  delivery: 10, payTerms: '15 Days' },
  ],

  items: [
    { code: 'IT-100', name: 'Steel Plate 5mm',  category: 'Raw Material', uom: 'KG',  stock: 80,   safety: 100, demand: 150, leadTime: 15, reorder: 100, value: 240000, rate: 100 },
    { code: 'IT-205', name: 'Aluminium Sheet',  category: 'Raw Material', uom: 'KG',  stock: 420,  safety: 200, demand: 180, leadTime: 10, reorder: 250, value: 890000, rate: 220 },
    { code: 'IT-310', name: 'Bearing SKF-6205', category: 'Component',    uom: 'PCS', stock: 45,   safety: 80,  demand: 120, leadTime: 20, reorder: 100, value: 135000, rate: 600 },
    { code: 'IT-401', name: 'Motor 5HP',        category: 'Component',    uom: 'PCS', stock: 12,   safety: 15,  demand: 18,  leadTime: 25, reorder: 20,  value: 360000, rate: 30000 },
    { code: 'IT-550', name: 'Copper Wire 2mm',  category: 'Raw Material', uom: 'MTR', stock: 1200, safety: 800, demand: 900, leadTime: 8,  reorder: 900, value: 180000, rate: 150 },
  ],

  employees: [
    { id: 'E-001', name: 'Rajesh Kumar', dept: 'Production', designation: 'Sr. Engineer',  joined: '2019-04-12', status: 'Active',   email: 'rajesh@acme.com', ctc: 900000 },
    { id: 'E-002', name: 'Neha Singh',   dept: 'Sales',      designation: 'Sales Manager', joined: '2020-07-01', status: 'Active',   email: 'neha@acme.com',   ctc: 1104000 },
    { id: 'E-003', name: 'Arun Verma',   dept: 'Finance',    designation: 'Accountant',    joined: '2021-02-15', status: 'Active',   email: 'arun@acme.com',   ctc: 660000 },
    { id: 'E-004', name: 'Sunita Patel', dept: 'HR',         designation: 'HR Executive',  joined: '2022-09-05', status: 'On Leave', email: 'sunita@acme.com', ctc: 576000 },
    { id: 'E-005', name: 'Manoj Joshi',  dept: 'Production', designation: 'Machine Op.',   joined: '2023-01-20', status: 'Active',   email: 'manoj@acme.com',  ctc: 384000 },
  ],

  /* -------- FINANCE -------- */
  journals: [
    { id: 'JE-1001', date: '2026-08-20', ref: 'INV-3021', narrative: 'Sales invoice — ABC Industries', debit: 850000, credit: 0,      account: '1100 · Receivables', status: 'Posted' },
    { id: 'JE-1002', date: '2026-08-20', ref: 'INV-3021', narrative: 'Sales revenue',                  debit: 0,      credit: 720338, account: '4000 · Revenue',     status: 'Posted' },
    { id: 'JE-1003', date: '2026-08-20', ref: 'INV-3021', narrative: 'GST output',                     debit: 0,      credit: 129662, account: '2200 · GST Payable', status: 'Posted' },
  ],

  vendorInvoices: [
    { id: 'VI-3001', vendorId: 'V-001', vendor: 'Vendor A', po: 'PO-2011', grn: 'GRN-2011', amount: 480000,  due: '2026-08-27', match: '3-Way',  status: 'Approved' },
    { id: 'VI-3002', vendorId: 'V-003', vendor: 'Vendor C', po: 'PO-2012', grn: 'GRN-2012', amount: 1250000, due: '2026-09-01', match: '3-Way',  status: 'Pending' },
    { id: 'VI-3003', vendorId: 'V-002', vendor: 'Vendor B', po: 'PO-2013', grn: '—',        amount: 320000,  due: '2026-09-05', match: '2-Way',  status: 'Exception' },
  ],

  customerInvoices: [
    { id: 'INV-3021', customerId: 'CU-001', customer: 'ABC Industries',    amount: 850000,  due: '2026-09-05', status: 'Pending' },
    { id: 'INV-3022', customerId: 'CU-004', customer: 'LMN Pharma',        amount: 1240000, due: '2026-08-30', status: 'Overdue' },
    { id: 'INV-3023', customerId: 'CU-002', customer: 'XYZ Manufacturing', amount: 420000,  due: '2026-09-10', status: 'Paid' },
  ],

  payments: [],

  bankRecon: {
    matched:    [{ id: 'TXN-1001', date: '2026-08-20', ref: 'TXN-1001', amount: 50000,  desc: 'Customer ABC receipt' }],
    unmatched:  [{ id: 'TXN-1003', date: '2026-08-22', ref: 'TXN-1003', amount: 85000,  desc: 'Unknown credit' }],
    partial:    [{ id: 'TXN-1004', date: '2026-08-23', ref: 'TXN-1004', amount: 95000,  desc: 'Partial match on PO-2011' }],
    exceptions: [{ id: 'TXN-1005', date: '2026-08-24', ref: 'TXN-1005', amount: 250000, desc: 'Duplicate entry suspected' }],
  },

  fixedAssets: [
    { id: 'FA-0001', name: 'CNC Milling Machine',       category: 'Plant & Machinery', loc: 'Pune HQ', cost: 4800000, dep: 1440000, nbv: 3360000, life: 10, acquired: '2022-04-15', custodian: 'R. Kumar' },
    { id: 'FA-0002', name: 'Industrial Lathe',          category: 'Plant & Machinery', loc: 'Pune HQ', cost: 2200000, dep: 880000,  nbv: 1320000, life: 10, acquired: '2021-09-20', custodian: 'M. Joshi' },
    { id: 'FA-0003', name: 'Warehouse Building Block A',category: 'Buildings',         loc: 'Pune HQ', cost: 8400000, dep: 2100000, nbv: 6300000, life: 30, acquired: '2018-03-01', custodian: 'Facilities' },
  ],

  taxFilings: [
    { id: 'TX-001', form: 'GSTR-1',  period: 'Aug 2026', due: '2026-09-11', status: 'Pending' },
    { id: 'TX-002', form: 'GSTR-3B', period: 'Aug 2026', due: '2026-09-20', status: 'Pending' },
    { id: 'TX-003', form: 'TDS 26Q', period: 'Q1 FY27',  due: '2026-07-31', status: 'Filed' },
  ],

  /* -------- PURCHASING -------- */
  purchaseRequisitions: [
    { id: 'PR-101', dept: 'Production',  itemCode: 'IT-100', item: 'Steel Plate 5mm',  qty: 500, amount: 50000,  status: 'Pending',  requestedBy: 'Priya Nair',   date: '2026-08-24' },
    { id: 'PR-102', dept: 'Maintenance', itemCode: 'IT-310', item: 'Bearing SKF-6205', qty: 200, amount: 120000, status: 'Approved', requestedBy: 'Rajesh Kumar', date: '2026-08-22' },
    { id: 'PR-103', dept: 'Production',  itemCode: 'IT-401', item: 'Motor 5HP',        qty: 25,  amount: 750000, status: 'Pending',  requestedBy: 'Priya Nair',   date: '2026-08-23' },
  ],

  rfqs: [
    { id: 'RFQ-205', prId: 'PR-101', item: 'Steel Plate 5mm', qty: 500, status: 'Open', created: '2026-08-24',
      responses: [
        { vendorId: 'V-001', vendor: 'Vendor A', price: 100, delivery: 7,  payTerms: '30 Days', rating: 4.5 },
        { vendorId: 'V-002', vendor: 'Vendor B', price: 95,  delivery: 15, payTerms: '45 Days', rating: 4.0 },
        { vendorId: 'V-003', vendor: 'Vendor C', price: 110, delivery: 5,  payTerms: '30 Days', rating: 4.7 },
      ]
    },
  ],

  purchaseOrders: [
    { id: 'PO-2011', vendorId: 'V-001', vendor: 'Vendor A', date: '2026-08-20', amount: 480000,  status: 'Approved', expected: '2026-08-27', items: 3 },
    { id: 'PO-2012', vendorId: 'V-003', vendor: 'Vendor C', date: '2026-08-21', amount: 1250000, status: 'Sent',     expected: '2026-09-01', items: 5 },
    { id: 'PO-2013', vendorId: 'V-002', vendor: 'Vendor B', date: '2026-08-22', amount: 320000,  status: 'Draft',    expected: '2026-09-05', items: 2 },
    { id: 'PO-2014', vendorId: 'V-001', vendor: 'Vendor A', date: '2026-08-23', amount: 780000,  status: 'Approved', expected: '2026-08-30', items: 4 },
    { id: 'PO-2015', vendorId: 'V-004', vendor: 'Vendor D', date: '2026-08-24', amount: 95000,   status: 'Pending',  expected: '2026-09-02', items: 1 },
  ],

  goodsReceipts: [
    { id: 'GRN-2011', poId: 'PO-2011', vendor: 'Vendor A', date: '2026-08-24', items: 3, qty: 500,  bin: 'A-12-B-01', qc: 'Passed',  status: 'Put-away done' },
    { id: 'GRN-2012', poId: 'PO-2012', vendor: 'Vendor C', date: '2026-08-23', items: 5, qty: 1200, bin: 'A-12-B-02', qc: 'Pending', status: 'QC in progress' },
    { id: 'GRN-2013', poId: 'PO-2014', vendor: 'Vendor A', date: '2026-08-22', items: 2, qty: 780,  bin: 'A-13-B-01', qc: 'Passed',  status: 'Awaiting invoice' },
  ],

  /* -------- SALES -------- */
  deals: [
    { id: 'D-01', title: 'ABC Industries · Pump Assembly', value: 480000,  owner: 'Neha Singh', stage: 'Qualified',   customerId: 'CU-001', days: 5 },
    { id: 'D-02', title: 'LMN Pharma · Motor Frames',      value: 1240000, owner: 'Neha Singh', stage: 'Proposal',    customerId: 'CU-004', days: 12 },
    { id: 'D-03', title: 'XYZ Mfg · Brackets',             value: 220000,  owner: 'Neha Singh', stage: 'Contacted',   customerId: 'CU-002', days: 2 },
    { id: 'D-04', title: 'PQR Eng · Copper Wire',          value: 680000,  owner: 'Neha Singh', stage: 'Negotiation', customerId: 'CU-003', days: 21 },
  ],

  quotations: [
    { id: 'Q-4011', customerId: 'CU-001', customer: 'ABC Industries',    value: 480000,  date: '2026-08-22', expiry: '2026-09-05', ver: 'v2', status: 'Sent' },
    { id: 'Q-4012', customerId: 'CU-004', customer: 'LMN Pharma',        value: 1240000, date: '2026-08-20', expiry: '2026-09-03', ver: 'v1', status: 'Pending Approval' },
    { id: 'Q-4013', customerId: 'CU-002', customer: 'XYZ Manufacturing', value: 220000,  date: '2026-08-18', expiry: '2026-08-30', ver: 'v3', status: 'Draft' },
  ],

  salesOrders: [
    { id: 'SO-1043', customerId: 'CU-001', customer: 'ABC Industries',    value: 480000, date: '2026-08-20', delivery: '2026-08-28', items: 4, status: 'Confirmed' },
    { id: 'SO-1042', customerId: 'CU-002', customer: 'XYZ Manufacturing', value: 220000, date: '2026-08-12', delivery: '2026-08-22', items: 2, status: 'Delivered' },
    { id: 'SO-1041', customerId: 'CU-003', customer: 'PQR Engineering',   value: 185000, date: '2026-08-02', delivery: '2026-08-15', items: 3, status: 'Invoiced' },
  ],

  /* -------- MANUFACTURING -------- */
  boms: [
    { id: 'BOM-001', product: 'Pump Assembly A', level: 3, components: 14, ver: 'v3', effective: '2026-04-01', status: 'Active' },
    { id: 'BOM-002', product: 'Motor Frame B',   level: 3, components: 9,  ver: 'v2', effective: '2026-06-15', status: 'Active' },
    { id: 'BOM-003', product: 'Bracket C',       level: 2, components: 4,  ver: 'v1', effective: '2026-01-10', status: 'Active' },
  ],

  productionOrders: [
    { id: 'PRO-1042', product: 'Pump Assembly A', qty: 50,  status: 'Completed',   progress: 100, due: '2026-08-22' },
    { id: 'PRO-1043', product: 'Motor Frame B',   qty: 120, status: 'In Progress', progress: 65,  due: '2026-08-28' },
    { id: 'PRO-1044', product: 'Bracket C',       qty: 300, status: 'Planned',     progress: 0,   due: '2026-09-05' },
  ],

  workCenters: [
    { id: 'WC-01', name: 'Lathe Bay',     capacity: 40, used: 30, rate: 850 },
    { id: 'WC-02', name: 'Milling Bay',   capacity: 30, used: 27, rate: 950 },
    { id: 'WC-03', name: 'CNC Cell',      capacity: 25, used: 22, rate: 1200 },
    { id: 'WC-04', name: 'Welding Bay',   capacity: 45, used: 38, rate: 720 },
    { id: 'WC-05', name: 'Assembly Line', capacity: 50, used: 42, rate: 600 },
  ],

  machines: [
    { id: 'MCH-001', name: 'CNC Lathe Fanuc T-200',    wc: 'WC-01', make: 'Fanuc',            installed: '2022-03-12', runtime: 18420, mtbf: 420, lastMaint: '2026-06-15', status: 'Running' },
    { id: 'MCH-002', name: 'Milling Machine Haas VF-4',wc: 'WC-02', make: 'Haas',             installed: '2021-08-22', runtime: 22110, mtbf: 380, lastMaint: '2026-05-20', status: 'Running' },
    { id: 'MCH-003', name: 'CNC 5-axis DMG Mori',      wc: 'WC-03', make: 'DMG Mori',         installed: '2023-11-04', runtime: 8900,  mtbf: 520, lastMaint: '2026-08-01', status: 'Running' },
    { id: 'MCH-004', name: 'MIG Welder Lincoln',       wc: 'WC-04', make: 'Lincoln',          installed: '2020-06-18', runtime: 31200, mtbf: 250, lastMaint: '2026-04-10', status: 'Maintenance' },
    { id: 'MCH-005', name: 'Assembly Robot UR-10',     wc: 'WC-05', make: 'Universal Robots', installed: '2024-02-28', runtime: 4500,  mtbf: 610, lastMaint: '2026-07-15', status: 'Running' },
  ],

  /* -------- HRMS -------- */
  leaveRequests: [
    { id: 'LV-101', empId: 'E-001', emp: 'Rajesh Kumar', type: 'Casual', from: '2026-09-01', to: '2026-09-03', days: 3, reason: 'Family function', status: 'Pending' },
    { id: 'LV-102', empId: 'E-002', emp: 'Neha Singh',   type: 'Sick',   from: '2026-08-28', to: '2026-08-29', days: 2, reason: 'Medical',         status: 'Approved' },
    { id: 'LV-103', empId: 'E-003', emp: 'Arun Verma',   type: 'Earned', from: '2026-09-15', to: '2026-09-20', days: 6, reason: 'Vacation',        status: 'Pending' },
  ],

  attendance: [
    { id: 'AT-001', empId: 'E-001', name: 'Rajesh Kumar', dept: 'Production', in: '09:02', out: '18:15', hrs: 9.2,  ot: 0,   status: 'Present' },
    { id: 'AT-002', empId: 'E-002', name: 'Neha Singh',   dept: 'Sales',      in: '09:35', out: '18:45', hrs: 9.2,  ot: 0,   status: 'Late' },
    { id: 'AT-003', empId: 'E-003', name: 'Arun Verma',   dept: 'Finance',    in: '08:58', out: '18:20', hrs: 9.4,  ot: 0.4, status: 'Present' },
  ],

  recruitment: [
    { id: 'REQ-101', title: 'Sr. Production Engineer', dept: 'Production', openings: 2, candidates: 18, posted: '2026-08-05', priority: 'High', status: 'Interviewing' },
    { id: 'REQ-102', title: 'Sales Manager',           dept: 'Sales',      openings: 1, candidates: 12, posted: '2026-08-10', priority: 'High', status: 'Screening' },
  ],

  /* -------- WORKFLOW / AI -------- */
  automationRules: [
    { id: 'R-01', when: 'Invoice > ₹10,00,000', if_: 'Customer credit limit exceeded', then: 'Send approval request to CFO', active: true },
    { id: 'R-02', when: 'Stock < Reorder Level', then: 'Create Purchase Requisition', active: true },
    { id: 'R-03', when: 'Employee certification expires in 30 days', then: 'Notify HR + Employee', active: true },
  ],

  aiAlerts: [
    { id: 'AL-01', level: 'critical',  title: 'Stockout predicted',        msg: 'IT-100 Steel Plate projected below safety stock in 12 days', module: 'Inventory',     ts: new Date().toISOString() },
    { id: 'AL-02', level: 'warning',   title: 'Vendor price anomaly',      msg: 'Vendor A price +22% vs previous PO on IT-205',              module: 'Purchasing',    ts: new Date().toISOString() },
    { id: 'AL-03', level: 'attention', title: 'Contract expiring',         msg: 'Vendor B contract expires in 18 days',                       module: 'Purchasing',    ts: new Date().toISOString() },
    { id: 'AL-04', level: 'info',      title: 'Production order complete', msg: 'PRO-1042 finished goods received',                           module: 'Manufacturing', ts: new Date().toISOString() },
  ],

  notifications: [
    { id: 'N-01', level: 'critical', title: 'Stockout predicted',       msg: 'IT-100 below safety stock in 12 days', read: false, ts: new Date().toISOString() },
    { id: 'N-02', level: 'warning',  title: 'Invoice approval pending', msg: 'VI-3002 awaiting approval',            read: false, ts: new Date().toISOString() },
  ],

    /* -------- SUPPLY CHAIN -------- */
  demandForecast: [
    { month: 'Apr', actual: 8.2, forecast: 8.4, accuracy: 94.2 },
    { month: 'May', actual: 8.9, forecast: 9.1, accuracy: 95.1 },
    { month: 'Jun', actual: 9.4, forecast: 9.6, accuracy: 96.4 },
    { month: 'Jul', actual: 10.1, forecast: 10.0, accuracy: 95.8 },
    { month: 'Aug', actual: 10.8, forecast: 10.9, accuracy: 97.2 },
    { month: 'Sep', actual: null, forecast: 11.2, accuracy: null },
    { month: 'Oct', actual: null, forecast: 11.8, accuracy: null },
    { month: 'Nov', actual: null, forecast: 12.4, accuracy: null },
  ],

  mrpRuns: [
    { id: 'MRP-001', itemCode: 'IT-100', name: 'Steel Plate 5mm',  required: 150, available: 80,  gap: 70,  action: 'Purchase 170 KG',  vendor: 'Vendor A', status: 'Suggested' },
    { id: 'MRP-002', itemCode: 'IT-310', name: 'Bearing SKF-6205', required: 120, available: 45,  gap: 75,  action: 'Purchase 155 PCS', vendor: 'Vendor C', status: 'Suggested' },
    { id: 'MRP-003', itemCode: 'IT-401', name: 'Motor 5HP',        required: 18,  available: 12,  gap: 6,   action: 'Purchase 21 PCS',  vendor: 'Vendor B', status: 'Pending' },
    { id: 'MRP-004', itemCode: 'IT-550', name: 'Copper Wire 2mm',  required: 900, available: 1200,gap: 0,   action: 'No action',        vendor: '—',        status: 'OK' },
  ],

  replenishments: [
    { id: 'REP-001', itemCode: 'IT-100', name: 'Steel Plate 5mm',  stock: 80,  safety: 100, recommend: 170, vendor: 'Vendor A', auto: true },
    { id: 'REP-002', itemCode: 'IT-310', name: 'Bearing SKF-6205', stock: 45,  safety: 80,  recommend: 155, vendor: 'Vendor C', auto: true },
    { id: 'REP-003', itemCode: 'IT-401', name: 'Motor 5HP',        stock: 12,  safety: 15,  recommend: 21,  vendor: 'Vendor B', auto: false },
  ],

  suppliers: [
    { id: 'V-001', name: 'Vendor A', quoted: 7,  actual: 7,  variance: 0,  onTime: 96, rating: 4.5 },
    { id: 'V-002', name: 'Vendor B', quoted: 15, actual: 18, variance: 3,  onTime: 78, rating: 4.0 },
    { id: 'V-003', name: 'Vendor C', quoted: 5,  actual: 5,  variance: 0,  onTime: 98, rating: 4.7 },
    { id: 'V-004', name: 'Vendor D', quoted: 10, actual: 12, variance: 2,  onTime: 82, rating: 3.8 },
  ],

  /* -------- MANUFACTURING EXTRAS -------- */
  routings: [
    { id: 'RT-001', product: 'Pump Assembly A', ops: 7, wcs: 'WC-01 to WC-05, QC', ver: 'v2', status: 'Active' },
    { id: 'RT-002', product: 'Motor Frame B',   ops: 5, wcs: 'WC-02, WC-03, WC-04', ver: 'v1', status: 'Active' },
    { id: 'RT-003', product: 'Bracket C',       ops: 3, wcs: 'WC-02',             ver: 'v1', status: 'Active' },
  ],

  qualityChecks: [
    { id: 'QC-401', order: 'PRO-1042', item: 'Pump Assembly A', sampled: 50,  passed: 50,  defects: 0, insp: 'A. Verma', result: 'Passed' },
    { id: 'QC-402', order: 'PRO-1043', item: 'Motor Frame B',   sampled: 120, passed: 118, defects: 2, insp: 'A. Verma', result: 'Conditional' },
    { id: 'QC-403', order: 'PRO-1044', item: 'Bracket C',       sampled: 300, passed: 294, defects: 6, insp: 'P. Nair',  result: 'Failed' },
    { id: 'QC-404', order: 'PRO-1045', item: 'Valve Body E',    sampled: 80,  passed: 80,  defects: 0, insp: 'A. Verma', result: 'Passed' },
  ],

  oeeData: {
    overall: 82.4, availability: 91.2, performance: 92.8, quality: 96.4,
    byWc: [
      { wc: 'WC-01', availability: 92, performance: 94, quality: 97 },
      { wc: 'WC-02', availability: 88, performance: 90, quality: 95 },
      { wc: 'WC-03', availability: 94, performance: 96, quality: 98 },
      { wc: 'WC-04', availability: 90, performance: 89, quality: 96 },
      { wc: 'WC-05', availability: 92, performance: 95, quality: 96 },
    ],
    downtime: [
      { reason: 'Unplanned maintenance', machine: 'MCH-004', hours: 5.5, impact: 'High' },
      { reason: 'Material shortage',     machine: 'WC-03',   hours: 3.0, impact: 'Medium' },
      { reason: 'Operator break',        machine: 'WC-01',   hours: 1.5, impact: 'Low' },
      { reason: 'Setup changeover',      machine: 'WC-02',   hours: 2.5, impact: 'Medium' },
    ],
  },

  /* -------- HRMS EXTRAS -------- */
  payroll: [
    { id: 'PAY-001', emp: 'Rajesh Kumar', gross: 75000, ded: 12000, net: 63000, status: 'Ready' },
    { id: 'PAY-002', emp: 'Neha Singh',   gross: 92000, ded: 14500, net: 77500, status: 'Ready' },
    { id: 'PAY-003', emp: 'Arun Verma',   gross: 55000, ded: 8000,  net: 47000, status: 'Ready' },
    { id: 'PAY-004', emp: 'Sunita Patel', gross: 48000, ded: 7000,  net: 41000, status: 'Ready' },
    { id: 'PAY-005', emp: 'Manoj Joshi',  gross: 32000, ded: 4500,  net: 27500, status: 'Ready' },
  ],

  performance: [
    { name: 'Rajesh Kumar', dept: 'Production', mgr: 'Priya Nair',   self: true,  mgrDone: true,  rating: 4.2 },
    { name: 'Neha Singh',   dept: 'Sales',      mgr: 'Rahul Mehta',  self: true,  mgrDone: false, rating: 4.6 },
    { name: 'Arun Verma',   dept: 'Finance',    mgr: 'Anita Sharma', self: true,  mgrDone: true,  rating: 3.8 },
    { name: 'Manoj Joshi',  dept: 'Production', mgr: 'Priya Nair',   self: false, mgrDone: false, rating: null },
  ],

  trainings: [
    { title: 'CNC Programming Advanced', cat: 'Technical',   trainer: 'Fanuc India',  start: '2026-09-15', dur: '3 days', enrolled: 8,  status: 'Scheduled' },
    { title: 'Safety & Compliance FY27', cat: 'Compliance',  trainer: 'Internal',     start: '2026-08-10', dur: '1 day',  enrolled: 42, status: 'Completed' },
    { title: 'Sales Negotiation',         cat: 'Soft Skills', trainer: 'External',     start: '2026-09-01', dur: '2 days', enrolled: 12, status: 'Ongoing' },
    { title: 'Six Sigma Green Belt',      cat: 'Process',     trainer: 'ASQ Certified',start: '2026-10-05', dur: '5 days', enrolled: 15, status: 'Scheduled' },
  ],

  /* -------- ADMIN EXTRAS -------- */
  users: [
    { name: 'Rahul Mehta',  email: 'ceo@acme.com',       role: 'CEO',              status: 'Active',    lastLogin: '2026-10-14 08:15' },
    { name: 'Anita Sharma', email: 'cfo@acme.com',       role: 'CFO',              status: 'Active',    lastLogin: '2026-10-14 09:02' },
    { name: 'Vikram Rao',   email: 'purchase@acme.com',  role: 'Purchase Manager', status: 'Active',    lastLogin: '2026-10-14 09:30' },
    { name: 'Suresh Kumar', email: 'warehouse@acme.com', role: 'Warehouse Manager',status: 'Active',    lastLogin: '2026-10-14 08:45' },
    { name: 'Priya Nair',   email: 'production@acme.com',role: 'Production Manager',status: 'Active',   lastLogin: '2026-10-13 17:20' },
    { name: 'Kavita Iyer',  email: 'hr@acme.com',        role: 'HR Manager',       status: 'Active',    lastLogin: '2026-10-14 10:12' },
    { name: 'New Joiner',   email: 'new@acme.com',       role: 'Purchase Executive',status: 'Invited',  lastLogin: '—' },
  ],

  integrations: [
    { name: 'Tally Prime',       desc: 'Sync GL entries from Tally',            icon: 'book',        status: 'Connected' },
    { name: 'Zoho CRM',          desc: 'Bi-directional lead & opportunity sync',icon: 'users',       status: 'Connected' },
    { name: 'Razorpay',          desc: 'Payment gateway for customer invoices', icon: 'dollar-sign', status: 'Connected' },
    { name: 'WhatsApp Business', desc: 'Notification channel for alerts',       icon: 'send',        status: 'Available' },
    { name: 'Biometric ZKTeco',  desc: 'Attendance punch-in sync',              icon: 'scan',        status: 'Connected' },
    { name: 'AWS S3',            desc: 'Document storage & backups',            icon: 'database',    status: 'Connected' },
    { name: 'Slack',             desc: 'Alert routing to channels',             icon: 'send',        status: 'Available' },
    { name: 'Bank HDFC',         desc: 'Statement import & reconciliation',     icon: 'building',    status: 'Connected' },
    { name: 'Zoom',              desc: 'Interview scheduling (Recruitment)',    icon: 'calendar',    status: 'Available' },
  ],

    /* -------- BATCH 2 DATA -------- */
  bankStatements: [
    { date: '2026-10-01', ref: 'TXN-2001', desc: 'Customer ABC receipt NEFT', amount: 850000, type: 'credit', matched: 'TXN-1001', status: 'Matched' },
    { date: '2026-10-02', ref: 'TXN-2002', desc: 'Vendor A payment RTGS',     amount: 480000, type: 'debit',  matched: 'TXN-1002', status: 'Matched' },
    { date: '2026-10-03', ref: 'TXN-2003', desc: 'Unknown credit',            amount: 85000,  type: 'credit', matched: null,       status: 'Unmatched' },
    { date: '2026-10-04', ref: 'TXN-2004', desc: 'Partial match PO-2011',     amount: 95000,  type: 'debit',  matched: 'TXN-1004', status: 'Partial' },
    { date: '2026-10-05', ref: 'TXN-2005', desc: 'Duplicate suspected',       amount: 250000, type: 'debit',  matched: null,       status: 'Exception' },
  ],

  batchSerials: [
    { id: 'BATCH-2026-08-15', item: 'IT-100 Steel Plate', mfg: '2026-08-15', exp: '2027-08-15', qty: 80,  bin: 'A-12-B-01', daysLeft: 300 },
    { id: 'BATCH-2026-07-22', item: 'IT-205 Aluminium',   mfg: '2026-07-22', exp: '2027-07-22', qty: 420, bin: 'A-12-B-02', daysLeft: 280 },
    { id: 'BATCH-2025-09-30', item: 'IT-310 Bearing',     mfg: '2025-09-30', exp: '2026-11-15', qty: 45,  bin: 'A-12-B-03', daysLeft: 30 },
  ],

  cycleCounts: [
    { id: 'CC-101', date: '2026-10-12', item: 'IT-100 Steel Plate', system: 92,  physical: 80,  diff: -12, value: -2880, status: 'Adjustment pending' },
    { id: 'CC-102', date: '2026-10-12', item: 'IT-205 Aluminium',   system: 420, physical: 420, diff: 0,   value: 0,     status: 'Matched' },
    { id: 'CC-103', date: '2026-10-11', item: 'IT-310 Bearing',     system: 48,  physical: 45,  diff: -3,  value: -9000, status: 'Adjustment pending' },
    { id: 'CC-104', date: '2026-10-10', item: 'IT-550 Copper Wire', system: 1200,physical: 1200,diff: 0,   value: 0,     status: 'Matched' },
  ],

  approvalThresholds: {
    po_cfo:  1000000,   // PO > ₹10L requires CFO
    po_ceo:  5000000,   // PO > ₹50L requires CEO
    discount_manager: 0.10,   // Sales Mgr discount up to 10%
    discount_cfo:     0.20,   // CFO up to 20%
    stock_adjust: 50000,      // Warehouse Mgr adjustment up to ₹50K
  },
  
    /* -------- MISSING MODULE DATA -------- */
  chartOfAccounts: [
    { code: '1000', name: 'Cash & Bank', type: 'Asset' },
    { code: '1100', name: 'Accounts Receivable', type: 'Asset' },
    { code: '2000', name: 'Accounts Payable', type: 'Liability' },
    { code: '4000', name: 'Sales Revenue', type: 'Revenue' },
  ],

  bomTree: [
    { level: 0, code: 'FG-PUMP', name: 'Pump Assembly A', qty: 1, uom: 'PCS' },
    { level: 1, code: 'SA-SHAFT', name: 'Shaft Module', qty: 1, uom: 'PCS' },
    { level: 2, code: 'IT-100', name: 'Steel Plate 5mm', qty: 12, uom: 'KG' },
    { level: 2, code: 'IT-310', name: 'Bearing SKF-6205', qty: 2, uom: 'PCS' },
    { level: 1, code: 'IT-205', name: 'Aluminium Sheet', qty: 4, uom: 'KG' },
  ],

  rfqComparison: {
    id: 'RFQ-205',
    item: 'Steel Plate 5mm',
    qty: 500,
    vendors: [
      { id: 'V-001', name: 'Vendor A', price: 100, delivery: 7, terms: '30 Days', rating: 4.5, total: 50000 },
      { id: 'V-002', name: 'Vendor B', price: 95, delivery: 15, terms: '45 Days', rating: 4.0, total: 47500 },
      { id: 'V-003', name: 'Vendor C', price: 110, delivery: 5, terms: '30 Days', rating: 4.7, total: 55000 },
    ]
  },

  dmsDocuments: [
    { id: 'DOC-001', name: 'Vendor A GST Certificate.pdf', entity: 'Vendor A', type: 'Certificate', version: 'v1', expiry: '2027-03-31', status: 'Active' },
    { id: 'DOC-002', name: 'Master Service Agreement.pdf', entity: 'ABC Industries', type: 'Contract', version: 'v2', expiry: '2026-12-31', status: 'Active' },
    { id: 'DOC-003', name: 'ISO 9001 Audit.pdf', entity: 'Company', type: 'SOP', version: 'v1', expiry: '2026-11-01', status: 'Expiring' },
  ],

  cashFlowWaterfall: [
    { label: 'Opening Cash', value: 41000000, type: 'total' },
    { label: 'Receivables', value: 24000000, type: 'in' },
    { label: 'Payables', value: -18000000, type: 'out' },
    { label: 'Payroll', value: -4500000, type: 'out' },
    { label: 'Taxes', value: -3200000, type: 'out' },
    { label: 'CAPEX', value: -2800000, type: 'out' },
    { label: 'Closing Cash', value: 36500000, type: 'total' }
  ],
  
  // Add or verify these keys inside export const db = { ... } in state.js

  companies: [
    { id: 'CMP-01', name: 'Acme Global Holdings (US HQ)', currency: 'USD', country: 'United States', status: 'Active' },
    { id: 'CMP-02', name: 'Acme Industrial Europe BV',   currency: 'EUR', country: 'Netherlands',   status: 'Active' },
    { id: 'CMP-03', name: 'Acme Manufacturing India Ltd', currency: 'INR', country: 'India',         status: 'Active' }
  ],

  costCenters: [
    { code: 'CC-100', name: 'Plant Operations', dept: 'Manufacturing', budget: 15000000, spent: 11200000 },
    { code: 'CC-200', name: 'Supply Chain & Logistics', dept: 'Logistics', budget: 8000000, spent: 6100000 },
    { code: 'CC-300', name: 'R&D Engineering', dept: 'Engineering', budget: 12000000, spent: 9800000 },
    { code: 'CC-400', name: 'Corporate Sales & Marketing', dept: 'Sales', budget: 10000000, spent: 8400000 },
  ],

  fiscalPeriods: [
    { period: '2026-Q1', name: 'Q1 FY26', start: '2026-01-01', end: '2026-03-31', status: 'Closed' },
    { period: '2026-Q2', name: 'Q2 FY26', start: '2026-04-01', end: '2026-06-30', status: 'Closed' },
    { period: '2026-Q3', name: 'Q3 FY26', start: '2026-07-01', end: '2026-09-30', status: 'Open' },
    { period: '2026-Q4', name: 'Q4 FY26', start: '2026-10-01', end: '2026-12-31', status: 'Future' },
  ],

  // International Tax Filings (VAT, Sales Tax, WHT)
  taxFilings: [
    { id: 'TX-001', form: 'EU VAT Return', period: 'Aug 2026', due: '2026-09-20', amount: 1420000, status: 'Pending', jurisdiction: 'Netherlands (NL)' },
    { id: 'TX-002', form: 'US Sales & Use Tax', period: 'Q2 2026', due: '2026-07-31', amount: 890000, status: 'Filed', jurisdiction: 'Delaware (US)' },
    { id: 'TX-003', form: 'GST / VAT Form 1', period: 'Aug 2026', due: '2026-09-11', amount: 2150000, status: 'Pending', jurisdiction: 'India (MH)' },
  ], 

  /* ============================================================
   ADDITIONS TO db OBJECT IN state.js FOR MODULE 1
   ============================================================ */

  // Hierarchical 4-Tier Chart of Accounts (§5.1.A)
  chartOfAccountsHierarchical: [
    { code: '1000', name: 'ASSETS', level: 0, type: 'Header', balance: 74500000 },
    { code: '1100', name: 'Current Assets', level: 1, type: 'Header', balance: 59300000 },
    { code: '1110', name: 'Cash and Liquid Cash Equivalents', level: 2, type: 'Header', balance: 41000000 },
    { code: '1111', name: 'Operating Bank Account - Corporate Treasury', level: 3, type: 'Asset', balance: 35000000, postable: true },
    { code: '1112', name: 'Payroll Clearing Account', level: 3, type: 'Asset', balance: 6000000, postable: true },
    { code: '1120', name: 'Accounts Receivable (Trade Debtors)', level: 2, type: 'Asset', balance: 18300000, postable: true },
    { code: '1200', name: 'Non-Current Assets', level: 1, type: 'Header', balance: 15200000 },
    { code: '1210', name: 'Property, Plant & Machinery (At Cost)', level: 2, type: 'Asset', balance: 15400000, postable: true },
    { code: '1220', name: 'Accumulated Depreciation - Plant & Equip', level: 2, type: 'Asset', balance: -4420000, postable: true },

    { code: '2000', name: 'LIABILITIES', level: 0, type: 'Header', balance: 38200000 },
    { code: '2100', name: 'Current Liabilities', level: 1, type: 'Header', balance: 38200000 },
    { code: '2110', name: 'Accounts Payable (Trade Creditors)', level: 2, type: 'Liability', balance: 22400000, postable: true },
    { code: '2120', name: 'Statutory Taxes & VAT / GST Payable', level: 2, type: 'Liability', balance: 4800000, postable: true },
    { code: '2130', name: 'Accrued Payroll & Employee Obligations', level: 2, type: 'Liability', balance: 11000000, postable: true },

    { code: '3000', name: 'EQUITY', level: 0, type: 'Header', balance: 36300000 },
    { code: '3100', name: 'Common Share Capital', level: 1, type: 'Equity', balance: 20000000, postable: true },
    { code: '3200', name: 'Retained Earnings (Reserves)', level: 1, type: 'Equity', balance: 16300000, postable: true },

    { code: '4000', name: 'REVENUE', level: 0, type: 'Header', balance: 124000000 },
    { code: '4100', name: 'Domestic Sales Revenue', level: 1, type: 'Revenue', balance: 98000000, postable: true },
    { code: '4200', name: 'International Export Sales', level: 1, type: 'Revenue', balance: 26000000, postable: true },

    { code: '5000', name: 'COST OF GOODS SOLD (COGS)', level: 0, type: 'Header', balance: 68000000 },
    { code: '5100', name: 'Direct Raw Material Consumption', level: 1, type: 'Expense', balance: 48000000, postable: true },
    { code: '5200', name: 'Direct Manufacturing Labor', level: 1, type: 'Expense', balance: 20000000, postable: true },

    { code: '6000', name: 'OPERATING EXPENSES (OPEX)', level: 0, type: 'Header', balance: 28000000 },
    { code: '6100', name: 'Salaries & Staff Welfare', level: 1, type: 'Expense', balance: 18000000, postable: true },
    { code: '6200', name: 'Facilities & Utilities', level: 1, type: 'Expense', balance: 4500000, postable: true },
    { code: '6300', name: 'Depreciation & Amortization Expense', level: 1, type: 'Expense', balance: 2500000, postable: true },
    { code: '6400', name: 'Sales, Marketing & Travel', level: 1, type: 'Expense', balance: 3000000, postable: true },
  ],

  // Recurring Journal Schedules (§5.1.A)
  recurringJournals: [
    { id: 'REC-001', title: 'Corporate HQ Lease Amortization', schedule: 'Monthly (1st)', debitAccount: '6200 · Facilities & Utilities', creditAccount: '1111 · Cash & Bank', amount: 450000, nextRun: '2026-11-01', status: 'Active' },
    { id: 'REC-002', title: 'Plant Machinery Depreciation Run', schedule: 'Monthly (Last day)', debitAccount: '6300 · Depreciation Expense', creditAccount: '1220 · Accumulated Depreciation', amount: 320000, nextRun: '2026-10-31', status: 'Active' },
    { id: 'REC-003', title: 'Enterprise Software License Accrual', schedule: 'Quarterly', debitAccount: '6100 · Operating Expenses', creditAccount: '2110 · Accounts Payable', amount: 850000, nextRun: '2026-12-31', status: 'Active' },
  ],

  // Debit / Credit Notes (§5.1.A, §5.1.B)
  memoNotes: [
    { id: 'DN-101', type: 'Debit Note', party: 'Vendor B', refInv: 'VI-3003', date: '2026-08-23', amount: 35000, reason: 'Defective batch materials returned to supplier', status: 'Posted' },
    { id: 'CN-201', type: 'Credit Note', party: 'ABC Industries', refInv: 'INV-3021', date: '2026-08-25', amount: 48000, reason: 'Early settlement prompt payment rebate (2%)', status: 'Approved' },
  ],

  // Fiscal Periods & Soft/Hard Closing (§5.1.A)
  fiscalPeriods: [
    { period: '2026-Q1', name: 'Q1 FY26', start: '2026-01-01', end: '2026-03-31', status: 'Hard Closed', lockedBy: 'Anita Sharma (CFO)' },
    { period: '2026-Q2', name: 'Q2 FY26', start: '2026-04-01', end: '2026-06-30', status: 'Hard Closed', lockedBy: 'Anita Sharma (CFO)' },
    { period: '2026-Q3', name: 'Q3 FY26', start: '2026-07-01', end: '2026-09-30', status: 'Open', lockedBy: '—' },
    { period: '2026-Q4', name: 'Q4 FY26', start: '2026-10-01', end: '2026-12-31', status: 'Future', lockedBy: '—' },
  ],

  // Multi-Company Subsidiaries for Consolidations (§5.1.A, §7)
  companies: [
    { id: 'CMP-01', name: 'Acme Global Holdings (US HQ)', currency: 'USD', country: 'United States', status: 'Parent' },
    { id: 'CMP-02', name: 'Acme Industrial Europe BV', currency: 'EUR', country: 'Netherlands', status: 'Subsidiary' },
    { id: 'CMP-03', name: 'Acme Manufacturing India Ltd', currency: 'INR', country: 'India', status: 'Subsidiary' },
  ],

  // Cost Center Allocations (§5.1.A)
  costCenters: [
    { code: 'CC-100', name: 'Plant Operations', dept: 'Manufacturing', budget: 15000000, spent: 11200000 },
    { code: 'CC-200', name: 'Supply Chain & Logistics', dept: 'Logistics', budget: 8000000, spent: 6100000 },
    { code: 'CC-300', name: 'R&D Engineering', dept: 'Engineering', budget: 12000000, spent: 9800000 },
    { code: 'CC-400', name: 'Corporate Sales & Marketing', dept: 'Sales', budget: 10000000, spent: 8400000 },
  ],

  // Multi-Jurisdiction Compliance Filings (§5.1.A, §5.1.E)
  taxFilings: [
    { id: 'TX-001', form: 'EU VAT Return', period: 'Aug 2026', due: '2026-09-20', amount: 1420000, status: 'Pending', jurisdiction: 'Netherlands (NL)' },
    { id: 'TX-002', form: 'US Sales & Use Tax', period: 'Q2 2026', due: '2026-07-31', amount: 890000, status: 'Filed', jurisdiction: 'Delaware (US)' },
    { id: 'TX-003', form: 'GST / VAT Form 1', period: 'Aug 2026', due: '2026-09-11', amount: 2150000, status: 'Pending', jurisdiction: 'India (MH)' },
  ],
  /* ============================================================
   ADDITIONS TO db OBJECT IN state.js FOR MODULE 2: SALES & CRM
   ============================================================ */

  // Price Lists for Tiered Pricing (§5.2)
  priceLists: [
    { id: 'PL-STD', name: 'Standard Wholesale USD', currency: 'USD', defaultMargin: '25%', status: 'Active' },
    { id: 'PL-ENT', name: 'Enterprise Key Accounts (15% Disc)', currency: 'USD', defaultMargin: '18%', status: 'Active' },
    { id: 'PL-EXP', name: 'International Export Rates', currency: 'EUR', defaultMargin: '30%', status: 'Active' },
  ],

  // Extended Customer 360 Mock Data (§5.2, §10.4)
  customerComplaints: [
    { id: 'CMP-401', customerId: 'CU-001', title: 'Packaging damaged on Motor Frames', severity: 'Medium', status: 'Resolved', date: '2026-08-12', agent: 'Neha Singh' },
    { id: 'CMP-402', customerId: 'CU-004', title: 'Delayed dispatch notice for Pump Assembly', severity: 'Low', status: 'Investigating', date: '2026-08-21', agent: 'Neha Singh' },
  ],

  customerActivities: [
    { id: 'ACT-01', customerId: 'CU-001', type: 'Call', title: 'Q4 Contract renewal discussion', date: '2026-08-24', notes: 'Customer requested 5% additional rebate on volume exceeding $500K.' },
    { id: 'ACT-02', customerId: 'CU-002', type: 'Meeting', title: 'Plant visit & technical evaluation', date: '2026-08-18', notes: 'Demoed CNC precision brackets. Sent proposal quotation Q-4013.' },
  ],

  /* ============================================================
   ADDITIONS TO db OBJECT IN state.js FOR MODULE 3: PURCHASING
   ============================================================ */

  // Vendor Performance History & Contracts (§5.3, §10.4)
  vendorContracts: [
    { id: 'CNT-01', vendorId: 'V-001', title: 'Annual Raw Steel Supply Master Agreement', effective: '2026-01-01', expiry: '2026-12-31', spendCap: 15000000, status: 'Active' },
    { id: 'CNT-02', vendorId: 'V-002', title: 'Aluminium Extrusions Framework Contract', effective: '2026-03-01', expiry: '2027-02-28', spendCap: 10000000, status: 'Active' },
    { id: 'CNT-03', vendorId: 'V-003', title: 'Precision Component Consignment SLA', effective: '2025-06-01', expiry: '2026-09-15', spendCap: 12000000, status: 'Expiring Soon' },
  ],

  vendorEvaluations: [
    { vendorId: 'V-001', qualityScore: 98.2, onTimeDelivery: 96.0, priceCompetitiveness: 92.5, auditPassed: true, lastAudit: '2026-06-12' },
    { vendorId: 'V-002', qualityScore: 91.0, onTimeDelivery: 78.0, priceCompetitiveness: 97.0, auditPassed: true, lastAudit: '2026-05-18' },
    { vendorId: 'V-003', qualityScore: 99.4, onTimeDelivery: 98.0, priceCompetitiveness: 88.0, auditPassed: true, lastAudit: '2026-07-22' },
    { vendorId: 'V-004', qualityScore: 86.5, onTimeDelivery: 82.0, priceCompetitiveness: 95.0, auditPassed: false, lastAudit: '2026-04-10' },
  ],
  
  /* ============================================================
   ADDITIONS TO db OBJECT IN state.js FOR MODULE 4: INVENTORY
   ============================================================ */

  // Warehouse Infrastructure Hierarchy (§5.4)
  warehouses: [
    {
      id: 'WH-01',
      name: 'Main Central Logistics Hub',
      code: 'WH-CENTRAL',
      loc: 'Pune Facility, Gate 3',
      capacityM3: 15000,
      utilizedPct: 78,
      zones: [
        { code: 'ZONE-A', name: 'Raw Material Bay (Heavy Metals)', racks: 12, temp: 'Ambient' },
        { code: 'ZONE-B', name: 'Component High-Bay (Automated)', racks: 24, temp: 'Climate Controlled' },
        { code: 'ZONE-C', name: 'Finished Goods Dispatch Area', racks: 8, temp: 'Ambient' },
      ]
    },
    {
      id: 'WH-02',
      name: 'Secondary Transit Warehouse',
      code: 'WH-TRANSIT',
      loc: 'Mumbai Port Logistics Park',
      capacityM3: 6500,
      utilizedPct: 42,
      zones: [
        { code: 'ZONE-INB', name: 'Import Clearance Staging', racks: 6, temp: 'Ambient' },
        { code: 'ZONE-EXP', name: 'Export Container Consolidation', racks: 6, temp: 'Ambient' },
      ]
    }
  ],

  // Stock Movement Ledger (§5.4, Screen #21)
  stockMovements: [
    { id: 'MOV-1001', date: '2026-08-24', type: 'Purchase Receipt', itemCode: 'IT-100', item: 'Steel Plate 5mm', qty: 500, from: 'Vendor A (V-001)', to: 'A-12-B-01', ref: 'GRN-2011', user: 'Suresh Kumar' },
    { id: 'MOV-1002', date: '2026-08-23', type: 'Production Issue', itemCode: 'IT-310', item: 'Bearing SKF-6205', qty: -40, from: 'A-12-B-03', to: 'PRO-1042 (Pump Assy)', ref: 'WO-1042', user: 'Priya Nair' },
    { id: 'MOV-1003', date: '2026-08-22', type: 'Internal Bin Transfer', itemCode: 'IT-205', item: 'Aluminium Sheet', qty: 60, from: 'A-12-B-02', to: 'A-13-B-01', ref: 'TRF-088', user: 'Suresh Kumar' },
    { id: 'MOV-1004', date: '2026-08-20', type: 'Cycle Count Adjustment', itemCode: 'IT-100', item: 'Steel Plate 5mm', qty: -12, from: 'A-12-B-01', to: 'Inventory Variance (GL)', ref: 'CC-101', user: 'Suresh Kumar' },
  ],

  

  auditLog: AUDIT,
};

/* ================================================================
   MUTATIONS — every one maps to a backend endpoint
   ================================================================ */
const seq = {};
function nextId(prefix) {
  seq[prefix] = (seq[prefix] || 0) + 1;
  return `${prefix}-${String(1000 + seq[prefix]).slice(-4)}`;
}

/* ---------- PURCHASING ---------- */
export function createPR(data) {
  const item = db.items.find(i => i.code === data.itemCode);
  const pr = {
    id: nextId('PR'),
    dept: data.dept,
    itemCode: data.itemCode,
    item: item?.name || data.itemCode,
    qty: Number(data.qty),
    amount: Number(data.qty) * (item?.rate || 100),
    status: 'Pending',
    requestedBy: window.__session?.name || 'system',
    date: new Date().toISOString().slice(0, 10),
  };
  db.purchaseRequisitions.unshift(pr);
  audit({ action: 'CREATE', entity: 'PurchaseRequisition', entityId: pr.id, next: pr });
  return pr;
}

export function approvePR(id) {
  const pr = db.purchaseRequisitions.find(p => p.id === id);
  if (!pr) throw new Error('PR not found');
  const prev = pr.status;
  pr.status = 'Approved';
  pr.approvedBy = window.__session?.name;
  audit({ action: 'APPROVE', entity: 'PurchaseRequisition', entityId: id, prev, next: 'Approved' });
  return pr;
}

export function createRFQFromPR(prId) {
  const pr = db.purchaseRequisitions.find(p => p.id === prId);
  if (!pr) throw new Error('PR not found');
  const rfq = {
    id: nextId('RFQ'),
    prId,
    item: pr.item,
    qty: pr.qty,
    status: 'Open',
    created: new Date().toISOString().slice(0, 10),
    responses: db.vendors.slice(0, 3).map(v => ({
      vendorId: v.id, vendor: v.name, price: v.price, delivery: v.delivery, payTerms: v.payTerms, rating: v.rating
    })),
  };
  db.rfqs.unshift(rfq);
  pr.status = 'Converted to RFQ';
  audit({ action: 'CREATE', entity: 'RFQ', entityId: rfq.id, next: rfq });
  return rfq;
}

export function createPOFromRFQ(rfqId, vendorId) {
  const rfq = db.rfqs.find(r => r.id === rfqId);
  if (!rfq) throw new Error('RFQ not found');
  const resp = rfq.responses.find(r => r.vendorId === vendorId);
  if (!resp) throw new Error('Vendor response not found');
  const po = {
    id: nextId('PO'),
    vendorId,
    vendor: resp.vendor,
    date: new Date().toISOString().slice(0, 10),
    amount: resp.price * rfq.qty,
    status: 'Pending',
    expected: addDays(new Date(), resp.delivery).toISOString().slice(0, 10),
    items: 1,
    rfqId,
  };
  db.purchaseOrders.unshift(po);
  rfq.status = 'Awarded';
  audit({ action: 'CREATE', entity: 'PurchaseOrder', entityId: po.id, next: po });
  return po;
}

export function approvePO(id) {
  const po = db.purchaseOrders.find(p => p.id === id);
  if (!po) throw new Error('PO not found');
  const prev = po.status;
  po.status = 'Approved';
  po.approvedBy = window.__session?.name;
  audit({ action: 'APPROVE', entity: 'PurchaseOrder', entityId: id, prev, next: 'Approved' });
  return po;
}

export function createGRN(poId, data = {}) {
  const po = db.purchaseOrders.find(p => p.id === poId);
  if (!po) throw new Error('PO not found');
  const grn = {
    id: nextId('GRN'),
    poId,
    vendor: po.vendor,
    date: new Date().toISOString().slice(0, 10),
    items: po.items,
    qty: Number(data.qty) || 500,
    bin: data.bin || 'A-12-B-01',
    qc: 'Pending',
    status: 'Received',
  };
  db.goodsReceipts.unshift(grn);
  const item = db.items[0];
  if (item) item.stock += grn.qty;
  audit({ action: 'CREATE', entity: 'GoodsReceipt', entityId: grn.id, next: grn });
  return grn;
}

export function passQC(id) {
  const grn = db.goodsReceipts.find(g => g.id === id);
  if (!grn) throw new Error('GRN not found');
  grn.qc = 'Passed';
  grn.status = 'Put-away done';
  audit({ action: 'QC_PASS', entity: 'GoodsReceipt', entityId: id });
  return grn;
}

export function threeWayMatch(poId, grnId, invoiceId) {
  const po  = db.purchaseOrders.find(p => p.id === poId);
  const grn = db.goodsReceipts.find(g => g.id === grnId);
  const inv = db.vendorInvoices.find(v => v.id === invoiceId);
  if (!po || !grn || !inv) throw new Error('Cannot match — missing document');
  const variance = inv.amount - po.amount;
  const tolerance = 0.02 * po.amount;
  const status = Math.abs(variance) <= tolerance ? 'Matched' : 'Exception';
  audit({ action: 'THREE_WAY_MATCH', entity: 'VendorInvoice', entityId: invoiceId, next: { status, variance } });
  return { status, variance, po, grn, inv };
}

/* ---------- FINANCE ---------- */
export function createVendorInvoice(data) {
  const vendor = db.vendors.find(v => v.id === data.vendorId);
  const vi = {
    id: nextId('VI'),
    vendorId: data.vendorId,
    vendor: vendor?.name || 'Vendor',
    po: data.po,
    grn: data.grn || '—',
    amount: Number(data.amount),
    due: data.due,
    match: data.grn ? '3-Way' : '2-Way',
    status: 'Pending',
    createdBy: window.__session?.name,
  };
  db.vendorInvoices.unshift(vi);
  audit({ action: 'CREATE', entity: 'VendorInvoice', entityId: vi.id, next: vi });
  return vi;
}

export function approveVendorInvoice(id) {
  const vi = db.vendorInvoices.find(v => v.id === id);
  if (!vi) throw new Error('Invoice not found');
  const prev = vi.status;
  vi.status = 'Approved';
  vi.approvedBy = window.__session?.name;
  const je = {
    id: nextId('JE'),
    date: new Date().toISOString().slice(0, 10),
    ref: vi.id,
    narrative: `Vendor invoice — ${vi.vendor}`,
    debit: vi.amount,
    credit: 0,
    account: '2000 · Payables',
    status: 'Posted',
  };
  db.journals.unshift(je);
  audit({ action: 'APPROVE', entity: 'VendorInvoice', entityId: id, prev, next: 'Approved' });
  audit({ action: 'POST', entity: 'Journal', entityId: je.id, next: je });
  return vi;
}

export function recordPayment(data) {
  const pay = {
    id: nextId('PMT'),
    type: data.type || 'vendor',
    refId: data.refId,
    amount: Number(data.amount),
    date: new Date().toISOString().slice(0, 10),
    mode: data.mode || 'NEFT',
    status: 'Completed',
  };
  db.payments.unshift(pay);
  if (data.type === 'vendor') {
    const vi = db.vendorInvoices.find(v => v.id === data.refId);
    if (vi) vi.status = 'Paid';
  } else if (data.type === 'customer') {
    const inv = db.customerInvoices.find(i => i.id === data.refId);
    if (inv) inv.status = 'Paid';
  }
  audit({ action: 'CREATE', entity: 'Payment', entityId: pay.id, next: pay });
  return pay;
}

export function createJournal(data) {
  const je = {
    id: nextId('JE'),
    date: data.date,
    ref: data.ref,
    narrative: data.narrative,
    debit: Number(data.debit) || 0,
    credit: Number(data.credit) || 0,
    account: data.account,
    status: 'Posted',
  };
  db.journals.unshift(je);
  audit({ action: 'CREATE', entity: 'Journal', entityId: je.id, next: je });
  return je;
}

export function capitalizeAsset(data) {
  const fa = {
    id: nextId('FA'),
    name: data.name,
    category: data.category,
    loc: data.loc,
    cost: Number(data.cost),
    dep: 0,
    nbv: Number(data.cost),
    life: Number(data.life),
    acquired: data.acquired,
    custodian: data.custodian,
  };
  db.fixedAssets.unshift(fa);
  audit({ action: 'CREATE', entity: 'FixedAsset', entityId: fa.id, next: fa });
  return fa;
}

export function fileTaxReturn(id) {
  const t = db.taxFilings.find(x => x.id === id);
  if (!t) throw new Error('Not found');
  t.status = 'Filed';
  t.filedOn = new Date().toISOString().slice(0, 10);
  audit({ action: 'FILE', entity: 'TaxReturn', entityId: id, next: 'Filed' });
  return t;
}

/* ---------- SALES ---------- */
export function createCustomer(data) {
  const c = {
    id: nextId('CU'),
    name: data.name,
    contact: data.contact,
    phone: data.phone,
    email: data.email,
    gst: data.gst,
    revenue: 0,
    outstanding: 0,
    orders: 0,
    avgPaymentDays: 0,
    creditLimit: Number(data.creditLimit) || 1000000,
    status: 'Active',
  };
  db.customers.unshift(c);
  audit({ action: 'CREATE', entity: 'Customer', entityId: c.id, next: c });
  return c;
}

export function createQuotation(data) {
  const c = db.customers.find(x => x.id === data.customerId);
  const q = {
    id: nextId('Q'),
    customerId: data.customerId,
    customer: c?.name || 'Customer',
    value: Number(data.value),
    date: new Date().toISOString().slice(0, 10),
    expiry: data.expiry,
    ver: 'v1',
    status: 'Draft',
  };
  db.quotations.unshift(q);
  audit({ action: 'CREATE', entity: 'Quotation', entityId: q.id, next: q });
  return q;
}

export function convertQuotationToSO(quoteId) {
  const q = db.quotations.find(x => x.id === quoteId);
  if (!q) throw new Error('Quotation not found');
  const so = {
    id: nextId('SO'),
    customerId: q.customerId,
    customer: q.customer,
    value: q.value,
    date: new Date().toISOString().slice(0, 10),
    delivery: addDays(new Date(), 7).toISOString().slice(0, 10),
    items: 1,
    status: 'Confirmed',
    quoteId,
  };
  db.salesOrders.unshift(so);
  q.status = 'Accepted';
  audit({ action: 'CREATE', entity: 'SalesOrder', entityId: so.id, next: so });
  return so;
}

export function createSalesOrder(data) {
  const c = db.customers.find(x => x.id === data.customerId);
  const so = {
    id: nextId('SO'),
    customerId: data.customerId,
    customer: c?.name || 'Customer',
    value: Number(data.value),
    date: new Date().toISOString().slice(0, 10),
    delivery: data.delivery,
    items: Number(data.items) || 1,
    status: 'Confirmed',
  };
  db.salesOrders.unshift(so);
  audit({ action: 'CREATE', entity: 'SalesOrder', entityId: so.id, next: so });
  return so;
}

export function moveDeal(id, newStage) {
  const d = db.deals.find(x => x.id === id);
  if (!d) throw new Error('Deal not found');
  const prev = d.stage;
  d.stage = newStage;
  audit({ action: 'MOVE', entity: 'Deal', entityId: id, prev, next: newStage });
  return d;
}

/* ---------- INVENTORY ---------- */
export function adjustStock(itemCode, delta, reason) {
  const item = db.items.find(i => i.code === itemCode);
  if (!item) throw new Error('Item not found');
  const prev = item.stock;
  item.stock += Number(delta);
  audit({ action: 'ADJUST', entity: 'Item', entityId: itemCode, prev, next: item.stock, reason });
  return item;
}

export function transferStock(itemCode, fromBin, toBin, qty) {
  audit({ action: 'TRANSFER', entity: 'Item', entityId: itemCode, next: { fromBin, toBin, qty } });
  return { itemCode, fromBin, toBin, qty };
}

/* ---------- MANUFACTURING ---------- */
export function createProductionOrder(data) {
  const po = {
    id: nextId('PRO'),
    product: data.product,
    qty: Number(data.qty),
    status: 'Planned',
    progress: 0,
    due: data.due,
  };
  db.productionOrders.unshift(po);
  audit({ action: 'CREATE', entity: 'ProductionOrder', entityId: po.id, next: po });
  return po;
}

export function releaseProductionOrder(id) {
  const po = db.productionOrders.find(p => p.id === id);
  if (!po) throw new Error('PO not found');
  const prev = po.status;
  po.status = 'In Progress';
  po.progress = 10;
  audit({ action: 'RELEASE', entity: 'ProductionOrder', entityId: id, prev, next: 'In Progress' });
  return po;
}

export function completeProductionOrder(id) {
  const po = db.productionOrders.find(p => p.id === id);
  if (!po) throw new Error('PO not found');
  po.status = 'Completed';
  po.progress = 100;
  audit({ action: 'COMPLETE', entity: 'ProductionOrder', entityId: id, next: 'Completed' });
  return po;
}

/* ---------- HRMS ---------- */
export function createEmployee(data) {
  const e = {
    id: nextId('E'),
    name: data.name,
    dept: data.dept,
    designation: data.designation,
    joined: data.joined,
    status: 'Active',
    email: data.email,
    ctc: Number(data.ctc) || 0,
  };
  db.employees.unshift(e);
  audit({ action: 'CREATE', entity: 'Employee', entityId: e.id, next: e });
  return e;
}

export function approveLeave(id) {
  const l = db.leaveRequests.find(x => x.id === id);
  if (!l) throw new Error('Leave not found');
  const prev = l.status;
  l.status = 'Approved';
  l.approvedBy = window.__session?.name;
  audit({ action: 'APPROVE', entity: 'LeaveRequest', entityId: id, prev, next: 'Approved' });
  return l;
}

export function createLeaveRequest(data) {
  const emp = db.employees.find(e => e.id === data.empId);
  const l = {
    id: nextId('LV'),
    empId: data.empId,
    emp: emp?.name || 'Employee',
    type: data.type,
    from: data.from,
    to: data.to,
    days: Number(data.days),
    reason: data.reason,
    status: 'Pending',
  };
  db.leaveRequests.unshift(l);
  audit({ action: 'CREATE', entity: 'LeaveRequest', entityId: l.id, next: l });
  return l;
}

/* ---------- AUTOMATION ---------- */
export function toggleAutomationRule(id) {
  const r = db.automationRules.find(x => x.id === id);
  if (!r) throw new Error('Rule not found');
  r.active = !r.active;
  audit({ action: 'TOGGLE', entity: 'AutomationRule', entityId: id, next: r.active });
  return r;
}

export function acknowledgeAlert(id) {
  const a = db.aiAlerts.find(x => x.id === id);
  if (!a) throw new Error('Alert not found');
  a.acknowledged = true;
  a.acknowledgedBy = window.__session?.name;
  audit({ action: 'ACK', entity: 'Alert', entityId: id });
  return a;
}

/* ---------- HELPERS ---------- */
export function getAuditLog() { return db.auditLog; }

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}