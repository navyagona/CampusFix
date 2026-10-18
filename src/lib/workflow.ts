import { ReportStatus, UserRole, ReportCategory, ReportPriority } from '@/types/database';

export const ALLOWED_STAFF_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  submitted: ['acknowledged', 'duplicate', 'rejected'],
  acknowledged: ['in_progress', 'duplicate', 'rejected'],
  in_progress: ['resolved', 'acknowledged'],
  resolved: ['in_progress'],
  duplicate: ['submitted'],
  rejected: ['submitted'],
  withdrawn: [],
};

/**
 * Validates whether a requested status transition is allowed based on actor role and current state
 */
export function validateStatusTransition({
  currentStatus,
  targetStatus,
  userRole,
  isOwner,
  resolutionNote,
  reasonComment,
}: {
  currentStatus: ReportStatus;
  targetStatus: ReportStatus;
  userRole: UserRole;
  isOwner: boolean;
  resolutionNote?: string;
  reasonComment?: string;
}): { valid: boolean; error?: string } {
  // If no change
  if (currentStatus === targetStatus) {
    return { valid: false, error: 'Target status is identical to current status.' };
  }

  // Student withdrawal
  if (targetStatus === 'withdrawn') {
    if (!isOwner) {
      return { valid: false, error: 'Only the student who submitted the report can withdraw it.' };
    }
    if (currentStatus !== 'submitted') {
      return {
        valid: false,
        error: `Reports cannot be withdrawn once staff have begun processing (current status: ${currentStatus}).`,
      };
    }
    return { valid: true };
  }

  // All other transitions require staff or admin privileges
  if (userRole !== 'staff' && userRole !== 'admin') {
    return { valid: false, error: 'Only maintenance staff can update report statuses.' };
  }

  const allowed = ALLOWED_STAFF_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    return {
      valid: false,
      error: `Transition from "${currentStatus}" to "${targetStatus}" is not permitted.`,
    };
  }

  // Validation rules for specific states
  if (targetStatus === 'resolved') {
    if (!resolutionNote || resolutionNote.trim().length < 5) {
      return {
        valid: false,
        error: 'A detailed resolution note (at least 5 characters) is required when marking a report as resolved.',
      };
    }
  }

  if (targetStatus === 'duplicate' || targetStatus === 'rejected') {
    if (!reasonComment || reasonComment.trim().length < 5) {
      return {
        valid: false,
        error: `A clear reason (at least 5 characters) must be provided when marking a report as ${targetStatus}.`,
      };
    }
  }

  return { valid: true };
}

export function canStudentEditReport(status: ReportStatus, isOwner: boolean): boolean {
  return isOwner && status === 'submitted';
}

export function canStudentWithdrawReport(status: ReportStatus, isOwner: boolean): boolean {
  return isOwner && status === 'submitted';
}

export function isStaffOrAdmin(role?: UserRole): boolean {
  return role === 'staff' || role === 'admin';
}

// Display formatters & Badge configuration
export const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; bg: string; text: string; border: string; description: string }
> = {
  submitted: {
    label: 'Submitted',
    bg: 'bg-[#fef9ee]',
    text: 'text-[#8a5b0b]',
    border: 'border-[#f4dfb2]',
    description: 'Waiting for staff to review',
  },
  acknowledged: {
    label: 'Acknowledged',
    bg: 'bg-[#f0f6fa]',
    text: 'text-[#1e5877]',
    border: 'border-[#cbe0ee]',
    description: 'Staff saw this and assigned it to the schedule',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-[#f4fbd6]',
    text: 'text-[#284307]',
    border: 'border-[#d4f54e]',
    description: 'A technician is actively working on the fix',
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-[#e7f3ec]',
    text: 'text-[#103b25]',
    border: 'border-[#b9decb]',
    description: 'Fixed and checked',
  },
  duplicate: {
    label: 'Duplicate',
    bg: 'bg-[#ede8dc]',
    text: 'text-[#46554b]',
    border: 'border-[#ded7c7]',
    description: 'Already reported by someone else',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-[#fdf2f2]',
    text: 'text-[#991b1b]',
    border: 'border-[#fecaca]',
    description: 'Cannot be fixed by maintenance staff',
  },
  withdrawn: {
    label: 'Withdrawn',
    bg: 'bg-[#ede8dc]',
    text: 'text-[#627267]',
    border: 'border-[#ded7c7]',
    description: 'Cancelled by the person who reported it',
  },
};

export const CATEGORY_CONFIG: Record<ReportCategory, { label: string; icon: string }> = {
  electrical: { label: 'Electrical', icon: 'zap' },
  plumbing: { label: 'Plumbing', icon: 'droplet' },
  classroom_equipment: { label: 'Classroom & AV', icon: 'monitor' },
  cleanliness: { label: 'Cleanliness & Custodial', icon: 'sparkles' },
  other: { label: 'General / Other', icon: 'wrench' },
};

export const PRIORITY_CONFIG: Record<
  ReportPriority,
  { label: string; bg: string; text: string; border: string }
> = {
  low: {
    label: 'Low',
    bg: 'bg-[#ede8dc]',
    text: 'text-[#627267]',
    border: 'border-[#ded7c7]',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-[#f0f6fa]',
    text: 'text-[#1e5877]',
    border: 'border-[#cbe0ee]',
  },
  high: {
    label: 'High',
    bg: 'bg-[#fff7ed]',
    text: 'text-[#c2410c]',
    border: 'border-[#fed7aa]',
  },
  urgent: {
    label: 'Urgent',
    bg: 'bg-[#fef2f2]',
    text: 'text-[#991b1b]',
    border: 'border-[#fca5a5]',
  },
};
