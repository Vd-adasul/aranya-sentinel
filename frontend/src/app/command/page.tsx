"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SentinelMap } from "@/components/map/SentinelMap";
import { useApp } from "@/lib/store";
import { DisturbancePolygon } from "@/lib/types";
import { getDisturbances } from "@/lib/api";
import {
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Layers,
  MapPin,
  TrendingDown,
  Loader2,
  FolderSearch,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  StatusBadge,
  SeverityBadge,
  WorkflowStatusBadge,
  ProvenanceBadge,
} from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { GfwAlertStream } from "@/components/alerts/GfwAlertStream";

export default function CommandPage() {
  const { selectedRegion, incidents, updateIncident, backendStatus } = useApp();
  const [disturbances, setDisturbances] = useState<DisturbancePolygon[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>("AS-2026-088");
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    getDisturbances(selectedRegion.id).then(setDisturbances);
  }, [selectedRegion]);

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId);

  const filteredIncidents = incidents.filter((i) => {
    if (severityFilter === "All") return true;
    return i.severity === severityFilter;
  });

  const totalAreaLoss = incidents.reduce((sum, i) => sum + i.affected_area_ha, 0);
  const criticalCount = incidents.filter((i) => i.severity === "CRITICAL").length;
  const verifiedCount = incidents.filter((i) => i.status === "Verified").length;

  const handleVerifyCase = async () => {
    if (!selectedIncident || isUpdating) return;
    setIsUpdating(true);
    setActionFeedback(null);
    const res = await updateIncident(selectedIncident.id, {
      status: "Verified",
      assigned_analyst: "Ranger Rapid Response",
      investigation_notes: "Field-verified: Machinery confirmed on-site.",
    });
    setIsUpdating(false);
    if (res.success) {
      setActionFeedback("Case successfully verified in cadastral ledger.");
    } else {
      setActionFeedback(res.error || "Failed to update incident.");
    }
  };

  const handleEscalateCase = async () => {
    if (!selectedIncident || isUpdating) return;
    setIsUpdating(true);
    setActionFeedback(null);
    const res = await updateIncident(selectedIncident.id, {
      status: "Escalated",
      assigned_analyst: "Wildlife Crime Interdiction Patrol",
      investigation_notes: "Urgent: Machinery active within buffer corridor.",
    });
    setIsUpdating(false);
    if (res.success) {
      setActionFeedback("Case escalated to Forest Interdiction Patrol.");
    } else {
      setActionFeedback(res.error || "Failed to escalate incident.");
    }
  };

  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-7 space-y-6 max-w-[1600px] w-full mx-auto font-sans">
        {/* Page Header */}
        <PageHeader
          title="Command Centre"
          scope={selectedRegion.name.split("—")[0].trim()}
          description={`Coordinated geospatial surveillance across ${selectedRegion.name}. Real-time Sentinel-2 L2A passes and drone computer-vision alerts.`}
          actions={
            <div className="flex items-center gap-3">
              <Link href="/map" className="btn btn-secondary text-xs h-11 min-h-[44px]">
                <Layers className="h-4 w-4 text-signal" />
                <span>Fullscreen GIS map</span>
              </Link>
              <Link
                href={selectedIncident ? `/verification?id=${selectedIncident.id}` : "/verification"}
                className="btn btn-primary text-xs h-11 min-h-[44px]"
              >
                <span>Evidence fusion desk</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          }
        />

        {/* Ruled Summary Metric Band */}
        <div className="atlas-card p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-sand">
            <div>
              <div className="flex items-center justify-between text-xs text-ink-600 font-medium">
                <span>Critical breaches</span>
                <span className="h-2 w-2 rounded-full bg-critical" />
              </div>
              <div className="text-3xl font-bold text-critical num mt-1">
                {criticalCount} <span className="text-sm font-sans font-normal text-ink-600">active</span>
              </div>
              <div className="text-xs text-ink-600 mt-0.5">Heavy machinery geolocated</div>
            </div>

            <div className="pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center justify-between text-xs text-ink-600 font-medium">
                <span>Total disturbance dockets</span>
                <span className="h-2 w-2 rounded-full bg-signal" />
              </div>
              <div className="text-3xl font-bold text-ink-900 num mt-1">
                {incidents.length} <span className="text-sm font-sans font-normal text-ink-600">cases</span>
              </div>
              <div className="text-xs text-ink-600 mt-0.5">Active reserve transects</div>
            </div>

            <div className="pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center justify-between text-xs text-ink-600 font-medium">
                <span>Canopy clear-cut area</span>
                <TrendingDown className="h-4 w-4 text-critical" />
              </div>
              <div className="text-3xl font-bold text-critical num mt-1">
                {totalAreaLoss.toFixed(1)} <span className="text-sm font-sans font-normal text-ink-600">ha</span>
              </div>
              <div className="text-xs text-ink-600 mt-0.5">Past 30 d observation window</div>
            </div>

            <div className="pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center justify-between text-xs text-ink-600 font-medium">
                <span>Verified court dockets</span>
                <CheckCircle2 className="h-4 w-4 text-moss-600" />
              </div>
              <div className="text-3xl font-bold text-moss-600 num mt-1">
                {verifiedCount} <span className="text-sm font-sans font-normal text-ink-600">verified</span>
              </div>
              <div className="text-xs text-ink-600 mt-0.5">SHA-256 evidence sealed</div>
            </div>
          </div>
        </div>

        {/* 3-Pane Responsive Layout: Queue (30%) + Tactical Map (45%) + Inspector (25%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
          {/* Left: Queue List (3.5 cols on lg) */}
          <div className="lg:col-span-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-ink-900 uppercase tracking-wider">
                Disturbance Queue ({filteredIncidents.length})
              </span>
              <div className="inline-flex rounded-full border border-sand p-0.5 bg-paper text-xs">
                {["All", "CRITICAL", "HIGH"].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                      severityFilter === sev
                        ? "bg-canopy text-bone"
                        : "text-ink-600 hover:text-ink-900"
                    }`}
                  >
                    {sev === "All" ? "All" : sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[580px] flex-1 pr-1">
              {filteredIncidents.length === 0 ? (
                <EmptyState
                  icon={FolderSearch}
                  title="No matching dockets"
                  description="No incidents match the active severity filter."
                  action={
                    <button
                      onClick={() => setSeverityFilter("All")}
                      className="btn btn-secondary text-xs"
                    >
                      Clear filter
                    </button>
                  }
                />
              ) : (
                filteredIncidents.map((inc) => {
                  const isSelected = inc.id === selectedIncidentId;
                  return (
                    <button
                      key={inc.id}
                      onClick={() => {
                        setSelectedIncidentId(inc.id);
                        setActionFeedback(null);
                      }}
                      className={`w-full text-left p-3.5 rounded-card border transition-all ${
                        isSelected
                          ? "bg-moss-100 border-moss-600/50 shadow-sm"
                          : "border-sand bg-bone hover:bg-paper text-ink-900"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 gap-1.5">
                        <span className="font-mono font-bold text-xs num text-ink-900 whitespace-nowrap shrink-0">{inc.id}</span>
                        <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                          <SeverityBadge severity={inc.severity} size="sm" />
                          <WorkflowStatusBadge status={inc.status} size="sm" />
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-ink-900 line-clamp-1 mb-1">
                        {inc.title}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-ink-600 font-mono">
                        <span>{inc.affected_area_ha} ha</span>
                        <span>{inc.jurisdiction}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Center: Tactical GIS Map (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs font-sans text-ink-600 px-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink-900">Tactical GIS Map</span>
                <span>·</span>
                <span>{selectedRegion.name}</span>
              </div>
              <ProvenanceBadge source={backendStatus.status === "healthy" ? "server" : "local-demo"} />
            </div>

            <div className="flex-1 min-h-[480px] w-full rounded-panel border border-sand bg-bone overflow-hidden shadow-card">
              <SentinelMap
                region={selectedRegion}
                incidents={incidents}
                disturbances={disturbances}
                selectedIncidentId={selectedIncidentId}
                onSelectIncident={(id) => {
                  setSelectedIncidentId(id);
                  setActionFeedback(null);
                }}
                className="h-full w-full"
              />
            </div>
          </div>

          {/* Right: Selected Case Inspector (3 cols on lg) */}
          <div className="lg:col-span-3 flex flex-col space-y-4">
            {selectedIncident ? (
              <div className="atlas-card p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-sand pb-3 flex-wrap">
                  <span className="font-mono font-bold text-ink-900 text-sm num tracking-tight whitespace-nowrap shrink-0">
                    {selectedIncident.id}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    <SeverityBadge severity={selectedIncident.severity} size="sm" />
                    <WorkflowStatusBadge status={selectedIncident.status} size="sm" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-ink-900 leading-snug">
                    {selectedIncident.title}
                  </h3>
                  <div className="text-xs text-ink-600 flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-signal shrink-0" />
                    <span>{selectedIncident.jurisdiction}</span>
                  </div>
                </div>

                {/* Data Grid */}
                <div className="p-3.5 rounded-control bg-paper border border-sand space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-ink-600">Affected area:</span>
                    <span className="text-sm font-bold text-critical font-mono num">
                      {selectedIncident.affected_area_ha} ha
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-600">Canopy cover loss:</span>
                    <span className="font-bold text-critical font-mono num">
                      -{selectedIncident.tree_loss_pct}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-600">Assigned ranger:</span>
                    <span className="font-semibold text-ink-900">
                      {selectedIncident.assigned_analyst || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-600">Detection sensor:</span>
                    <span className="font-mono text-ink-900">{selectedIncident.detection_source}</span>
                  </div>
                </div>

                {/* Notes */}
                <div className="p-3 rounded-control bg-bone border border-sand text-xs text-ink-900 leading-relaxed font-sans">
                  <div className="text-[11px] text-ink-600 font-semibold mb-0.5">Field notes:</div>
                  {selectedIncident.investigation_notes || "No investigation notes recorded yet."}
                </div>

                {/* Action Feedback Banner */}
                {actionFeedback && (
                  <div className="p-2.5 rounded-control bg-moss-100 border border-moss-600/30 text-canopy text-xs font-medium">
                    {actionFeedback}
                  </div>
                )}

                {/* Triage Actions */}
                <div className="space-y-2 pt-2 border-t border-sand">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleVerifyCase}
                      disabled={isUpdating}
                      className="btn btn-secondary text-xs h-10 min-h-[40px]"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-moss-600" />
                      )}
                      <span>Verify case</span>
                    </button>

                    <button
                      onClick={handleEscalateCase}
                      disabled={isUpdating}
                      className="btn btn-secondary text-xs text-critical h-10 min-h-[40px]"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ShieldAlert className="h-4 w-4 text-critical" />
                      )}
                      <span>Escalate</span>
                    </button>
                  </div>

                  <Link
                    href={`/verification?id=${selectedIncident.id}`}
                    className="btn btn-primary w-full text-xs h-10 min-h-[40px]"
                  >
                    <span>Open evidence fusion desk</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={FolderSearch}
                title="No docket selected"
                description="Select an incident from the queue or map to inspect details."
              />
            )}
          </div>
        </div>

        {/* Real-time Global Forest Watch (GFW) Alert Ingestion Stream */}
        <GfwAlertStream />
      </div>
    </AppShell>
  );
}
