import React from 'react';
import { getCurrentUser } from '@/lib/auth/session';
import { getReports, getStaffMetrics, getStaffList } from '@/lib/data/repository';
import { StaffReportsClient } from './StaffReportsClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Staff Operations & Triage — CampusFix',
  description: 'Role-protected facilities management portal to triage and resolve campus maintenance tickets.',
};

export default async function StaffReportsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login');
  }

  // Fetch all reports (repository enforces that staff see all reports, students see own or gets filtered)
  const reports = await getReports();
  const metrics = await getStaffMetrics();
  const staffList = await getStaffList();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <StaffReportsClient
        initialReports={reports}
        currentUser={currentUser}
        metrics={metrics}
        staffList={staffList}
      />
    </div>
  );
}
