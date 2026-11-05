"use client";

import React, { useState, useEffect, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/lib/store";
import { ReportItem } from "@/lib/types";
import { getReports, generateReport } from "@/lib/api";
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
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, ProvenanceBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

function ReportsContent() {
  const { incidents } = useApp();
  const searchParams = useSearchParams();
  const deepLinkedIncidentId = searchParams.get("id");

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIncidentForNew, setSelectedIncidentForNew] = useState(
    deepLinkedIncidentId || incidents[0]?.id || "AS-2026-088"
  );

  useEffect(() => {
    getReports().then((data) => {
      setReports(data);
      if (deepLinkedIncidentId) {
        const match = data.find((r) => r.incident_id === deepLinkedIncidentId);
        if (match) setSelectedReport(match);
        else if (data.length > 0) setSelectedReport(data[0]);
      } else if (data.length > 0) {
        setSelectedReport(data[0]);
      }
    });
  }, [deepLinkedIncidentId]);

  const handleGenerateNew = async () => {
    setIsGenerating(true);
    try {
      const rep = await generateReport(selectedIncidentForNew);
      setReports((prev) => [rep, ...prev]);
      setSelectedReport(rep);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintDossier = () => {
    if (!selectedReport) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedReport.id} — Aranya Sentinel Legal Dossier</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
            body { 
              font-family: 'Manrope', ui-sans-serif, sans-serif; 
              margin: 36px auto; 
              max-width: 820px;
              color: #202923; 
              background: #FFFEF8;
              line-height: 1.6; 
              padding: 24px;
            }
            .header { border-bottom: 2px solid #202923; padding-bottom: 16px; margin-bottom: 24px; }
            .title { font-size: 24px; font-weight: 700; margin: 0; color: #183C2D; }
            .subtitle { font-size: 12px; color: #59645C; margin-top: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; font-size: 12px; }
            .box { background: #F4F1E7; border: 1px solid #E7E1D3; padding: 12px; border-radius: 6px; }
            .label { font-size: 11px; color: #59645C; font-weight: 500; }
            .value { font-weight: 700; margin-top: 2px; font-family: 'IBM Plex Mono', monospace; }
            .seal { background: #F4F1E7; border: 1px solid #202923; padding: 14px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; word-break: break-all; margin: 24px 0; border-radius: 4px; }
            .signature { margin-top: 48px; border-top: 1px solid #202923; padding-top: 8px; width: 280px; font-size: 12px; }
            @media print { body { margin: 15mm; padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Aranya Sentinel — Forensic Investigation Dossier</h1>
            <div class="subtitle">State Forest Department · Environmental Enforcement Cadastre</div>
            <div style="font-size: 11px; color: #59645C; margin-top: 4px;">Wildlife Protection Act 1972 (§ 27, 29) · Indian Forest Act 1927</div>
          </div>

          <h2 style="font-size: 18px; margin-bottom: 12px; color: #202923;">${selectedReport.title}</h2>
          
          <div class="grid">
            <div class="box">
              <div class="label">Dossier reference</div>
              <div class="value">${selectedReport.id}</div>
            </div>
            <div class="box">
              <div class="label">Incident docket link</div>
              <div class="value">${selectedReport.incident_id}</div>
            </div>
            <div class="box">
              <div class="label">Jurisdiction</div>
              <div class="value">${selectedReport.jurisdiction}</div>
            </div>
            <div class="box">
              <div class="label">Observation date</div>
              <div class="value">${selectedReport.generated_at}</div>
            </div>
            <div class="box">
              <div class="label">Affected forest area</div>
              <div class="value">${selectedReport.area_hectares} hectares</div>
            </div>
            <div class="box">
              <div class="label">Investigating officer</div>
              <div class="value">${selectedReport.generated_by}</div>
            </div>
          </div>

          <div style="margin: 20px 0;">
            <div style="font-size: 12px; font-weight: 700; margin-bottom: 6px;">Ground Findings &amp; Evidence Narrative</div>
            <div style="background: #F4F1E7; border: 1px solid #E7E1D3; padding: 14px; border-radius: 6px; font-size: 12px; line-height: 1.6;">
              ${selectedReport.summary}
            </div>
          </div>

          <div style="margin: 20px 0;">
            <div style="font-size: 12px; font-weight: 700; margin-bottom: 6px;">Seized / Identified Heavy Logging Machinery</div>
            <div style="font-size: 12px; color: #B94236; font-weight: 600;">
              ${selectedReport.machinery_detected.join(", ")}
            </div>
          </div>

          <div class="seal">
            <div style="font-weight: 700; margin-bottom: 4px;">SHA-256 DIGITAL EVIDENCE CUSTODY SEAL</div>
            <div>${selectedReport.sha256_evidence_seal}</div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 48px;">
            <div class="signature">
              <div>Authorized Forest Officer Signature</div>
              <div style="font-size: 11px; color: #59645C; margin-top: 4px;">State Cadastral Intelligence Unit</div>
            </div>
            <div class="signature">
              <div>Forensic Lab Timestamp</div>
              <div style="font-size: 11px; color: #59645C; margin-top: 4px;">Verified Cryptographically</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-7 space-y-6 max-w-[1500px] w-full mx-auto font-sans text-xs">
        {/* Page Header */}
        <PageHeader
          title="Forensic Investigation Dossiers"
          description="Court-admissible incident dossiers with SHA-256 cryptographic chain of custody seals for judicial forest crime prosecution."
          actions={<ProvenanceBadge source="server" />}
        />

        {/* 2-Column Responsive Workspace: Library (4 cols) + Document Preview (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Dossier Library & Generation Card (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Dossier Generation Card */}
            <div className="atlas-card p-5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-sand pb-2">
                <span className="font-bold text-ink-900 text-sm">
                  Generate Investigation Dossier
                </span>
                <span className="text-[11px] font-mono text-ink-600">Court-format</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-900 mb-1.5">
                  Select incident docket:
                </label>
                <select
                  value={selectedIncidentForNew}
                  onChange={(e) => setSelectedIncidentForNew(e.target.value)}
                  className="w-full bg-paper border border-sand rounded-control px-3.5 h-11 text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy text-xs font-medium cursor-pointer"
                >
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      {inc.id} — {inc.jurisdiction} ({inc.affected_area_ha} ha)
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
                    <span>Compiling satellite &amp; drone telemetry...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Compile court dossier</span>
                  </>
                )}
              </button>
            </div>

            {/* Existing Dossiers List */}
            <div className="atlas-card p-4 space-y-2">
              <div className="font-bold text-ink-900 text-xs px-1 border-b border-sand pb-2 flex items-center justify-between">
                <span>Dossier Archive ({reports.length})</span>
                <span className="text-[11px] font-mono text-ink-600">SHA-256</span>
              </div>

              <div className="space-y-1.5 overflow-y-auto max-h-[480px]">
                {reports.map((rep) => {
                  const isSelected = selectedReport?.id === rep.id;
                  return (
                    <button
                      key={rep.id}
                      onClick={() => setSelectedReport(rep)}
                      className={`w-full text-left p-3.5 rounded-card border transition-all ${
                        isSelected
                          ? "bg-moss-100 border-moss-600/50 shadow-sm"
                          : "border-sand bg-bone hover:bg-paper text-ink-900"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-ink-900 text-xs num">{rep.id}</span>
                        <StatusBadge label="Certified" variant="verified" size="sm" />
                      </div>
                      <div className="font-semibold text-ink-900 line-clamp-1 leading-snug">
                        {rep.title}
                      </div>
                      <div className="text-[11px] text-ink-600 mt-1 flex justify-between font-mono">
                        <span>{rep.jurisdiction}</span>
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
              <article className="atlas-card p-6 sm:p-8 space-y-6 text-xs text-ink-900 leading-relaxed shadow-lift bg-bone">
                {/* Dossier Header */}
                <div className="border-b border-sand pb-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-canopy font-bold tracking-wide uppercase">
                      State Forest Department · Environmental Enforcement Cadastre
                    </div>
                    <h2 className="text-xl sm:text-2xl font-sans font-bold text-ink-900 mt-1">
                      {selectedReport.title}
                    </h2>
                    <div className="text-xs text-ink-600 mt-1 flex items-center gap-2">
                      <span>Dossier: <strong className="text-ink-900 font-mono">{selectedReport.id}</strong></span>
                      <span>·</span>
                      <span>Incident link: <strong className="text-canopy font-mono">{selectedReport.incident_id}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={handlePrintDossier}
                    className="btn btn-primary h-11 min-h-[44px] text-xs px-4"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print official dossier</span>
                  </button>
                </div>

                {/* Case Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-4 rounded-control bg-paper border border-sand">
                  <div>
                    <div className="text-ink-600">Jurisdiction</div>
                    <div className="font-bold text-ink-900 mt-0.5">{selectedReport.jurisdiction}</div>
                  </div>
                  <div>
                    <div className="text-ink-600">Observation date</div>
                    <div className="font-bold text-ink-900 mt-0.5 num">{selectedReport.generated_at}</div>
                  </div>
                  <div>
                    <div className="text-ink-600">Recorded loss</div>
                    <div className="font-bold text-critical mt-0.5 num">{selectedReport.area_hectares} ha</div>
                  </div>
                  <div>
                    <div className="text-ink-600">Investigating officer</div>
                    <div className="font-bold text-ink-900 mt-0.5">{selectedReport.generated_by}</div>
                  </div>
                </div>

                {/* Findings Narrative */}
                <div className="space-y-2">
                  <div className="font-bold text-ink-900 text-xs">
                    Forensic Ground Reconnaissance &amp; Telemetry Findings
                  </div>
                  <div className="text-xs text-ink-900 leading-relaxed bg-paper p-4 rounded-control border border-sand">
                    {selectedReport.summary}
                  </div>
                </div>

                {/* Machinery Evidence */}
                <div className="space-y-2">
                  <div className="font-bold text-ink-900 text-xs">
                    Geolocated / Seized Commercial Machinery
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.machinery_detected.map((mach, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-critical-soft border border-critical/30 text-critical font-bold text-xs"
                      >
                        {mach}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cryptographic SHA-256 Stamp */}
                <div className="p-4 rounded-control bg-paper border border-sand space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-ink-900 font-bold">
                      <Lock className="h-4 w-4 text-canopy" />
                      <span>SHA-256 Digital Evidence Seal</span>
                    </span>
                    <StatusBadge label="Certified Authentic" variant="verified" size="sm" />
                  </div>
                  <div className="text-ink-900 font-mono text-xs num break-all p-2 rounded bg-bone border border-sand">
                    {selectedReport.sha256_evidence_seal}
                  </div>
                </div>

                {/* Court Admissibility Notice */}
                <div className="text-xs text-ink-600 pt-3 border-t border-sand flex flex-wrap items-center justify-between gap-2">
                  <span>Prepared under Indian Wildlife Protection Act 1972 (§ 27, 29) &amp; Indian Forest Act 1927</span>
                  <span className="text-canopy font-bold">Certified Court Admissible</span>
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
