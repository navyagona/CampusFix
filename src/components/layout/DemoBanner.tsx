'use client';

import React, { useTransition } from 'react';
import { Profile } from '@/types/database';
import { switchDemoUserAction } from '@/app/actions/auth-actions';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Sparkles, Shield, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DemoBanner({ currentUser }: { currentUser: Profile | null }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isSupabase = isSupabaseConfigured();

  const handleSwitchUser = (userId: string, targetPath?: string) => {
    startTransition(async () => {
      await switchDemoUserAction(userId);
      if (targetPath) {
        router.push(targetPath);
      } else {
        router.refresh();
      }
    });
  };

  const isAlex = currentUser?.email === 'alex.chen@campus.edu';
  const isDave = currentUser?.email === 'dave.miller@campus.edu';

  return (
    <div className="bg-[#102a1d] text-[#f7f4ed] text-xs py-2 px-4 shadow-sm border-b border-[#1c4530]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold text-[#d4f54e] bg-[#1c4530] px-2.5 py-0.5 rounded-full text-[11px] border border-[#255c41]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Demo Mode</span>
          </span>
          <span className="text-[#3f946b] hidden sm:inline">•</span>
          <span className="text-[#c2ded1] text-[11px] hidden sm:inline">
            {isSupabase
              ? 'Connected to live Supabase PostgreSQL'
              : 'Test both student & staff workflows with 1 click:'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#c2ded1] text-[11px] font-semibold hidden md:inline">Switch Role:</span>
          <div className="inline-flex rounded-lg shadow-xs bg-[#0a1f14] p-0.5 border border-[#1c4530]">
            <button
              onClick={() => handleSwitchUser('11111111-1111-1111-1111-111111111111', '/dashboard')}
              disabled={isPending}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                isAlex
                  ? 'bg-[#d4f54e] text-[#102a1d] font-bold shadow-xs'
                  : 'text-[#c2ded1] hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Alex (Student)</span>
            </button>
            <button
              onClick={() => handleSwitchUser('33333333-3333-3333-3333-333333333333', '/staff/reports')}
              disabled={isPending}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                isDave
                  ? 'bg-[#d4f54e] text-[#102a1d] font-bold shadow-xs'
                  : 'text-[#c2ded1] hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Dave (Staff)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
