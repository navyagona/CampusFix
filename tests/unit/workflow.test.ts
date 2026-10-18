import { describe, it, expect } from 'vitest';
import {
  validateStatusTransition,
  canStudentEditReport,
  canStudentWithdrawReport,
  isStaffOrAdmin,
} from '@/lib/workflow';

describe('Workflow State Machine - validateStatusTransition', () => {
  it('allows staff to advance from submitted to acknowledged', () => {
    const result = validateStatusTransition({
      currentStatus: 'submitted',
      targetStatus: 'acknowledged',
      userRole: 'staff',
      isOwner: false,
    });
    expect(result.valid).toBe(true);
  });

  it('allows staff to advance from acknowledged to in_progress', () => {
    const result = validateStatusTransition({
      currentStatus: 'acknowledged',
      targetStatus: 'in_progress',
      userRole: 'staff',
      isOwner: false,
    });
    expect(result.valid).toBe(true);
  });

  it('allows staff to resolve in_progress ticket with a resolution note', () => {
    const result = validateStatusTransition({
      currentStatus: 'in_progress',
      targetStatus: 'resolved',
      userRole: 'staff',
      isOwner: false,
      resolutionNote: 'Replaced broken HDMI cable and tested video output.',
    });
    expect(result.valid).toBe(true);
  });

  it('rejects resolving a ticket without a resolution note', () => {
    const result = validateStatusTransition({
      currentStatus: 'in_progress',
      targetStatus: 'resolved',
      userRole: 'staff',
      isOwner: false,
      resolutionNote: '',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/resolution note/i);
  });

  it('allows staff to mark report as duplicate with a reason', () => {
    const result = validateStatusTransition({
      currentStatus: 'submitted',
      targetStatus: 'duplicate',
      userRole: 'staff',
      isOwner: false,
      reasonComment: 'Duplicate of ticket CF-2026-1001 filed earlier today.',
    });
    expect(result.valid).toBe(true);
  });

  it('rejects duplicate status without a reason', () => {
    const result = validateStatusTransition({
      currentStatus: 'submitted',
      targetStatus: 'duplicate',
      userRole: 'staff',
      isOwner: false,
      reasonComment: '',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/clear reason/i);
  });

  it('blocks skipping states (e.g. submitted directly to resolved)', () => {
    const result = validateStatusTransition({
      currentStatus: 'submitted',
      targetStatus: 'resolved',
      userRole: 'staff',
      isOwner: false,
      resolutionNote: 'Fixed it fast.',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/not permitted/i);
  });

  it('blocks students from executing staff transitions', () => {
    const result = validateStatusTransition({
      currentStatus: 'submitted',
      targetStatus: 'acknowledged',
      userRole: 'student',
      isOwner: true,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/only maintenance staff/i);
  });

  it('allows student owner to withdraw their submitted report', () => {
    const result = validateStatusTransition({
      currentStatus: 'submitted',
      targetStatus: 'withdrawn',
      userRole: 'student',
      isOwner: true,
    });
    expect(result.valid).toBe(true);
  });

  it('prevents non-owners from withdrawing a report', () => {
    const result = validateStatusTransition({
      currentStatus: 'submitted',
      targetStatus: 'withdrawn',
      userRole: 'student',
      isOwner: false,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/only the student who submitted/i);
  });

  it('prevents withdrawing a report after staff have acknowledged or started work', () => {
    const result = validateStatusTransition({
      currentStatus: 'in_progress',
      targetStatus: 'withdrawn',
      userRole: 'student',
      isOwner: true,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/cannot be withdrawn once staff have begun/i);
  });
});

describe('Report Modification Permissions', () => {
  it('allows student owner to edit submitted report', () => {
    expect(canStudentEditReport('submitted', true)).toBe(true);
  });

  it('blocks student owner from editing report once acknowledged or in progress', () => {
    expect(canStudentEditReport('acknowledged', true)).toBe(false);
    expect(canStudentEditReport('in_progress', true)).toBe(false);
    expect(canStudentEditReport('resolved', true)).toBe(false);
  });

  it('blocks non-owners from editing', () => {
    expect(canStudentEditReport('submitted', false)).toBe(false);
  });

  it('allows owner to withdraw while submitted and blocks afterwards', () => {
    expect(canStudentWithdrawReport('submitted', true)).toBe(true);
    expect(canStudentWithdrawReport('acknowledged', true)).toBe(false);
    expect(canStudentWithdrawReport('in_progress', true)).toBe(false);
    expect(canStudentWithdrawReport('submitted', false)).toBe(false);
  });

  it('correctly verifies staff or admin roles', () => {
    expect(isStaffOrAdmin('staff')).toBe(true);
    expect(isStaffOrAdmin('admin')).toBe(true);
    expect(isStaffOrAdmin('student')).toBe(false);
    expect(isStaffOrAdmin(undefined)).toBe(false);
  });
});
