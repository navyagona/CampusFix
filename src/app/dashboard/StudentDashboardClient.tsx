'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ReportWithDetails, ReportStatus } from '@/types/database';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import {
  Search,
  Filter,
  PlusCircle,
  MapPin,
  Calendar,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
  Clock,
  Building2,
  Activity,
  ChevronDown,
  ChevronUp,
  Sparkles,
  PhoneCall,
  Wrench,
} from 'lucide-react';

export function StudentDashboardClient({
  initialReports,
  studentName,
}: {
  initialReports: ReportWithDetails[];
  studentName: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'newest' | 'priority'>('updated');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  // Filtered & sorted reports
  const filteredReports = useMemo(() => {
    const list = initialReports.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
      if (selectedBuilding !== 'all' && r.building !== selectedBuilding) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesTrack = r.tracking_number.toLowerCase().includes(q);
        const matchesLoc = r.location_details.toLowerCase().includes(q);
        const matchesBldg = r.building.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTrack && !matchesLoc && !matchesBldg) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'priority') {
        const pOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      // default: updated
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [initialReports, searchQuery, statusFilter, categoryFilter, selectedBuilding, sortBy]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: initialReports.length,
      submitted: initialReports.filter((r) => r.status === 'submitted').length,
      acknowledged: initialReports.filter((r) => r.status === 'acknowledged').length,
      in_progress: initialReports.filter((r) => r.status === 'in_progress').length,
      resolved: initialReports.filter((r) => r.status === 'resolved').length,
      withdrawn: initialReports.filter((r) => r.status === 'withdrawn').length,
    };
  }, [initialReports]);

  const activeCount = counts.submitted + counts.acknowledged + counts.in_progress;

  // Location summary breakdown
  const locationBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    initialReports.forEach((r) => {
      map[r.building] = (map[r.building] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [initialReports]);

  // Recent activity stream across all student reports
  const recentUpdates = useMemo(() => {
    const list: Array<{
      reportId: string;
      trackingNumber: string;
      reportTitle: string;
      toStatus: ReportStatus;
      authorName: string;
      comment?: string | null;
      createdAt: string;
    }> = [];

    initialReports.forEach((r) => {
      (r.history || []).forEach((h) => {
        list.push({
          reportId: r.id,
          trackingNumber: r.tracking_number,
          reportTitle: r.title,
          toStatus: h.to_status,
          authorName: h.author_name || 'Staff',
          comment: h.comment,
          createdAt: h.created_at,
        });
      });
    });

    return list
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [initialReports]);

  const toggleExpand = (id: string) => {
    setExpandedReportId((prev) => (prev === id ? null : id));
  };

  const getWorkflowStep = (status: ReportStatus) => {
    switch (status) {
      case 'submitted':
        return 1;
      case 'acknowledged':
        return 2;
      case 'in_progress':
        return 3;
      case 'resolved':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Welcoming Editorial Header */}
      <div className="bg-[#fdfbf7] rounded-3xl border border-[#ede8dc] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background watermarks */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-[#d4f54e]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#102a1d] text-[#d4f54e] border border-[#1c4530]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Resident Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#102a1d] tracking-tight">
              Hello, {studentName}
            </h1>
            <p className="text-sm text-[#46554b] leading-relaxed">
              Track live repairs, check staff inspection notes, or report broken equipment in your campus buildings.
            </p>
          </div>

          <Link
            href="/reports/new"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold bg-[#102a1d] text-[#d4f54e] hover:bg-[#173f2d] shadow-sm hover:shadow-md border border-[#1c4530] active:scale-[0.98] transition-all shrink-0 group"
          >
            <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>Report an Issue</span>
          </Link>
        </div>
      </div>

      {/* 2. Overview Section: Active, Resolved, Needs Review */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#fdfbf7] p-5 rounded-2xl border border-[#ede8dc] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#627267]">
            <span>Active Repairs</span>
            <div className="w-7 h-7 rounded-lg bg-[#f4fbd6] text-[#284307] flex items-center justify-center border border-[#d4f54e]/60">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#102a1d] font-display">{activeCount}</p>
          <p className="text-[11px] text-[#46554b]">Assigned or in progress</p>
        </div>

        <div className="bg-[#fdfbf7] p-5 rounded-2xl border border-[#ede8dc] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#627267]">
            <span>Awaiting Review</span>
            <div className="w-7 h-7 rounded-lg bg-[#fef9ee] text-[#8a5b0b] flex items-center justify-center border border-[#f4dfb2]">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#8a5b0b] font-display">{counts.submitted}</p>
          <p className="text-[11px] text-[#8a5b0b]/80">Submitted, queued for lead</p>
        </div>

        <div className="bg-[#fdfbf7] p-5 rounded-2xl border border-[#ede8dc] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#627267]">
            <span>Resolved Fixes</span>
            <div className="w-7 h-7 rounded-lg bg-[#e7f3ec] text-[#103b25] flex items-center justify-center border border-[#b9decb]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#103b25] font-display">{counts.resolved}</p>
          <p className="text-[11px] text-[#103b25]/80">Completed & verified</p>
        </div>

        <div className="bg-[#fdfbf7] p-5 rounded-2xl border border-[#ede8dc] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#627267]">
            <span>Total Reported</span>
            <div className="w-7 h-7 rounded-lg bg-[#ede8dc] text-[#19211c] flex items-center justify-center border border-[#ded7c7]">
              <ClipboardList className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#19211c] font-display">{counts.all}</p>
          <p className="text-[11px] text-[#627267]">Lifetime tickets filed</p>
        </div>
      </div>

      {/* 3. Main Asymmetric Section: Reports Stream (Left 7) + Activity/Locations (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Reports Stream */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls: Search, Category, Sort */}
          <div className="bg-[#fdfbf7] p-4 sm:p-5 rounded-2xl border border-[#ede8dc] shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#88988e] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by title, room, building, ticket #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-sm bg-[#f7f4ed] border border-[#ede8dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#102a1d] focus:bg-[#fdfbf7] text-[#19211c] transition-colors"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-[#f7f4ed] border border-[#ede8dc] rounded-xl text-[#19211c] focus:outline-none focus:ring-2 focus:ring-[#102a1d]"
                >
                  <option value="all">All Categories</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="classroom_equipment">Classroom & AV</option>
                  <option value="cleanliness">Cleanliness</option>
                  <option value="other">General / Other</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'updated' | 'newest' | 'priority')}
                  className="px-3 py-2 text-xs font-semibold bg-[#f7f4ed] border border-[#ede8dc] rounded-xl text-[#19211c] focus:outline-none focus:ring-2 focus:ring-[#102a1d]"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="newest">Newest First</option>
                  <option value="priority">Highest Priority</option>
                </select>
              </div>
            </div>

            {/* Status Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#ede8dc]/60">
              <span className="text-xs text-[#627267] font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#88988e]" /> Status:
              </span>
              {[
                { id: 'all', label: 'All', count: counts.all },
                { id: 'submitted', label: 'Submitted', count: counts.submitted },
                { id: 'acknowledged', label: 'Acknowledged', count: counts.acknowledged },
                { id: 'in_progress', label: 'In Progress', count: counts.in_progress },
                { id: 'resolved', label: 'Resolved', count: counts.resolved },
                { id: 'withdrawn', label: 'Withdrawn', count: counts.withdrawn },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setStatusFilter(pill.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    statusFilter === pill.id
                      ? 'bg-[#102a1d] text-[#d4f54e] shadow-xs'
                      : 'bg-[#ede8dc] text-[#46554b] hover:bg-[#ded7c7]'
                  }`}
                >
                  <span>{pill.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      statusFilter === pill.id
                        ? 'bg-[#1c4530] text-[#d4f54e]'
                        : 'bg-[#ded7c7] text-[#627267]'
                    }`}
                  >
                    {pill.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Report Cards */}
          <div className="space-y-3.5">
            {filteredReports.length === 0 ? (
              <div className="bg-[#fdfbf7] rounded-3xl border border-[#ede8dc] p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#ede8dc] text-[#627267] flex items-center justify-center mx-auto">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#102a1d] font-display">No reports match your filters</h3>
                <p className="text-xs text-[#627267] max-w-sm mx-auto leading-relaxed">
                  {initialReports.length === 0
                    ? 'You have not submitted any campus reports yet. Report a broken item to start tracking repairs.'
                    : 'Try clearing your search query or switching your status filter above.'}
                </p>
                {initialReports.length === 0 && (
                  <div className="pt-2">
                    <Link
                      href="/reports/new"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#102a1d] text-[#d4f54e]"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Submit First Report</span>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              filteredReports.map((report) => {
                const stepNum = getWorkflowStep(report.status);
                const isExpanded = expandedReportId === report.id;

                return (
                  <div
                    key={report.id}
                    className="bg-[#fdfbf7] rounded-2xl border border-[#ede8dc] p-5 shadow-xs hover:border-[#102a1d]/30 hover:shadow-sm transition-all"
                  >
                    {/* Top Row: Meta & Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#102a1d] bg-[#ede8dc] px-2 py-0.5 rounded-md border border-[#ded7c7]">
                          {report.tracking_number}
                        </span>
                        <StatusBadge status={report.status} />
                        <PriorityBadge priority={report.priority} />
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#627267]">
                        <Calendar className="w-3.5 h-3.5 text-[#88988e]" />
                        <span>Updated {new Date(report.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Middle Row: Title & Category */}
                    <div className="flex items-start gap-3 my-2">
                      <div className="w-10 h-10 rounded-xl bg-[#ede8dc] text-[#102a1d] flex items-center justify-center shrink-0 border border-[#ded7c7]">
                        <CategoryIcon category={report.category} className="w-5 h-5 text-[#102a1d]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/reports/${report.id}`}
                          className="font-display font-bold text-base text-[#102a1d] hover:underline block line-clamp-1"
                        >
                          {report.title}
                        </Link>
                        <p className="text-xs text-[#46554b] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#627267]" />
                          <span>
                            {report.building} • {report.location_details}
                          </span>
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-[#46554b] line-clamp-2 leading-relaxed mt-2 pl-13">
                      {report.description}
                    </p>

                    {/* 4-Step Mini Workflow Progress Line */}
                    {stepNum > 0 && (
                      <div className="mt-4 pt-3 border-t border-[#ede8dc]/70">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-[#627267] mb-1.5">
                          <span className={stepNum >= 1 ? 'text-[#102a1d] font-bold' : ''}>1. Submitted</span>
                          <span className={stepNum >= 2 ? 'text-[#102a1d] font-bold' : ''}>2. Acknowledged</span>
                          <span className={stepNum >= 3 ? 'text-[#102a1d] font-bold' : ''}>3. In Progress</span>
                          <span className={stepNum >= 4 ? 'text-[#102a1d] font-bold' : ''}>4. Resolved</span>
                        </div>
                        <div className="w-full bg-[#ede8dc] h-1.5 rounded-full overflow-hidden flex">
                          <div
                            className="bg-[#102a1d] h-full transition-all duration-500 rounded-full"
                            style={{ width: `${(stepNum / 4) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions: Inline History Expand & Full Page Link */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#ede8dc]/60 text-xs">
                      <button
                        type="button"
                        onClick={() => toggleExpand(report.id)}
                        className="inline-flex items-center gap-1 text-[#46554b] hover:text-[#102a1d] font-semibold"
                      >
                        <span>History ({(report.history || []).length} updates)</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <Link
                        href={`/reports/${report.id}`}
                        className="inline-flex items-center gap-1 font-bold text-[#102a1d] hover:text-[#255c41] transition-colors"
                      >
                        <span>Full Ticket Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Inline Expanded History View */}
                    {isExpanded && (
                      <div className="mt-3 p-3.5 rounded-xl bg-[#f7f4ed] border border-[#ede8dc] space-y-2 text-xs">
                        <p className="font-bold text-[#102a1d] text-[11px] uppercase tracking-wider">
                          Update Timeline
                        </p>
                        {(!report.history || report.history.length === 0) ? (
                          <p className="text-[11px] text-[#627267] italic">No updates logged yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {report.history.map((h, idx) => (
                              <div key={h.id || idx} className="flex items-start gap-2 text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#102a1d] mt-1 shrink-0" />
                                <div>
                                  <span className="font-bold text-[#102a1d] capitalize">
                                    {h.to_status.replace('_', ' ')}
                                  </span>{' '}
                                  <span className="text-[#627267]">
                                    by {h.author_name || 'Staff'} • {new Date(h.created_at).toLocaleDateString()}
                                  </span>
                                  {h.comment && (
                                    <p className="text-[#46554b] italic mt-0.5">&ldquo;{h.comment}&rdquo;</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Editorial Location Summary + Recent Activity Timeline */}
        <div className="lg:col-span-4 space-y-6">
          {/* Location Summary Breakdown */}
          <div className="bg-[#fdfbf7] p-5 rounded-3xl border border-[#ede8dc] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ede8dc]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#102a1d]" />
                <h2 className="text-sm font-bold font-display text-[#102a1d]">Campus Location Summary</h2>
              </div>
              <span className="text-[10px] font-bold text-[#627267] uppercase">By Building</span>
            </div>

            <p className="text-xs text-[#627267] leading-relaxed">
              Click a campus building below to filter tickets filed in that location.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => setSelectedBuilding('all')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedBuilding === 'all'
                    ? 'bg-[#102a1d] text-[#d4f54e]'
                    : 'bg-[#f7f4ed] text-[#19211c] hover:bg-[#ede8dc]'
                }`}
              >
                <span>All Buildings</span>
                <span className="text-[11px] opacity-80">{initialReports.length}</span>
              </button>

              {locationBreakdown.map(([bldg, count]) => {
                const isSelected = selectedBuilding === bldg;
                const percentage = Math.round((count / (initialReports.length || 1)) * 100);

                return (
                  <button
                    key={bldg}
                    onClick={() => setSelectedBuilding(isSelected ? 'all' : bldg)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border ${
                      isSelected
                        ? 'bg-[#102a1d] text-[#d4f54e] border-[#1c4530]'
                        : 'bg-[#f7f4ed] text-[#19211c] border-[#ede8dc] hover:bg-[#ede8dc]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold line-clamp-1">{bldg}</span>
                      <span className="font-bold shrink-0 ml-2">{count}</span>
                    </div>
                    <div className="w-full bg-[#ded7c7] h-1 rounded-full overflow-hidden">
                      <div
                        className={isSelected ? 'bg-[#d4f54e] h-full' : 'bg-[#102a1d] h-full'}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Maintenance Activity Stream */}
          <div className="bg-[#fdfbf7] p-5 rounded-3xl border border-[#ede8dc] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ede8dc]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#102a1d]" />
                <h2 className="text-sm font-bold font-display text-[#102a1d]">Recent Timeline Updates</h2>
              </div>
              <span className="text-[10px] font-bold text-[#627267] uppercase">Live</span>
            </div>

            {recentUpdates.length === 0 ? (
              <p className="text-xs text-[#627267] italic">No updates logged yet.</p>
            ) : (
              <div className="space-y-3.5">
                {recentUpdates.map((act, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#102a1d] mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <Link
                          href={`/reports/${act.reportId}`}
                          className="font-bold text-[#102a1d] hover:underline truncate"
                        >
                          {act.trackingNumber}
                        </Link>
                        <span className="text-[10px] text-[#88988e]">
                          {new Date(act.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-[#46554b] text-[11px] line-clamp-1">
                        Status &rarr; <span className="font-bold capitalize">{act.toStatus.replace('_', ' ')}</span> by {act.authorName}
                      </p>
                      {act.comment && (
                        <p className="text-[11px] text-[#627267] italic mt-0.5 line-clamp-1">
                          &ldquo;{act.comment}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Direct Assistance Card */}
          <div className="bg-[#102a1d] text-[#f7f4ed] p-5 rounded-3xl border border-[#1c4530] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#d4f54e]">
              <PhoneCall className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-display">Facilities Emergency</h3>
            </div>
            <p className="text-xs text-[#c2ded1] leading-relaxed">
              If an issue poses an immediate safety hazard, active flood, or electrical spark, contact Campus Dispatch immediately:
            </p>
            <div className="p-3 rounded-xl bg-[#1c4530] border border-[#255c41] text-xs">
              <p className="font-mono font-bold text-[#d4f54e] text-sm">(555) 019-3829</p>
              <p className="text-[11px] text-[#c2ded1]">Campus Facilities 24/7 Operations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
