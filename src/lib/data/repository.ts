import {
  Profile,
  ReportWithDetails,
  ReportFilters,
  StaffMetrics,
} from '@/types/database';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mockStore } from './mock-store';
import { getCurrentUser } from '@/lib/auth/session';
import {
  createReportSchema,
  updateReportSchema,
  updateReportStatusSchema,
  addInternalNoteSchema,
  CreateReportInput,
  UpdateReportInput,
  UpdateReportStatusInput,
} from '@/lib/validations/report';
import { validateStatusTransition, isStaffOrAdmin, canStudentEditReport } from '@/lib/workflow';

export async function getReports(filters: ReportFilters = {}): Promise<ReportWithDetails[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        let query = supabase
          .from('reports')
          .select(`
            *,
            creator:created_by (id, email, full_name, role),
            assignee:assigned_to (id, email, full_name, role)
          `)
          .order('created_at', { ascending: false });

        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        if (filters.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }
        if (filters.priority && filters.priority !== 'all') {
          query = query.eq('priority', filters.priority);
        }
        if (filters.building) {
          query = query.ilike('building', `%${filters.building}%`);
        }
        if (filters.search) {
          query = query.or(
            `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tracking_number.ilike.%${filters.search}%,location_details.ilike.%${filters.search}%`
          );
        }

        const { data, error } = await query;
        if (!error && data) {
          return data as unknown as ReportWithDetails[];
        }
      }
    } catch {
      // Fallback to mock store
    }
  }

  return mockStore.getReports(filters, user);
}

export async function getReportById(id: string): Promise<ReportWithDetails | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data: report, error } = await supabase
          .from('reports')
          .select(`
            *,
            creator:created_by (id, email, full_name, role),
            assignee:assigned_to (id, email, full_name, role)
          `)
          .eq('id', id)
          .single();

        if (error || !report) return null;

        // Fetch history
        const { data: history } = await supabase
          .from('report_status_history')
          .select(`
            *,
            actor:changed_by (full_name, role)
          `)
          .eq('report_id', id)
          .order('created_at', { ascending: false });

        const mappedHistory = (history || []).map((h) => {
          const actor = (h as unknown as { actor?: { full_name: string; role: Profile['role'] } }).actor;
          return {
            ...h,
            author_name: actor?.full_name || 'System',
            author_role: actor?.role,
          };
        });

        // Fetch internal notes if staff
        let internalNotes: ReportWithDetails['internal_notes'] = [];
        if (isStaffOrAdmin(user.role)) {
          const { data: notes } = await supabase
            .from('report_internal_notes')
            .select(`
              *,
              author:author_id (full_name)
            `)
            .eq('report_id', id)
            .order('created_at', { ascending: false });

          internalNotes = (notes || []).map((n) => {
            const author = (n as unknown as { author?: { full_name: string } }).author;
            return {
              ...n,
              author_name: author?.full_name || 'Staff Member',
            };
          });
        }

        return {
          ...(report as unknown as ReportWithDetails),
          history: mappedHistory,
          internal_notes: internalNotes,
        };
      }
    } catch {
      // Fallback to mock store
    }
  }

  return mockStore.getReportById(id, user);
}

export async function createReportAction(
  formData: CreateReportInput
): Promise<{ success: boolean; error?: string; report?: ReportWithDetails }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'You must be logged in to report an issue.' };
  }

  const parsed = createReportSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join('. '),
    };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data: report, error } = await supabase
          .from('reports')
          .insert({
            title: parsed.data.title,
            description: parsed.data.description,
            category: parsed.data.category,
            building: parsed.data.building,
            location_details: parsed.data.location_details,
            photo_url: parsed.data.photo_url || null,
            created_by: user.id,
            status: 'submitted',
            priority: 'medium',
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        // Insert initial history
        await supabase.from('report_status_history').insert({
          report_id: report.id,
          to_status: 'submitted',
          changed_by: user.id,
          comment: 'Report submitted by student.',
        });

        return { success: true, report: report as unknown as ReportWithDetails };
      }
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Database error' };
    }
  }

  const report = mockStore.createReport(parsed.data, user);
  return { success: true, report };
}

export async function updateReportAction(
  id: string,
  formData: UpdateReportInput
): Promise<{ success: boolean; error?: string; report?: ReportWithDetails }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized.' };

  const parsed = updateReportSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join('. ') };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data: existing } = await supabase
          .from('reports')
          .select('status, created_by')
          .eq('id', id)
          .single();

        if (!existing) return { success: false, error: 'Report not found.' };

        if (!canStudentEditReport(existing.status, existing.created_by === user.id)) {
          return {
            success: false,
            error: 'Reports can only be edited while in "submitted" status by the student who created them.',
          };
        }

        const { data, error } = await supabase
          .from('reports')
          .update({
            title: parsed.data.title,
            description: parsed.data.description,
            category: parsed.data.category,
            building: parsed.data.building,
            location_details: parsed.data.location_details,
            photo_url: parsed.data.photo_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) return { success: false, error: error.message };
        return { success: true, report: data as unknown as ReportWithDetails };
      }
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Database error' };
    }
  }

  return mockStore.updateReport(id, parsed.data, user);
}

