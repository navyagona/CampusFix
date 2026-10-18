'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createReport } from '@/app/actions/report-actions';
import { ReportCategory } from '@/types/database';
import { CATEGORY_CONFIG } from '@/lib/workflow';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Button } from '@/components/ui/Button';
import {
  Upload,
  AlertCircle,
  Building2,
  Image as ImageIcon,
  X,
  ArrowRight,
  MapPin,
  Check,
  Lightbulb,
} from 'lucide-react';

const COMMON_BUILDINGS = [
  'Engineering Hall',
  'Library East Wing',
  'Student Center',
  'Arts Building',
  'Science Complex',
  'Humanities Hall',
  'North Residence Hall',
  'South Dining Commons',
  'Campus Athletic Center',
];

const CATEGORY_DETAILS: Record<
  ReportCategory,
  { label: string; subtitle: string; hint: string }
> = {
  classroom_equipment: {
    label: 'Classroom & AV',
    subtitle: 'Projectors, podium HDMI cables, monitors, microphones',
    hint: 'Include room number and whether a class is scheduled soon.',
  },
  electrical: {
    label: 'Electrical & Power',
    subtitle: 'Outlets, flickering fixtures, buzzing ballasts, circuit breakers',
    hint: 'State if any sparking or burnt smell was detected.',
  },
  plumbing: {
    label: 'Plumbing & Water',
    subtitle: 'Restroom sinks, pipe leaks, overflowing toilets, low pressure',
    hint: 'Let us know if there is standing water or active dripping.',
  },
  cleanliness: {
    label: 'Cleanliness & Custodial',
    subtitle: 'Liquid spills, glass hazards, sanitation, trash overflow',
    hint: 'Mark if slipping risk is present in high-traffic hallways.',
  },
  other: {
    label: 'General / Other',
    subtitle: 'Doors, locks, broken desk chairs, broken window latches',
    hint: 'Provide specific seat or door location details.',
  },
};

const EXAMPLE_DESCRIPTIONS = [
  {
    category: 'classroom_equipment' as ReportCategory,
    title: 'Ceiling projector HDMI port loose in room 204',
    desc: 'The wall and podium HDMI connector is bent and projector loses signal when podium is moved.',
  },
  {
    category: 'electrical' as ReportCategory,
    title: 'Power outlet sparks when plugging laptop charger',
    desc: 'The wall outlet at desk 12 made a loud spark and tripped the breaker when plugging in standard USB-C charger. Outlet appears scorched.',
  },
  {
    category: 'plumbing' as ReportCategory,
    title: 'Water leak under sink in 2nd floor restroom',
    desc: 'Cold water pipe under middle hand sink in 2nd floor restroom is dripping steadily onto the tile floor.',
  },
  {
    category: 'cleanliness' as ReportCategory,
    title: 'Soap dispenser fell off wall near main study carrels',
    desc: 'Soap dispenser fell off the mounting plate and liquid soap spilled near the entrance, creating a slipping hazard.',
  },
];

