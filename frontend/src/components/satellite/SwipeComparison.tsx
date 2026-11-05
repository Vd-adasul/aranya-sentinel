"use client";

import React, { useState } from "react";
import { Satellite, CheckCircle2, Sliders, Columns, Sparkles } from "lucide-react";

interface SwipeComparisonProps {
  regionName?: string;
  onCandidatePolygonGenerate?: () => void;
}

export function SwipeComparison({
  regionName = "Western Ghats (Agumbe Reserve)",
  onCandidatePolygonGenerate,
}: SwipeComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeBand, setActiveBand] = useState<"dynamic_world" | "ndvi" | "true_color">("dynamic_world");
  const [viewMode, setViewMode] = useState<"swipe" | "side_by_side">("swipe");
  const [candidateState, setCandidateState] = useState<"idle" | "generating" | "prepared">("idle");

  const handleGenerate = () => {
    setCandidateState("generating");
    setTimeout(() => {
      setCandidateState("prepared");
      if (onCandidatePolygonGenerate) onCandidatePolygonGenerate();
    }, 600);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Controls: Segmented Band Tabs & View Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-card border border-sand bg-bone shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-ink-900 font-bold text-sm">
            <Satellite className="h-4 w-4 text-signal shrink-0" />
            <span>Dual-Date Sentinel-2 Inspection</span>
          </div>
          <span className="text-sand">·</span>
          <span className="text-ink-600 text-xs">{regionName}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switch: Swipe vs Side-by-side */}
          <div className="flex items-center gap-1 border border-sand rounded-control p-1 bg-paper text-xs">
            <button
              onClick={() => setViewMode("swipe")}
              className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === "swipe" ? "bg-canopy text-bone shadow-sm" : "text-ink-600 hover:text-ink-900"
              }`}
              aria-label="Swipe wipe comparison mode"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Wipe</span>
            </button>
            <button
              onClick={() => setViewMode("side_by_side")}
              className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === "side_by_side" ? "bg-canopy text-bone shadow-sm" : "text-ink-600 hover:text-ink-900"
              }`}
              aria-label="Side-by-side comparison mode"
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Dual-Pane</span>
            </button>
          </div>

          {/* Segmented Band Switcher */}
          <div className="flex items-center gap-1 border border-sand rounded-control p-1 bg-paper text-xs">
            <button
              onClick={() => setActiveBand("dynamic_world")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeBand === "dynamic_world"
                  ? "bg-canopy text-bone shadow-sm"
                  : "text-ink-600 hover:text-ink-900"
              }`}
            >
              Dynamic World 10m
            </button>
            <button
              onClick={() => setActiveBand("ndvi")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeBand === "ndvi"
                  ? "bg-canopy text-bone shadow-sm"
                  : "text-ink-600 hover:text-ink-900"
              }`}
            >
              NDVI Delta
            </button>
            <button
              onClick={() => setActiveBand("true_color")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeBand === "true_color"
                  ? "bg-canopy text-bone shadow-sm"
                  : "text-ink-600 hover:text-ink-900"
              }`}
            >
              True Color (B4-B3-B2)
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Viewer */}
      {viewMode === "swipe" ? (
        <div className="relative aspect-[16/9] min-h-[380px] max-h-[520px] w-full rounded-card border border-sand bg-[#17241D] overflow-hidden select-none shadow-lift">
          {/* Right Layer (After: Recent observation) */}
          <div className="absolute inset-0 bg-[#252A22] flex flex-col justify-between p-5 overflow-hidden">
            {/* Real Satellite Imagery: Recent Observation */}
            <div className="absolute inset-0 pointer-events-none">
              <img
                src={activeBand === "ndvi" ? "/imagery/satellite-ndvi-spectral.jpg" : "/imagery/satellite-recent.jpg"}
                alt="Recent Sentinel-2 Observation (25 Oct 2026)"
                className="w-full h-full object-cover object-center"
              />
              {activeBand === "dynamic_world" && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="rounded-xl border-2 border-critical bg-critical/30 backdrop-blur-[2px] p-3 px-4 flex items-center justify-center shadow-lift">
                    <div className="text-center text-xs text-bone font-mono font-bold bg-critical px-3 py-1.5 rounded-full shadow-sm">
                      49.0% CANOPY LOSS DETECTED (14.8 HA)
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative z-10 self-end rounded-full border border-critical/50 bg-bone/95 backdrop-blur px-3 py-1 text-xs text-critical font-bold font-mono shadow-sm">
              AFTER: 25 OCT 2026 (SENTINEL-2A)
            </div>
            <div className="relative z-10 self-end rounded-control border border-sand bg-bone/95 backdrop-blur px-3.5 py-1.5 text-xs text-ink-900 shadow-sm font-sans">
              Canopy Tree Probability: <span className="text-critical font-bold font-mono">39%</span> (Bare Ground: <span className="font-mono font-bold">44%</span>)
            </div>
          </div>

          {/* Left Layer (Before: Baseline observation) - Clipped to sliderPosition */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-signal shadow-2xl z-20"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="absolute inset-0 w-[1480px] bg-[#142A1E] flex flex-col justify-between p-5 overflow-hidden">
              {/* Real Satellite Imagery: Baseline Observation */}
              <div className="absolute inset-0 pointer-events-none">
                <img
                  src="/imagery/satellite-baseline.jpg"
                  alt="Baseline Sentinel-2 Observation (11 Oct 2026)"
                  className="w-full h-full object-cover object-center"
                />
                {activeBand === "dynamic_world" && (
                  <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                    <div className="text-xs text-bone bg-canopy/90 border border-moss-600/40 px-3.5 py-1.5 rounded-full font-bold shadow-sm backdrop-blur-[2px]">
                      Intact Rainforest Canopy (88% tree probability)
                    </div>
                  </div>
                )}
              </div>

              <div className="relative z-10 self-start rounded-full border border-moss-600/50 bg-bone/95 backdrop-blur px-3 py-1 text-xs text-moss-600 font-bold font-mono shadow-sm">
                BEFORE: 11 OCT 2026 (SENTINEL-2B)
              </div>
              <div className="relative z-10 self-start rounded-control border border-sand bg-bone/95 backdrop-blur px-3.5 py-1.5 text-xs text-ink-900 shadow-sm font-sans">
                Canopy Tree Probability: <span className="text-moss-600 font-bold font-mono">88%</span> (Bare Ground: <span className="font-mono font-bold">4%</span>)
              </div>
            </div>
          </div>

          {/* Splitter Handle (44px hit target) */}
          <div
            className="absolute inset-y-0 z-30 flex items-center justify-center pointer-events-none"
            style={{ left: `calc(${sliderPosition}% - 14px)` }}
          >
            <div className="h-11 w-7 rounded-control bg-signal border border-white text-bone flex items-center justify-center shadow-lift pointer-events-auto cursor-ew-resize">
              <span className="text-xs font-bold">⇄</span>
            </div>
          </div>

          {/* Interactive Drag Range Input */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40"
            aria-label="Swipe comparison position slider"
          />
        </div>
      ) : (
        /* Side by Side Dual Pane Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="aspect-[4/3] rounded-card border border-sand bg-[#142A1E] p-4 flex flex-col justify-between text-bone shadow-card relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <img
                src="/imagery/satellite-baseline.jpg"
                alt="Baseline Sentinel-2 Observation"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="relative z-10 self-start rounded-full border border-moss-600/50 bg-bone/95 backdrop-blur px-3 py-1 text-xs text-moss-600 font-bold font-mono">
              BASELINE: 11 OCT 2026
            </div>
            <div className="relative z-10 self-start rounded-control border border-sand bg-bone/95 backdrop-blur px-3 py-1.5 text-xs text-ink-900 font-sans">
              Tree Probability: <span className="text-moss-600 font-bold font-mono">88%</span>
            </div>
          </div>

          <div className="aspect-[4/3] rounded-card border border-sand bg-[#252A22] p-4 flex flex-col justify-between text-bone shadow-card relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <img
                src={activeBand === "ndvi" ? "/imagery/satellite-ndvi-spectral.jpg" : "/imagery/satellite-recent.jpg"}
                alt="Recent Sentinel-2 Observation"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="relative z-10 self-end rounded-full border border-critical/50 bg-bone/95 backdrop-blur px-3 py-1 text-xs text-critical font-bold font-mono">
              RECENT: 25 OCT 2026
            </div>
            <div className="relative z-10 self-end rounded-control border border-sand bg-bone/95 backdrop-blur px-3 py-1.5 text-xs text-ink-900 font-sans">
              Tree Probability: <span className="text-critical font-bold font-mono">39%</span>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic World 10m Probability Distribution & Candidate Action */}
      <div className="atlas-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-base font-bold text-ink-900">
              Dynamic World 10m Land Cover Transition
            </div>
            <div className="text-xs text-ink-600 mt-0.5">
              Pixel classification model comparing before and after observations
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={candidateState !== "idle"}
            className={`btn text-xs h-10 min-h-[40px] ${
              candidateState === "prepared"
                ? "bg-moss-100 text-canopy border border-moss-600/30"
                : "btn-signal"
            }`}
          >
            {candidateState === "prepared" ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-canopy" />
                <span>Demo boundary prepared (14.8 ha)</span>
              </>
            ) : candidateState === "generating" ? (
              <span>Preparing vector boundary...</span>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Prepare candidate boundary</span>
              </>
            )}
          </button>
        </div>

        {/* Probability Distribution Strip */}
        <div className="space-y-2">
          <div className="flex h-3.5 w-full rounded-full overflow-hidden border border-sand shadow-inner">
            <div style={{ width: "39%" }} className="bg-moss-600" title="Trees: 39%" />
            <div style={{ width: "44%" }} className="bg-signal" title="Bare Ground: 44%" />
            <div style={{ width: "11%" }} className="bg-sand" title="Shrub & Scrub: 11%" />
            <div style={{ width: "4%" }} className="bg-critical" title="Built / Machinery: 4%" />
            <div style={{ width: "2%" }} className="bg-water" title="Water: 2%" />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-ink-600 font-sans gap-2">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-moss-600" /> Trees 39%
            </span>
            <span className="flex items-center gap-1.5 font-bold text-signal">
              <span className="h-2.5 w-2.5 rounded-full bg-signal" /> Bare ground 44% (+40%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-sand" /> Shrub 11%
            </span>
            <span className="flex items-center gap-1.5 font-bold text-critical">
              <span className="h-2.5 w-2.5 rounded-full bg-critical" /> Built/machinery 4%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-water" /> Water 2%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
