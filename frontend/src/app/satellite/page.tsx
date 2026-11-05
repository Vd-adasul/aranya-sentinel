"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SwipeComparison } from "@/components/satellite/SwipeComparison";
import { useApp } from "@/lib/store";
import {
  Satellite,
  Activity,
  CheckCircle2,
  Play,
  Plus,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, ProvenanceBadge } from "@/components/ui/StatusBadge";
import { RunAnalysisModal } from "@/components/satellite/RunAnalysisModal";
import { RegisterAoiModal } from "@/components/aoi/RegisterAoiModal";

export default function SatellitePage() {
  const { selectedRegion } = useApp();
  const [notification, setNotification] = useState<string | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isRegisterAoiOpen, setIsRegisterAoiOpen] = useState(false);

  const handlePolygonGenerated = () => {
    setNotification(
      "Candidate disturbance boundary DIST-WG-01 prepared for cadastral review (14.8 ha)."
    );
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-7 space-y-6 max-w-[1500px] w-full mx-auto font-sans text-xs">
        {/* Page Header */}
        <PageHeader
          title="Satellite &amp; Dynamic World 10m Observation"
          scope={`Sensor: Sentinel-2 MSI (10m) · ${selectedRegion.name.split("—")[0].trim()}`}
          description="Multispectral temporal change detection, bi-temporal swipe comparison, and land cover probability classification."
          actions={
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsRegisterAoiOpen(true)}
                className="btn btn-secondary text-xs h-10 min-h-[40px] px-3 flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5 text-signal" />
                <span>Register AOI</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAnalysisModalOpen(true)}
                className="btn btn-primary text-xs h-10 min-h-[40px] px-3.5 flex items-center gap-1.5 shadow-sm"
              >
                <Play className="h-3.5 w-3.5 text-moss-200 fill-current" />
                <span>Execute Analysis Run</span>
              </button>
              <ProvenanceBadge source="server" />
            </div>
          }
        />

        {notification && (
          <div className="p-3.5 rounded-control border border-moss-600/30 bg-moss-100 text-canopy flex items-center gap-2 animate-in fade-in font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-moss-600" />
            <span>{notification}</span>
          </div>
        )}

        {/* Dual-Date Swipe Comparison Slider */}
        <SwipeComparison
          regionName={selectedRegion.name}
          onCandidatePolygonGenerate={handlePolygonGenerated}
        />

        {/* Multi-spectral Spectral Index Delta Grid */}
        <div className="space-y-3">
          <div className="text-sm font-bold text-ink-900 flex items-center gap-2">
            <Activity className="h-4 w-4 text-signal" />
            <span>Multispectral Vegetation Indices &amp; Sensitivity Deltas</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* NDVI Card */}
            <div className="atlas-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink-900 text-sm">NDVI Vegetation Health</span>
                <span className="text-xs text-critical font-bold font-mono num">-0.31 Δ</span>
              </div>
              <div className="text-2xl font-bold text-critical font-mono num">
                0.82 → 0.51
              </div>
              <p className="text-xs text-ink-600 leading-relaxed">
                Normalized Difference Vegetation Index indicates sharp canopy biomass loss and chlorophyll degradation.
              </p>
            </div>

            {/* NBR Card */}
            <div className="atlas-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink-900 text-sm">NBR Burn &amp; Clear-Cut Ratio</span>
                <span className="text-xs text-signal font-bold font-mono num">-0.36 Δ</span>
              </div>
              <div className="text-2xl font-bold text-signal font-mono num">
                0.74 → 0.38
              </div>
              <p className="text-xs text-ink-600 leading-relaxed">
                Normalized Burn Ratio exposes bare mineral soil, scorched residue, and mechanical clearing tracks.
              </p>
            </div>

            {/* NDMI Card */}
            <div className="atlas-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink-900 text-sm">NDMI Canopy Moisture</span>
                <span className="text-xs text-critical font-bold font-mono num">-0.24 Δ</span>
              </div>
              <div className="text-2xl font-bold text-critical font-mono num">
                0.65 → 0.41
              </div>
              <p className="text-xs text-ink-600 leading-relaxed">
                Normalized Difference Moisture Index flags acute evapotranspiration collapse following clear-cut felling.
              </p>
            </div>
          </div>
        </div>

        {/* Ad-Hoc Satellite Change Detection Runner */}
        <RunAnalysisModal
          isOpen={isAnalysisModalOpen}
          onClose={() => setIsAnalysisModalOpen(false)}
        />

        {/* Register AOI Dialog */}
        <RegisterAoiModal
          isOpen={isRegisterAoiOpen}
          onClose={() => setIsRegisterAoiOpen(false)}
        />
      </div>
    </AppShell>
  );
}
