'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signupAction } from '@/app/actions/auth-actions';
import { Button } from '@/components/ui/Button';
import {
  Wrench,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Shield,
  User,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'staff'>('student');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    startTransition(async () => {
      const res = await signupAction({
        full_name: fullName,
        email,
        password,
        role,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Signup failed. Please try again.');
      } else {
        if (role === 'staff') {
          router.push('/staff/reports');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-[#fdfbf7] rounded-3xl border border-[#ede8dc] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Modern Campus Highlights Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0a1f14] via-[#102a1d] to-[#153625] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
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
                Join CampusFix
              </h2>
              <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
                Whether you are a student reporting a classroom issue or a technician solving problems, CampusFix keeps everything transparent.
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs text-zinc-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#d4f54e] shrink-0" />
                <span className="font-medium">Sign up in under 30 seconds</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#d4f54e] shrink-0" />
                <span className="font-medium">Choose your role: Student or Staff</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#d4f54e] shrink-0" />
                <span className="font-medium">Instant status updates on all reports</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 p-3.5 rounded-2xl bg-white/10 border border-white/15 text-xs text-zinc-200 backdrop-blur-xs">
            <p className="font-semibold text-white">Testing for an interview?</p>
            <p className="text-[11px] text-zinc-300 mt-0.5">
              You can pick either Student or Staff role to test role-based permissions immediately.
            </p>
          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6 bg-[#fdfbf7]">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#102a1d] text-[#d4f54e] flex items-center justify-center mb-3 shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[#102a1d]">Create your account</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Start reporting campus repairs or manage maintenance.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Your Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ede8dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#102a1d] focus:border-[#102a1d] text-[#19211c] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Campus Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan.lee@campus.edu"
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
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ede8dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#102a1d] focus:border-[#102a1d] text-[#19211c] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Choose Your Role</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    role === 'student'
                      ? 'border-[#102a1d] bg-[#102a1d] text-white shadow-xs ring-2 ring-[#d4f54e]/30'
                      : 'border-[#ede8dc] bg-white hover:bg-[#ede8dc]/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                    <User className={`w-3.5 h-3.5 ${role === 'student' ? 'text-[#d4f54e]' : 'text-[#102a1d]'}`} />
                    <span className={role === 'student' ? 'text-white' : 'text-[#102a1d]'}>Student</span>
                  </div>
                  <p className={`text-[11px] ${role === 'student' ? 'text-zinc-300' : 'text-zinc-500'}`}>Report & track issues</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('staff')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    role === 'staff'
                      ? 'border-[#102a1d] bg-[#102a1d] text-white shadow-xs ring-2 ring-[#d4f54e]/30'
                      : 'border-[#ede8dc] bg-white hover:bg-[#ede8dc]/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                    <Shield className={`w-3.5 h-3.5 ${role === 'staff' ? 'text-[#d4f54e]' : 'text-[#102a1d]'}`} />
                    <span className={role === 'staff' ? 'text-white' : 'text-[#102a1d]'}>Staff / Facilities</span>
                  </div>
                  <p className={`text-[11px] ${role === 'staff' ? 'text-zinc-300' : 'text-zinc-500'}`}>Triage & fix tickets</p>
                </button>
              </div>
            </div>

            <Button type="submit" isLoading={isPending} className="w-full py-2.5">
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-[#ede8dc] text-xs text-zinc-500">
            <span>Already have an account? </span>
            <Link href="/auth/login" className="text-[#102a1d] font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
