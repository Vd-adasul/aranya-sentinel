"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/lib/store";
import { Incident, IncidentStatus } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  GitMerge,
  X,
  Loader2,
  Filter,
  MapPin,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  StatusBadge,
  SeverityBadge,
  WorkflowStatusBadge,
} from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LogIncidentModal } from "@/components/incidents/LogIncidentModal";

function IncidentsContent() {
  const { incidents, updateIncident } = useApp();
  const searchParams = useSearchParams();
  const deepLinkedId = searchParams.get("id");
  const consumedDeepLink = useRef<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isLogIncidentOpen, setIsLogIncidentOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open to avoid awkward background scroll
  useEffect(() => {
    if (selectedIncident) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIncident]);

  // Edit form state
  const [editStatus, setEditStatus] = useState<IncidentStatus>("Under Review");
  const [assignedAnalyst, setAssignedAnalyst] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveOutcome, setSaveOutcome] = useState<{ success: boolean; message: string } | null>(null);

  // Consume deep-linked incident ID from URL (?id=AS-2026-088)
  useEffect(() => {
    if (!deepLinkedId) consumedDeepLink.current = null;
    if (deepLinkedId && consumedDeepLink.current !== deepLinkedId) {
      const match = incidents.find((i) => i.id === deepLinkedId);
      if (match) {
        consumedDeepLink.current = deepLinkedId;
        openTriage(match);
      }
    }
  }, [deepLinkedId, incidents]);

  // Dismiss modal on Escape key press
  useEffect(() => {
    if (!selectedIncident) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedIncident(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIncident]);

  const openTriage = (inc: Incident) => {
    setSelectedIncident(inc);
    setEditStatus(inc.status);
    setAssignedAnalyst(inc.assigned_analyst || "");
    setNotes(inc.investigation_notes || "");
    setSaveOutcome(null);
  };

  const handleSaveTriage = async () => {
    if (!selectedIncident || isSaving) return;
    setIsSaving(true);
    setSaveOutcome(null);

    const res = await updateIncident(selectedIncident.id, {
      status: editStatus,
      assigned_analyst: assignedAnalyst,
      investigation_notes: notes,
    });

    setIsSaving(false);
    if (res.success) {
      setSaveOutcome({ success: true, message: "Triage saved successfully to database." });
      setTimeout(() => {
        setSaveOutcome(null);
        setSelectedIncident(null);
      }, 1000);
    } else {
      setSaveOutcome({
        success: false,
        message: res.error || "Failed to persist triage update. Please retry.",
      });
    }
  };

  const filtered = incidents.filter((inc) => {
    const matchesSearch =
      inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || inc.status === statusFilter;
    const matchesSeverity = severityFilter === "All" || inc.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-7 space-y-6 max-w-[1500px] w-full mx-auto font-sans text-xs">
        {/* Page Header */}
        <PageHeader
          title="Incident Matrix &amp; Investigation Ledger"
          description="Operational docket for suspected and verified illegal logging operations across reserve holdings."
          actions={
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-xs text-ink-600 font-sans hidden sm:block">
                Total cases: <span className="text-ink-900 font-bold num">{incidents.length}</span> · Active:{" "}
                <span className="text-critical font-bold num">
                  {incidents.filter((i) => i.severity === "CRITICAL").length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsLogIncidentOpen(true)}
                className="btn btn-primary text-xs h-10 min-h-[40px] px-3.5 flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Log Field Incident</span>
              </button>
            </div>
          }
        />

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-card border border-sand bg-bone shadow-card">
          {/* Search Input */}
          <div className="flex-1 min-w-[240px] flex items-center gap-2 bg-paper rounded-control border border-sand px-3.5 h-11 text-xs">
            <Search className="h-4 w-4 text-ink-600 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by case ID, title, or jurisdiction..."
              className="bg-transparent border-0 text-ink-900 placeholder:text-ink-600 focus:outline-none w-full font-sans"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-ink-600 hover:text-ink-900 p-0.5 rounded"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-ink-600 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-paper border border-sand rounded-control px-3 h-11 text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy text-xs font-medium cursor-pointer"
            >
              <option value="All">All statuses</option>
              <option value="New">New</option>
              <option value="Under Review">Under Review</option>
              <option value="Verified">Verified</option>
              <option value="Escalated">Escalated</option>
              <option value="Rejected">Rejected</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-ink-600 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-paper border border-sand rounded-control px-3 h-11 text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy text-xs font-medium cursor-pointer"
            >
              <option value="All">All severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== "All" || severityFilter !== "All") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setSeverityFilter("All");
              }}
              className="btn btn-secondary text-xs h-11 px-3"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Ruled Inspection Table */}
        <div className="rounded-card border border-sand bg-bone overflow-hidden shadow-card">
          {filtered.length === 0 ? (
            <EmptyState
              title="No matching incident dockets"
              description="No cases match your active search terms or filters."
              action={
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("All");
                    setSeverityFilter("All");
                  }}
                  className="btn btn-secondary text-xs"
                >
                  Clear all filters
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-sand bg-paper text-ink-900 font-bold">
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Title &amp; Jurisdiction</th>
                    <th className="py-3 px-4">Area</th>
                    <th className="py-3 px-4">Canopy Loss</th>
                    <th className="py-3 px-4">Sensor Source</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand font-sans">
                  {filtered.map((inc) => (
                    <tr
                      key={inc.id}
                      className="hover:bg-sand/30 transition-colors group cursor-pointer"
                      onClick={() => openTriage(inc)}
                    >
                      <td className="py-3 px-4 font-bold text-ink-900 num whitespace-nowrap">
                        {inc.id}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <SeverityBadge severity={inc.severity} size="sm" />
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <WorkflowStatusBadge status={inc.status} size="sm" />
                      </td>

                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-semibold text-ink-900 line-clamp-1">
                          {inc.title}
                        </div>
                        <div className="text-[11px] text-ink-600 line-clamp-1 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-signal shrink-0" />
                          <span>{inc.jurisdiction}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-ink-900 font-bold font-mono num whitespace-nowrap">
                        {inc.affected_area_ha} ha
                      </td>

                      <td className="py-3 px-4 text-critical font-bold font-mono num whitespace-nowrap">
                        -{inc.tree_loss_pct}%
                      </td>

                      <td className="py-3 px-4 text-ink-600 whitespace-nowrap text-xs font-mono">
                        {inc.detection_source}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openTriage(inc)}
                            className="btn btn-secondary py-1 px-3 text-xs h-9 min-h-[36px]"
                          >
                            Triage
                          </button>
                          <Link
                            href={`/verification?id=${inc.id}`}
                            className="btn btn-secondary py-1 px-2.5 h-9 min-h-[36px]"
                            title="Open evidence fusion desk"
                          >
                            <GitMerge className="h-3.5 w-3.5 text-signal" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Triage Dialog Modal rendered directly via React Portal to cover entire viewport */}
        {selectedIncident && mounted && createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0B1710]/85 backdrop-blur-md modal-scrim-enter cursor-pointer overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="triage-title"
            onClick={() => setSelectedIncident(null)}
          >
            <div
              className="relative w-full max-w-xl rounded-panel border border-sand-300 bg-bone p-5 sm:p-6 space-y-4 shadow-dialog modal-card-enter cursor-default my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-sand pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-ink-900 num text-sm bg-paper-200 border border-sand px-2.5 py-1 rounded-control tracking-tight">
                    {selectedIncident.id}
                  </span>
                  <SeverityBadge severity={selectedIncident.severity} size="sm" />
                  <WorkflowStatusBadge status={selectedIncident.status} size="sm" />
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="p-1.5 rounded-full hover:bg-paper-200 text-ink-600 hover:text-ink-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy"
                  aria-label="Close triage dialog"
                  title="Close (Esc)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <h3 id="triage-title" className="text-lg font-bold text-ink-900 leading-snug tracking-tight font-sans">
                  {selectedIncident.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-medium text-ink-600 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-signal shrink-0" />
                  <span>{selectedIncident.jurisdiction}</span>
                </div>

                {/* Quick Telemetry Chips */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-sand/70">
                  <div className="bg-paper-200/50 rounded-control p-2 border border-sand/80">
                    <div className="text-[10px] uppercase font-mono font-semibold tracking-wider text-ink-400">Footprint</div>
                    <div className="font-mono font-bold text-xs text-ink-900 mt-0.5 num">
                      {selectedIncident.affected_area_ha} ha
                    </div>
                  </div>
                  <div className="bg-paper-200/50 rounded-control p-2 border border-sand/80">
                    <div className="text-[10px] uppercase font-mono font-semibold tracking-wider text-ink-400">Canopy Loss</div>
                    <div className="font-mono font-bold text-xs text-critical-red mt-0.5 num">
                      -{selectedIncident.tree_loss_pct}%
                    </div>
                  </div>
                  <div className="bg-paper-200/50 rounded-control p-2 border border-sand/80">
                    <div className="text-[10px] uppercase font-mono font-semibold tracking-wider text-ink-400">Primary Sensor</div>
                    <div className="font-mono font-semibold text-xs text-ink-800 mt-0.5 truncate" title={selectedIncident.detection_source}>
                      {selectedIncident.detection_source}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Assignment Form */}
              <div className="space-y-3.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1.5">
                      Lifecycle status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as IncidentStatus)}
                      className="w-full bg-paper-100 border border-sand rounded-control px-3 h-10 text-ink-900 focus-visible:outline-none focus:border-canopy-900 focus:ring-1 focus:ring-canopy-900/20 text-xs font-medium cursor-pointer transition-colors"
                    >
                      <option value="New">New</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Verified">Verified</option>
                      <option value="Escalated">Escalated</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1.5">
                      Assigned ranger unit
                    </label>
                    <input
                      type="text"
                      value={assignedAnalyst}
                      onChange={(e) => setAssignedAnalyst(e.target.value)}
                      placeholder="e.g. Strike Force Bravo"
                      className="w-full bg-paper-100 border border-sand rounded-control px-3 h-10 text-ink-900 focus-visible:outline-none focus:border-canopy-900 focus:ring-1 focus:ring-canopy-900/20 text-xs font-medium transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1.5">
                    Investigation notes &amp; ground findings
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter on-ground patrol observations, vehicle registrations, or evidentiary notes..."
                    className="w-full bg-paper-100 border border-sand rounded-control p-3 text-ink-900 focus-visible:outline-none focus:border-canopy-900 focus:ring-1 focus:ring-canopy-900/20 leading-relaxed text-xs resize-none font-sans transition-colors"
                  />
                </div>

                {saveOutcome && (
                  <div
                    className={`p-3 rounded-control text-xs font-medium border ${
                      saveOutcome.success
                        ? "bg-moss-100 text-canopy border-moss-600/30"
                        : "bg-critical-soft text-critical border-critical/30"
                    }`}
                  >
                    {saveOutcome.message}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3.5 border-t border-sand">
                <Link
                  href={`/verification?id=${selectedIncident.id}`}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control border border-sand-300 bg-bone hover:bg-paper-200 px-3.5 h-10 text-xs font-semibold text-ink-700 hover:text-ink-900 shadow-sm transition-colors shrink-0"
                >
                  <GitMerge className="h-3.5 w-3.5 text-signal shrink-0" />
                  <span>Cross-sensor verification</span>
                </Link>

                <div className="flex items-center gap-2 justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedIncident(null)}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-control border border-sand-300 bg-bone hover:bg-paper-200 px-3.5 h-10 text-xs font-semibold text-ink-600 hover:text-ink-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTriage}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control border border-canopy-950 bg-canopy-950 hover:bg-canopy-900 px-4 h-10 text-xs font-semibold text-bone shadow-sm transition-colors disabled:opacity-50 active:translate-y-px"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-moss-200" />
                        <span>Save triage record</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Log Incident Dialog */}
        <LogIncidentModal
          isOpen={isLogIncidentOpen}
          onClose={() => setIsLogIncidentOpen(false)}
        />
      </div>
    </AppShell>
  );
}

export default function IncidentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center font-mono text-xs text-ink-600">
          Loading incident ledger...
        </div>
      }
    >
      <IncidentsContent />
    </Suspense>
  );
}
