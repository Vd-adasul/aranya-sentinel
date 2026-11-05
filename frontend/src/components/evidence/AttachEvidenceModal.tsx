"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, GitMerge, CheckCircle2, Loader2, Link2, Crosshair, MapPin } from "lucide-react";
import { attachEvidenceToIncident } from "@/lib/api";
import { useApp } from "@/lib/store";
import { Incident } from "@/lib/types";

interface AttachEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident?: Incident | null;
  onSuccess?: () => void;
}

export function AttachEvidenceModal({ isOpen, onClose, incident, onSuccess }: AttachEvidenceModalProps) {
  const { incidents, refreshIncidents } = useApp();
  const [mounted, setMounted] = useState(false);

  const [selectedIncidentId, setSelectedIncidentId] = useState(incident?.id || "");
  const [evidenceType, setEvidenceType] = useState<"drone" | "disturbance">("drone");
  const [evidenceId, setEvidenceId] = useState("DRN-MSSN-101");
  const [notes, setNotes] = useState("Corroborated vehicle and excavator detections within reserve boundary.");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSelectedIncidentId(incident?.id || incidents[0]?.id || "");
      setError(null);
      setSuccess(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, incident, incidents]);

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
    if (!selectedIncidentId || !evidenceId.trim()) {
      setError("Please choose an incident and evidence ID.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await attachEvidenceToIncident(selectedIncidentId, {
        evidence_type: evidenceType,
        evidence_id: evidenceId.trim(),
        notes: notes.trim(),
      });

      await refreshIncidents();
      setSuccess(`Evidence ${evidenceId} attached to incident ${selectedIncidentId}.`);

      if (onSuccess) onSuccess();

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || "Failed to attach evidence.");
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0B1710]/85 backdrop-blur-md modal-scrim-enter cursor-pointer overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attach-evidence-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-panel border border-sand-300 bg-bone p-5 sm:p-6 space-y-4 shadow-dialog modal-card-enter cursor-default my-auto text-ink-900 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sand pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-control bg-canopy-950 text-bone shadow-sm shrink-0">
              <Link2 className="h-4 w-4" />
            </div>
            <div>
              <h2 id="attach-evidence-title" className="text-base font-bold text-ink-900 leading-snug tracking-tight">
                Attach Sensor Evidence to Case Docket
              </h2>
              <p className="text-[11px] text-ink-600">
                Link drone missions or satellite polygons for forensic spatiotemporal fusion
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
              Target Incident Case
            </label>
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="w-full bg-paper-100 border border-sand rounded-control px-3 h-10 text-ink-900 focus-visible:outline-none focus:border-canopy-900 focus:ring-1 focus:ring-canopy-900/20 text-xs font-medium cursor-pointer"
              required
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.id} — {inc.title} ({inc.jurisdiction})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1">
                Evidence Modality
              </label>
              <select
                value={evidenceType}
                onChange={(e) => {
                  const val = e.target.value as "drone" | "disturbance";
                  setEvidenceType(val);
                  setEvidenceId(val === "drone" ? "DRN-MSSN-101" : "DIST-WG-01");
                }}
                className="w-full bg-paper-100 border border-sand rounded-control px-3 h-10 text-ink-900 text-xs font-medium cursor-pointer"
              >
                <option value="drone">Drone Aerial Recon Mission</option>
                <option value="disturbance">Satellite Disturbance Polygon</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1">
                Evidence Identifier
              </label>
              <input
                type="text"
                value={evidenceId}
                onChange={(e) => setEvidenceId(e.target.value)}
                placeholder="e.g. DRN-MSSN-101"
                className="w-full bg-paper-100 border border-sand rounded-control px-3 h-10 text-ink-900 font-mono text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1">
              Corroboration Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="State geometric alignment, GPS centroid proximity, or detected targets..."
              className="w-full bg-paper-100 border border-sand rounded-control p-3 text-ink-900 text-xs font-sans leading-relaxed resize-none focus-visible:outline-none focus:border-canopy-900 focus:ring-1 focus:ring-canopy-900/20"
            />
          </div>

          {error && (
            <div className="p-3 rounded-control text-xs font-medium border bg-critical-soft text-critical border-critical/30 animate-in fade-in">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-control text-xs font-medium border bg-moss-100 text-canopy border-moss-600/30 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-moss-600 shrink-0" />
              <span>{success}</span>
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
                  <span>Linking Evidence...</span>
                </>
              ) : (
                <>
                  <GitMerge className="h-3.5 w-3.5 text-moss-200" />
                  <span>Attach &amp; Fuse Evidence</span>
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
