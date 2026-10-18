import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Fraunces, Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google';
import './globals.css';
import { getCurrentUser } from '@/lib/auth/session';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { Navbar } from '@/components/layout/Navbar';

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CampusFix — Campus Maintenance & Facilities Tracker',
  description:
    'Transparent incident tracking, status workflows, and facilities triage for university campus maintenance.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${plusJakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f7f4ed] text-[#19211c] font-sans selection:bg-[#d4f54e] selection:text-[#102a1d] bg-paper">
        <Suspense fallback={<div className="h-9 bg-[#102a1d]" />}>
          <DemoBanner currentUser={currentUser} />
        </Suspense>
        <Suspense fallback={<div className="h-16 bg-[#fdfbf7] border-b border-[#ede8dc]" />}>
          <Navbar currentUser={currentUser} />
        </Suspense>
        <main className="flex-1 pb-16">{children}</main>
        <footer className="border-t border-[#ede8dc] bg-[#fdfbf7]/80 backdrop-blur-xs py-8 text-center text-xs text-[#627267]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#102a1d]" />
              <p>
                <strong className="font-semibold text-[#19211c] font-display">CampusFix</strong> • University Maintenance & Facilities
              </p>
            </div>
            <p className="text-[#88988e]">
              Role-Based Access Control • Supabase PostgreSQL • Finite-State Workflow Machine
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
