'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Profile } from '@/types/database';
import { RoleBadge } from '@/components/ui/Badge';
import { Wrench, PlusCircle, LayoutDashboard, Shield, LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth-actions';
import { isStaffOrAdmin } from '@/lib/workflow';

export function Navbar({ currentUser }: { currentUser: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.push('/');
      router.refresh();
    });
  };

  const isStaff = isStaffOrAdmin(currentUser?.role);

  return (
    <header className="sticky top-0 z-40 bg-[#fdfbf7]/90 backdrop-blur-md border-b border-[#ede8dc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#102a1d] text-[#d4f54e] flex items-center justify-center shadow-xs border border-[#1c4530] group-hover:scale-105 transition-transform">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-[#102a1d] tracking-tight leading-tight">
                  CampusFix
                </span>
                <span className="text-[10px] uppercase font-bold text-[#627267] tracking-wider">
                  Campus Facilities
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === '/dashboard'
                    ? 'text-[#102a1d] bg-[#ede8dc] font-semibold'
                    : 'text-[#627267] hover:text-[#102a1d] hover:bg-[#ede8dc]/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>My Reports</span>
              </Link>

              <Link
                href="/staff/reports"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname.startsWith('/staff')
                    ? 'text-[#102a1d] bg-[#ede8dc] font-semibold'
                    : 'text-[#627267] hover:text-[#102a1d] hover:bg-[#ede8dc]/50'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Staff Portal</span>
                {isStaff && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-[#102a1d]" />
                )}
              </Link>
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            <Link
              href="/reports/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold bg-[#102a1d] text-[#d4f54e] hover:bg-[#173f2d] shadow-xs border border-[#1c4530] active:scale-[0.98] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Report an Issue</span>
              <span className="sm:hidden">Report</span>
            </Link>

            {currentUser ? (
              <div className="flex items-center gap-3 pl-2 border-l border-[#ede8dc]">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-semibold text-[#19211c] leading-none">
                    {currentUser.full_name}
                  </span>
                  <div className="mt-0.5">
                    <RoleBadge role={currentUser.role} />
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isPending}
                  title="Sign out"
                  className="p-1.5 text-[#627267] hover:text-[#19211c] hover:bg-[#ede8dc] rounded-lg transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-[#102a1d] hover:bg-[#ede8dc] px-3.5 py-1.5 rounded-xl border border-[#ede8dc] transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
