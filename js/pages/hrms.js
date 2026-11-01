import { dataTable, chip, icon, toast, formModal, confirmDialog } from '../components.js';
import { db, createEmployee, approveLeave, createLeaveRequest, session } from '../state.js';
import { logContract } from '../api-contract.js';
import { fmtCurrencyINR, fmtDate } from '../format.js';

export function register(route) {
  route('hrms/employees',   renderEmployees);
  route('hrms/recruitment', renderRecruitment);
  route('hrms/attendance',  renderAttendance);
  route('hrms/leave',       renderLeave);
}

function renderEmployees() {
  const html = `
    <div class="page-header">
      <div><div class="page-title">Employees</div><div class="page-subtitle">Directory · lifecycle</div></div>
      <div class="page-actions"><button class="btn btn-primary" id="btn-new-emp" data-perm="create.employee">${icon('plus', 16)} Add Employee</button></div>
    </div>
    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'ID', key: 'id', mono: true },
        { label: 'Name', key: 'name' },
        { label: 'Department', key: 'dept' },
        { label: 'Designation', key: 'designation' },
        { label: 'Joined', render: r => fmtDate(r.joined) },
        { label: 'CTC', align: 'right', num: true, render: r => fmtCurrencyINR(r.ctc) },
        { label: 'Status', render: r => chip(r.status === 'Active' ? 'success' : 'warning', r.status) },
      ],
      rows: db.employees,
    })}</div></div>`;
  setTimeout(() => {
    document.getElementById('btn-new-emp')?.addEventListener('click', () => {
      formModal({
        title: 'Add Employee',
        fields: [
          { name: 'name', label: 'Full name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'dept', label: 'Department', type: 'select', required: true, options: [
            { value: 'Production', label: 'Production' }, { value: 'Sales', label: 'Sales' },
            { value: 'Finance', label: 'Finance' }, { value: 'HR', label: 'HR' },
          ]},
          { name: 'designation', label: 'Designation', type: 'text', required: true },
          { name: 'joined', label: 'Joining date', type: 'date', required: true, value: new Date().toISOString().slice(0,10) },
          { name: 'ctc', label: 'Annual CTC (₹)', type: 'number', required: true },
        ],
        submitLabel: 'Add',
        onSubmit: (data) => {
          const e = createEmployee(data);
          logContract({ method: 'POST', path: '/api/employees', body: data, response: e, role: session.role });
          toast('Employee added', e.name, 'success');
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      });
    });
  }, 0);
  return html;
}

function renderRecruitment() {
  return `
    <div class="page-header"><div><div class="page-title">Recruitment</div><div class="page-subtitle">Open requisitions · candidates</div></div></div>
    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'Req #', key: 'id', mono: true },
        { label: 'Position', key: 'title' },
        { label: 'Department', key: 'dept' },
        { label: 'Openings', align: 'right', num: true, key: 'openings' },
        { label: 'Candidates', align: 'right', num: true, key: 'candidates' },
        { label: 'Priority', render: r => chip(r.priority === 'High' ? 'critical' : 'info', r.priority) },
        { label: 'Status', render: r => chip('info', r.status) },
      ],
      rows: db.recruitment,
    })}</div></div>`;
}

function renderAttendance() {
  return `
    <div class="page-header"><div><div class="page-title">Attendance</div><div class="page-subtitle">Punch in / out register</div></div></div>
    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'Employee', key: 'name' },
        { label: 'Dept', key: 'dept' },
        { label: 'In', key: 'in', mono: true },
        { label: 'Out', key: 'out', mono: true },
        { label: 'Hours', align: 'right', num: true, key: 'hrs' },
        { label: 'OT', align: 'right', num: true, render: r => r.ot ? `+${r.ot}` : '—' },
        { label: 'Status', render: r => chip(r.status === 'Present' ? 'success' : r.status === 'Late' ? 'warning' : 'critical', r.status) },
      ],
      rows: db.attendance,
    })}</div></div>`;
}

function renderLeave() {
  const html = `
    <div class="page-header">
      <div><div class="page-title">Leave Management</div><div class="page-subtitle">Requests · approvals</div></div>
      <div class="page-actions"><button class="btn btn-primary" id="btn-new-leave" data-perm="create.employee">${icon('plus', 16)} Apply</button></div>
    </div>
    <div class="card"><div class="card-body">${dataTable({
      columns: [
        { label: 'Employee', key: 'emp' },
        { label: 'Type', key: 'type' },
        { label: 'From', render: r => fmtDate(r.from) },
        { label: 'To', render: r => fmtDate(r.to) },
        { label: 'Days', align: 'right', num: true, key: 'days' },
        { label: 'Reason', key: 'reason' },
        { label: 'Status', render: r => chip(r.status === 'Approved' ? 'success' : r.status === 'Rejected' ? 'critical' : 'warning', r.status) },
        { label: 'Actions', render: r => r.status === 'Pending'
            ? `<button class="btn btn-primary btn-sm" data-approve-leave="${r.id}" data-perm="approve.leave_request">Approve</button>` : '' },
      ],
      rows: db.leaveRequests,
    })}</div></div>`;
  setTimeout(() => {
    document.getElementById('btn-new-leave')?.addEventListener('click', () => {
      formModal({
        title: 'Apply for Leave',
        fields: [
          { name: 'empId', label: 'Employee', type: 'select', required: true,
            options: db.employees.map(e => ({ value: e.id, label: e.name })) },
          { name: 'type', label: 'Leave type', type: 'select', required: true,
            options: [{value:'Casual',label:'Casual'},{value:'Sick',label:'Sick'},{value:'Earned',label:'Earned'}] },
          { name: 'from', label: 'From', type: 'date', required: true },
          { name: 'to', label: 'To', type: 'date', required: true },
          { name: 'days', label: 'Days', type: 'number', required: true },
          { name: 'reason', label: 'Reason', type: 'text', required: true },
        ],
        submitLabel: 'Submit',
        onSubmit: (data) => {
          const l = createLeaveRequest(data);
          logContract({ method: 'POST', path: '/api/leave-requests', body: data, response: l, role: session.role });
          toast('Leave applied', `${l.days} days pending approval`, 'success');
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      });
    });
    document.querySelectorAll('[data-approve-leave]').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.dataset.approveLeave;
        const ok = await confirmDialog({ title: 'Approve leave?', message: 'Employee will be notified.' });
        if (!ok) return;
        const l = approveLeave(id);
        logContract({ method: 'PATCH', path: `/api/leave-requests/${id}/approve`, role: session.role });
        toast('Leave approved', l.emp, 'success');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });
  }, 0);
  return html;
}