export function NewReportForm() {
  const router = useRouter();

  // Form state
  const [category, setCategory] = useState<ReportCategory>('classroom_equipment');
  const [building, setBuilding] = useState<string>('Engineering Hall');
  const [customBuilding, setCustomBuilding] = useState<string>('');
  const [locationDetails, setLocationDetails] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Submission state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Photo size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectExample = (ex: typeof EXAMPLE_DESCRIPTIONS[0]) => {
    setCategory(ex.category);
    setTitle(ex.title);
    setDescription(ex.desc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const effectiveBuilding = building === 'Other' ? customBuilding.trim() : building;

    if (!effectiveBuilding) {
      setErrorMessage('Please provide a building name.');
      setIsLoading(false);
      return;
    }

    if (!locationDetails.trim()) {
      setErrorMessage('Please specify the room or floor details.');
      setIsLoading(false);
      return;
    }

    if (title.trim().length < 5) {
      setErrorMessage('Please provide a descriptive title with at least 5 characters.');
      setIsLoading(false);
      return;
    }

    if (description.trim().length < 10) {
      setErrorMessage('Please provide a description with at least 10 characters.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await createReport({
        category,
        building: effectiveBuilding,
        location_details: locationDetails.trim(),
        title: title.trim(),
        description: description.trim(),
        photo_url: photoPreview,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to submit report.');
        setIsLoading(false);
        return;
      }

      if (res.report?.id) {
        router.push(`/reports/${res.report.id}?created=true`);
        router.refresh();
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Visual Workflow Steps Header */}
      <div className="bg-[#fdfbf7] p-5 rounded-3xl border border-[#ede8dc] shadow-xs">
        <div className="grid grid-cols-3 gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#102a1d] text-[#d4f54e] flex items-center justify-center font-bold text-xs shrink-0">
              1
            </span>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-[#102a1d]">Category</p>
              <p className="text-[11px] text-zinc-500">Pick problem type</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#102a1d] text-[#d4f54e] flex items-center justify-center font-bold text-xs shrink-0">
              2
            </span>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-[#102a1d]">Location & Details</p>
              <p className="text-[11px] text-zinc-500">Room, title, & description</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#102a1d] text-[#d4f54e] flex items-center justify-center font-bold text-xs shrink-0">
              3
            </span>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-[#102a1d]">Photo & Review</p>
              <p className="text-[11px] text-zinc-500">Submit to staff queue</p>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Please check your report details</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* STEP 1: CATEGORY SELECTION TILES */}
      <section className="bg-[#fdfbf7] rounded-3xl border border-[#ede8dc] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#ede8dc]">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#102a1d] text-[#d4f54e] text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="font-display text-lg font-bold text-[#102a1d]">
              Choose Issue Category
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-medium">Step 1 of 3</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(CATEGORY_DETAILS) as ReportCategory[]).map((catKey) => {
            const isSelected = category === catKey;
            const details = CATEGORY_DETAILS[catKey];
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setCategory(catKey)}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#102a1d] bg-[#102a1d] text-white shadow-sm ring-2 ring-[#d4f54e]/40'
                    : 'border-[#ede8dc] bg-white hover:border-[#102a1d]/30 hover:bg-[#ede8dc]/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#d4f54e] text-[#102a1d]'
                          : 'bg-[#ede8dc] text-[#102a1d]'
                      }`}
                    >
                      <CategoryIcon category={catKey} className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#d4f54e] text-[#102a1d] flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p
                    className={`font-display text-sm font-bold ${
                      isSelected ? 'text-white' : 'text-[#102a1d]'
                    }`}
                  >
                    {details.label}
                  </p>
                  <p
                    className={`text-[11px] mt-1 leading-relaxed ${
                      isSelected ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    {details.subtitle}
                  </p>
                </div>

                <div
                  className={`mt-3 pt-2.5 border-t text-[10px] ${
                    isSelected
                      ? 'border-white/15 text-[#d4f54e]'
                      : 'border-[#ede8dc] text-zinc-400'
                  }`}
                >
                  💡 {details.hint}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* STEP 2: LOCATION & PROBLEM DETAILS */}
      <section className="bg-[#fdfbf7] rounded-3xl border border-[#ede8dc] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#ede8dc]">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#102a1d] text-[#d4f54e] text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h2 className="font-display text-lg font-bold text-[#102a1d]">
              Campus Location & Description
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-medium">Step 2 of 3</span>
        </div>

        {/* Location selectors */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#102a1d] mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#102a1d]" />
              <span>Campus Building</span>
            </label>
            <select
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ede8dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#102a1d] focus:border-[#102a1d] text-[#19211c]"
            >
              {COMMON_BUILDINGS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
              <option value="Other">Other / Unlisted Building...</option>
            </select>
            {building === 'Other' && (
              <input
                type="text"
                placeholder="Enter building or outdoor quad name..."
                value={customBuilding}
                onChange={(e) => setCustomBuilding(e.target.value)}
                className="mt-2 w-full px-3.5 py-2 text-sm bg-white border border-[#ede8dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#102a1d]"
                required
              />
            )}
          </div>

          <div>
            <label
              htmlFor="location-details"
              className="block text-xs font-bold text-[#102a1d] mb-1.5 flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-[#102a1d]" />
              <span>Room Number or Floor Area</span>
            </label>
            <input
              id="location-details"
              name="location_details"
              type="text"
              placeholder="e.g. Room 405, 4th floor study carrel"
              value={locationDetails}
              onChange={(e) => setLocationDetails(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ede8dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#102a1d] focus:border-[#102a1d] text-[#19211c]"
              required
            />
          </div>
        </div>

        {/* Helpful example pills */}
        <div className="p-4 rounded-2xl bg-[#ede8dc]/40 border border-[#ede8dc] space-y-2">
          <p className="text-xs font-bold text-[#102a1d] flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
            <span>Need an example? Click any sample to populate:</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_DESCRIPTIONS.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectExample(ex)}
                className="px-2.5 py-1 text-xs rounded-lg bg-white border border-[#ede8dc] hover:border-[#102a1d] hover:bg-[#102a1d] hover:text-[#d4f54e] transition-all text-[#19211c] cursor-pointer"
              >
                {ex.title}
              </button>
            ))}
          </div>
        </div>

        {/* Issue title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="issue-title"
              className="block text-xs font-bold text-[#102a1d]"
            >
              Short Summary of the Issue
            </label>
            <span className="text-[11px] text-zinc-400">{title.length}/80</span>
          </div>
          <input
            id="issue-title"
            name="title"
            type="text"
            maxLength={80}
            placeholder="e.g. Power outlet sparks when plugging laptop charger"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ede8dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#102a1d] focus:border-[#102a1d] text-[#19211c]"
            required
          />
        </div>

        {/* Issue description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="issue-desc"
              className="block text-xs font-bold text-[#102a1d]"
            >
              Detailed Problem Description
            </label>
            <span className="text-[11px] text-zinc-400">{description.length} chars</span>
          </div>
          <textarea
            id="issue-desc"
            name="description"
            rows={4}
            placeholder="Describe what you observed. Mention if any active dripping, sparking, or safety hazard is present..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ede8dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#102a1d] focus:border-[#102a1d] text-[#19211c] leading-relaxed"
            required
          />
        </div>
      </section>

      {/* STEP 3: PHOTO UPLOAD, LIVE REVIEW & SUBMIT */}
      <section className="bg-[#fdfbf7] rounded-3xl border border-[#ede8dc] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#ede8dc]">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#102a1d] text-[#d4f54e] text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h2 className="font-display text-lg font-bold text-[#102a1d]">
              Add Photo & Submit
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-medium">Step 3 of 3</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Photo upload dropzone */}
          <div>
            <label className="block text-xs font-bold text-[#102a1d] mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#102a1d]" />
              <span>Attach Photo (Optional)</span>
            </label>
            {photoPreview ? (
              <div className="relative rounded-2xl border border-[#ede8dc] overflow-hidden bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Upload preview"
                  className="w-full h-44 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute top-4 right-4 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-[#ede8dc] hover:border-[#102a1d] rounded-2xl p-4 bg-white hover:bg-[#ede8dc]/30 transition-all cursor-pointer text-center group">
                <Upload className="w-7 h-7 text-[#102a1d] mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-[#102a1d]">
                  Click or drag photo here
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Supports PNG, JPG, WebP up to 5MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Live review summary card */}
          <div className="p-5 rounded-2xl bg-[#ede8dc]/40 border border-[#ede8dc] space-y-3">
            <p className="text-xs font-bold text-[#102a1d] uppercase tracking-wider">
              Submission Summary
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#ede8dc]">
                <span className="text-zinc-500">Category:</span>
                <span className="font-bold text-[#102a1d]">
                  {CATEGORY_CONFIG[category]?.label}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#ede8dc]">
                <span className="text-zinc-500">Location:</span>
                <span className="font-bold text-[#102a1d] text-right truncate max-w-[180px]">
                  {building === 'Other' ? customBuilding || 'Other' : building} •{' '}
                  {locationDetails || 'Room unassigned'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#ede8dc]">
                <span className="text-zinc-500">Initial Status:</span>
                <span className="font-bold text-[#102a1d] bg-[#d4f54e]/30 text-[#102a1d] px-2 py-0.5 rounded border border-[#d4f54e]">
                  Submitted
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Next Action:</span>
                <span className="text-zinc-600">Facilities triage review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form action bar */}
        <div className="pt-4 border-t border-[#ede8dc] flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-zinc-500 hover:text-[#102a1d] transition-colors"
          >
            ← Cancel and return to dashboard
          </Link>

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="px-8 py-3 text-sm font-bold bg-[#102a1d] text-[#d4f54e] hover:bg-[#1c4530] shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Submit Maintenance Request</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </section>
    </form>
  );
}
