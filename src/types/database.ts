export type UserRole = 'student' | 'staff' | 'admin';

export type ReportCategory =
  | 'electrical'
  | 'plumbing'
  | 'classroom_equipment'
  | 'cleanliness'
  | 'other';

export type ReportPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ReportStatus =
  | 'submitted'
  | 'acknowledged'
  | 'in_progress'
  | 'resolved'
  | 'duplicate'
  | 'rejected'
  | 'withdrawn';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

export interface Report {
  id: string;
  tracking_number: string;
  title: string;
  description: string;
  category: ReportCategory;
  building: string;
  location_details: string;
  priority: ReportPriority;
  status: ReportStatus;
  photo_url?: string | null;
  created_by: string;
  assigned_to?: string | null;
  resolution_note?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportStatusHistory {
  id: string;
  report_id: string;
  from_status: ReportStatus | null;
  to_status: ReportStatus;
  changed_by: string;
  comment?: string | null;
  created_at: string;
  // Join fields
  author_name?: string;
  author_role?: UserRole;
}

export interface ReportInternalNote {
  id: string;
  report_id: string;
  author_id: string;
  note: string;
  created_at: string;
  // Join fields
  author_name?: string;
}

export interface ReportWithDetails extends Report {
  creator?: Profile;
  assignee?: Profile;
  history?: ReportStatusHistory[];
  internal_notes?: ReportInternalNote[];
}

export interface ReportFilters {
  status?: ReportStatus | 'all';
  category?: ReportCategory | 'all';
  priority?: ReportPriority | 'all';
  building?: string;
  search?: string;
  assigned_to?: string;
}

export interface StaffMetrics {
  totalReports: number;
  pendingTriage: number; // submitted
  inProgress: number;   // acknowledged + in_progress
  resolved: number;     // resolved
  highUrgent: number;   // high or urgent priority
}
