"use client";

import React, { useState, useEffect } from "react";
import { Radio, AlertTriangle, ShieldCheck, MapPin, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { getGfwAlerts, getGfwStatus } from "@/lib/api";
import { GFWAlert } from "@/lib/types";

export function GfwAlertStream() {
  const [alerts, setAlerts] = useState<GFWAlert[]>([]);
  const [status, setStatus] = useState<{ status: string; connected: boolean; active_feeds: number }>({
    status: "nominal",
    connected: true,
    active_feeds: 3,
  });
  const [loading, setLoading] = useState(true);
  const [activeDataset, setActiveDataset] = useState<string>("All");

  const loadData = async (datasetFilter?: string) => {
    setLoading(true);
    try {
      const [alertsData, statusData] = await Promise.all([
        getGfwAlerts(datasetFilter && datasetFilter !== "All" ? datasetFilter : undefined, true),
        getGfwStatus(),
      ]);
      setAlerts(alertsData);
      setStatus(statusData);
    } catch {
      // keep cached
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeDataset);
  }, [activeDataset]);

  return (
    <div className="atlas-card p-5 space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-control bg-signal text-bone shadow-sm shrink-0">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-ink-900 leading-snug tracking-tight">
                Global Forest Watch (GFW) Alert Ingestion
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-moss-100 text-canopy border border-moss-600/30">
                Live Feed
              </span>
            </div>
            <p className="text-[11px] text-ink-600">
              External GLAD &amp; RADD Sentinel-1 radar disturbance stream cross-referenced against reserve geofences
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Dataset filter tabs */}
          <div className="flex items-center bg-paper-200 p-0.5 rounded-control border border-sand text-[11px]">
            {["All", "GLAD-L", "RADD-Sentinel1", "GLAD-S2"].map((ds) => (
              <button
                key={ds}
                type="button"
                onClick={() => setActiveDataset(ds)}
                className={`px-2 py-1 rounded transition-colors font-medium ${
                  activeDataset === ds
                    ? "bg-bone text-ink-900 shadow-sm font-semibold"
                    : "text-ink-600 hover:text-ink-900"
                }`}
              >
                {ds}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => loadData(activeDataset)}
            disabled={loading}
            className="p-1.5 rounded-control border border-sand bg-bone hover:bg-paper text-ink-600 hover:text-ink-900 transition-colors"
            title="Refresh stream"
            aria-label="Refresh stream"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Stream Table */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-4 w-4 animate-spin text-ink-600 mr-2" />
          <span className="font-mono text-xs text-ink-600">Polling GFW Gladys &amp; RADD radar feeds...</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-6 text-center text-ink-600 italic">No external alerts in current transect.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-sand text-[10px] uppercase font-bold tracking-wider text-ink-400">
                <th className="py-2.5 px-3">Alert Identifier</th>
                <th className="py-2.5 px-3">Sensor Dataset</th>
                <th className="py-2.5 px-3">Detection Coordinates</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Geofence Status</th>
                <th className="py-2.5 px-3 text-right">Detection Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/60">
              {alerts.map((a) => {
                const isCriticalGeofence =
                  a.geofence_status?.includes("CRITICAL") || a.geofence_status?.includes("CORE");
                return (
                  <tr key={a.id} className="hover:bg-paper-100/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-ink-900 text-[11px] num">
                      {a.id}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-medium text-[11px] text-ink-800 bg-paper-100 px-1.5 py-0.5 rounded border border-sand">
                        {a.dataset} {a.version ? `(${a.version})` : ""}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-ink-700">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-signal shrink-0" />
                        <span>
                          {a.latitude.toFixed(4)}°N, {a.longitude.toFixed(4)}°E
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          a.confidence_level === "highest" || a.confidence_level === "high"
                            ? "bg-critical-soft text-critical border border-critical/30"
                            : "bg-paper text-ink-700 border border-sand"
                        }`}
                      >
                        {a.confidence_level}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded flex items-center gap-1 w-fit ${
                          isCriticalGeofence
                            ? "bg-critical-soft text-critical font-bold border border-critical/30"
                            : "bg-moss-100 text-canopy border border-moss-600/30"
                        }`}
                      >
                        {isCriticalGeofence ? (
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                        ) : (
                          <ShieldCheck className="h-3 w-3 shrink-0" />
                        )}
                        <span>{a.geofence_status?.replace(/_/g, " ") || "UNVERIFIED"}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-ink-600 text-[11px] num">
                      {a.date_detected}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

