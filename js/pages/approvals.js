import { confirmDialog, toast } from '../components.js';
import { db } from '../state.js';

/**
 * Check if current user's role can approve a PO of given amount.
 * Returns { allowed, requiredRole }.
 */
export function canApprovePO(amount) {
  const role = window.__session?.role;
  const t = db.approvalThresholds;
  if (role === 'CEO' || role === 'CFO') return { allowed: true };
  if (role === 'Purchase Manager') {
    if (amount <= t.po_cfo) return { allowed: true };
    return { allowed: false, requiredRole: amount > t.po_ceo ? 'CEO' : 'CFO' };
  }
  return { allowed: false, requiredRole: 'Purchase Manager' };
}

export async function gateApproval({ action, amount, onConfirm }) {
  const { allowed, requiredRole } = canApprovePO(amount);
  if (!allowed) {
    toast('Approval required', `${action} of ₹${amount.toLocaleString('en-IN')} needs ${requiredRole}`, 'warning', 4000);
    return false;
  }
  const ok = await confirmDialog({
    title: `Approve ${action}?`,
    message: `Amount: ₹${amount.toLocaleString('en-IN')}. This action will be logged to the audit trail.`,
    confirmText: 'Approve',
  });
  if (ok && onConfirm) onConfirm();
  return ok;
}

export function initThresholds() {
  // Helper called at boot to expose thresholds globally
  window.__approvalThresholds = db.approvalThresholds;
}