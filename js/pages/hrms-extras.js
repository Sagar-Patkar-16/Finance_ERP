import { dataTable, chip, icon, toast, confirmDialog, formModal } from '../components.js';
import { db } from '../state.js';
import { logContract } from '../api-contract.js';
import { fmtCurrencyINR, fmtDate } from '../format.js';

export function register(route) {
  route('hrms/payroll',     renderPayroll);
  route('hrms/performance', renderPerformance);
  route('hrms/training',    renderTraining);
}

function renderPayroll() {
  const totalGross = db.payroll.reduce((s, p) => s + p.gross, 0);
  const totalDed = db.payroll.reduce((s, p) => s + p.ded, 0);
  const totalNet = db.payroll.reduce((s, p) => s + p.net, 0);
  const html = `
    <div class="page-header">
      <div><div class="page-title">Payroll</div><div class="page-subtitle">October 2026 · Draft run</div></div>
      <div class="page-actions">
        <button class="btn btn-secondary" id="btn-register">View Register</button>
        <button class="btn btn-primary" id="btn-process">Process Payroll</button>
      </div>
    </div>
    <div class="grid grid-kpi">
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Total Gross</span></div><div class="kpi-value">${fmtCurrencyINR(totalGross)}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Deductions</span></div><div class="kpi-value">${fmtCurrencyINR(totalDed)}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Net Payout</span></div><div class="kpi-value">${fmtCurrencyINR(totalNet)}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Payslips Ready</span></div><div class="kpi-value">${db.payroll.length}</div></div>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><div class="card-title">Payroll Preview</div></div>
      <div class="card-body">${dataTable({
        columns: [
          { label: 'Employee', key: 'emp' },
          { label: 'Gross', align: 'right', num: true, render: r => fmtCurrencyINR(r.gross) },
          { label: 'Deductions', align: 'right', num: true, render: r => fmtCurrencyINR(r.ded) },
          { label: 'Net Pay', align: 'right', num: true, render: r => `<b>${fmtCurrencyINR(r.net)}</b>` },
          { label: 'Status', render: r => chip('success', r.status) },
        ],
        rows: db.payroll,
      })}</div>
    </div>`;
  setTimeout(() => {
    document.getElementById('btn-process')?.addEventListener('click', async () => {
      const ok = await confirmDialog({ title: 'Process payroll for Oct 2026?', message: `This will generate ${db.payroll.length} payslips and route for HR Manager approval.`, confirmText: 'Process' });
      if (!ok) return;
      logContract({ method: 'POST', path: '/api/payroll/process', body: { month: '2026-10' }, role: window.__session.role });
      toast('Payroll processing', 'Generating payslips…', 'info');
      setTimeout(() => toast('Payroll ready', `${db.payroll.length} payslips generated`, 'success'), 1400);
    });
    document.getElementById('btn-register')?.addEventListener('click', () => toast('Register', 'Full payroll register will open', 'info'));
  }, 0);
  return html;
}

function renderPerformance() {
  return `
    <div class="page-header">
      <div><div class="page-title">Performance Management</div><div class="page-subtitle">KPIs · appraisals · 360° feedback</div></div>
      <div class="page-actions"><button class="btn btn-primary" id="btn-appraisal">Start Appraisal</button></div>
    </div>
    <div class="grid grid-kpi">
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Appraisal Cycle</span></div><div class="kpi-value" style="font-size:20px">H2 FY27</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Reviews Pending</span></div><div class="kpi-value" style="color:var(--warning)">${db.performance.filter(p => !p.mgrDone).length}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Self Reviews Done</span></div><div class="kpi-value" style="color:var(--success)">${db.performance.filter(p => p.self).length}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Avg Rating</span></div><div class="kpi-value">3.9 / 5</div></div>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><div class="card-title">Employee Ratings</div></div>
      <div class="card-body">${dataTable({
        columns: [
          { label: 'Employee', key: 'name' },
          { label: 'Department', key: 'dept' },
          { label: 'Manager', key: 'mgr' },
          { label: 'Self Review', render: r => r.self ? chip('success', 'Done') : chip('warning', 'Pending') },
          { label: 'Manager Review', render: r => r.mgrDone ? chip('success', 'Done') : chip('warning', 'Pending') },
          { label: 'Rating', align: 'right', num: true, render: r => r.rating ? `${r.rating} ★` : '—' },
          { label: 'Band', render: r => {
            if (!r.rating) return '—';
            if (r.rating >= 4.5) return chip('success', 'Outstanding');
            if (r.rating >= 4)   return chip('info', 'Exceeds');
            if (r.rating >= 3)   return chip('neutral', 'Meets');
            return chip('warning', 'Needs Improvement');
          }},
        ],
        rows: db.performance,
      })}</div>
    </div>`;
}

function renderTraining() {
  return `
    <div class="page-header">
      <div><div class="page-title">Training</div><div class="page-subtitle">Programs · calendar · certifications</div></div>
      <div class="page-actions"><button class="btn btn-primary">Schedule Training</button></div>
    </div>
    <div class="grid grid-kpi">
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Active Programs</span></div><div class="kpi-value">${db.trainings.length}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Enrolled</span></div><div class="kpi-value">${db.trainings.reduce((s, t) => s + t.enrolled, 0)}</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Completed MTD</span></div><div class="kpi-value" style="color:var(--success)">42</div></div>
      <div class="kpi"><div class="kpi-header"><span class="kpi-label">Certifications Expiring</span></div><div class="kpi-value" style="color:var(--warning)">7</div></div>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><div class="card-title">Training Programs</div></div>
      <div class="card-body">${dataTable({
        columns: [
          { label: 'Program', key: 'title' },
          { label: 'Category', key: 'cat' },
          { label: 'Trainer', key: 'trainer' },
          { label: 'Start', render: r => fmtDate(r.start) },
          { label: 'Duration', key: 'dur' },
          { label: 'Enrolled', align: 'right', num: true, key: 'enrolled' },
          { label: 'Status', render: r => r.status === 'Ongoing' ? chip('info', 'Ongoing') : r.status === 'Completed' ? chip('success', 'Completed') : chip('neutral', 'Scheduled') },
        ],
        rows: db.trainings,
      })}</div>
    </div>`;
}