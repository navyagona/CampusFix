import React from 'react';
import Link from 'next/link';
import {
  Wrench,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ClipboardList,
  AlertCircle,
} from 'lucide-react';
import { LandingInteractive } from './LandingInteractive';

export default function HomePage() {
  return (
    <div className="space-y-16 py-8 sm:py-14">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#102a1d]/5 text-[#102a1d] border border-[#102a1d]/15">
          <Wrench className="w-3.5 h-3.5 text-[#102a1d]" />
          <span>Simple Campus Maintenance Tracking</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#102a1d] tracking-tight leading-[1.1] max-w-3xl mx-auto">
          Campus repairs without the runaround.
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-600 leading-relaxed">
          When classroom projectors glitch or pipes leak, group chat messages get buried.
          CampusFix gives students and maintenance staff a simple, open way to report issues, assign technicians, and see when things are fixed.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/reports/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#102a1d] text-[#d4f54e] hover:bg-[#1c4530] shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Report an Issue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#fdfbf7] text-[#19211c] border border-[#ede8dc] hover:bg-[#ede8dc] shadow-xs transition-colors"
          >
            <ClipboardList className="w-4 h-4 text-zinc-500" />
            <span>My Reports</span>
          </Link>
          <Link
            href="/staff/reports"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#102a1d]/5 text-[#102a1d] hover:bg-[#102a1d]/10 border border-[#102a1d]/15 shadow-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-[#102a1d]" />
            <span>Staff Portal</span>
          </Link>
        </div>
      </section>

      {/* The Problem & Solution (Plain, relatable English) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#fdfbf7] rounded-2xl border border-[#ede8dc] p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>The Problem We Experience</span>
            </div>
            <h2 className="font-display text-xl font-bold text-[#102a1d]">
              Informal complaints don&apos;t get things fixed
            </h2>
            <ul className="space-y-3 text-sm text-zinc-600">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold mt-0.5">•</span>
                <span>You see a broken desk or leaky faucet, but have no idea if anyone reported it yet.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold mt-0.5">•</span>
                <span>Telling someone in the hallway or texting a group chat means the details get lost by lunchtime.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold mt-0.5">•</span>
                <span>You have no way of knowing if anyone is working on it or if it was simply ignored.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#fdfbf7] rounded-2xl border border-[#102a1d]/20 bg-gradient-to-b from-[#d4f54e]/10 to-[#fdfbf7] p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#102a1d] font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-[#102a1d]" />
              <span>How CampusFix Solves It</span>
            </div>
            <h2 className="font-display text-xl font-bold text-[#102a1d]">
              Clear reports, assigned staff, real updates
            </h2>
            <ul className="space-y-3 text-sm text-zinc-600">
              <li className="flex items-start gap-2.5">
                <span className="text-[#102a1d] font-bold mt-0.5">•</span>
                <span><strong>Quick intake:</strong> Pick the building, type the room number, and choose what kind of issue it is.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#102a1d] font-bold mt-0.5">•</span>
                <span><strong>Full history:</strong> Every time staff touches a ticket, a timestamped update is added to the report.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#102a1d] font-bold mt-0.5">•</span>
                <span><strong>Proper protection:</strong> Staff have their own portal to assign crew and keep private repair notes.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Component */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <LandingInteractive />
      </section>

      {/* Live Sample Data Quick Tour */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-br from-[#0a1f14] via-[#102a1d] to-[#153625] text-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-[#102a1d]/20 space-y-4 relative overflow-hidden">
        {/* Subtle radial dot backdrop */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10 space-y-4">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Ready to try it out?</h2>
          <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed">
            Use the <strong>Switch Role</strong> buttons in the top demo bar to switch between <strong>Alex (Student)</strong> and <strong>Dave (Staff)</strong>. Submit a new report as Alex, then switch to Dave to assign someone and resolve it.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#d4f54e] text-[#102a1d] hover:bg-[#bce438] shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Open Student Dashboard
            </Link>
            <Link
              href="/staff/reports"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-[#ede8dc] border border-white/20 backdrop-blur-xs transition-all"
            >
              Open Staff Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
