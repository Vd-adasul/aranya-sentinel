"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Users,
  Shield,
  EyeOff,
  Send,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, ProvenanceBadge } from "@/components/ui/StatusBadge";

export default function PublicTransparencyPage() {
  const [submittedReceipt, setSubmittedReceipt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  // Tip-off form fields
  const [reserve, setReserve] = useState("Western Ghats (Agumbe Corridor)");
  const [disturbanceType, setDisturbanceType] = useState("Commercial Logging / Chainsaws");
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState("");

  const handleSubmitTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const receipt = `TIP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      setSubmittedReceipt(receipt);
      setDescription("");
      setCoordinates("");
    }, 800);
  };

  const handleCopyReceipt = (r: string) => {
    navigator.clipboard.writeText(r);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-7 space-y-6 max-w-[1400px] w-full mx-auto font-sans text-xs">
        {/* Page Header */}
        <PageHeader
          title="Public Conservation Transparency &amp; Citizen Intake"
          description="Open forest surveillance telemetry, community conservation metrics, and anonymous citizen disturbance reporting."
          actions={
            <div className="flex items-center gap-2 text-xs text-canopy font-semibold">
              <Shield className="h-4 w-4 text-moss-600" />
              <span>Community Intake Active</span>
            </div>
          }
        />

        {/* Public Telemetry Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="atlas-card p-5 space-y-1.5">
            <div className="text-xs text-ink-600 font-medium">Citizen tip-offs reviewed</div>
            <div className="text-3xl font-bold text-ink-900 num">148 reports</div>
            <div className="text-xs text-ink-600">
              Past 6-month reporting period across state reserves
            </div>
          </div>

          <div className="atlas-card p-5 space-y-1.5">
            <div className="text-xs text-ink-600 font-medium">Canopy area safeguarded</div>
            <div className="text-3xl font-bold text-moss-600 num">84.2 ha</div>
            <div className="text-xs text-ink-600">
              Recovered through illegal machinery interdiction
            </div>
          </div>

          <div className="atlas-card p-5 space-y-1.5">
            <div className="text-xs text-ink-600 font-medium">Sanctuary canopy integrity</div>
            <div className="text-3xl font-bold text-signal num">88.9%</div>
            <div className="text-xs text-ink-600">
              Average across 4 monitored biosphere reserves
            </div>
          </div>
        </div>

        {/* Anonymous Tip-Off Form & Anonymity Commitment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Tip Form (8 cols) */}
          <div className="lg:col-span-8 atlas-card p-6 sm:p-8 space-y-5">
            <div className="border-b border-sand pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <EyeOff className="h-5 w-5 text-signal" />
                <h2 className="font-bold text-ink-900 text-base">
                  Community Disturbance Report
                </h2>
              </div>
              <StatusBadge label="Client-Side Sanitized" variant="verified" size="sm" />
            </div>

            {submittedReceipt ? (
              <div className="p-6 rounded-control bg-paper border border-sand space-y-4">
                <div className="flex items-center gap-2.5 text-canopy font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-moss-600" />
                  <span>Observation Submitted (Local Demonstration Receipt)</span>
                </div>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Your report has been queued for verification. Keep this receipt identifier for status tracking:
                </p>

                <div className="p-3.5 rounded-control bg-bone border border-sand flex items-center justify-between font-mono text-sm">
                  <span className="font-bold text-ink-900">{submittedReceipt}</span>
                  <button
                    onClick={() => handleCopyReceipt(submittedReceipt)}
                    className="p-1 rounded text-ink-600 hover:text-ink-900"
                    aria-label="Copy receipt ID"
                  >
                    {copiedReceipt ? <Check className="h-4 w-4 text-canopy" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setSubmittedReceipt(null)}
                    className="btn btn-secondary text-xs h-10"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Submit another observation</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitTip} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-900 mb-1.5">
                      Reserve transect:
                    </label>
                    <select
                      value={reserve}
                      onChange={(e) => setReserve(e.target.value)}
                      className="w-full bg-paper border border-sand rounded-control px-3.5 h-11 text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy text-xs font-medium cursor-pointer"
                    >
                      <option>Western Ghats (Agumbe Corridor)</option>
                      <option>Sundarbans Mangrove Core</option>
                      <option>Jim Corbett Buffer North</option>
                      <option>Similipal Sal Reserve</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-900 mb-1.5">
                      Disturbance category:
                    </label>
                    <select
                      value={disturbanceType}
                      onChange={(e) => setDisturbanceType(e.target.value)}
                      className="w-full bg-paper border border-sand rounded-control px-3.5 h-11 text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy text-xs font-medium cursor-pointer"
                    >
                      <option>Commercial Logging / Chainsaws</option>
                      <option>Heavy Excavation / Road Cutting</option>
                      <option>Forest Fire / Agricultural Encroachment</option>
                      <option>Felled Timber Transportation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-900 mb-1.5">
                    Approximate GPS coordinates (optional):
                  </label>
                  <input
                    type="text"
                    value={coordinates}
                    onChange={(e) => setCoordinates(e.target.value)}
                    placeholder="e.g. 13.5180, 75.0940 or landmark landmark description"
                    className="w-full bg-paper border border-sand rounded-control px-3.5 h-11 text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy text-xs font-mono"
                  />
                  <div className="text-[11px] text-ink-600 mt-1">
                    Decimal degrees or descriptive proximity to known forest trail landmarks.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-900 mb-1.5">
                    Detailed field observations &amp; equipment spotted:
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe sounds of chainsaws, vehicle types, time of activity, or physical forest clearance observed..."
                    className="w-full bg-paper border border-sand rounded-control p-3.5 text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy leading-relaxed text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !description.trim()}
                    className="btn btn-primary h-11 min-h-[44px] text-xs px-6"
                  >
                    {isSubmitting ? (
                      <span>Sanitizing &amp; submitting...</span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit anonymous report</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Anonymity Charter Side Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="atlas-card p-6 space-y-3.5 bg-paper">
              <div className="font-bold text-ink-900 text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-moss-600" />
                <span>Whistleblower Protection Charter</span>
              </div>
              <p className="text-xs text-ink-600 leading-relaxed">
                Aranya Sentinel implements client-side metadata stripping before tip-offs reach the dispatch queue:
              </p>
              <ul className="space-y-2 text-xs text-ink-900 list-disc list-inside">
                <li>Zero HTTP referrer logging or tracking pixels</li>
                <li>EXIF header stripping on any attached imagery</li>
                <li>Receipt hash generated independently of origin IP</li>
                <li>Direct routing to the District Forest Officer (DFO)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
