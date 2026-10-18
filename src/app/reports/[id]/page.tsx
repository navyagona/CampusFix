import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getReportById, getStaffList } from '@/lib/data/repository';
import { ReportDetailClient } from './ReportDetailClient';
import { isStaffOrAdmin } from '@/lib/workflow';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return { title: 'Report Details — CampusFix' };

  const report = await getReportById(id);
  if (!report) return { title: 'Report Not Found — CampusFix' };

  return {
    title: `${report.tracking_number}: ${report.title} — CampusFix`,
    description: report.description.slice(0, 160),
  };
}

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login');
  }

  const report = await getReportById(id);
  if (!report) {
    notFound();
  }

  const staffList = isStaffOrAdmin(currentUser.role) ? await getStaffList() : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ReportDetailClient
        report={report}
        currentUser={currentUser}
        staffList={staffList}
      />
    </div>
  );
}
