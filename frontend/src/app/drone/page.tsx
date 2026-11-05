"use client";

import React, { useState, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { DroneCanvas } from "@/components/drone/DroneCanvas";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import {
  Crosshair,
  Plane,
  ShieldCheck,
  Cpu,
  Lock,
  Target,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, ProvenanceBadge } from "@/components/ui/StatusBadge";
import { DroneMissionsGallery } from "@/components/drone/DroneMissionsGallery";
import { DroneSampleMission } from "@/lib/types";

function DroneVisionContent() {
  const searchParams = useSearchParams();
  const targetIncident = searchParams.get("incident_id");
  const targetLat = searchParams.get("lat");
  const targetLng = searchParams.get("lng");

  const { incidents } = useApp();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    targetIncident || incidents[0]?.id || "AS-2026-088"
  );

  const [activeMission, setActiveMission] = useState<string | null>(
    targetIncident ? `SORTIE-${targetIncident}` : null
  );
  const [selectedMission, setSelectedMission] = useState<DroneSampleMission | null>(null);

  const activeInc = incidents.find((i) => i.id === selectedIncidentId);
  const effectiveLat = activeInc?.coordinates?.[0] ?? (targetLat ? parseFloat(targetLat) : 13.5165);
  const effectiveLng = activeInc?.coordinates?.[1] ?? (targetLng ? parseFloat(targetLng) : 75.0934);

  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-7 space-y-6 max-w-[1500px] w-full mx-auto font-sans text-xs">
        {/* Page Header */}
        <PageHeader
          title="Drone Aerial Computer Vision Studio"
          scope="Model: Grounding DINO Tiny + SAM 2"
          description="Zero-shot object detection and organic mask segmentation for heavy machinery, illegal log piles, and access skid trails."
          actions={
            <div className="flex items-center gap-2">
              <ProvenanceBadge source="server" />
              <StatusBadge label="RTK GPS Locked" variant="verified" size="sm" />
            </div>
          }
        />

        {/* Docket Assignment Ribbon */}
        <div className="atlas-card p-4 bg-bone border-sand flex items-center justify-between gap-4 flex-wrap shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-signal-soft border border-signal/30 flex items-center justify-center text-signal shrink-0">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-ink-600">
                Corroborate Incident Docket
              </div>
              <div className="text-xs text-ink-900 font-semibold mt-0.5">
                Uploaded aerial media and AI detections will be saved to storage and linked to this case docket.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="bg-paper-100 border border-sand rounded-control px-3 h-10 text-xs font-semibold text-ink-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-canopy-900 cursor-pointer min-w-[260px]"
            >
              <option value="">Standalone Reconnaissance (No Docket)</option>
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.id} — {inc.title} ({inc.jurisdiction})
                </option>
              ))}
            </select>

            {selectedIncidentId && (
              <Link
                href={`/verification?id=${selectedIncidentId}`}
                className="btn btn-secondary text-xs h-10 min-h-[40px] px-3 flex items-center gap-1.5"
              >
                <span>Evidence Desk</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Mission Switcher Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setActiveMission("DRN-MSSN-101");
              setSelectedMission(null);
            }}
            className={`btn text-xs h-11 min-h-[44px] ${
              activeMission === "DRN-MSSN-101"
                ? "btn-primary"
                : "btn-secondary"
            }`}
          >
            <Plane className="h-4 w-4" />
            <span>Mission DRN-MSSN-101 (Agumbe Core Transect)</span>
          </button>

          <button
            onClick={() => {
              setActiveMission("DRN-MSSN-102");
              setSelectedMission(null);
            }}
            className={`btn text-xs h-11 min-h-[44px] ${
              activeMission === "DRN-MSSN-102"
                ? "btn-primary"
                : "btn-secondary"
            }`}
          >
            <Plane className="h-4 w-4" />
            <span>Mission DRN-MSSN-102 (Corbett Northern Buffer)</span>
          </button>
        </div>

        {/* Recent Drone Missions Gallery from Database */}
        <DroneMissionsGallery
          activeMissionId={activeMission || undefined}
          onSelectMission={(m) => {
            setActiveMission(m.id);
            setSelectedMission(m);
          }}
        />

        {/* Main Drone Canvas Studio */}
        <DroneCanvas
          activeMission={activeMission || undefined}
          selectedMission={selectedMission}
          incidentId={selectedIncidentId || undefined}
          latitude={effectiveLat}
          longitude={effectiveLng}
        />

        {/* Mission Telemetry & Detections Inventory */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="atlas-card p-5 space-y-2">
            <div className="text-xs text-ink-600 font-semibold flex items-center gap-1.5">
              <Plane className="h-3.5 w-3.5 text-signal" />
              <span>Aircraft Sensor Telemetry</span>
            </div>
            <div className="text-sm font-bold text-ink-900">DJI Matrice 350 RTK</div>
            <div className="text-xs text-ink-600 space-y-1 font-mono">
              <div>Sensor: Zenmuse H20T Quad-Sensor Optical/IR</div>
              <div className="num">Altitude: 120 m AGL</div>
              <div className="num">Ground sample distance: 2.4 cm/pixel</div>
              <div className="num">Heading: 142° SE · Speed: 8.5 m/s</div>
            </div>
          </div>

          <div className="atlas-card p-5 space-y-2">
            <div className="text-xs text-ink-600 font-semibold flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-moss-600" />
              <span>Zero-Shot Vision Model Stack</span>
            </div>
            <div className="text-sm font-bold text-ink-900">Grounding DINO + SAM 2</div>
            <div className="text-xs text-ink-600 space-y-1 font-mono">
              <div>Detection: IDEA-Research/grounding-dino-tiny</div>
              <div>Segmentation: facebook/sam2-hiera-small</div>
              <div>Inference Engine: PyTorch FP16</div>
              <div>Weights: Resident on host machine</div>
            </div>
          </div>

          <div className="atlas-card p-5 space-y-2">
            <div className="text-xs text-ink-600 font-semibold flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-canopy" />
              <span>Forensic Evidence Custody</span>
            </div>
            <div className="text-sm font-bold text-canopy">SHA-256 Validated</div>
            <div className="text-xs text-ink-600 space-y-1">
              <div>Orthomosaic hash generated upon landing</div>
              <div className="font-mono text-[11px] truncate">
                c8e42f9a7d1b3e5c2a8f6d4b9e1c3a5f...
              </div>
              <div className="text-moss-600 font-semibold">Exif metadata integrity confirmed</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function DroneVisionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-600 font-mono text-xs">Loading Drone CV Studio...</div>}>
      <DroneVisionContent />
    </Suspense>
  );
}
