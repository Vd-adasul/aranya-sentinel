"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ShieldAlert, CheckCircle2, Loader2, MapPin, Hash, TreePine } from "lucide-react";
import { createIncident } from "@/lib/api";
import { useApp } from "@/lib/store";
import { IncidentCreateRequest, Severity } from "@/lib/types";

interface LogIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LogIncidentModal({ isOpen, onClose, onSuccess }: LogIncidentModalProps) {
  const { selectedRegion, addIncident } = useApp();
  const [mounted, setMounted] = useState(false);

  const [title, setTitle] = useState("Illegal Excavator Activity in Reserved Forest");
  const [jurisdiction, setJurisdiction] = useState(selectedRegion.name);
  const [latitude, setLatitude] = useState(selectedRegion.center[0] || 13.5165);
  const [longitude, setLongitude] = useState(selectedRegion.center[1] || 75.0934);
  const [areaHa, setAreaHa] = useState(8.4);
  const [lossPct, setLossPct] = useState(42.0);
  const [severity, setSeverity] = useState<Severity>("HIGH");
  const [detectionSource, setDetectionSource] = useState("Field Ranger Mobile");
  const [protectedReserve, setProtectedReserve] = useState(selectedRegion.name.split("—")[0].trim());
  const [assignedAnalyst, setAssignedAnalyst] = useState("Officer Patel");
  const [notes, setNotes] = useState("On-ground patrol confirmed tire tracks and clear-cut canopy beyond demarcated forest border.");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdIncidentId, setCreatedIncidentId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setJurisdiction(selectedRegion.name);
      setProtectedReserve(selectedRegion.name.split("—")[0].trim());
      setLatitude(selectedRegion.center[0] || 13.5165);
      setLongitude(selectedRegion.center[1] || 75.0934);
      setError(null);
      setCreatedIncidentId(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, selectedRegion]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !jurisdiction.trim()) {
      setError("Title and jurisdiction are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: IncidentCreateRequest = {
        title: title.trim(),
        jurisdiction: jurisdiction.trim(),
        latitude: parseFloat(latitude.toString()),
        longitude: parseFloat(longitude.toString()),
        affected_area_ha: parseFloat(areaHa.toString()),
        tree_loss_pct: parseFloat(lossPct.toString()),
        severity,
        status: "New",
        detection_source: detectionSource,
        protected_area_violation: true,
        protected_reserve_name: protectedReserve.trim(),
        model_confidence: 0.91,
        evidence_score: 82.0,
        assigned_analyst: assignedAnalyst.trim() || "Unassigned",
        investigation_notes: notes.trim(),
      };

      const newInc = await createIncident(payload);
      addIncident(newInc);
      setCreatedIncidentId(newInc.id);

      if (onSuccess) onSuccess();

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1400);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || "Failed to log incident.");
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0B1710]/85 backdrop-blur-md modal-scrim-enter cursor-pointer overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-incident-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-panel border border-sand-300 bg-bone p-5 sm:p-6 space-y-4 shadow-dialog modal-card-enter cursor-default my-auto text-ink-900 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sand pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-control bg-critical text-bone shadow-sm shrink-0">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h2 id="log-incident-title" className="text-base font-bold text-ink-900 leading-snug tracking-tight">
                Log New Field Incident
              </h2>
              <p className="text-[11px] text-ink-600">
                Register on-ground patrol or sensor discovery into the immutable evidence docket
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-paper-200 text-ink-600 hover:text-ink-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy"
            aria-label="Close dialog"
            title="Close (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1">
              Incident Case Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unauthorized Bulldozer Corridor Excavation"
              className="w-full bg-paper-100 border border-sand rounded-control px-3 h-10 text-ink-900 focus-visible:outline-none focus:border-canopy-900 focus:ring-1 focus:ring-canopy-900/20 text-xs font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1">
                Jurisdiction / Compartment
              </label>
              <input
                type="text"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                placeholder="e.g. Western Ghats (Agumbe Core)"
                className="w-full bg-paper-100 border border-sand rounded-control px-3 h-10 text-ink-900 focus-visible:outline-none focus:border-canopy-900 focus:ring-1 focus:ring-canopy-900/20 text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1">
                Initial Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full bg-paper-100 border border-sand rounded-control px-3 h-10 text-ink-900 focus-visible:outline-none focus:border-canopy-900 focus:ring-1 focus:ring-canopy-900/20 text-xs font-medium cursor-pointer"
              >
                <option value="CRITICAL">Critical (Immediate Response)</option>
                <option value="HIGH">High (Active Machinery / Breach)</option>
                <option value="MEDIUM">Medium (Suspected Clearing)</option>
                <option value="LOW">Low (Edge disturbance)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-signal" />
                <span>Latitude</span>
              </label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                className="w-full bg-paper-100 border border-sand rounded-control px-3 h-10 text-ink-900 font-mono text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-signal" />
                <span>Longitude</span>
              </label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                className="w-full bg-paper-100 border border-sand rounded-control px-3 h-10 text-ink-900 font-mono text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1">
                Footprint (Hectares)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={areaHa}
                onChange={(e) => setAreaHa(parseFloat(e.target.value) || 1)}
                className="w-full bg-paper-100 border border-sand rounded-control px-3 h-10 text-ink-900 font-mono text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1">
                Canopy Loss %
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max="100"
                value={lossPct}
                onChange={(e) => setLossPct(parseFloat(e.target.value) || 10)}
                className="w-full bg-paper-100 border border-sand rounded-control px-3 h-10 text-ink-900 font-mono text-xs text-critical font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1">
                Detection Sensor
              </label>
              <select
                value={detectionSource}
                onChange={(e) => setDetectionSource(e.target.value)}
                className="w-full bg-paper-100 border border-sand rounded-control px-3 h-10 text-ink-900 text-xs font-medium cursor-pointer"
              >
                <option value="Field Ranger Mobile">Field Ranger Patrol</option>
                <option value="Drone Recon CV">Drone Aerial CV</option>
                <option value="Sentinel-2 + Dynamic World">Sentinel-2 + Dynamic World</option>
                <option value="GFW Alert Stream">GFW Alert Stream</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1">
              Field Notes &amp; Evidentiary Findings
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe vehicles, equipment observed, access routes, or witness statements..."
              className="w-full bg-paper-100 border border-sand rounded-control p-3 text-ink-900 text-xs font-sans leading-relaxed resize-none focus-visible:outline-none focus:border-canopy-900 focus:ring-1 focus:ring-canopy-900/20"
            />
          </div>

          {error && (
            <div className="p-3 rounded-control text-xs font-medium border bg-critical-soft text-critical border-critical/30 animate-in fade-in">
              {error}
            </div>
          )}

          {createdIncidentId && (
            <div className="p-3 rounded-control text-xs font-medium border bg-moss-100 text-canopy border-moss-600/30 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-moss-600 shrink-0" />
              <span>Incident registered as <strong className="font-mono">{createdIncidentId}</strong> with verified SHA-256 seal.</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-sand">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-control border border-sand-300 bg-bone hover:bg-paper-200 px-3.5 h-10 text-xs font-semibold text-ink-600 hover:text-ink-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control border border-canopy-950 bg-canopy-950 hover:bg-canopy-900 px-4 h-10 text-xs font-semibold text-bone shadow-sm transition-colors disabled:opacity-50 active:translate-y-px"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Hashing &amp; Storing Docket...</span>
                </>
              ) : (
                <>
                  <Hash className="h-3.5 w-3.5 text-moss-200" />
                  <span>Log &amp; Seal Incident</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
