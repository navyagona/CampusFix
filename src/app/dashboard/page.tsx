import React from 'react';
import { getCurrentUser } from '@/lib/auth/session';
import { getReports } from '@/lib/data/repository';
import { StudentDashboardClient } from './StudentDashboardClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'My Reports — CampusFix',
  description: 'View and track your submitted campus maintenance reports.',
};

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login');
  }

  const reports = await getReports();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <StudentDashboardClient
        initialReports={reports}
        studentName={currentUser.full_name}
      />
    </div>
  );
}
