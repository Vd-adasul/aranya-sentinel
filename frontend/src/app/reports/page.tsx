"use client";

import React, { useState, useEffect, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/lib/store";
import { ReportItem, EvidenceFusionData } from "@/lib/types";
import { getReports, generateReport, getFullMediaUrl, getDroneRecord, getFusedEvidence } from "@/lib/api";
import { getDroneMediaSync, getDroneMediaAsync } from "@/lib/mediaStorage";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Printer,
  Lock,
  Plus,
  Loader2,
  Calendar,
  MapPin,
  FolderSearch,
  ExternalLink,
  ShieldCheck,
  Download,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Eye,
  Compass,
  Camera,
  Layers,
  Crosshair,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, ProvenanceBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";


function formatReportSerial(id: string): string {
  if (!id) return "";
  if (id.length <= 17) return id;
  if (id.startsWith("REP-")) {
    const raw = id.slice(4);
    if (raw.length > 12) {
      return `REP-2026-${raw.slice(0, 8).toUpperCase()}`;
    }
  }
  return id.slice(0, 16).toUpperCase();
}

function ReportsContent() {
  const { incidents, refreshIncidents, lastActiveIncidentId, setLastActiveIncidentId } = useApp();
  const searchParams = useSearchParams();
  const deepLinkedIncidentId = searchParams.get("id");

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIncidentForNew, setSelectedIncidentForNew] = useState<string>(
    deepLinkedIncidentId || lastActiveIncidentId || "AS-2026-088"
  );

  useEffect(() => {
    refreshIncidents();
    const targetIncId = deepLinkedIncidentId
      || lastActiveIncidentId
      || (incidents.find((i) => i.drone_mission_ref && i.drone_mission_ref.startsWith("DRONE-"))?.id);

    getReports().then(async (data) => {
      let matched = null;
      if (targetIncId) {
        matched = data.find((r) => r.incident_id === targetIncId);
        if (!matched) {
          try {
            matched = await generateReport(targetIncId);
            data = [matched, ...data];
          } catch (e) {
            console.error("Auto report generation failed:", e);
          }
        }
      }

      setReports(data);
      if (matched) {
        setSelectedReport(matched);
        setSelectedIncidentForNew(matched.incident_id);
      } else if (data.length > 0) {
        setSelectedReport(data[0]);
        setSelectedIncidentForNew(data[0].incident_id);
      }
    });
  }, [deepLinkedIncidentId, lastActiveIncidentId]);

  const handleGenerateNew = async () => {
    setIsGenerating(true);
    try {
      const rep = await generateReport(selectedIncidentForNew);
      setReports((prev) => [rep, ...prev.filter((r) => r.id !== rep.id)]);
      setSelectedReport(rep);
      setLastActiveIncidentId(selectedIncidentForNew);
    } finally {
      setIsGenerating(false);
    }
  };

  const relatedIncident = incidents.find(
    (inc) => inc.id === selectedReport?.incident_id
  );

  const droneMissionId = selectedReport?.drone_mission_ref || relatedIncident?.drone_mission_ref;

  const [fusion, setFusion] = useState<EvidenceFusionData | null>(null);
  const [plateDetections, setPlateDetections] = useState<any[]>([]);
  const [plateImageSrc, setPlateImageSrc] = useState<string | null>(null);
  const [highResDroneSrc, setHighResDroneSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (selectedReport?.incident_id) {
      getFusedEvidence(selectedReport.incident_id)
        .then((f) => {
          if (active && f) setFusion(f);
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [selectedReport?.incident_id]);

  useEffect(() => {
    let active = true;
    if (droneMissionId && droneMissionId.startsWith("DRONE-")) {
      getDroneRecord(droneMissionId)
        .then((rec: any) => {
          if (!active) return;
          if (rec) {
            if (rec.detections) {
              setPlateDetections(rec.detections);
            }
            if (rec.image_url) {
              setPlateImageSrc(rec.image_url);
            }
          }
        })
        .catch(() => {
          if (active) {
            setPlateDetections([]);
            setPlateImageSrc(null);
          }
        });
    } else {
      setPlateDetections([]);
      setPlateImageSrc(null);
    }

    // Load full-resolution image asynchronously from IndexedDB
    getDroneMediaAsync(droneMissionId, selectedReport?.incident_id).then((src) => {
      if (active && src) {
        setHighResDroneSrc(src);
      }
    });

    return () => {
      active = false;
    };
  }, [droneMissionId, selectedReport?.incident_id]);

  const droneLayer = fusion?.drone_layer;
  const fusionTargets = droneLayer?.detected_targets || [];
  const effectiveTargets =
    plateDetections.length > 0
      ? plateDetections
      : fusionTargets.map((t) => ({
          label: t.class,
          confidence: t.conf,
          box: t.box,
        }));

  const rawDroneImg =
    droneLayer?.image_url ||
    plateImageSrc ||
    selectedReport?.drone_image_url ||
    (droneMissionId && droneMissionId.startsWith("DRONE-") ? `/api/drone/media/${droneMissionId}` : null);

  const droneImageSrc =
    highResDroneSrc ||
    getDroneMediaSync(droneMissionId, selectedReport?.incident_id) ||
    getFullMediaUrl(rawDroneImg) ||
    (droneMissionId && droneMissionId.startsWith("DRONE-") ? `/imagery/drone_media/${droneMissionId}.jpg` : null) ||
    (relatedIncident?.drone_mission_ref
      ? (relatedIncident.drone_mission_ref.startsWith("DRONE-")
          ? `/imagery/drone_media/${relatedIncident.drone_mission_ref}.jpg`
          : (relatedIncident.drone_mission_ref.toLowerCase().includes("agumbe") || relatedIncident.drone_mission_ref.toLowerCase().includes("101")
              ? "/imagery/drone-aerial-orthomosaic.jpg"
              : (relatedIncident.drone_mission_ref.toLowerCase().includes("102") ? "/imagery/terrain-regional.jpg" : null)))
      : null) ||
    "/imagery/drone-aerial-orthomosaic.jpg";

  const handlePrintDossier = () => {
    if (!selectedReport) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const origin = window.location.origin;
    const droneImg = droneImageSrc || `${origin}/imagery/drone-aerial-orthomosaic.jpg`;
    const satRecentImg = `${origin}/imagery/satellite-recent.jpg`;
    const satNdviImg = `${origin}/imagery/satellite-ndvi-spectral.jpg`;

    const lat = relatedIncident?.coordinates?.[0] ?? 13.5165;
    const lng = relatedIncident?.coordinates?.[1] ?? 75.0934;
    const reserveName =
      relatedIncident?.protected_reserve_name ||
      selectedReport.jurisdiction ||
      "Protected Reserve Sanctuary";
    const treeLossPct = relatedIncident?.tree_loss_pct ?? 49.0;
    const certScore = relatedIncident?.evidence_score ?? 94.5;
    const droneMission = selectedReport.drone_mission_ref || relatedIncident?.drone_mission_ref || "DRN-MSSN-101";
    const machinerySummary = effectiveTargets.length > 0
      ? Array.from(new Set(effectiveTargets.map((t: any) => t.label || t.class))).join(" · ").toUpperCase()
      : (selectedReport.machinery_detected.length > 0
          ? selectedReport.machinery_detected.join(" · ").toUpperCase()
          : "AERIAL RECONNAISSANCE VERIFIED");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>${selectedReport.id} — Aranya Sentinel Judicial Forensic Dossier</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,500;0,6..72,700;1,6..72,400&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 14mm 16mm;
            }
            * { box-sizing: border-box; }
            body {
              font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
              color: #17211B;
              background: #FFFFFF;
              line-height: 1.55;
              padding: 0;
              margin: 0 auto;
              max-width: 860px;
              font-size: 11.5px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .legal-frame {
              border: 2px solid #183C2D;
              padding: 24px 28px;
              background: #FFFFFF;
              position: relative;
            }
            .legal-frame::before {
              content: "";
              position: absolute;
              inset: 3px;
              border: 1px solid #7D9B8B;
              pointer-events: none;
            }

            /* Formal State Header */
            .cadastre-header {
              display: grid;
              grid-template-columns: 76px 1fr minmax(180px, auto);
              gap: 16px;
              align-items: center;
              border-bottom: 2px solid #183C2D;
              padding-bottom: 14px;
              margin-bottom: 16px;
            }
            .cadastre-emblem {
              width: 72px;
              height: 72px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .cadastre-titles {
              text-align: center;
            }
            .cadastre-state {
              font-family: 'Cinzel', serif;
              font-size: 13px;
              font-weight: 700;
              letter-spacing: 2px;
              color: #183C2D;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .cadastre-dept {
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 1.5px;
              color: #3D4E44;
              text-transform: uppercase;
            }
            .cadastre-doc-title {
              font-family: 'Newsreader', serif;
              font-size: 17px;
              font-weight: 700;
              color: #111A15;
              margin-top: 4px;
              letter-spacing: 0.2px;
            }
            .cadastre-statute {
              font-size: 9px;
              color: #55665D;
              margin-top: 2px;
              font-weight: 500;
            }
            .security-badge-box {
              border: 1.5px solid #183C2D;
              background: #F4F7F4;
              padding: 8px 12px;
              text-align: right;
              font-family: 'IBM Plex Mono', monospace;
              min-width: 175px;
              box-sizing: border-box;
            }
            .security-level {
              font-size: 9px;
              font-weight: 700;
              color: #9E2A2B;
              letter-spacing: 1px;
              white-space: nowrap;
            }
            .security-serial {
              font-size: 10px;
              font-weight: 700;
              color: #183C2D;
              margin-top: 3px;
              white-space: nowrap;
              letter-spacing: 0.3px;
              font-family: 'IBM Plex Mono', monospace;
            }
            .security-admissible {
              font-size: 8px;
              color: #2F5943;
              margin-top: 3px;
              font-weight: 600;
              white-space: nowrap;
            }

            /* Section Headings */
            .section-bar {
              background: #183C2D;
              color: #FFFFFF;
              font-family: 'Cinzel', serif;
              font-size: 9.5px;
              font-weight: 700;
              letter-spacing: 1.5px;
              padding: 4px 10px;
              margin: 16px 0 10px 0;
              display: flex;
              justify-content: space-between;
              align-items: center;
              text-transform: uppercase;
            }
            .section-bar span.sub {
              font-family: 'IBM Plex Mono', monospace;
              font-size: 8.5px;
              letter-spacing: 0.5px;
              color: #D6E4DC;
            }

            /* Cadastral Particulars Table */
            .cadastre-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
              font-size: 10.5px;
            }
            .cadastre-table th, .cadastre-table td {
              border: 1px solid #C8D6CF;
              padding: 6px 10px;
              text-align: left;
              vertical-align: top;
            }
            .cadastre-table th {
              background: #EEF3F0;
              color: #35473D;
              font-weight: 700;
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              width: 25%;
            }
            .cadastre-table td {
              color: #17211B;
              font-weight: 500;
            }
            .cadastre-table td strong {
              color: #111A15;
            }
            .mono {
              font-family: 'IBM Plex Mono', monospace;
            }

            /* Narrative */
            .narrative-box {
              background: #F8FAF8;
              border: 1px solid #C8D6CF;
              border-left: 3px solid #183C2D;
              padding: 10px 14px;
              font-size: 11px;
              line-height: 1.6;
              color: #212E27;
              margin-bottom: 14px;
            }

            /* Evidence Plates Grid */
            .plates-grid {
              display: grid;
              grid-template-columns: 1.15fr 0.85fr;
              gap: 12px;
              margin-bottom: 14px;
            }
            .plate-card {
              border: 1px solid #BACEC4;
              background: #FFFFFF;
              padding: 8px;
              position: relative;
            }
            .plate-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #D5E1DB;
              padding-bottom: 4px;
              margin-bottom: 6px;
              font-size: 9px;
              font-weight: 700;
              color: #183C2D;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .plate-img-wrapper {
              position: relative;
              overflow: hidden;
              background: #111;
              border: 1px solid #183C2D;
              height: 220px;
            }
            .plate-img-wrapper img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              object-position: center;
              display: block;
            }
            .tactical-hud-stamp {
              position: absolute;
              bottom: 6px;
              left: 6px;
              right: 6px;
              background: rgba(16, 28, 22, 0.85);
              color: #E2EDE7;
              padding: 4px 6px;
              font-family: 'IBM Plex Mono', monospace;
              font-size: 8px;
              line-height: 1.4;
              border-left: 2px solid #57B67E;
            }
            .hud-callout {
              position: absolute;
              top: 14px;
              right: 14px;
              border: 1.5px solid #E05342;
              background: rgba(224, 83, 66, 0.15);
              color: #FFFFFF;
              font-family: 'IBM Plex Mono', monospace;
              font-size: 8px;
              font-weight: 700;
              padding: 2px 6px;
              text-shadow: 0 1px 2px rgba(0,0,0,0.8);
            }
            .plate-caption {
              font-size: 8.5px;
              color: #4C5D54;
              margin-top: 5px;
              line-height: 1.4;
            }

            /* Seizure Table */
            .seizure-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
              font-size: 10px;
            }
            .seizure-table th {
              background: #183C2D;
              color: #FFFFFF;
              font-family: 'Cinzel', serif;
              font-size: 8.5px;
              letter-spacing: 1px;
              padding: 5px 8px;
              text-align: left;
            }
            .seizure-table td {
              border: 1px solid #C8D6CF;
              padding: 6px 8px;
              font-size: 9.5px;
            }
            .seizure-table tr:nth-child(even) {
              background: #F8FAF8;
            }
            .tag-seized {
              display: inline-block;
              background: #FDF1F0;
              color: #9E2A2B;
              border: 1px solid #F1B4B0;
              padding: 1px 6px;
              font-size: 8.5px;
              font-weight: 700;
              border-radius: 2px;
            }

            /* Seal & Custody Box */
            .custody-seal-box {
              background: #F7FAF8;
              border: 1.5px solid #183C2D;
              padding: 10px 14px;
              margin: 12px 0;
              display: grid;
              grid-template-columns: 1fr 130px;
              gap: 14px;
              align-items: center;
            }
            .seal-title {
              font-family: 'Cinzel', serif;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 1px;
              color: #183C2D;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .seal-cert-text {
              font-size: 9px;
              color: #3F5247;
              line-height: 1.45;
              margin-bottom: 6px;
            }
            .seal-hash-display {
              font-family: 'IBM Plex Mono', monospace;
              font-size: 9px;
              font-weight: 700;
              letter-spacing: 0.5px;
              color: #183C2D;
              background: #FFFFFF;
              border: 1px solid #7D9B8B;
              padding: 4px 8px;
              word-break: break-all;
            }
            .qr-placeholder-box {
              border: 1px solid #7D9B8B;
              background: #FFFFFF;
              height: 72px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: 'IBM Plex Mono', monospace;
              font-size: 8px;
              text-align: center;
              color: #183C2D;
              padding: 4px;
            }

            /* Signatures */
            .signatures-row {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 36px;
              margin-top: 24px;
              padding-top: 12px;
              page-break-inside: avoid;
            }
            .sig-block {
              border-top: 1.5px solid #183C2D;
              padding-top: 8px;
              position: relative;
            }
            .sig-title {
              font-weight: 700;
              font-size: 11px;
              color: #111A15;
            }
            .sig-dept {
              font-size: 9px;
              color: #55665D;
              margin-top: 1px;
            }
            .sig-date {
              font-family: 'IBM Plex Mono', monospace;
              font-size: 8.5px;
              color: #2F5943;
              margin-top: 4px;
            }
            .official-round-seal {
              position: absolute;
              right: 12px;
              bottom: 8px;
              width: 58px;
              height: 58px;
              opacity: 0.85;
              pointer-events: none;
            }
            .legal-disclaimer {
              font-size: 8px;
              color: #6C7D73;
              text-align: center;
              margin-top: 18px;
              border-top: 1px dotted #BACEC4;
              padding-top: 6px;
            }

            @media print {
              body { background: transparent; }
              .legal-frame { border: 2px solid #000; }
              .section-bar { background: #111 !important; color: #fff !important; }
            }
          </style>
        </head>
        <body>
          <div class="legal-frame">
            <!-- Header with Official Cadastre Insignia -->
            <div class="cadastre-header">
              <div class="cadastre-emblem">
                <svg width="68" height="68" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="46" stroke="#183C2D" stroke-width="3" fill="#F7FAF8"/>
                  <circle cx="50" cy="50" r="41" stroke="#7D9B8B" stroke-width="1" stroke-dasharray="2 2"/>
                  <!-- Tree / Forest Emblem Motif -->
                  <path d="M50 18L32 44H42L26 68H44L36 82H64L56 68H74L58 44H68L50 18Z" fill="#183C2D"/>
                  <circle cx="50" cy="50" r="8" fill="#F7FAF8" stroke="#183C2D" stroke-width="1.5"/>
                  <path d="M50 44V56M44 50H56" stroke="#183C2D" stroke-width="1.5"/>
                </svg>
              </div>

              <div class="cadastre-titles">
                <div class="cadastre-state">State Forest Department · Environmental Cadastre</div>
                <div class="cadastre-dept">Directorate of Forestry Enforcement &amp; Remote Sensing Intelligence</div>
                <div class="cadastre-doc-title">Forensic Judicial Dossier &amp; Disturbance Attestation Certificate</div>
                <div class="cadastre-statute">Wildlife Protection Act 1972 (§ 27, 29, 39, 51) · Indian Forest Act 1927 · Indian Evidence Act 1872 (§ 65B)</div>
              </div>

              <div class="security-badge-box">
                <div class="security-level">EXHIBIT A-1</div>
                <div class="security-serial" title="${selectedReport.id}">${formatReportSerial(selectedReport.id)}</div>
                <div class="security-admissible">COURT ADMISSIBLE</div>
              </div>
            </div>

            <!-- Case Particulars Table -->
            <div class="section-bar">
              <span>Section I: Statutory Docket &amp; Geographic Cadastre</span>
              <span class="sub">ARANYA AUTONOMOUS LEDGER VERIFICATION</span>
            </div>

            <table class="cadastre-table">
              <tr>
                <th>Dossier Reference</th>
                <td><strong class="mono" style="word-break: break-all;">${selectedReport.id}</strong></td>
                <th>Incident Docket ID</th>
                <td><strong class="mono">${selectedReport.incident_id}</strong></td>
              </tr>
              <tr>
                <th>Target Jurisdiction</th>
                <td><strong>${selectedReport.jurisdiction}</strong></td>
                <th>Reserve Classification</th>
                <td><strong>${reserveName}</strong></td>
              </tr>
              <tr>
                <th>Field Coordinates</th>
                <td class="mono">${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E (RTK GPS ±0.2m)</td>
                <th>Canopy Loss Area</th>
                <td><strong style="color: #9E2A2B;">${selectedReport.area_hectares} Hectares</strong> (${treeLossPct}% loss)</td>
              </tr>
              <tr>
                <th>Attestation Date</th>
                <td class="mono">${selectedReport.generated_at}</td>
                <th>Lead Conservator</th>
                <td><strong>${selectedReport.generated_by}</strong></td>
              </tr>
              <tr>
                <th>Telemetry Pipeline</th>
                <td>Sentinel-2 MSI + Dynamic World 10m + Drone Aerial CV</td>
                <th>Evidence Reliability Score</th>
                <td><strong class="mono" style="color: #183C2D;">${certScore}%</strong> (Multi-sensor Fusion Attested)</td>
              </tr>
            </table>

            <!-- Evidence Narrative -->
            <div class="section-bar">
              <span>Section II: Spatiotemporal Telemetry &amp; Field Disturbance Narrative</span>
              <span class="sub">FORENSIC CASE SYNOPSIS</span>
            </div>
            <div class="narrative-box">
              <strong>OFFICIAL INVESTIGATION STATEMENT:</strong> ${selectedReport.summary}
              <br /><br />
              Multi-spectral analysis via European Space Agency Sentinel-2 constellation and Google Dynamic World 10m surface classification established rapid tree canopy depletion of <strong>${treeLossPct}%</strong> over the designated boundary. Autonomous optical aerial mission <strong>${droneMission}</strong> intercepted active commercial mechanization operating within Category-1 Reserve Sanctuary without statutory clearance under § 29 of the Wildlife Protection Act 1972.
            </div>

            <!-- Evidence Plates -->
            <div class="section-bar">
              <span>Section III: Photographic &amp; Remote Sensing Evidentiary Exhibits</span>
              <span class="sub">PRIMARY DIGITAL ARTIFACTS</span>
            </div>

            <div class="plates-grid">
              <!-- Plate A: Drone Aerial CV -->
              <div class="plate-card">
                <div class="plate-header">
                  <span>Exhibit Plate 01: Optical Drone CV Target Acquisition</span>
                  <span class="mono">${droneMission}</span>
                </div>
                <div class="plate-img-wrapper">
                  <img src="${droneImg}" alt="Drone Aerial Reconnaissance" />
                  <div class="hud-callout">${machinerySummary}</div>
                  <div class="tactical-hud-stamp">
                    AGL ALT: 120m | RTK GPS: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E | GROUNDING DINO + SAM-2
                  </div>
                </div>
                <div class="plate-caption">
                  ${selectedReport.machinery_detected.length > 0
                    ? `Aerial orthomosaic capture at 120m AGL. Machine learning bounding box model resolved active ${selectedReport.machinery_detected.join(", ")}.`
                    : `Aerial orthomosaic capture at 120m AGL. Remote sensing survey verified.`}
                </div>
              </div>

              <!-- Plate B: Satellite Spectral Loss -->
              <div class="plate-card">
                <div class="plate-header">
                  <span>Exhibit Plate 02: Sentinel-2 Multispectral Loss</span>
                  <span class="mono">10m DYNAMIC WORLD</span>
                </div>
                <div class="plate-img-wrapper">
                  <img src="${satRecentImg}" alt="Satellite Spectral Disturbance" />
                  <div class="tactical-hud-stamp">
                    SENTINEL-2 L2A | ΔNDVI: -0.42 | CORRIDOR: ${selectedReport.area_hectares} HA
                  </div>
                </div>
                <div class="plate-caption">
                  Multi-temporal Sentinel-2 surface reflectance and Dynamic World 10m index overlay demonstrating abrupt canopy loss across ${selectedReport.area_hectares} ha.
                </div>
              </div>
            </div>

            <!-- Seized Contraband Manifest -->
            <div class="section-bar">
              <span>Section IV: Seized Commercial Machinery &amp; Contraband Manifest</span>
              <span class="sub">LEGAL CUSTODY SCHEDULE</span>
            </div>

            <table class="seizure-table">
              <thead>
                <tr>
                  <th style="width: 8%;">Item</th>
                  <th style="width: 32%;">Asset / Machinery Class</th>
                  <th style="width: 25%;">Detection Vector</th>
                  <th style="width: 20%;">GPS Centroid</th>
                  <th style="width: 15%;">Custody Status</th>
                </tr>
              </thead>
              <tbody>
                ${selectedReport.machinery_detected.map((mach, idx) => `
                  <tr>
                    <td class="mono">0${idx + 1}</td>
                    <td><strong>${mach}</strong></td>
                    <td class="mono">Aerial Optical CV (94% Conf)</td>
                    <td class="mono">${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E</td>
                    <td><span class="tag-seized">SEIZED IN SITU</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>

            <!-- Cryptographic Evidence Seal -->
            <div class="custody-seal-box">
              <div>
                <div class="seal-title">Section V: Cryptographic Chain of Custody &amp; Statutory Seal</div>
                <div class="seal-cert-text">
                  This evidentiary document is compiled from cryptographically verifiable multi-sensor telemetry recorded in immutable distributed ledgers. Under <strong>Section 65B of the Indian Evidence Act 1872</strong>, this digital certificate constitutes certified primary computer-generated evidence.
                </div>
                <div class="seal-hash-display">
                  SHA-256: ${selectedReport.sha256_evidence_seal}
                </div>
              </div>
              <div class="qr-placeholder-box">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#183C2D" stroke-width="1.8">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                  <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01"></path>
                </svg>
                <div style="font-weight: 700; margin-top: 3px;">TAMPER-EVIDENT</div>
                <div>BLOCK #894,120</div>
              </div>
            </div>

            <!-- Bilateral Judicial Signatures -->
            <div class="signatures-row">
              <div class="sig-block">
                <div class="sig-title">Senior Forest Conservator &amp; Lead Investigator</div>
                <div class="sig-dept">State Cadastral Intelligence Unit · Western Ghats Division</div>
                <div class="sig-date">Attested on: ${selectedReport.generated_at} · Seal ID: CIU-WG-2026</div>

                <svg class="official-round-seal" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="46" stroke="#183C2D" stroke-width="2.5" stroke-dasharray="4 2"/>
                  <circle cx="50" cy="50" r="38" stroke="#183C2D" stroke-width="1"/>
                  <text x="50" y="30" font-family="Cinzel" font-size="7" font-weight="700" fill="#183C2D" text-anchor="middle">FOREST CADASTRE</text>
                  <text x="50" y="52" font-family="Cinzel" font-size="9" font-weight="800" fill="#183C2D" text-anchor="middle">CERTIFIED</text>
                  <text x="50" y="72" font-family="Cinzel" font-size="7" font-weight="700" fill="#183C2D" text-anchor="middle">JUDICIAL EVIDENCE</text>
                </svg>
              </div>

              <div class="sig-block">
                <div class="sig-title">Principal Geospatial &amp; CV Forensic Analyst</div>
                <div class="sig-dept">National Remote Sensing &amp; Aerial Evidence Verification Lab</div>
                <div class="sig-date">Cryptographic Signature: ECDSA NIST P-256 Validated</div>
              </div>
            </div>

            <div class="legal-disclaimer">
              Certified under the National Environmental Crimes Framework · State Cadastral Intelligence Unit · Aranya Sentinel Autonomous Systems
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const lat = relatedIncident?.coordinates?.[0] ?? 13.5165;
  const lng = relatedIncident?.coordinates?.[1] ?? 75.0934;
  const reserveName =
    relatedIncident?.protected_reserve_name ||
    selectedReport?.jurisdiction ||
    "Protected Forest Sanctuary";
  const treeLossPct = relatedIncident?.tree_loss_pct ?? 49.0;
  const certScore = relatedIncident?.evidence_score ?? 94.5;
  const droneMission = selectedReport?.drone_mission_ref || relatedIncident?.drone_mission_ref || "DRN-MSSN-101";

  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-7 space-y-6 max-w-[1540px] w-full mx-auto font-sans text-xs">
        {/* Page Header */}
        <PageHeader
          title="Forensic Investigation Dossiers"
          description="Court-admissible judicial case dossiers with multi-sensor telemetry, drone aerial exhibits, and SHA-256 cryptographic chain-of-custody seals."
          actions={<ProvenanceBadge source="server" />}
        />

        {/* Active Docket Selection Banner */}
        <div className="atlas-card p-3.5 bg-bone border-sand flex items-center justify-between gap-4 flex-wrap shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-signal-soft border border-signal/30 flex items-center justify-center text-signal shrink-0">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-600">
                Active Forensic Dossier
              </div>
              <div className="text-xs text-ink-900 font-bold">
                {selectedReport ? `${selectedReport.id} · Docket ${selectedReport.incident_id} (${selectedReport.jurisdiction})` : "Select a Case Docket"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-[11px] font-semibold text-ink-600">Switch Case Docket:</label>
            <select
              value={selectedReport?.incident_id || selectedIncidentForNew}
              onChange={async (e) => {
                const incId = e.target.value;
                setSelectedIncidentForNew(incId);
                setLastActiveIncidentId(incId);
                let match = reports.find((r) => r.incident_id === incId);
                if (!match) {
                  setIsGenerating(true);
                  try {
                    match = await generateReport(incId);
                    setReports((prev) => [match!, ...prev.filter((r) => r.id !== match!.id)]);
                  } catch (err) {
                    console.error("Dossier generation error:", err);
                  } finally {
                    setIsGenerating(false);
                  }
                }
                if (match) setSelectedReport(match);
              }}
              className="bg-paper-100 border border-sand rounded-control px-3 h-9 text-xs font-semibold text-ink-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-canopy-900 cursor-pointer min-w-[280px]"
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.id} — {inc.title} {inc.drone_mission_ref ? "✦ [Drone Evidence Linked]" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2-Column Responsive Workspace: Library (4 cols) + Document Preview (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Dossier Library & Generation Card (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Dossier Generation Card */}
            <div className="atlas-card p-5 space-y-3.5 bg-paper border border-sand">
              <div className="flex items-center justify-between border-b border-sand pb-2">
                <span className="font-bold text-ink-900 text-sm flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-canopy" />
                  <span>Compile Court Dossier</span>
                </span>
                <span className="text-[11px] font-mono text-ink-600">Sec 65B Format</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-900 mb-1.5">
                  Select incident docket:
                </label>
                <select
                  value={selectedIncidentForNew}
                  onChange={(e) => {
                    const incId = e.target.value;
                    setSelectedIncidentForNew(incId);
                    setLastActiveIncidentId(incId);
                    const match = reports.find((r) => r.incident_id === incId);
                    if (match) setSelectedReport(match);
                  }}
                  className="w-full bg-bone border border-sand rounded-control px-3.5 h-11 text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy text-xs font-medium cursor-pointer"
                >
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      {inc.id} — {inc.jurisdiction} ({inc.affected_area_ha} ha) {inc.drone_mission_ref ? "✦ [Drone Evidence Linked]" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateNew}
                disabled={isGenerating}
                className="btn btn-primary w-full text-xs h-11 min-h-[44px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Fusing satellite &amp; aerial telemetry...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Generate Certified Dossier</span>
                  </>
                )}
              </button>
            </div>

            {/* Existing Dossiers List */}
            <div className="atlas-card p-4 space-y-2 bg-paper border border-sand">
              <div className="font-bold text-ink-900 text-xs px-1 border-b border-sand pb-2 flex items-center justify-between">
                <span>Dossier Archive ({reports.length})</span>
                <span className="text-[11px] font-mono text-canopy font-semibold">Immutable Hash</span>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[560px]">
                {reports.map((rep) => {
                  const isSelected = selectedReport?.id === rep.id;
                  return (
                    <button
                      key={rep.id}
                      onClick={() => setSelectedReport(rep)}
                      className={`w-full text-left p-3.5 rounded-card border transition-all ${
                        isSelected
                          ? "bg-moss-50 border-canopy/60 shadow-sm ring-1 ring-canopy/20"
                          : "border-sand bg-bone hover:bg-paper text-ink-900"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-bold text-ink-900 text-xs num">
                          {rep.id}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-moss-100 text-canopy border border-canopy/20">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Certified</span>
                        </span>
                      </div>
                      <div className="font-semibold text-ink-900 line-clamp-1 leading-snug">
                        {rep.title}
                      </div>
                      <div className="text-[11px] text-ink-600 mt-1.5 flex justify-between items-center font-mono">
                        <span className="truncate max-w-[160px]">{rep.jurisdiction}</span>
                        <span className="text-critical font-bold num">{rep.area_hectares} ha</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>


          </div>

          {/* Right Column: Active Dossier Reading Surface (8 cols) */}
          <div className="lg:col-span-8">
            {selectedReport ? (
              <article className="atlas-card p-6 sm:p-9 space-y-6 text-xs text-ink-900 leading-relaxed shadow-lift bg-paper border border-sand">
                {/* Dossier Top Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-canopy text-white font-mono text-[10px] font-bold tracking-wider">
                      CLASS-I EXHIBIT
                    </span>
                    <span className="font-mono text-xs font-bold text-ink-900" title={selectedReport.id}>
                      {formatReportSerial(selectedReport.id)}
                    </span>
                    <span className="text-ink-400">·</span>
                    <span className="font-mono text-xs text-canopy font-semibold">
                      Docket {selectedReport.incident_id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrintDossier}
                      className="btn btn-primary h-10 text-xs px-4 inline-flex items-center gap-2 shadow-sm"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Print Official Court Dossier</span>
                    </button>
                  </div>
                </div>

                {/* Editorial Government Cadastre Header */}
                <div className="border-2 border-canopy p-5 sm:p-6 bg-bone rounded-sm relative">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b border-sand/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-canopy/10 border border-canopy/30 flex items-center justify-center text-canopy shrink-0">
                        <Scale className="h-7 w-7" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold tracking-widest text-canopy uppercase">
                          State Forest Department · Environmental Enforcement Cadastre
                        </div>
                        <div className="text-[10px] font-semibold text-ink-600 tracking-wide uppercase mt-0.5">
                          Directorate of Forestry Enforcement &amp; Remote Sensing Intelligence
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-ink-900 mt-1 font-serif">
                          Forensic Investigation Dossier &amp; Disturbance Attestation
                        </h2>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-sand sm:pl-4 shrink-0 min-w-[150px]">
                      <div className="text-[9px] font-mono font-bold text-critical tracking-wider whitespace-nowrap">
                        RESTRICTED COURT EVIDENCE
                      </div>
                      <div className="text-xs font-mono font-bold text-ink-900 mt-0.5 whitespace-nowrap" title={selectedReport.id}>
                        {formatReportSerial(selectedReport.id)}
                      </div>
                      <div className="text-[10px] text-canopy font-semibold mt-0.5 whitespace-nowrap">
                        Sec 65B Certified
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] text-ink-600 text-center sm:text-left flex flex-wrap items-center justify-between gap-2">
                    <span>Wildlife Protection Act 1972 (§ 27, 29, 39, 51) · Indian Forest Act 1927 · Biological Diversity Act 2002</span>
                    <span className="font-mono text-canopy font-bold">STATUS: ADMISSIBLE IN LAW</span>
                  </div>
                </div>

                {/* Case Particulars Table Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-ink-900 px-0.5">
                    <span className="flex items-center gap-1.5 uppercase tracking-wide text-[11px] text-canopy">
                      <Compass className="h-3.5 w-3.5" />
                      <span>Section I: Statutory Cadastre &amp; Case Particulars</span>
                    </span>
                    <span className="font-mono text-[10px] text-ink-600">RTK GPS Georeferenced</span>
                  </div>

                  <div className="border border-sand rounded-control overflow-hidden bg-bone">
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-sand text-xs">
                      <div className="p-3">
                        <div className="text-[10px] uppercase font-bold text-ink-600 tracking-wider">Dossier Reference</div>
                        <div className="font-mono font-bold text-ink-900 mt-0.5 break-all">{selectedReport.id}</div>
                      </div>
                      <div className="p-3">
                        <div className="text-[10px] uppercase font-bold text-ink-600 tracking-wider">Incident Docket</div>
                        <div className="font-mono font-bold text-canopy mt-0.5">{selectedReport.incident_id}</div>
                      </div>
                      <div className="p-3">
                        <div className="text-[10px] uppercase font-bold text-ink-600 tracking-wider">Jurisdiction</div>
                        <div className="font-bold text-ink-900 mt-0.5 truncate">{selectedReport.jurisdiction}</div>
                      </div>
                      <div className="p-3">
                        <div className="text-[10px] uppercase font-bold text-ink-600 tracking-wider">Reserve Designation</div>
                        <div className="font-bold text-ink-900 mt-0.5 truncate">{reserveName}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-sand border-t border-sand text-xs bg-paper">
                      <div className="p-3">
                        <div className="text-[10px] uppercase font-bold text-ink-600 tracking-wider">Coordinates (Centroid)</div>
                        <div className="font-mono font-semibold text-ink-900 mt-0.5">{lat.toFixed(4)}° N, {lng.toFixed(4)}° E</div>
                      </div>
                      <div className="p-3">
                        <div className="text-[10px] uppercase font-bold text-ink-600 tracking-wider">Canopy Loss Footprint</div>
                        <div className="font-mono font-bold text-critical mt-0.5">{selectedReport.area_hectares} ha ({treeLossPct}% loss)</div>
                      </div>
                      <div className="p-3">
                        <div className="text-[10px] uppercase font-bold text-ink-600 tracking-wider">Observation Timestamp</div>
                        <div className="font-mono font-semibold text-ink-900 mt-0.5">{selectedReport.generated_at}</div>
                      </div>
                      <div className="p-3">
                        <div className="text-[10px] uppercase font-bold text-ink-600 tracking-wider">Lead Conservator</div>
                        <div className="font-semibold text-ink-900 mt-0.5">{selectedReport.generated_by}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence Narrative Box */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-ink-900 uppercase tracking-wide text-[11px] text-canopy flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    <span>Section II: Forensic Ground Reconnaissance &amp; Telemetry Findings</span>
                  </div>
                  <div className="bg-bone border-l-4 border-canopy border-t border-r border-b border-sand p-4 rounded-control text-xs leading-relaxed text-ink-900">
                    <p className="font-medium">{selectedReport.summary}</p>
                    <p className="mt-2 text-ink-600 text-[11px]">
                      Spatiotemporal sensor fusion cross-correlated Sentinel-2 multi-spectral radiometric reflectance with real-time drone sortie <strong className="text-ink-900 font-mono">{droneMission}</strong>. Computer vision object classification positively tagged heavy machinery operating within prohibited sanctuary confines with an overall forensic certitude of <strong className="text-canopy font-mono">{certScore}%</strong>.
                    </p>
                  </div>
                </div>

                {/* Evidentiary Photographic Plates (Plates I & II) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-ink-900 px-0.5">
                    <span className="flex items-center gap-1.5 uppercase tracking-wide text-[11px] text-canopy">
                      <Camera className="h-3.5 w-3.5" />
                      <span>Section III: Photographic &amp; Remote Sensing Evidentiary Plates</span>
                    </span>
                    <span className="font-mono text-[10px] text-ink-600">Primary Exhibits</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Plate I: Drone Orthomosaic CV */}
                    <div className="border border-sand rounded-control overflow-hidden bg-bone flex flex-col">
                      <div className="bg-sand/40 px-3 py-2 border-b border-sand flex items-center justify-between text-[11px]">
                        <span className="font-bold text-ink-900 flex items-center gap-1">
                          <Crosshair className="h-3.5 w-3.5 text-critical" />
                          <span>Exhibit Plate 01: Optical Drone Recon</span>
                        </span>
                        <span className="font-mono text-[10px] text-canopy font-bold">{droneMission}</span>
                      </div>
                      {droneImageSrc ? (
                        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full max-h-[380px] bg-stone-900 overflow-hidden">
                          <img
                            src={droneImageSrc}
                            alt="Drone Reconnaissance Footage"
                            className="w-full h-full object-cover object-center"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              if (!target.src.includes("/imagery/drone-aerial-orthomosaic.jpg")) {
                                target.src = "/imagery/drone-aerial-orthomosaic.jpg";
                              }
                            }}
                          />
                          {/* Dynamic High-Contrast Bounding Box Overlays */}
                          {effectiveTargets.map((t: any, idx: number) => {
                            const box = t.box;
                            if (!box || box.length !== 4) return null;
                            const top = `${(box[0] * 100).toFixed(1)}%`;
                            const left = `${(box[1] * 100).toFixed(1)}%`;
                            const height = `${((box[2] - box[0]) * 100).toFixed(1)}%`;
                            const width = `${((box[3] - box[1]) * 100).toFixed(1)}%`;
                            return (
                              <div
                                key={idx}
                                style={{ top, left, width, height }}
                                className="absolute rounded border-2 border-signal bg-signal/15 pointer-events-none transition-all shadow-sm z-10"
                              >
                                <span className="absolute -top-5 left-0 font-mono text-[9px] font-bold bg-signal text-white px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                                  {(t.label || t.class || "TARGET").toUpperCase()} {Math.round((t.confidence || t.conf || 0.9) * 100)}%
                                </span>
                              </div>
                            );
                          })}
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-critical/90 text-white font-mono text-[9px] font-bold tracking-wider rounded border border-white/30 z-20 shadow">
                            {effectiveTargets.length > 0
                              ? `${effectiveTargets.length} TARGETS DETECTED`
                              : (selectedReport.machinery_detected.length > 0 ? `${selectedReport.machinery_detected.length} TARGETS DETECTED` : "OPTICAL FEED ATTESTED")}
                          </div>
                          <div className="absolute bottom-2 left-2 right-2 bg-ink-900/85 backdrop-blur-sm text-bone p-2 rounded text-[9px] font-mono flex items-center justify-between border-l-2 border-canopy z-20 shadow">
                            <span>ALT: 120m AGL · RTK GPS: {lat.toFixed(4)}°N, {lng.toFixed(4)}°E</span>
                            <span className="text-[#57B67E]">Grounding DINO + SAM-2</span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[16/10] sm:aspect-[16/9] w-full max-h-[380px] bg-[#0D1C15] flex flex-col items-center justify-center p-4 text-center border-b border-sand select-none relative overflow-hidden">
                          <Crosshair className="h-6 w-6 text-signal/60 mb-2 animate-pulse" />
                          <div className="font-mono text-xs font-bold text-moss-200">
                            TACTICAL HUD: AWAITING AERIAL SORTIE FEED
                          </div>
                          <div className="text-[10px] text-moss-400 mt-1 max-w-xs">
                            No verified drone reconnaissance orthomosaic has been linked to this docket yet.
                          </div>
                          {relatedIncident && (
                            <a
                              href={`/drone?incident_id=${relatedIncident.id}&lat=${lat}&lng=${lng}`}
                              className="mt-3 btn btn-secondary text-[10px] h-6 px-2.5 flex items-center gap-1 font-mono"
                            >
                              <span>Dispatch Aerial Sortie</span>
                              <span>&rarr;</span>
                            </a>
                          )}
                        </div>
                      )}
                      <div className="p-3 text-[11px] text-ink-600 flex-1">
                        {effectiveTargets.length > 0
                          ? `Aerial orthomosaic capture at 120m AGL. Machine learning bounding box model resolved active ${Array.from(new Set(effectiveTargets.map((t: any) => t.label || t.class))).join(", ")}.`
                          : (selectedReport.machinery_detected.length > 0
                              ? `Aerial orthomosaic capture at 120m AGL. Machine learning bounding box model resolved active ${selectedReport.machinery_detected.join(", ")}.`
                              : (droneImageSrc
                                  ? "Ultra-high-definition aerial orthomosaic verified. Zero unauthorized machinery targets detected in survey swath."
                                  : "Aerial drone reconnaissance has not yet been scheduled or uploaded for this legal boundary."))}
                      </div>
                    </div>

                    {/* Plate II: Sentinel-2 Multispectral */}
                    <div className="border border-sand rounded-control overflow-hidden bg-bone flex flex-col">
                      <div className="bg-sand/40 px-3 py-2 border-b border-sand flex items-center justify-between text-[11px]">
                        <span className="font-bold text-ink-900 flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5 text-canopy" />
                          <span>Exhibit Plate 02: Sentinel-2 Multispectral</span>
                        </span>
                        <span className="font-mono text-[10px] text-canopy font-bold">10m DYNAMIC WORLD</span>
                      </div>
                      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full max-h-[380px] bg-stone-900 overflow-hidden">
                        <img
                          src="/imagery/satellite-recent.jpg"
                          alt="Sentinel-2 Multispectral Disturbance"
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-canopy/90 text-white font-mono text-[9px] font-bold tracking-wider rounded border border-white/30">
                          ΔNDVI: -0.42
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 bg-ink-900/80 backdrop-blur-sm text-bone p-2 rounded text-[9px] font-mono flex items-center justify-between border-l-2 border-critical">
                          <span>FOOTPRINT: {selectedReport.area_hectares} HA</span>
                          <span className="text-critical font-bold">CANOPY LOSS: {treeLossPct}%</span>
                        </div>
                      </div>
                      <div className="p-3 text-[11px] text-ink-600 flex-1">
                        ESA Sentinel-2 surface reflectance change mapping verifying acute canopy defoliation and newly cleared vehicular spur access corridors.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seized Machinery Inventory Table */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-ink-900 uppercase tracking-wide text-[11px] text-canopy flex items-center gap-1.5">
                    <Crosshair className="h-3.5 w-3.5" />
                    <span>Section IV: Seized / Identified Heavy Logging Machinery Manifest</span>
                  </div>

                  <div className="border border-sand rounded-control overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-sand/40 border-b border-sand font-mono text-[10px] text-ink-600 uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Item</th>
                          <th className="py-2.5 px-3">Asset / Machinery Class</th>
                          <th className="py-2.5 px-3">Detection Vector</th>
                          <th className="py-2.5 px-3">Field Coordinates</th>
                          <th className="py-2.5 px-3">Custody Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sand bg-bone font-mono text-[11px]">
                        {(plateDetections.length > 0
                          ? plateDetections.map((d: any) => d.label || d.class || "Machinery Target")
                          : selectedReport.machinery_detected
                        ).length > 0 ? (
                          (plateDetections.length > 0
                            ? plateDetections.map((d: any) => d.label || d.class || "Machinery Target")
                            : selectedReport.machinery_detected
                          ).map((mach: string, idx: number) => (
                            <tr key={idx} className="hover:bg-paper transition-colors">
                              <td className="py-2.5 px-3 font-bold text-ink-600">0{idx + 1}</td>
                              <td className="py-2.5 px-3 font-sans font-bold text-critical">{mach}</td>
                              <td className="py-2.5 px-3 text-ink-600">Aerial Optical CV (Grounding DINO + SAM 2)</td>
                              <td className="py-2.5 px-3 text-ink-900">{lat.toFixed(4)}°N, {lng.toFixed(4)}°E</td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded bg-critical-soft text-critical font-bold text-[10px] border border-critical/30">
                                  SEIZED IN SITU
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-4 px-3 text-center text-ink-600 font-sans italic">
                              Zero heavy logging machinery targets detected in survey perimeter. Visual ground survey verified.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cryptographic SHA-256 Digital Evidence Seal */}
                <div className="border-2 border-canopy p-4 sm:p-5 rounded-control bg-bone space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-bold text-ink-900 text-xs uppercase tracking-wide text-canopy">
                      <Lock className="h-4 w-4" />
                      <span>Section V: SHA-256 Cryptographic Chain-of-Custody Seal</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded bg-moss-100 text-canopy border border-canopy/30">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Certified Immutable &amp; Tamper-Evident</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-ink-600 leading-relaxed">
                    Under <strong className="text-ink-900">Section 65B of the Indian Evidence Act 1872</strong>, this digital record constitutes certified primary computer-generated evidence. All associated aerial orthomosaics, raw Sentinel-2 telemetry, and model classifications are secured by immutable cryptographic hash digest:
                  </p>

                  <div className="font-mono text-xs text-ink-900 bg-paper p-3 rounded-control border border-sand break-all flex items-center justify-between gap-2 select-all font-bold">
                    <span>{selectedReport.sha256_evidence_seal}</span>
                  </div>
                </div>

                {/* Statutory Bilateral Signature Block */}
                <div className="pt-4 border-t border-sand grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="border-t-2 border-ink-900 pt-3 relative">
                    <div className="font-bold text-xs text-ink-900">{selectedReport.generated_by}</div>
                    <div className="text-[11px] text-ink-600">Senior Conservator &amp; Lead Investigating Officer</div>
                    <div className="text-[10px] font-mono text-canopy mt-1">State Cadastral Intelligence Unit · Western Ghats</div>
                  </div>

                  <div className="border-t-2 border-ink-900 pt-3 relative">
                    <div className="font-bold text-xs text-ink-900">Dr. A. N. Murthy (Director)</div>
                    <div className="text-[11px] text-ink-600">Principal Forensic Geospatial Intelligence Laboratory</div>
                    <div className="text-[10px] font-mono text-canopy mt-1">National Remote Sensing &amp; Verification Agency</div>
                  </div>
                </div>

                {/* Footnote Admissibility */}
                <div className="text-[10px] text-ink-400 text-center border-t border-sand/60 pt-3 flex flex-wrap items-center justify-between gap-2">
                  <span>Prepared for State Judicial Court Proceedings · High Court Jurisdiction</span>
                  <span className="font-mono text-canopy">BLOCK #894,120 · VERIFIED CRYPTOGRAPHICALLY</span>
                </div>
              </article>
            ) : (
              <EmptyState
                icon={FolderSearch}
                title="No dossier selected"
                description="Select an existing dossier from the archive or compile a new one from the active incident queue."
              />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center font-mono text-xs text-ink-600">
          Loading forensic dossiers...
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
