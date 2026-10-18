import { describe, it, expect, beforeEach } from 'vitest';
import { mockStore, INITIAL_PROFILES } from '@/lib/data/mock-store';

describe('Data Store & Role-Based Filtering', () => {
  const studentAlex = INITIAL_PROFILES.find((p) => p.email === 'alex.chen@campus.edu')!;
  const studentMaya = INITIAL_PROFILES.find((p) => p.email === 'maya.patel@campus.edu')!;
  const staffDave = INITIAL_PROFILES.find((p) => p.email === 'dave.miller@campus.edu')!;

  beforeEach(() => {
    mockStore.reset();
  });

  it('students only see their own reports', () => {
    const alexReports = mockStore.getReports({}, studentAlex);
    expect(alexReports.length).toBeGreaterThan(0);
    // Every report returned must belong to Alex
    for (const report of alexReports) {
      expect(report.created_by).toBe(studentAlex.id);
    }

    const mayaReports = mockStore.getReports({}, studentMaya);
    expect(mayaReports.length).toBeGreaterThan(0);
    for (const report of mayaReports) {
      expect(report.created_by).toBe(studentMaya.id);
    }
  });

  it('staff can see all reports from all students', () => {
    const allReports = mockStore.getReports({}, staffDave);
    const alexReports = mockStore.getReports({}, studentAlex);
    const mayaReports = mockStore.getReports({}, studentMaya);

    expect(allReports.length).toBeGreaterThanOrEqual(alexReports.length + mayaReports.length);
  });

  it('hides internal notes from students completely', () => {
    // Ticket CF-2026-1001 has an internal note in seed data
    const alexView = mockStore.getReportById('a0000000-0000-0000-0000-000000000001', studentAlex);
    expect(alexView).not.toBeNull();
    expect(alexView?.internal_notes).toEqual([]);

    const staffView = mockStore.getReportById('a0000000-0000-0000-0000-000000000001', staffDave);
    expect(staffView).not.toBeNull();
    expect(staffView?.internal_notes?.length).toBeGreaterThan(0);
  });

  it('prevents student from editing a report once it has been acknowledged or progressed', () => {
    // Report CF-2026-1001 is in_progress
    const updateResult = mockStore.updateReport(
      'a0000000-0000-0000-0000-000000000001',
      {
        title: 'Tampered title',
        description: 'Trying to edit after staff started work',
        category: 'classroom_equipment',
        building: 'Engineering Hall',
        location_details: 'Room 204',
      },
      studentAlex
    );

    expect(updateResult.success).toBe(false);
    expect(updateResult.error).toMatch(/only while it is in "submitted" status/i);
  });

  it('allows student to withdraw report while submitted', () => {
    // Create new submitted report for Alex
    const newReport = mockStore.createReport(
      {
        title: 'Temporary noise in lounge',
        description: 'Loud music coming from room 105 during study hours.',
        category: 'other',
        building: 'Student Center',
        location_details: 'Room 105',
      },
      studentAlex
    );

    expect(newReport.status).toBe('submitted');

    const withdrawResult = mockStore.withdrawReport(newReport.id, studentAlex);
    expect(withdrawResult.success).toBe(true);
    expect(withdrawResult.report?.status).toBe('withdrawn');

    // Verify history recorded the withdrawal
    const detail = mockStore.getReportById(newReport.id, studentAlex);
    expect(detail?.history?.[0].to_status).toBe('withdrawn');
  });

  it('staff can resolve in_progress ticket with resolution note', () => {
    const resolveResult = mockStore.updateReportStatus(
      'a0000000-0000-0000-0000-000000000001',
      {
        to_status: 'resolved',
        comment: 'Installed high-speed braided HDMI 2.1 cable and tested 4K projection.',
      },
      staffDave
    );

    expect(resolveResult.success).toBe(true);
    expect(resolveResult.report?.status).toBe('resolved');
    expect(resolveResult.report?.resolution_note).toMatch(/braided HDMI/);
    expect(resolveResult.report?.resolved_at).toBeTruthy();
  });
});
