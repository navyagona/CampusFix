import React from 'react';
import { ReportStatus, ReportPriority, UserRole } from '@/types/database';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/workflow';

export function StatusBadge({ status }: { status: ReportStatus }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-zinc-100',
    text: 'text-zinc-800',
    border: 'border-zinc-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ReportPriority }) {
  const config = PRIORITY_CONFIG[priority] || {
    label: priority,
    bg: 'bg-zinc-100',
    text: 'text-zinc-800',
    border: 'border-zinc-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
}

export function RoleBadge({ role }: { role: UserRole }) {
  const isStaff = role === 'staff' || role === 'admin';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isStaff
          ? 'bg-[#102a1d] text-[#d4f54e] border border-[#1c4530]'
          : 'bg-[#ede8dc] text-[#19211c] border border-[#ded7c7]'
      }`}
    >
      {isStaff ? 'Staff / Facilities' : 'Student'}
    </span>
  );
}
