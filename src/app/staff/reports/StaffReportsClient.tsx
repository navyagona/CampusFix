'use client';

import React, { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ReportWithDetails,
  Profile,
  StaffMetrics,
  ReportStatus,
  ReportPriority,
} from '@/types/database';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CATEGORY_CONFIG } from '@/lib/workflow';
import { updateReportStatus, addInternalNote } from '@/app/actions/report-actions';
import { switchDemoUserAction } from '@/app/actions/auth-actions';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Lock,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export function StaffReportsClient({
  initialReports,
  currentUser,
  metrics,
  staffList,
}: {
  initialReports: ReportWithDetails[];
  currentUser: Profile;
  metrics: StaffMetrics;
  staffList: Profile[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isStaff = currentUser.role === 'staff' || currentUser.role === 'admin';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'priority' | 'newest'>('priority');

  // Quick Triage Modal State
  const [selectedReport, setSelectedReport] = useState<ReportWithDetails | null>(null);
  const [triageStatus, setTriageStatus] = useState<ReportStatus>('acknowledged');
  const [triagePriority, setTriagePriority] = useState<ReportPriority>('medium');
  const [triageAssignee, setTriageAssignee] = useState<string>('');
  const [triageComment, setTriageComment] = useState<string>('');
  const [internalNote, setInternalNote] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  // Buildings list for filter
  const buildings = useMemo(() => {
    return Array.from(new Set(initialReports.map((r) => r.building))).sort();
  }, [initialReports]);

  // Filtered & sorted reports
  const filteredReports = useMemo(() => {
    const list = initialReports.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
      if (buildingFilter !== 'all' && r.building !== buildingFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesTrack = r.tracking_number.toLowerCase().includes(q);
        const matchesLoc = r.location_details.toLowerCase().includes(q);
        const matchesBldg = r.building.toLowerCase().includes(q);
        const matchesUser = r.creator?.full_name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTrack && !matchesLoc && !matchesBldg && !matchesUser) {
          return false;
        }
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'priority') {
        const pOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        const diff = (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
        if (diff !== 0) return diff;
      }
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [initialReports, searchQuery, statusFilter, categoryFilter, priorityFilter, buildingFilter, sortBy]);

  const openTriageModal = (report: ReportWithDetails) => {
    setSelectedReport(report);
    setTriageStatus(
      report.status === 'submitted'
        ? 'acknowledged'
        : report.status === 'acknowledged'
        ? 'in_progress'
        : report.status === 'in_progress'
        ? 'resolved'
        : report.status
    );
    setTriagePriority(report.priority);
    setTriageAssignee(report.assigned_to || '');
    setTriageComment('');
    setInternalNote('');
    setActionError(null);
  };

  const handleTriageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setActionError(null);

    startTransition(async () => {
      const res = await updateReportStatus(selectedReport.id, {
        to_status: triageStatus,
        priority: triagePriority,
        assigned_to: triageAssignee ? triageAssignee : null,
        comment: triageComment.trim() || undefined,
      });

      if (!res.success) {
        setActionError(res.error || 'Failed to update report status.');
        return;
      }

      // If internal note provided
      if (internalNote.trim()) {
        await addInternalNote(selectedReport.id, internalNote.trim());
      }

      setSelectedReport(null);
      router.refresh();
    });
  };

  // If unauthorized student visits
  if (!isStaff) {
    return (
      <div className="bg-[#fdfbf7] rounded-3xl border border-[#fecaca] p-8 text-center max-w-lg mx-auto my-12 shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#fdf2f2] text-[#991b1b] flex items-center justify-center mx-auto border border-[#fca5a5]">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-display text-[#102a1d]">Staff Authorization Required</h2>
        <p className="text-sm text-[#46554b] leading-relaxed">
          You are currently signed in as <strong className="text-[#102a1d]">{currentUser.full_name}</strong> (Student role).
          The Staff Portal and maintenance triage operations are protected by role-based access control.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              startTransition(async () => {
                await switchDemoUserAction('33333333-3333-3333-3333-333333333333');
                router.refresh();
              });
            }}
            disabled={isPending}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-[#102a1d] text-[#d4f54e] hover:bg-[#173f2d] shadow-xs transition-all"
          >
            Switch to Dave Miller (Staff)
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold border border-[#ded7c7] bg-[#ede8dc] text-[#19211c] hover:bg-[#ded7c7] transition-all"
          >
            Return to Student Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#fdfbf7] p-6 rounded-3xl border border-[#ede8dc] shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#102a1d] tracking-tight">
              Facilities Staff Operations
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#102a1d] text-[#d4f54e] border border-[#1c4530]">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Staff Access</span>
            </span>
          </div>
          <p className="text-xs text-[#46554b] mt-1">
            Signed in as <strong className="text-[#102a1d]">{currentUser.full_name}</strong> • Facilities Lead Operations & Triage Queue
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/reports/new"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#102a1d] text-[#d4f54e] hover:bg-[#173f2d] shadow-xs border border-[#1c4530] transition-all"
          >
            + Create Staff Ticket
          </Link>
        </div>
      </div>

      {/* Interactive Operations Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => {
            setStatusFilter('all');
            setPriorityFilter('all');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'all' && priorityFilter === 'all'
              ? 'border-[#102a1d] bg-[#fdfbf7] ring-2 ring-[#102a1d] shadow-xs'
              : 'border-[#ede8dc] bg-[#fdfbf7] hover:border-[#ded7c7]'
          }`}
        >
          <p className="text-xs text-[#627267] font-semibold">All Tickets</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#102a1d] font-display mt-0.5">
            {metrics.totalReports}
          </p>
          <p className="text-[10px] text-[#88988e]">Campus-wide queue</p>
        </button>

        <button
          type="button"
          aria-label="Filter by Needs Review"
          onClick={() => {
            setStatusFilter('submitted');
            setPriorityFilter('all');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'submitted'
              ? 'border-[#8a5b0b] bg-[#fef9ee] ring-2 ring-[#8a5b0b] shadow-xs'
              : 'border-[#f4dfb2] bg-[#fef9ee]/50 hover:bg-[#fef9ee]'
          }`}
        >
          <p className="text-xs text-[#8a5b0b] font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Needs Review</span>
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#8a5b0b] font-display mt-0.5">
            {metrics.pendingTriage}
          </p>
          <p className="text-[10px] text-[#8a5b0b]/80">Awaiting staff review</p>
        </button>

        <button
          onClick={() => {
            setStatusFilter('in_progress');
            setPriorityFilter('all');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'in_progress'
              ? 'border-[#284307] bg-[#f4fbd6] ring-2 ring-[#284307] shadow-xs'
              : 'border-[#d4f54e] bg-[#f4fbd6]/40 hover:bg-[#f4fbd6]'
          }`}
        >
          <p className="text-xs text-[#284307] font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#3f946b] animate-pulse" />
            <span>Being Fixed</span>
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#284307] font-display mt-0.5">
            {metrics.inProgress}
          </p>
          <p className="text-[10px] text-[#284307]/80">Technicians active</p>
        </button>

        <button
          onClick={() => {
            setPriorityFilter('urgent');
            setStatusFilter('all');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            priorityFilter === 'urgent'
              ? 'border-[#991b1b] bg-[#fdf2f2] ring-2 ring-[#991b1b] shadow-xs'
              : 'border-[#fecaca] bg-[#fdf2f2]/40 hover:bg-[#fdf2f2]'
          }`}
        >
          <p className="text-xs text-[#991b1b] font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Urgent</span>
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#991b1b] font-display mt-0.5">
            {metrics.highUrgent}
          </p>
          <p className="text-[10px] text-[#991b1b]/80">Restrained alerts</p>
        </button>

        <button
          onClick={() => {
            setStatusFilter('resolved');
            setPriorityFilter('all');
          }}
          className={`p-4 rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 ${
            statusFilter === 'resolved'
              ? 'border-[#103b25] bg-[#e7f3ec] ring-2 ring-[#103b25] shadow-xs'
              : 'border-[#b9decb] bg-[#e7f3ec]/40 hover:bg-[#e7f3ec]'
          }`}
        >
          <p className="text-xs text-[#103b25] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved</span>
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#103b25] font-display mt-0.5">
            {metrics.resolved}
          </p>
          <p className="text-[10px] text-[#103b25]/80">Completed tickets</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#fdfbf7] p-4 sm:p-5 rounded-3xl border border-[#ede8dc] shadow-xs space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#88988e] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by ticket #, title, room, building, or student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-xs bg-[#f7f4ed] border border-[#ede8dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#102a1d] text-[#19211c] transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-[#f7f4ed] border border-[#ede8dc] rounded-xl text-[#19211c] focus:ring-2 focus:ring-[#102a1d]"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="duplicate">Duplicate</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-[#f7f4ed] border border-[#ede8dc] rounded-xl text-[#19211c] focus:ring-2 focus:ring-[#102a1d]"
            >
              <option value="all">All Categories</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
              <option value="classroom_equipment">Classroom & AV</option>
              <option value="cleanliness">Cleanliness</option>
              <option value="other">General / Other</option>
            </select>
          </div>

          {/* Priority & Sorting */}
          <div className="md:col-span-3 flex gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-1/2 px-2.5 py-2 text-xs font-semibold bg-[#f7f4ed] border border-[#ede8dc] rounded-xl text-[#19211c] focus:ring-2 focus:ring-[#102a1d]"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'updated' | 'priority' | 'newest')}
              className="w-1/2 px-2.5 py-2 text-xs font-semibold bg-[#f7f4ed] border border-[#ede8dc] rounded-xl text-[#19211c] focus:ring-2 focus:ring-[#102a1d]"
            >
              <option value="priority">Priority First</option>
              <option value="updated">Recently Updated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Building Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[#627267] font-semibold mr-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-[#88988e]" /> Building:
          </span>
          <button
            onClick={() => setBuildingFilter('all')}
            className={`px-3 py-1 rounded-full font-semibold transition-all ${
              buildingFilter === 'all'
                ? 'bg-[#102a1d] text-[#d4f54e] shadow-xs'
                : 'bg-[#ede8dc] text-[#46554b] hover:bg-[#ded7c7]'
            }`}
          >
            All Buildings
          </button>
          {buildings.map((b) => (
            <button
              key={b}
              onClick={() => setBuildingFilter(b)}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                buildingFilter === b
                  ? 'bg-[#102a1d] text-[#d4f54e] shadow-xs'
                  : 'bg-[#ede8dc] text-[#46554b] hover:bg-[#ded7c7]'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table / Queue */}
      <div className="bg-[#fdfbf7] rounded-3xl border border-[#ede8dc] shadow-xs overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#627267]">
            No campus maintenance tickets match your current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f7f4ed] border-b border-[#ede8dc] text-[#46554b] font-bold tracking-wider">
                  <th className="py-3.5 px-4">Tracking #</th>
                  <th className="py-3.5 px-4">Title & Location</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Reporter</th>
                  <th className="py-3.5 px-4">Assignee</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ede8dc]/80">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-[#f7f4ed] transition-colors">
                    {/* Tracking # */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-[#102a1d] bg-[#ede8dc] px-2 py-0.5 rounded-md border border-[#ded7c7]">
                        {report.tracking_number}
                      </span>
                    </td>

                    {/* Title & Location */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <Link
                        href={`/reports/${report.id}`}
                        className="font-bold text-[#102a1d] font-display hover:underline line-clamp-1 text-sm"
                      >
                        {report.title}
                      </Link>
                      <p className="text-[11px] text-[#46554b] line-clamp-1 mt-0.5">
                        {report.building} — {report.location_details}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 font-medium text-[#19211c]">
                        <CategoryIcon
                          category={report.category}
                          className="w-3.5 h-3.5 text-[#102a1d]"
                        />
                        <span>{CATEGORY_CONFIG[report.category]?.label}</span>
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={report.priority} />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={report.status} />
                    </td>

                    {/* Reporter */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-[#46554b]">
                      {report.creator?.full_name || 'Student'}
                    </td>

                    {/* Assignee */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-[#46554b]">
                      {report.assignee?.full_name ? (
                        <span className="text-[#102a1d] font-semibold">
                          {report.assignee.full_name}
                        </span>
                      ) : (
                        <span className="text-[#88988e] italic">Unassigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openTriageModal(report)}
                          className="px-3 py-1 rounded-xl text-xs font-bold bg-[#102a1d] text-[#d4f54e] hover:bg-[#173f2d] shadow-2xs active:scale-95 transition-all"
                        >
                          Triage
                        </button>
                        <Link
                          href={`/reports/${report.id}`}
                          className="p-1.5 text-[#627267] hover:text-[#102a1d] rounded-lg hover:bg-[#ede8dc] transition-colors"
                          title="Open full report page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Triage Modal */}
      {selectedReport && (
        <Modal
          isOpen={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          title={`Triage Ticket: ${selectedReport.tracking_number}`}
          description={`${selectedReport.title} (${selectedReport.building})`}
          maxWidth="lg"
        >
          <form onSubmit={handleTriageSubmit} className="space-y-4">
            {actionError && (
              <div className="p-3 rounded-xl bg-[#fdf2f2] border border-[#fecaca] text-[#991b1b] text-xs">
                {actionError}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#102a1d] mb-1">
                  Set Status <span className="text-[#991b1b]">*</span>
                </label>
                <select
                  value={triageStatus}
                  onChange={(e) => setTriageStatus(e.target.value as ReportStatus)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-[#ded7c7] rounded-xl focus:ring-2 focus:ring-[#102a1d] bg-[#fdfbf7] text-[#19211c]"
                >
                  <option value="acknowledged">Acknowledged (Triage Verified)</option>
                  <option value="in_progress">In Progress (Active Work)</option>
                  <option value="resolved">Resolved (Completed)</option>
                  <option value="duplicate">Mark as Duplicate</option>
                  <option value="rejected">Mark as Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102a1d] mb-1">
                  Set Priority
                </label>
                <select
                  value={triagePriority}
                  onChange={(e) => setTriagePriority(e.target.value as ReportPriority)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-[#ded7c7] rounded-xl focus:ring-2 focus:ring-[#102a1d] bg-[#fdfbf7] text-[#19211c]"
                >
                  <option value="low">Low (Routine / Non-disruptive)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="high">High (Impairs lecture or safety)</option>
                  <option value="urgent">Urgent (Immediate hazard / water leak)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102a1d] mb-1">
                Assign Technician
              </label>
              <select
                value={triageAssignee}
                onChange={(e) => setTriageAssignee(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold border border-[#ded7c7] rounded-xl focus:ring-2 focus:ring-[#102a1d] bg-[#fdfbf7] text-[#19211c]"
              >
                <option value="">Unassigned</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102a1d] mb-1">
                {triageStatus === 'resolved'
                  ? 'Resolution Summary (Required to complete ticket)'
                  : triageStatus === 'duplicate' || triageStatus === 'rejected'
                  ? 'Reason (Required)'
                  : 'Student-Visible Update Note (Optional)'}
              </label>
              <textarea
                rows={2}
                value={triageComment}
                onChange={(e) => setTriageComment(e.target.value)}
                placeholder={
                  triageStatus === 'resolved'
                    ? 'State what was repaired or replaced (e.g. replaced worn sink gasket and verified water pressure)...'
                    : 'Add note visible in student timeline...'
                }
                className="w-full px-3 py-2 text-xs border border-[#ded7c7] rounded-xl focus:ring-2 focus:ring-[#102a1d] bg-[#fdfbf7] text-[#19211c]"
                required={
                  triageStatus === 'resolved' ||
                  triageStatus === 'duplicate' ||
                  triageStatus === 'rejected'
                }
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102a1d] mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#8a5b0b]" />
                <span>Internal Staff Note (Optional, Hidden from Students)</span>
              </label>
              <textarea
                rows={2}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Private note for facility technicians (e.g. ordered replacement parts from warehouse)..."
                className="w-full px-3 py-2 text-xs border border-[#ded7c7] rounded-xl focus:ring-2 focus:ring-[#102a1d] bg-[#f7f4ed] text-[#19211c]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#ede8dc]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedReport(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary" isLoading={isPending}>
                Save Triage Updates
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
