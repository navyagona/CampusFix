'use client';

import React, { useState } from 'react';
import {
  Clock,
  FileCheck2,
  Wrench,
  CheckCircle2,
  User,
  Sparkles,
} from 'lucide-react';

const WORKFLOW_STEPS = [
  {
    id: 'submitted',
    stepNumber: '1',
    name: 'Submitted',
    badge: 'Step 1: Submitted',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
    icon: Clock,
    title: 'Student reports the problem',
    summary:
      'You see something broken—like a flickering light or a broken projector. You pick the building, enter the room number, describe what happened, and hit submit.',
    whoActs: 'Student Reporter',
    studentCanDo: 'You can still edit details or cancel (withdraw) the report if you made a mistake.',
    sampleUpdate: 'Report submitted by Alex Chen (Student) • Waiting for staff review',
  },
  {
    id: 'acknowledged',
    stepNumber: '2',
    name: 'Acknowledged',
    badge: 'Step 2: Acknowledged',
    badgeColor: 'bg-[#102a1d]/10 text-[#102a1d] border-[#102a1d]/20',
    icon: FileCheck2,
    title: 'Maintenance staff reviews the ticket',
    summary:
      'Facilities staff reviews your report. They verify which building crew should handle it, set the priority level (e.g. Medium or Urgent), and assign a technician.',
    whoActs: 'Facilities Lead',
    studentCanDo: 'Ticket is locked from student edits so staff can work with stable information.',
    sampleUpdate: 'Dave Miller (Staff): "AV team verified the room schedule. Queued for morning shift."',
  },
  {
    id: 'in_progress',
    stepNumber: '3',
    name: 'In Progress',
    badge: 'Step 3: In Progress',
    badgeColor: 'bg-[#1c4530]/15 text-[#102a1d] border-[#102a1d]/25',
    icon: Wrench,
    title: 'Technician is actively working',
    summary:
      'The assigned technician goes to the room with the tools and parts needed. They can post public progress updates and private internal staff notes.',
    whoActs: 'Assigned Technician',
    studentCanDo: 'You can check the timeline to see exactly what staff is doing.',
    sampleUpdate: 'Dave Miller (Staff): "Technician dispatched to replace the podium HDMI plate."',
  },
  {
    id: 'resolved',
    stepNumber: '4',
    name: 'Resolved',
    badge: 'Step 4: Resolved',
    badgeColor: 'bg-[#d4f54e]/30 text-[#102a1d] border-[#d4f54e]',
    icon: CheckCircle2,
    title: 'Problem is fixed and checked off',
    summary:
      'The repair is completed. Staff must enter a resolution note explaining what was repaired before the ticket can be closed.',
    whoActs: 'Facilities Staff',
    studentCanDo: 'You see the final resolution summary and the exact time it was finished.',
    sampleUpdate: 'Resolution Note: "Replaced loose HDMI port and tested projector with 4K video signal."',
  },
];

export function LandingInteractive() {
  const [activeStep, setActiveStep] = useState(0);
  const current = WORKFLOW_STEPS[activeStep];
  const IconComponent = current.icon;

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#102a1d]/5 text-[#102a1d] border border-[#102a1d]/15">
          <Sparkles className="w-3.5 h-3.5 text-[#102a1d]" />
          <span>Interactive State Machine</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#102a1d] tracking-tight">
          How a report moves from broken to fixed
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600">
          Click any step below to see how our campus maintenance workflow works.
        </p>
      </div>

      {/* Step Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-4xl mx-auto">
        {WORKFLOW_STEPS.map((step, idx) => {
          const isSelected = activeStep === idx;
          const StepIcon = step.icon;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-[#102a1d] bg-[#102a1d] text-white shadow-sm ring-2 ring-[#d4f54e]/40'
                  : 'border-[#ede8dc] bg-[#fdfbf7] hover:border-[#102a1d]/30 hover:bg-[#ede8dc]/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${
                    isSelected ? 'bg-[#d4f54e] text-[#102a1d]' : 'bg-[#ede8dc] text-[#19211c]'
                  }`}
                >
                  {step.stepNumber}
                </span>
                <StepIcon
                  className={`w-4 h-4 ${isSelected ? 'text-[#d4f54e]' : 'text-zinc-400'}`}
                />
              </div>
              <div>
                <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#102a1d]'}`}>
                  {step.name}
                </p>
                <p className={`text-[11px] mt-0.5 line-clamp-1 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {step.whoActs}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step Detail Card */}
      <div className="max-w-4xl mx-auto bg-[#fdfbf7] rounded-2xl border border-[#ede8dc] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ede8dc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#102a1d] text-[#d4f54e] flex items-center justify-center shrink-0 shadow-xs">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border mb-1 ${current.badgeColor}`}>
                {current.badge}
              </span>
              <h3 className="font-display text-lg font-bold text-[#102a1d]">{current.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-600 bg-[#ede8dc]/60 px-3 py-1.5 rounded-lg border border-[#ede8dc]">
            <User className="w-3.5 h-3.5 text-zinc-500" />
            <span>Action by: <strong className="text-[#102a1d]">{current.whoActs}</strong></span>
          </div>
        </div>

        <p className="text-sm text-zinc-700 leading-relaxed">{current.summary}</p>

        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#ede8dc]/40 border border-[#ede8dc] space-y-1">
            <p className="text-xs font-semibold text-[#102a1d]">Student Control & Visibility</p>
            <p className="text-xs text-zinc-600 leading-relaxed">{current.studentCanDo}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#102a1d]/5 border border-[#102a1d]/15 space-y-1">
            <p className="text-xs font-semibold text-[#102a1d]">Sample Timeline Entry</p>
            <p className="text-xs text-[#1c4530] italic leading-relaxed">
              &ldquo;{current.sampleUpdate}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
