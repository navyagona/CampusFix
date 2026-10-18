import {
  Profile,
  Report,
  ReportStatusHistory,
  ReportInternalNote,
  ReportWithDetails,
  ReportFilters,
  StaffMetrics,
} from '@/types/database';
import { validateStatusTransition, canStudentEditReport, isStaffOrAdmin } from '../workflow';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'alex.chen@campus.edu',
    full_name: 'Alex Chen',
    role: 'student',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'maya.patel@campus.edu',
    full_name: 'Maya Patel',
    role: 'student',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'dave.miller@campus.edu',
    full_name: 'Dave Miller (Facilities Lead)',
    role: 'staff',
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'sarah.jenkins@campus.edu',
    full_name: 'Sarah Jenkins (Electrician)',
    role: 'staff',
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    tracking_number: 'CF-2026-1001',
    title: 'Ceiling projector HDMI port loose & flickering in main hall',
    description:
      'The overhead projector in room 204 disconnects whenever someone touches the podium table. The HDMI receptacle feels loose and needs tightening or replacing.',
    category: 'classroom_equipment',
    building: 'Engineering Hall',
    location_details: 'Room 204 (Main Lecture Hall)',
    priority: 'high',
    status: 'in_progress',
    photo_url: null,
    created_by: '11111111-1111-1111-1111-111111111111',
    assigned_to: '33333333-3333-3333-3333-333333333333',
    resolution_note: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    tracking_number: 'CF-2026-1002',
    title: 'Water leak under sink in 2nd floor restroom',
    description:
      'There is a persistent puddle forming under the middle hand sink in the men\'s restroom. Cold water pipe compression fitting is dripping constantly.',
    category: 'plumbing',
    building: 'Library East Wing',
    location_details: '2nd Floor Restroom near quiet study area',
    priority: 'medium',
    status: 'acknowledged',
    photo_url: null,
    created_by: '11111111-1111-1111-1111-111111111111',
    assigned_to: '33333333-3333-3333-3333-333333333333',
    resolution_note: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    tracking_number: 'CF-2026-1003',
    title: 'Fluorescent fixture buzzing loudly and flickering',
    description:
      'The overhead light fixture directly over study desk cluster 4 is buzzing loudly and rapidly flashing. Hard to concentrate on reading.',
    category: 'electrical',
    building: 'Student Center',
    location_details: '3rd Floor Study Lounge, Northwest Corner',
    priority: 'low',
    status: 'submitted',
    photo_url: null,
    created_by: '22222222-2222-2222-2222-222222222222',
    assigned_to: null,
    resolution_note: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    tracking_number: 'CF-2026-1004',
    title: 'Large detergent spill on central marble stairs',
    description:
      'Someone dropped cleaning fluid or detergent on the landing between floors 1 and 2. Highly slippery and hazardous.',
    category: 'cleanliness',
    building: 'Arts Building',
    location_details: 'Central Stairwell, between Floor 1 and 2',
    priority: 'urgent',
    status: 'resolved',
    photo_url: null,
    created_by: '11111111-1111-1111-1111-111111111111',
    assigned_to: '33333333-3333-3333-3333-333333333333',
    resolution_note:
      'Janitorial team mopped and fully dried the stairs. Wet floor cones deployed until dry.',
    resolved_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
];

