'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReportWithDetails, Profile, ReportStatus, ReportPriority } from '@/types/database';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CATEGORY_CONFIG, isStaffOrAdmin, canStudentEditReport, canStudentWithdrawReport } from '@/lib/workflow';
import {
  updateReport,
  withdrawReport,
  updateReportStatus,
  addInternalNote,
} from '@/app/actions/report-actions';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  User,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit3,
  XCircle,
  Lock,
  Wrench,
  FileCheck2,
} from 'lucide-react';

export function ReportDetailClient({
  report,
  currentUser,
  staffList,
}: {
  report: ReportWithDetails;
  currentUser: Profile;
  staffList: Profile[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isOwner = report.created_by === currentUser.id;
  const isStaff = isStaffOrAdmin(currentUser.role);
  const canEdit = canStudentEditReport(report.status, isOwner);
  const canWithdraw = canStudentWithdrawReport(report.status, isOwner);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState(report.title);
  const [editDesc, setEditDesc] = useState(report.description);
  const [editCategory, setEditCategory] = useState(report.category);
  const [editBuilding, setEditBuilding] = useState(report.building);
  const [editLoc, setEditLoc] = useState(report.location_details);

  // Staff triage state
  const [triageStatus, setTriageStatus] = useState<ReportStatus>(
    report.status === 'submitted'
      ? 'acknowledged'
      : report.status === 'acknowledged'
      ? 'in_progress'
      : report.status === 'in_progress'
      ? 'resolved'
      : report.status
  );
  const [triageComment, setTriageComment] = useState('');
  const [triagePriority, setTriagePriority] = useState<ReportPriority>(report.priority);
  const [triageAssignee, setTriageAssignee] = useState<string>(report.assigned_to || '');

  // Internal Note form state
  const [internalNoteText, setInternalNoteText] = useState('');

  // Action error feedback
  const [actionError, setActionError] = useState<string | null>(null);

  // Handle student editing
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    startTransition(async () => {
      const res = await updateReport(report.id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        category: editCategory,
        building: editBuilding.trim(),
        location_details: editLoc.trim(),
      });
      if (!res.success) {
        setActionError(res.error || 'Failed to update report.');
      } else {
        setIsEditModalOpen(false);
        router.refresh();
      }
    });
  };

  // Handle student withdrawal
  const handleWithdrawConfirm = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await withdrawReport(report.id);
      if (!res.success) {
        setActionError(res.error || 'Failed to withdraw report.');
      } else {
        setIsWithdrawModalOpen(false);
        router.refresh();
      }
    });
  };

  // Handle staff triage / status update
  const handleTriageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    startTransition(async () => {
      const res = await updateReportStatus(report.id, {
        to_status: triageStatus,
        comment: triageComment.trim() || undefined,
        priority: triagePriority,
        assigned_to: triageAssignee ? triageAssignee : null,
      });

      if (!res.success) {
        setActionError(res.error || 'Failed to update status.');
      } else {
        setIsTriageModalOpen(false);
        setTriageComment('');
        router.refresh();
      }
    });
  };

  // Handle internal staff note submission
  const handleAddInternalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNoteText.trim()) return;
    setActionError(null);
    startTransition(async () => {
      const res = await addInternalNote(report.id, internalNoteText.trim());
      if (!res.success) {
        setActionError(res.error || 'Failed to add internal note.');
      } else {
        setInternalNoteText('');
        router.refresh();
      }
    });
  };

  // Step indices: submitted = 0, acknowledged = 1, in_progress = 2, resolved = 3
  const currentStepIndex =
    report.status === 'submitted'
      ? 0
      : report.status === 'acknowledged'
      ? 1
      : report.status === 'in_progress'
      ? 2
      : report.status === 'resolved'
      ? 3
      : -1;

  const isTerminalOther =
    report.status === 'duplicate' || report.status === 'rejected' || report.status === 'withdrawn';

  // Newly submitted report banner (lazy initialized from query parameter)
  const [isNewlyCreated, setIsNewlyCreated] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.search.includes('created=true');
    }
    return false;
  });

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href={isStaff ? '/staff/reports' : '/dashboard'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>{isStaff ? 'Back to Staff Portal' : 'Back to My Reports'}</span>
        </Link>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-zinc-500" />
              <span>Edit Details</span>
            </Button>
          )}

          {canWithdraw && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWithdrawModalOpen(true)}
              className="gap-1.5 text-rose-600 hover:bg-rose-50 hover:border-rose-200"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Report</span>
            </Button>
          )}

          {isStaff && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsTriageModalOpen(true)}
              className="gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Update Ticket / Assign Staff</span>
            </Button>
          )}
        </div>
      </div>

      {/* Success Callout when freshly submitted */}
      {isNewlyCreated && (
        <div className="p-5 rounded-2xl bg-[#d4f54e]/25 border-2 border-[#d4f54e] text-[#102a1d] space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#102a1d] text-[#d4f54e] flex items-center justify-center font-bold shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1c4530] bg-[#d4f54e]/50 px-2 py-0.5 rounded border border-[#d4f54e]">
                  Ticket Logged: {report.tracking_number}
                </span>
                <h2 className="font-display font-bold text-base text-[#102a1d] mt-1">
                  Report Submitted Successfully!
                </h2>
                <p className="text-xs text-[#1c4530] mt-0.5 leading-relaxed">
                  Your ticket has been dispatched to campus facilities maintenance. Facilities Lead Dave Miller has received it and will triage it shortly. You can follow real-time progress below or edit details until it is acknowledged.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsNewlyCreated(false)}
              className="text-xs font-bold text-[#102a1d] hover:opacity-70 p-1 cursor-pointer"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-0.5">{actionError}</p>
          </div>
        </div>
      )}

      {/* Visual Interactive Progress Stepper */}
      <div className="bg-[#fdfbf7] rounded-2xl border border-[#ede8dc] p-5 sm:p-6 shadow-xs">
        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-4">
          Repair Progress
        </p>

        {isTerminalOther ? (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#ede8dc]/50 border border-[#ede8dc] text-xs text-[#19211c]">
            <span className="font-semibold text-[#102a1d]">Current Status:</span>
            <StatusBadge status={report.status} />
            <span className="text-zinc-400">•</span>
            <span>This ticket is closed and not progressing through standard maintenance.</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 relative">
            {[
              { label: 'Submitted', desc: 'Received', icon: Clock, idx: 0 },
              { label: 'Acknowledged', desc: 'Staff Saw It', icon: FileCheck2, idx: 1 },
              { label: 'In Progress', desc: 'Fixing Now', icon: Wrench, idx: 2 },
              { label: 'Resolved', desc: 'All Done', icon: CheckCircle2, idx: 3 },
            ].map((step) => {
              const isPast = currentStepIndex > step.idx;
              const isCurrent = currentStepIndex === step.idx;
              const StepIcon = step.icon;

              return (
                <div key={step.label} className="flex flex-col items-center text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                      isPast
                        ? 'bg-[#102a1d] text-[#d4f54e] ring-2 ring-[#102a1d]/10'
                        : isCurrent
                        ? 'bg-[#d4f54e] text-[#102a1d] ring-4 ring-[#d4f54e]/30 shadow-xs font-black'
                        : 'bg-[#ede8dc] text-zinc-400'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-[#d4f54e]" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-[#102a1d]'
                        : isPast
                        ? 'text-[#1c4530]'
                        : 'text-zinc-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[10px] text-zinc-500 hidden sm:inline mt-0.5">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid: Details + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#fdfbf7] rounded-2xl border border-[#ede8dc] p-6 sm:p-7 shadow-xs space-y-5">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#ede8dc]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-[#102a1d] bg-[#ede8dc] px-2.5 py-1 rounded-lg">
                  {report.tracking_number}
                </span>
                <StatusBadge status={report.status} />
                <PriorityBadge priority={report.priority} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Reported on {new Date(report.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Title & Category */}
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#102a1d] bg-[#102a1d]/5 border border-[#102a1d]/10 px-2.5 py-1 rounded-lg mb-2">
                <CategoryIcon category={report.category} className="w-3.5 h-3.5" />
                <span>{CATEGORY_CONFIG[report.category]?.label}</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102a1d] tracking-tight">{report.title}</h1>
            </div>

            {/* Location Banner */}
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[#ede8dc]/50 border border-[#ede8dc] text-xs text-[#19211c]">
              <MapPin className="w-4 h-4 text-[#102a1d] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#102a1d] text-sm">{report.building}</p>
                <p className="text-zinc-600 mt-0.5">{report.location_details}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                What Happened
              </h2>
              <p className="text-sm text-[#19211c] whitespace-pre-wrap leading-relaxed">
                {report.description}
              </p>
            </div>

            {/* Resolution Note Callout (if resolved) */}
            {report.status === 'resolved' && (
              <div className="p-4 rounded-2xl bg-[#d4f54e]/20 border border-[#d4f54e]/60 text-[#102a1d] space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-[#102a1d]">
                  <CheckCircle2 className="w-4 h-4 text-[#102a1d]" />
                  <span>Issue Fixed & Verified</span>
                  {report.resolved_at && (
                    <span className="text-xs font-normal text-[#1c4530]">
                      • {new Date(report.resolved_at).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#102a1d] leading-relaxed pt-1">
                  {report.resolution_note || 'Repair complete.'}
                </p>
              </div>
            )}

            {/* Meta info: Reporter & Technician */}
            <div className="pt-4 border-t border-[#ede8dc] grid sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#ede8dc] text-[#102a1d] flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#102a1d]">
                    {report.creator?.full_name || 'Student Reporter'}
                  </p>
                  <p className="text-zinc-500">{report.creator?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#102a1d]/10 text-[#102a1d] flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#102a1d]">
                    {report.assignee?.full_name || 'Not assigned yet'}
                  </p>
                  <p className="text-zinc-500">
                    {report.assignee ? 'Assigned Maintenance Staff' : 'Waiting for crew assignment'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Internal Notes Section (Staff Only!) */}
          {isStaff && (
            <div className="bg-[#fdfbf7] rounded-2xl border border-[#ede8dc] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#ede8dc]">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <h2 className="text-base font-bold text-[#102a1d]">Private Staff Notes</h2>
                </div>
                <span className="text-[11px] font-semibold uppercase text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                  Staff Only
                </span>
              </div>

              <p className="text-xs text-zinc-600">
                These notes are completely private to facilities staff. Students cannot see them. Use them to note part order numbers, shift handoffs, or diagnostic details.
              </p>

              {/* Add Note Form */}
              <form onSubmit={handleAddInternalNote} className="space-y-2">
                <textarea
                  rows={2}
                  value={internalNoteText}
                  onChange={(e) => setInternalNoteText(e.target.value)}
                  placeholder="Write a private staff note (e.g. ordered spare fuse from cabinet 2)..."
                  className="w-full px-3 py-2 text-sm bg-white border border-[#ede8dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#102a1d] text-[#19211c]"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    variant="secondary"
                    isLoading={isPending}
                    disabled={internalNoteText.trim().length < 3}
                  >
                    Post Staff Note
                  </Button>
                </div>
              </form>

              {/* Existing Notes List */}
              <div className="space-y-2.5 pt-2">
                {(!report.internal_notes || report.internal_notes.length === 0) ? (
                  <p className="text-xs text-zinc-400 italic">No private staff notes yet.</p>
                ) : (
                  report.internal_notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-xl bg-white border border-[#ede8dc] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="font-bold text-[#102a1d]">
                          {note.author_name || 'Staff Member'}
                        </span>
                        <span>{new Date(note.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-[#19211c] whitespace-pre-wrap">{note.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Status Timeline (1 Col) */}
        <div className="space-y-6">
          <div className="bg-[#fdfbf7] rounded-2xl border border-[#ede8dc] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#ede8dc]">
              <Clock className="w-4 h-4 text-[#102a1d]" />
              <h2 className="text-base font-bold text-[#102a1d]">Updates & Timeline</h2>
            </div>

            <p className="text-xs text-zinc-500">
              Here is what has happened to this ticket from start to finish.
            </p>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#ede8dc]">
              {(report.history || []).map((step, idx) => (
                <div key={step.id || idx} className="relative">
                  <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-[#fdfbf7] bg-[#102a1d] ring-2 ring-[#d4f54e]/60" />

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-[#102a1d] capitalize">
                        {step.to_status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(step.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-500">
                      By <strong className="text-[#102a1d]">{step.author_name || 'System'}</strong>{' '}
                      {step.author_role && `(${step.author_role})`}
                    </p>

                    {step.comment && (
                      <div className="mt-1.5 p-2.5 rounded-xl bg-white border border-[#ede8dc] text-xs text-[#19211c] leading-relaxed">
                        {step.comment}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Student Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Maintenance Report"
        description="Update your report details while it is still waiting for staff review."
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#102a1d] focus:border-[#102a1d]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Category</label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as ReportWithDetails['category'])}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#102a1d] focus:border-[#102a1d] bg-white"
            >
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
              <option value="classroom_equipment">Classroom & AV</option>
              <option value="cleanliness">Cleanliness & Sanitation</option>
              <option value="other">General / Other</option>
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Building</label>
              <input
                type="text"
                value={editBuilding}
                onChange={(e) => setEditBuilding(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#102a1d] focus:border-[#102a1d]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Room / Floor</label>
              <input
                type="text"
                value={editLoc}
                onChange={(e) => setEditLoc(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#102a1d] focus:border-[#102a1d]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#102a1d] focus:border-[#102a1d]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#ede8dc]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student Withdraw Confirmation Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Cancel This Report?"
        description="Are you sure you want to cancel this maintenance request?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-600 leading-relaxed">
            This will cancel the ticket and let maintenance staff know that no action is needed anymore.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-[#ede8dc]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsWithdrawModalOpen(false)}
            >
              Keep Report
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleWithdrawConfirm}
              isLoading={isPending}
            >
              Yes, Cancel Report
            </Button>
          </div>
        </div>
      </Modal>

      {/* Staff Triage / Status Update Modal */}
      <Modal
        isOpen={isTriageModalOpen}
        onClose={() => setIsTriageModalOpen(false)}
        title="Update Ticket & Assign Staff"
        description={`Update status, assign crew, and adjust priority for ticket ${report.tracking_number}.`}
        maxWidth="lg"
      >
        <form onSubmit={handleTriageSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">
                New Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={triageStatus}
                onChange={(e) => setTriageStatus(e.target.value as ReportStatus)}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#102a1d] focus:border-[#102a1d] bg-white"
              >
                <option value="acknowledged">Acknowledged (Staff verified ticket)</option>
                <option value="in_progress">In Progress (Work actively underway)</option>
                <option value="resolved">Resolved (Issue is fixed)</option>
                <option value="duplicate">Mark as Duplicate</option>
                <option value="rejected">Mark as Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">
                Priority
              </label>
              <select
                value={triagePriority}
                onChange={(e) => setTriagePriority(e.target.value as ReportPriority)}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#102a1d] focus:border-[#102a1d] bg-white"
              >
                <option value="low">Low (Routine / minor)</option>
                <option value="medium">Medium (Normal)</option>
                <option value="high">High (Impairs classes or lectures)</option>
                <option value="urgent">Urgent (Safety hazard or active leak)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">
              Assign Technician
            </label>
            <select
              value={triageAssignee}
              onChange={(e) => setTriageAssignee(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#102a1d] focus:border-[#102a1d] bg-white"
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
            <label className="block text-xs font-semibold text-zinc-800 mb-1">
              {triageStatus === 'resolved'
                ? 'Resolution Note (Explain what was repaired)'
                : triageStatus === 'duplicate' || triageStatus === 'rejected'
                ? 'Reason (Required)'
                : 'Student-Visible Note (Optional update for the student)'}
            </label>
            <textarea
              rows={3}
              value={triageComment}
              onChange={(e) => setTriageComment(e.target.value)}
              placeholder={
                triageStatus === 'resolved'
                  ? 'Example: Replaced the faulty HDMI wall socket and confirmed 4K signal.'
                  : triageStatus === 'duplicate'
                  ? 'Example: Duplicate of ticket CF-2026-1001 filed earlier today.'
                  : 'Add a message the student will see on their ticket timeline...'
              }
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#102a1d] focus:border-[#102a1d]"
              required={
                triageStatus === 'resolved' ||
                triageStatus === 'duplicate' ||
                triageStatus === 'rejected'
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#ede8dc]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTriageModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isPending}>
              Save Status Update
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