export async function withdrawReportAction(
  id: string
): Promise<{ success: boolean; error?: string; report?: ReportWithDetails }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized.' };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data: existing } = await supabase
          .from('reports')
          .select('status, created_by')
          .eq('id', id)
          .single();

        if (!existing) return { success: false, error: 'Report not found.' };

        const check = validateStatusTransition({
          currentStatus: existing.status,
          targetStatus: 'withdrawn',
          userRole: user.role,
          isOwner: existing.created_by === user.id,
        });

        if (!check.valid) return { success: false, error: check.error };

        const { data, error } = await supabase
          .from('reports')
          .update({
            status: 'withdrawn',
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) return { success: false, error: error.message };

        await supabase.from('report_status_history').insert({
          report_id: id,
          from_status: existing.status,
          to_status: 'withdrawn',
          changed_by: user.id,
          comment: 'Report withdrawn by student.',
        });

        return { success: true, report: data as unknown as ReportWithDetails };
      }
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Database error' };
    }
  }

  return mockStore.withdrawReport(id, user);
}

export async function updateReportStatusAction(
  id: string,
  input: UpdateReportStatusInput
): Promise<{ success: boolean; error?: string; report?: ReportWithDetails }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized.' };

  const parsed = updateReportStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join('. ') };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data: existing } = await supabase
          .from('reports')
          .select('status, created_by')
          .eq('id', id)
          .single();

        if (!existing) return { success: false, error: 'Report not found.' };

        const check = validateStatusTransition({
          currentStatus: existing.status,
          targetStatus: parsed.data.to_status,
          userRole: user.role,
          isOwner: existing.created_by === user.id,
          resolutionNote: parsed.data.to_status === 'resolved' ? (parsed.data.comment || '') : undefined,
          reasonComment:
            parsed.data.to_status === 'duplicate' || parsed.data.to_status === 'rejected'
              ? (parsed.data.comment || '')
              : undefined,
        });

        if (!check.valid) return { success: false, error: check.error };

        const now = new Date().toISOString();
        const updatePayload: Record<string, unknown> = {
          status: parsed.data.to_status,
          updated_at: now,
        };

        if (parsed.data.priority) updatePayload.priority = parsed.data.priority;
        if (parsed.data.assigned_to !== undefined) updatePayload.assigned_to = parsed.data.assigned_to;
        if (parsed.data.to_status === 'resolved') {
          updatePayload.resolution_note = parsed.data.comment;
          updatePayload.resolved_at = now;
        }

        const { data, error } = await supabase
          .from('reports')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .single();

        if (error) return { success: false, error: error.message };

        await supabase.from('report_status_history').insert({
          report_id: id,
          from_status: existing.status,
          to_status: parsed.data.to_status,
          changed_by: user.id,
          comment: parsed.data.comment || `Status updated to ${parsed.data.to_status}.`,
        });

        return { success: true, report: data as unknown as ReportWithDetails };
      }
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Database error' };
    }
  }

  return mockStore.updateReportStatus(id, parsed.data, user);
}

export async function addInternalNoteAction(
  reportId: string,
  noteText: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user || !isStaffOrAdmin(user.role)) {
    return { success: false, error: 'Forbidden: Only facilities staff can add internal notes.' };
  }

  const parsed = addInternalNoteSchema.safeParse({ note: noteText });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from('report_internal_notes').insert({
          report_id: reportId,
          author_id: user.id,
          note: parsed.data.note,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Database error' };
    }
  }

  return mockStore.addInternalNote(reportId, parsed.data.note, user);
}

export async function getStaffMetrics(): Promise<StaffMetrics> {
  const user = await getCurrentUser();
  if (!user || !isStaffOrAdmin(user.role)) {
    return { totalReports: 0, pendingTriage: 0, inProgress: 0, resolved: 0, highUrgent: 0 };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data: all } = await supabase.from('reports').select('status, priority');
        if (all) {
          return {
            totalReports: all.length,
            pendingTriage: all.filter((r) => r.status === 'submitted').length,
            inProgress: all.filter((r) => r.status === 'acknowledged' || r.status === 'in_progress').length,
            resolved: all.filter((r) => r.status === 'resolved').length,
            highUrgent: all.filter(
              (r) =>
                (r.priority === 'high' || r.priority === 'urgent') &&
                r.status !== 'resolved' &&
                r.status !== 'withdrawn' &&
                r.status !== 'duplicate' &&
                r.status !== 'rejected'
            ).length,
          };
        }
      }
    } catch {
      // Fallback to mock store
    }
  }

  return mockStore.getStaffMetrics();
}

export async function getStaffList(): Promise<Profile[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['staff', 'admin']);
        if (data) return data as Profile[];
      }
    } catch {
      // fallback
    }
  }
  return mockStore.getStaffMembers();
}
