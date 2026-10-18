'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginAction, switchDemoUserAction } from '@/app/actions/auth-actions';
import { Button } from '@/components/ui/Button';
import {
  Wrench,
  User,
  Shield,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    startTransition(async () => {
      const res = await loginAction({ email, password });
      if (!res.success) {
        setErrorMessage(res.error || 'Login failed. Please check your email and password.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    });
  };

  const handleQuickDemoLogin = (userId: string, role: string) => {
    setErrorMessage(null);
    startTransition(async () => {
      await switchDemoUserAction(userId);
      if (role === 'staff') {
        router.push('/staff/reports');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    });
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-[#fdfbf7] rounded-3xl border border-[#ede8dc] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Modern Campus Highlights Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0a1f14] via-[#102a1d] to-[#153625] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle geometric dot pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-[#d4f54e] border border-white/15 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#d4f54e]" />
              <span>Campus Facilities Portal</span>
            </div>

            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Keep our campus safe, clean, and working.
              </h2>
              <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
                Report broken equipment in 60 seconds and follow along as our maintenance staff fixes it.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 text-xs text-zinc-200">
                <div className="w-6 h-6 rounded-md bg-white/10 text-[#d4f54e] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">Clear & Simple</strong>
                  <span className="text-zinc-300">Pick a building, room, and category. No paperwork needed.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-zinc-200">
                <div className="w-6 h-6 rounded-md bg-white/10 text-[#d4f54e] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">Real Updates</strong>
                  <span className="text-zinc-300">See when a technician is assigned and what was repaired.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-zinc-200">
                <div className="w-6 h-6 rounded-md bg-white/10 text-[#d4f54e] flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">No Forgotten Tickets</strong>
                  <span className="text-zinc-300">Every report stays visible until it is fully resolved.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Live Preview Badge */}
          <div className="relative z-10 mt-8 p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="font-mono text-[#d4f54e] font-bold">CF-2026-1001</span>
              <span className="inline-flex items-center gap-1.5 text-white font-semibold bg-[#d4f54e]/20 text-[#d4f54e] px-2 py-0.5 rounded-full text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4f54e] animate-pulse" />
                <span>In Progress</span>
              </span>
            </div>
            <p className="text-xs text-white font-semibold line-clamp-1">
              Ceiling projector HDMI port loose in room 204
            </p>
            <p className="text-[11px] text-zinc-300 mt-0.5">Engineering Hall • Assigned to Dave Miller</p>
          </div>
        </div>

        {/* Right Side: Clean Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6 bg-[#fdfbf7]">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#102a1d] text-[#d4f54e] flex items-center justify-center mb-3 shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[#102a1d]">Sign in to CampusFix</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Check on your reported issues or manage maintenance tickets.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Demo Evaluation Box */}
          <div className="p-4 rounded-2xl bg-[#ede8dc]/50 border border-[#ede8dc] space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#102a1d]">1-Click Test Accounts:</p>
              <span className="text-[10px] text-zinc-500 font-medium">Try both roles</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin('11111111-1111-1111-1111-111111111111', 'student')
                }
                disabled={isPending}
                className="group p-3 rounded-xl bg-white border border-[#ede8dc] hover:border-[#102a1d] hover:shadow-xs text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-[#102a1d]/10 text-[#102a1d] flex items-center justify-center group-hover:bg-[#102a1d] group-hover:text-[#d4f54e] transition-colors">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#102a1d]">Alex Chen</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#d4f54e]/30 text-[#102a1d] font-bold border border-[#d4f54e] ml-auto">
                    Student
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">Submit & track personal reports</p>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin('33333333-3333-3333-3333-333333333333', 'staff')
                }
                disabled={isPending}
                className="group p-3 rounded-xl bg-white border border-[#ede8dc] hover:border-[#102a1d] hover:shadow-xs text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-[#102a1d]/10 text-[#102a1d] flex items-center justify-center group-hover:bg-[#102a1d] group-hover:text-[#d4f54e] transition-colors">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#102a1d]">Dave Miller</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#102a1d]/10 text-[#102a1d] font-bold border border-[#102a1d]/20 ml-auto">
                    Staff Lead
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">Triage, prioritize & fix tickets</p>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Campus Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@campus.edu"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ede8dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#102a1d] focus:border-[#102a1d] text-[#19211c] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ede8dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#102a1d] focus:border-[#102a1d] text-[#19211c] transition-colors"
                required
              />
            </div>

            <Button type="submit" isLoading={isPending} className="w-full py-2.5">
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-[#ede8dc] text-xs text-zinc-500">
            <span>Don&apos;t have an account? </span>
            <Link href="/auth/signup" className="text-[#102a1d] font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
