import React from 'react';
import { getCurrentUser } from '@/lib/auth/session';
import { NewReportForm } from './NewReportForm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'Report an Issue — CampusFix',
  description: 'Submit a new campus maintenance request for immediate triage.',
};

export default async function NewReportPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-2 text-xs text-[#627267]">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 font-semibold text-[#46554b] hover:text-[#102a1d] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to My Reports</span>
        </Link>
      </div>

      <NewReportForm />
    </div>
  );
}
