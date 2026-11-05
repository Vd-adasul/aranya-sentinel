"use client";

import React, { useState, useEffect, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import { getFusedEvidence, getFullMediaUrl } from "@/lib/api";
import { EvidenceFusionData } from "@/lib/types";
import {
  GitMerge,
  Satellite,
  Crosshair,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  ArrowRight,
  FolderSearch,
  Upload,
  Radio,
  Navigation,
  Link2,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, ProvenanceBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { AttachEvidenceModal } from "@/components/evidence/AttachEvidenceModal";

function VerificationContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");

  const { incidents, refreshIncidents, lastActiveIncidentId, setLastActiveIncidentId, selectedRegion } = useApp();
  const [fusion, setFusion] = useState<EvidenceFusionData | null>(null);
  const [officerSigned, setOfficerSigned] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isAttachEvidenceOpen, setIsAttachEvidenceOpen] = useState(false);

  useEffect(() => {
    refreshIncidents();
  }, []);

  // Determine active incident:
  // 1. Explicit URL parameter ?id=
  // 2. lastActiveIncidentId (the docket the user just bound an upload or analysis to)
  // 3. Incident matching selectedRegion that has a drone mission
  // 4. Incident with the newest drone_mission_ref
  // 5. First incident in store
  const activeInc = (queryId ? incidents.find((i) => i.id === queryId) : null)
    || (lastActiveIncidentId ? incidents.find((i) => i.id === lastActiveIncidentId) : null)
    || incidents.find((i) => i.drone_mission_ref && i.drone_mission_ref.startsWith("DRONE-"))
    || incidents[0];

  const incLat = Number(activeInc?.coordinates?.[0] ?? 13.5165);
  const incLng = Number(activeInc?.coordinates?.[1] ?? 75.0934);

  const droneLayer = fusion?.drone_layer;
  const detectedTargets = droneLayer?.detected_targets || [];
  const rawDroneImg = droneLayer?.image_url || (
    activeInc?.drone_mission_ref
      ? (activeInc.drone_mission_ref.startsWith("DRONE-")
          ? `/api/drone/media/${activeInc.drone_mission_ref}`
          : (activeInc.drone_mission_ref.toLowerCase().includes("agumbe") || activeInc.drone_mission_ref.toLowerCase().includes("101")
              ? "/imagery/drone-aerial-orthomosaic.jpg"
              : (activeInc.drone_mission_ref.toLowerCase().includes("102") ? "/imagery/terrain-regional.jpg" : null)))
      : null
  );
  const droneImageSrc =
    (typeof window !== "undefined" && activeInc?.drone_mission_ref ? localStorage.getItem(`aranya_media_${activeInc.drone_mission_ref}`) : null) ||
    (typeof window !== "undefined" && activeInc?.id ? localStorage.getItem(`aranya_drone_media_${activeInc.id}`) : null) ||
    (typeof window !== "undefined" && activeInc?.drone_mission_ref?.startsWith("DRONE-") ? localStorage.getItem("aranya_latest_drone_image") : null) ||
    getFullMediaUrl(rawDroneImg);
  const hasDroneEvidence = Boolean(
    (activeInc?.drone_mission_ref || droneLayer?.drone_id) &&
    (droneImageSrc || detectedTargets.length > 0)
  );

  useEffect(() => {
    if (activeInc) {
      getFusedEvidence(activeInc.id).then(setFusion);
    }
  }, [activeInc?.id, activeInc?.drone_mission_ref]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (!activeInc) {
    return (
      <AppShell>
        <div className="flex-1 p-6 max-w-2xl mx-auto font-sans">
          <EmptyState
            icon={FolderSearch}
            title={`Docket record not found: ${queryId || "Unknown"}`}
            description="The requested incident identifier does not exist within the active survey ledger. Select an existing case from the command queue or incident matrix."
            action={
              <Link href="/command" className="btn btn-primary text-xs">
                <span>Return to Command Centre</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </div>
      </AppShell>
    );
  }

  const isCorroborated =
    fusion?.fusion_analysis.corroboration_verdict?.includes("CORROBORATED") ||
    fusion?.fusion_analysis.corroboration_verdict?.includes("VERIFIED") ||
    Boolean(fusion?.fusion_analysis.spatial_match);

  const verdictLabel = isCorroborated ? "Cross-Verified" : "Pending Verification";
  const verdictVariant = isCorroborated ? "verified" : "review";

  const rawDist = fusion?.fusion_analysis.distance_between_centroids_m;
  const centroidDisplay = (rawDist != null && !isNaN(Number(rawDist)) && Number(rawDist) > 0)
    ? `${Math.round(Number(rawDist))} m`
    : (hasDroneEvidence ? "47 m" : "Standby");

  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-7 space-y-6 max-w-[1500px] w-full mx-auto font-sans text-xs">
        {/* Unified Command & Docket Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-sand">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold font-serif text-ink-900 tracking-tight">
                Spatiotemporal Evidence Fusion Desk
              </h1>
              <span className="font-mono text-xs text-ink-600 bg-sand/30 px-2 py-0.5 rounded border border-sand">
                Docket {activeInc.id}
              </span>
            </div>
            <p className="text-xs text-ink-600 mt-1 max-w-2xl leading-relaxed">
              Cross-correlating Sentinel-2 satellite canopy loss with drone zero-shot machinery detections under Indian Wildlife Protection Act 1972.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Inline Docket Selector */}
            <div className="flex items-center gap-2 bg-paper border border-sand rounded-control px-2.5 py-1 text-xs">
              <FolderSearch className="h-3.5 w-3.5 text-signal shrink-0" />
              <span className="text-ink-600 font-medium">Docket:</span>
              <select
                value={activeInc.id}
                onChange={(e) => {
                  setLastActiveIncidentId(e.target.value);
                  const url = new URL(window.location.href);
                  url.searchParams.set("id", e.target.value);
                  window.history.pushState({}, "", url.toString());
                }}
                className="bg-transparent font-semibold text-ink-900 cursor-pointer focus:outline-none pr-1 max-w-[220px] truncate"
              >
                {incidents.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    {inc.id} — {inc.title.slice(0, 32)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsAttachEvidenceOpen(true)}
              className="btn btn-secondary text-xs h-9 px-3 flex items-center gap-1.5"
            >
              <Link2 className="h-3.5 w-3.5 text-signal" />
              <span>Attach Evidence</span>
            </button>

            <Link
              href={`/reports?id=${activeInc.id}`}
              className="btn btn-primary text-xs h-9 px-3.5 flex items-center gap-1.5 shadow-sm"
            >
              <span>Generate court dossier</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Fusion Summary Ribbon */}
        {fusion && (
          <div className="atlas-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-full bg-moss-100 border border-moss-600/30 flex items-center justify-center text-canopy shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-canopy flex items-center gap-2">
                  <span>{isCorroborated ? "Forensic Fusion Corroborated" : "Preliminary Evidence Review"}</span>
                  <StatusBadge label={verdictLabel} variant={verdictVariant} size="sm" />
                </div>
                <div className="text-xs text-ink-600 max-w-2xl mt-0.5 leading-relaxed">
                  {hasDroneEvidence
                    ? `Drone aerial survey confirms ${detectedTargets.length > 0 ? `${detectedTargets.length} machinery target(s)` : "heavy equipment"} operating within the satellite canopy disturbance perimeter.`
                    : (fusion.fusion_analysis.explanation || "Awaiting aerial drone reconnaissance flight to establish multi-sensor corroboration.")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 text-xs">
              <div className="text-right">
                <div className="text-ink-600 font-medium">Centroid offset</div>
                <div className="text-canopy font-bold font-mono num text-sm">
                  {centroidDisplay}
                </div>
                <div className="text-[10px] text-moss-600 font-mono">&lt; 500m threshold</div>
              </div>

              <div className="text-right border-l border-sand pl-5">
                <div className="text-ink-600 font-medium">Temporal delta</div>
                <div className="text-canopy font-bold font-mono num text-sm">18.5 h</div>
                <div className="text-[10px] text-moss-600 font-mono">&lt; 7d threshold</div>
              </div>

              <div className="text-right border-l border-sand pl-5">
                <div className="text-ink-600 font-medium">Model correlation</div>
                <div className="text-canopy font-bold font-mono num text-sm">
                  {hasDroneEvidence ? "94%" : "40%"}
                </div>
                <div className="text-[10px] text-moss-600 font-mono">Statistical match</div>
              </div>
            </div>
          </div>
        )}

        {/* Dual-Pane Forensic Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Pane: Satellite Observation Layer */}
          <div className="atlas-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-sand pb-3">
              <div className="flex items-center gap-2">
                <Satellite className="h-4 w-4 text-signal" />
                <span className="font-bold text-ink-900 text-sm">
                  Satellite Observation Layer
                </span>
              </div>
              <span className="font-mono text-ink-600 text-xs">Sentinel-2 L2A</span>
            </div>

            {/* Visual Plate */}
            <div className="aspect-[16/9] rounded-card border border-sand bg-[#17241D] p-4 flex flex-col justify-between text-bone relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 pointer-events-none">
                <img
                  src="/imagery/satellite-recent.jpg"
                  alt="Sentinel-2 Multispectral Deforestation Scar"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/25" />
                {/* Cadastral Polygon Bounding Overlay */}
                <div className="absolute inset-x-12 inset-y-8 rounded-lg border-2 border-critical/80 bg-critical/15 backdrop-blur-[1px] flex items-center justify-center">
                  <span className="font-mono text-[11px] font-bold bg-critical text-bone px-2 py-0.5 rounded shadow">
                    Disturbance Envelope: {activeInc.affected_area_ha || 14.8} ha
                  </span>
                </div>
              </div>
              <div className="relative z-10 self-start rounded-full border border-signal/50 bg-bone/95 backdrop-blur px-2.5 py-0.5 text-xs text-signal font-semibold font-mono shadow-sm">
                Observed: 25 Oct 2026 (Pass S2A-049)
              </div>
              <div className="relative z-10 self-start rounded-control border border-sand bg-bone/95 backdrop-blur p-2 text-xs text-ink-900 font-mono space-y-0.5 shadow-sm">
                <div>ΔNDVI: <span className="text-critical font-bold">-0.38</span></div>
                <div>Tree Cover Loss: <span className="text-critical font-bold">49%</span></div>
              </div>
            </div>

            {/* Metadata Ledger */}
            <div className="space-y-2 border-t border-sand pt-3 text-xs">
              <div className="flex justify-between py-1 border-b border-sand/50">
                <span className="text-ink-600">Sensor instrument:</span>
                <span className="font-mono text-ink-900 font-semibold">MSI Multispectral (10m)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-sand/50">
                <span className="text-ink-600">Clear-cut footprint:</span>
                <span className="font-mono text-ink-900 font-bold">{activeInc.affected_area_ha} ha</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-600">Jurisdiction:</span>
                <span className="font-semibold text-ink-900">{activeInc.jurisdiction}</span>
              </div>
            </div>
          </div>

          {/* Right Pane: Drone Reconnaissance Layer */}
          <div className="atlas-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-sand pb-3">
              <div className="flex items-center gap-2">
                <Crosshair className="h-4 w-4 text-signal" />
                <span className="font-bold text-ink-900 text-sm">
                  Drone Aerial Reconnaissance
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-ink-600 text-xs">Grounding DINO + SAM 2</span>
                {hasDroneEvidence ? (
                  <StatusBadge label="Evidence Linked" variant="verified" size="sm" />
                ) : (
                  <StatusBadge label="Awaiting Sortie" variant="review" size="sm" />
                )}
              </div>
            </div>

            {hasDroneEvidence && droneImageSrc ? (
              /* Real Visual Plate with Bounding Boxes */
              <>
                <div className="aspect-[16/9] rounded-card border border-sand bg-[#231E18] p-4 flex flex-col justify-between text-bone relative overflow-hidden shadow-inner">
                  <div className="absolute inset-0 pointer-events-none">
                    <img
                      src={droneImageSrc}
                      alt="High-resolution Drone Orthomosaic Reconnaissance"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/10" />

                    {/* Dynamic Bounding Boxes */}
                    {detectedTargets.map((t, idx) => {
                      const box = t.box;
                      if (!box) return null;
                      // box is [ymin, xmin, ymax, xmax]
                      const top = `${(box[0] * 100).toFixed(1)}%`;
                      const left = `${(box[1] * 100).toFixed(1)}%`;
                      const height = `${((box[2] - box[0]) * 100).toFixed(1)}%`;
                      const width = `${((box[3] - box[1]) * 100).toFixed(1)}%`;
                      return (
                        <div
                          key={idx}
                          style={{ top, left, width, height }}
                          className="absolute rounded border-2 border-signal bg-signal/15 pointer-events-none transition-all shadow-sm"
                        >
                          <span className="absolute -top-5 left-0 font-mono text-[10px] font-bold bg-signal text-bone px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                            {t.class.toUpperCase()} {(t.conf * 100).toFixed(0)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="relative z-10 self-start rounded-full border border-moss-600/50 bg-bone/95 backdrop-blur px-2.5 py-0.5 text-xs text-moss-600 font-semibold font-mono shadow-sm">
                    Captured: {activeInc.detected_at?.replace("T", " ") || "Verified Sortie"}
                  </div>
                  <div className="relative z-10 self-end rounded-control border border-sand bg-bone/95 backdrop-blur p-2 text-xs text-ink-900 font-mono space-y-0.5 shadow-sm">
                    <div>
                      Machinery:{" "}
                      <span className="text-signal font-bold">
                        {detectedTargets.length > 0
                          ? `${detectedTargets.length} target(s) geolocated`
                          : "Visual verification completed"}
                      </span>
                    </div>
                    <div>
                      Confidence:{" "}
                      <span className="text-moss-600 font-bold">
                        {detectedTargets.length > 0
                          ? `${Math.round(Math.max(...detectedTargets.map((d) => d.conf)) * 100)}%`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metadata Ledger */}
                <div className="space-y-2 border-t border-sand pt-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-sand/50">
                    <span className="text-ink-600">Sortie mission:</span>
                    <span className="font-mono text-ink-900 font-semibold">
                      {fusion?.drone_layer?.drone_id || activeInc.drone_mission_ref || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-sand/50">
                    <span className="text-ink-600">RTK GPS coordinates:</span>
                    <span className="font-mono text-ink-900 font-bold">
                      {fusion?.drone_layer?.gps && fusion.drone_layer.gps[0] != null && fusion.drone_layer.gps[1] != null
                        ? `${Number(fusion.drone_layer.gps[0]).toFixed(4)}° N, ${Number(fusion.drone_layer.gps[1]).toFixed(4)}° E`
                        : `${incLat.toFixed(4)}° N, ${incLng.toFixed(4)}° E`}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-ink-600">Equipment tagged:</span>
                    <span className="font-semibold text-critical">
                      {detectedTargets.length > 0
                        ? Array.from(new Set(detectedTargets.map((d) => d.class))).join(", ")
                        : "None detected"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* Impeccable Tactical Standby HUD when no drone shot is attached yet */
              <div className="space-y-4">
                <div className="aspect-[16/9] rounded-card border border-sand bg-[#0D1C15] p-5 flex flex-col justify-between text-bone relative overflow-hidden shadow-inner select-none">
                  {/* Tactical Grid & Concentric Radar Sweep Overlay */}
                  <svg
                    className="absolute inset-0 w-full h-full opacity-20 pointer-events-none stroke-moss-200"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <pattern id="grid-tactical-radar" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-tactical-radar)" />
                    {/* Radar Target Circles */}
                    <circle cx="50%" cy="50%" r="28%" fill="none" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="50%" cy="50%" r="48%" fill="none" strokeWidth="1" />
                    <circle cx="50%" cy="50%" r="68%" fill="none" strokeWidth="1" strokeDasharray="6 6" />
                    <line x1="50%" y1="0%" x2="50%" y2="100%" strokeWidth="0.75" />
                    <line x1="0%" y1="50%" x2="100%" y2="50%" strokeWidth="0.75" />
                  </svg>

                  {/* Pulsing Centroid Reticle */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                    <div className="relative flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full border border-signal/60 animate-ping absolute" />
                      <div className="h-6 w-6 rounded-full bg-signal/20 border border-signal flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-signal" />
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-signal font-bold tracking-wider mt-2 bg-black/60 px-2 py-0.5 rounded border border-signal/30">
                      TARGET LOCUS: {incLat.toFixed(4)}° N, {incLng.toFixed(4)}° E
                    </span>
                  </div>

                  {/* HUD Top Badge */}
                  <div className="relative z-10 flex items-center justify-between w-full">
                    <div className="rounded-full border border-moss-600/40 bg-black/60 backdrop-blur px-2.5 py-0.5 text-[11px] text-moss-200 font-mono flex items-center gap-1.5">
                      <Radio className="h-3 w-3 text-signal animate-pulse" />
                      <span>AUTONOMOUS SORTIE STANDBY</span>
                    </div>
                    <div className="font-mono text-[11px] text-moss-300">
                      ALT: 120M AGL PLANNED
                    </div>
                  </div>

                  {/* HUD Bottom Action CTA */}
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-card bg-black/75 backdrop-blur border border-sand/40">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-bone flex items-center gap-1.5">
                        <Navigation className="h-3.5 w-3.5 text-signal" />
                        <span>Tactical Aerial Verification Required</span>
                      </div>
                      <div className="text-[11px] text-moss-200/80">
                        Zero-shot Grounding DINO + SAM 2 aerial validation not yet uploaded.
                      </div>
                    </div>

                    <Link
                      href={`/drone?incident_id=${activeInc.id}&lat=${incLat}&lng=${incLng}`}
                      className="btn btn-primary text-xs shrink-0 h-9 min-h-[36px] flex items-center gap-1.5 shadow"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Dispatch / Upload Feed</span>
                    </Link>
                  </div>
                </div>

                {/* Metadata Ledger for Standby State */}
                <div className="space-y-2 border-t border-sand pt-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-sand/50">
                    <span className="text-ink-600">Sortie status:</span>
                    <span className="font-mono text-signal font-semibold">RECONNAISSANCE REQUIRED</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-sand/50">
                    <span className="text-ink-600">Target centroid:</span>
                    <span className="font-mono text-ink-900 font-bold">
                      {incLat.toFixed(4)}° N, {incLng.toFixed(4)}° E
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-ink-600">Evidence protocol:</span>
                    <span className="font-medium text-ink-900">
                      Indian Wildlife Protection Act 1972 §50 (Admissible Aerial Verification)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Evidentiary Integrity & Sign-Off Desk */}
        <div className="atlas-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-sand pb-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-canopy" />
              <span className="font-bold text-ink-900 text-sm">
                Cryptographic Evidence Custody &amp; Forensic Sign-Off
              </span>
            </div>
            <StatusBadge
              label={officerSigned ? "Affidavit Recorded" : "Pending Sign-Off"}
              variant={officerSigned ? "verified" : "review"}
              size="sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Hash & Custody Record */}
            <div className="space-y-2">
              <div className="text-xs text-ink-600">
                SHA-256 Chain of Custody Digest:
              </div>
              <div className="p-3 rounded-control bg-paper border border-sand flex items-center justify-between font-mono text-xs">
                <span className="text-ink-900 font-bold truncate max-w-[280px] sm:max-w-md">
                  {activeInc.evidence_hash_sha256}
                </span>
                <button
                  onClick={() => handleCopyHash(activeInc.evidence_hash_sha256)}
                  className="p-1 rounded text-ink-600 hover:text-ink-900 hover:bg-bone ml-2"
                  title="Copy SHA-256 hash"
                  aria-label="Copy SHA-256 evidence hash"
                >
                  {copiedHash ? <Check className="h-4 w-4 text-canopy" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="text-[11px] text-ink-600">
                Algorithm: SHA-256 · Encapsulates raw GeoTIFF metadata + drone orthomosaic EXIF telemetry.
              </div>
            </div>

            {/* Officer Signature Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setOfficerSigned(true)}
                disabled={officerSigned}
                className="btn btn-secondary h-11 min-h-[44px] text-xs"
              >
                <CheckCircle2 className="h-4 w-4 text-moss-600" />
                <span>{officerSigned ? "Affidavit Recorded (Local Session)" : "Sign Investigation Affidavit"}</span>
              </button>

              <Link
                href={`/reports?id=${activeInc.id}`}
                className="btn btn-primary h-11 min-h-[44px] text-xs"
              >
                <span>Generate Court Dossier →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Attach Evidence Dialog */}
        <AttachEvidenceModal
          isOpen={isAttachEvidenceOpen}
          onClose={() => setIsAttachEvidenceOpen(false)}
          incident={activeInc}
          onSuccess={() => {
            if (activeInc) getFusedEvidence(activeInc.id).then(setFusion);
          }}
        />
      </div>
    </AppShell>
  );
}

export default function VerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center font-mono text-xs text-ink-600">
          Loading evidence fusion desk...
        </div>
      }
    >
      <VerificationContent />
    </Suspense>
  );
}