export const INITIAL_HISTORY: ReportStatusHistory[] = [
  {
    id: 'h0000000-0000-0000-0000-000000000001',
    report_id: 'a0000000-0000-0000-0000-000000000001',
    from_status: null,
    to_status: 'submitted',
    changed_by: '11111111-1111-1111-1111-111111111111',
    comment: 'Report submitted by student.',
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: 'h0000000-0000-0000-0000-000000000002',
    report_id: 'a0000000-0000-0000-0000-000000000001',
    from_status: 'submitted',
    to_status: 'acknowledged',
    changed_by: '33333333-3333-3333-3333-333333333333',
    comment: 'AV support team reviewed the report and queued it for the morning shift.',
    created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
  },
  {
    id: 'h0000000-0000-0000-0000-000000000003',
    report_id: 'a0000000-0000-0000-0000-000000000001',
    from_status: 'acknowledged',
    to_status: 'in_progress',
    changed_by: '33333333-3333-3333-3333-333333333333',
    comment: 'Technician dispatched with replacement podium HDMI interface.',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'h0000000-0000-0000-0000-000000000004',
    report_id: 'a0000000-0000-0000-0000-000000000002',
    from_status: null,
    to_status: 'submitted',
    changed_by: '11111111-1111-1111-1111-111111111111',
    comment: 'Report submitted by student.',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'h0000000-0000-0000-0000-000000000005',
    report_id: 'a0000000-0000-0000-0000-000000000002',
    from_status: 'submitted',
    to_status: 'acknowledged',
    changed_by: '33333333-3333-3333-3333-333333333333',
    comment: 'Scheduled plumbing inspection for 2:00 PM today.',
    created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
  {
    id: 'h0000000-0000-0000-0000-000000000006',
    report_id: 'a0000000-0000-0000-0000-000000000003',
    from_status: null,
    to_status: 'submitted',
    changed_by: '22222222-2222-2222-2222-222222222222',
    comment: 'Report submitted by student.',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'h0000000-0000-0000-0000-000000000007',
    report_id: 'a0000000-0000-0000-0000-000000000004',
    from_status: null,
    to_status: 'submitted',
    changed_by: '11111111-1111-1111-1111-111111111111',
    comment: 'Report submitted by student.',
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'h0000000-0000-0000-0000-000000000008',
    report_id: 'a0000000-0000-0000-0000-000000000004',
    from_status: 'submitted',
    to_status: 'in_progress',
    changed_by: '33333333-3333-3333-3333-333333333333',
    comment: 'Custodial team dispatched immediately.',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'h0000000-0000-0000-0000-000000000009',
    report_id: 'a0000000-0000-0000-0000-000000000004',
    from_status: 'in_progress',
    to_status: 'resolved',
    changed_by: '33333333-3333-3333-3333-333333333333',
    comment: 'Spill mopped, floor dried, hazard cleared.',
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
];

export const INITIAL_INTERNAL_NOTES: ReportInternalNote[] = [
  {
    id: 'n0000000-0000-0000-0000-000000000001',
    report_id: 'a0000000-0000-0000-0000-000000000001',
    author_id: '33333333-3333-3333-3333-333333333333',
    note: 'Crestron transmitter parts are stocked in Cabinet B in Central Facilities.',
    created_at: new Date(Date.now() - 30 * 3600000).toISOString(),
  },
];

// In-Memory Store instance
class MockDataStore {
  private profiles: Profile[] = [...INITIAL_PROFILES];
  private reports: Report[] = [...INITIAL_REPORTS];
  private history: ReportStatusHistory[] = [...INITIAL_HISTORY];
  private internalNotes: ReportInternalNote[] = [...INITIAL_INTERNAL_NOTES];
  private nextReportNumber = 1005;

  public reset() {
    this.profiles = [...INITIAL_PROFILES];
    this.reports = [...INITIAL_REPORTS];
    this.history = [...INITIAL_HISTORY];
    this.internalNotes = [...INITIAL_INTERNAL_NOTES];
    this.nextReportNumber = 1005;
  }

  public getProfiles(): Profile[] {
    return [...this.profiles];
  }

  public getStaffMembers(): Profile[] {
    return this.profiles.filter((p) => p.role === 'staff' || p.role === 'admin');
  }

  public getProfileById(id: string): Profile | undefined {
    return this.profiles.find((p) => p.id === id);
  }

  public addProfile(profile: Profile) {
    const existingIndex = this.profiles.findIndex((p) => p.id === profile.id || p.email === profile.email);
    if (existingIndex >= 0) {
      this.profiles[existingIndex] = profile;
    } else {
      this.profiles.push(profile);
    }
  }

  public getReports(filters: ReportFilters = {}, currentUser: Profile): ReportWithDetails[] {
    const isStaff = isStaffOrAdmin(currentUser.role);

    const list = this.reports.filter((r) => {
      // Students see only their own reports
      if (!isStaff && r.created_by !== currentUser.id) {
        return false;
      }
      // Status filter
      if (filters.status && filters.status !== 'all' && r.status !== filters.status) {
        return false;
      }
      // Category filter
      if (filters.category && filters.category !== 'all' && r.category !== filters.category) {
        return false;
      }
      // Priority filter
      if (filters.priority && filters.priority !== 'all' && r.priority !== filters.priority) {
        return false;
      }
      // Building filter
      if (
        filters.building &&
        !r.building.toLowerCase().includes(filters.building.toLowerCase())
      ) {
        return false;
      }
      // Text search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(query);
        const matchesDesc = r.description.toLowerCase().includes(query);
        const matchesTrack = r.tracking_number.toLowerCase().includes(query);
        const matchesLoc = r.location_details.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesTrack && !matchesLoc) {
          return false;
        }
      }
      return true;
    });

    // Sort descending by created_at
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return list.map((r) => this.enrichReport(r, currentUser));
  }

  public getReportById(id: string, currentUser: Profile): ReportWithDetails | null {
    const report = this.reports.find((r) => r.id === id);
    if (!report) return null;

    const isStaff = isStaffOrAdmin(currentUser.role);
    if (!isStaff && report.created_by !== currentUser.id) {
      return null; // Forbidden / Not Found to students
    }

    return this.enrichReport(report, currentUser);
  }

  public createReport(
    data: {
      title: string;
      description: string;
      category: Report['category'];
      building: string;
      location_details: string;
      photo_url?: string | null;
    },
    currentUser: Profile
  ): ReportWithDetails {
    const reportId = crypto.randomUUID();
    const trackingNumber = `CF-${new Date().getFullYear()}-${this.nextReportNumber++}`;
    const now = new Date().toISOString();

    const newReport: Report = {
      id: reportId,
      tracking_number: trackingNumber,
      title: data.title,
      description: data.description,
      category: data.category,
      building: data.building,
      location_details: data.location_details,
      priority: 'medium',
      status: 'submitted',
      photo_url: data.photo_url || null,
      created_by: currentUser.id,
      assigned_to: null,
      resolution_note: null,
      resolved_at: null,
      created_at: now,
      updated_at: now,
    };

    this.reports.unshift(newReport);

    // Initial status history entry
    this.history.unshift({
      id: crypto.randomUUID(),
      report_id: reportId,
      from_status: null,
      to_status: 'submitted',
      changed_by: currentUser.id,
      comment: 'Report submitted by student.',
      created_at: now,
    });

    return this.enrichReport(newReport, currentUser);
  }

  public updateReport(
    id: string,
    data: {
      title: string;
      description: string;
      category: Report['category'];
      building: string;
      location_details: string;
      photo_url?: string | null;
    },
    currentUser: Profile
  ): { success: boolean; error?: string; report?: ReportWithDetails } {
    const reportIndex = this.reports.findIndex((r) => r.id === id);
    if (reportIndex === -1) {
      return { success: false, error: 'Report not found.' };
    }

    const report = this.reports[reportIndex];
    const isOwner = report.created_by === currentUser.id;

    if (!canStudentEditReport(report.status, isOwner)) {
      return {
        success: false,
        error: 'Only the submitting student can edit a report, and only while it is in "submitted" status.',
      };
    }

    const updated: Report = {
      ...report,
      title: data.title,
      description: data.description,
      category: data.category,
      building: data.building,
      location_details: data.location_details,
      photo_url: data.photo_url !== undefined ? data.photo_url : report.photo_url,
      updated_at: new Date().toISOString(),
    };

    this.reports[reportIndex] = updated;
    return { success: true, report: this.enrichReport(updated, currentUser) };
  }

  public withdrawReport(
    id: string,
    currentUser: Profile
  ): { success: boolean; error?: string; report?: ReportWithDetails } {
    const reportIndex = this.reports.findIndex((r) => r.id === id);
    if (reportIndex === -1) {
      return { success: false, error: 'Report not found.' };
    }

    const report = this.reports[reportIndex];
    const validation = validateStatusTransition({
      currentStatus: report.status,
      targetStatus: 'withdrawn',
      userRole: currentUser.role,
      isOwner: report.created_by === currentUser.id,
    });

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const now = new Date().toISOString();
    const updated: Report = {
      ...report,
      status: 'withdrawn',
      updated_at: now,
    };

    this.reports[reportIndex] = updated;

    this.history.unshift({
      id: crypto.randomUUID(),
      report_id: id,
      from_status: report.status,
      to_status: 'withdrawn',
      changed_by: currentUser.id,
      comment: 'Report withdrawn by student.',
      created_at: now,
    });

    return { success: true, report: this.enrichReport(updated, currentUser) };
  }

  public updateReportStatus(
    id: string,
    updateData: {
      to_status: Report['status'];
      comment?: string | null;
      priority?: Report['priority'];
      assigned_to?: string | null;
    },
    currentUser: Profile
  ): { success: boolean; error?: string; report?: ReportWithDetails } {
    const reportIndex = this.reports.findIndex((r) => r.id === id);
    if (reportIndex === -1) {
      return { success: false, error: 'Report not found.' };
    }

    const report = this.reports[reportIndex];
    const isOwner = report.created_by === currentUser.id;

    const validation = validateStatusTransition({
      currentStatus: report.status,
      targetStatus: updateData.to_status,
      userRole: currentUser.role,
      isOwner,
      resolutionNote: updateData.to_status === 'resolved' ? (updateData.comment || '') : undefined,
      reasonComment:
        updateData.to_status === 'duplicate' || updateData.to_status === 'rejected'
          ? (updateData.comment || '')
          : undefined,
    });

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const now = new Date().toISOString();
    const updated: Report = {
      ...report,
      status: updateData.to_status,
      priority: updateData.priority || report.priority,
      assigned_to:
        updateData.assigned_to !== undefined ? updateData.assigned_to : report.assigned_to,
      resolution_note:
        updateData.to_status === 'resolved' ? updateData.comment : report.resolution_note,
      resolved_at: updateData.to_status === 'resolved' ? now : report.resolved_at,
      updated_at: now,
    };

    this.reports[reportIndex] = updated;

    this.history.unshift({
      id: crypto.randomUUID(),
      report_id: id,
      from_status: report.status,
      to_status: updateData.to_status,
      changed_by: currentUser.id,
      comment: updateData.comment || `Status updated to ${updateData.to_status}.`,
      created_at: now,
    });

    return { success: true, report: this.enrichReport(updated, currentUser) };
  }

  public addInternalNote(
    reportId: string,
    note: string,
    currentUser: Profile
  ): { success: boolean; error?: string; note?: ReportInternalNote } {
    if (!isStaffOrAdmin(currentUser.role)) {
      return { success: false, error: 'Only staff can add internal notes.' };
    }

    const report = this.reports.find((r) => r.id === reportId);
    if (!report) {
      return { success: false, error: 'Report not found.' };
    }

    const newNote: ReportInternalNote = {
      id: crypto.randomUUID(),
      report_id: reportId,
      author_id: currentUser.id,
      note,
      created_at: new Date().toISOString(),
      author_name: currentUser.full_name,
    };

    this.internalNotes.unshift(newNote);
    return { success: true, note: newNote };
  }

  public getStaffMetrics(): StaffMetrics {
    const totalReports = this.reports.length;
    const pendingTriage = this.reports.filter((r) => r.status === 'submitted').length;
    const inProgress = this.reports.filter(
      (r) => r.status === 'acknowledged' || r.status === 'in_progress'
    ).length;
    const resolved = this.reports.filter((r) => r.status === 'resolved').length;
    const highUrgent = this.reports.filter(
      (r) =>
        (r.priority === 'high' || r.priority === 'urgent') &&
        r.status !== 'resolved' &&
        r.status !== 'withdrawn' &&
        r.status !== 'duplicate' &&
        r.status !== 'rejected'
    ).length;

    return { totalReports, pendingTriage, inProgress, resolved, highUrgent };
  }

  private enrichReport(report: Report, currentUser: Profile): ReportWithDetails {
    const isStaff = isStaffOrAdmin(currentUser.role);
    const creator = this.getProfileById(report.created_by);
    const assignee = report.assigned_to ? this.getProfileById(report.assigned_to) : undefined;

    const history = this.history
      .filter((h) => h.report_id === report.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((h) => {
        const author = this.getProfileById(h.changed_by);
        return {
          ...h,
          author_name: author ? author.full_name : 'System',
          author_role: author ? author.role : undefined,
        };
      });

    // Internal notes are strictly for staff/admin!
    const internal_notes = isStaff
      ? this.internalNotes
          .filter((n) => n.report_id === report.id)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((n) => {
            const author = this.getProfileById(n.author_id);
            return {
              ...n,
              author_name: author ? author.full_name : 'Staff Member',
            };
          })
      : [];

    return {
      ...report,
      creator,
      assignee,
      history,
      internal_notes,
    };
  }
}

// Global singleton instance for development / mock runs
const globalForStore = globalThis as unknown as { campusFixStore: MockDataStore };
export const mockStore = globalForStore.campusFixStore || new MockDataStore();
if (process.env.NODE_ENV !== 'production') globalForStore.campusFixStore = mockStore;
