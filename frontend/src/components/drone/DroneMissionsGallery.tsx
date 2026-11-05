"use client";

import React, { useState, useEffect } from "react";
import { Crosshair, MapPin, Calendar, Clock, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { getDroneSamples } from "@/lib/api";
import { DroneSampleMission } from "@/lib/types";

interface DroneMissionsGalleryProps {
  onSelectMission?: (mission: DroneSampleMission) => void;
  activeMissionId?: string;
}

export function DroneMissionsGallery({ onSelectMission, activeMissionId }: DroneMissionsGalleryProps) {
  const [missions, setMissions] = useState<DroneSampleMission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDroneSamples(true)
      .then((data) => {
        setMissions(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 border border-sand rounded-card bg-bone">
        <Loader2 className="h-4 w-4 animate-spin text-ink-600 mr-2" />
        <span className="text-xs text-ink-600 font-mono">Loading mission archive from database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-signal" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900">
            Past Recon Flights in Database (GET /api/drone/samples)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-ink-600 num">
          {missions.length} sorties logged
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {missions.map((m) => {
          const isSelected = activeMissionId === m.id;
          return (
            <div
              key={m.id}
              onClick={() => onSelectMission && onSelectMission(m)}
              className={`p-3.5 rounded-card border transition-all cursor-pointer ${
                isSelected
                  ? "bg-bone border-canopy-950 shadow-lift ring-1 ring-canopy-950"
                  : "bg-bone hover:bg-paper-100 border-sand shadow-card"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-xs text-ink-900 bg-paper-200 px-2 py-0.5 rounded border border-sand num">
                  {m.id}
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-moss-100 text-canopy border border-moss-600/30">
                  {m.status.replace("_", " ")}
                </span>
              </div>

              <div className="font-bold text-xs text-ink-900 leading-snug line-clamp-1 mb-1">
                {m.name}
              </div>

              <div className="text-[11px] text-ink-600 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-ink-800">Drone:</span>
                  <span>{m.drone_model}</span>
                </div>
                {m.coordinates && (
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <MapPin className="h-3 w-3 text-signal shrink-0" />
                    <span>
                      {m.coordinates[0]?.toFixed(4)}°N, {m.coordinates[1]?.toFixed(4)}°E
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Clock className="h-3 w-3 text-ink-400 shrink-0" />
                  <span>{new Date(m.date).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Machinery Tags */}
              <div className="mt-2.5 pt-2 border-t border-sand/60 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {m.machinery_identified.length > 0 ? (
                    m.machinery_identified.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-critical-soft text-critical border border-critical/20"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-ink-400 italic">No machinery detected</span>
                  )}
                </div>
                <button
                  type="button"
                  className="text-[11px] font-semibold text-canopy hover:text-canopy-800 underline underline-offset-2 shrink-0 ml-2"
                >
                  {isSelected ? "Active" : "Inspect"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

