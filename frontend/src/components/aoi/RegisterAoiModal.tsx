"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, Loader2, MapPin, Sparkles, Layers, ShieldAlert, Code2, RefreshCw } from "lucide-react";
import { registerAoi } from "@/lib/api";
import { useApp } from "@/lib/store";
import { AoiCreateRequest, Region } from "@/lib/types";

// High-fidelity pre-configured Indian Forest & Tiger Reserve boundaries for 1-click evaluation
const INDIAN_RESERVE_PRESETS = [
  {
    name: "Kancha Gachibowli (SC Order 2025)",
    shortName: "Kancha",
    id: "kancha-gachibowli-hyd",
    state: "Telangana",
    risk_level: "Critical",
    canopy_cover_pct: 62.0,
    coordinates: [
      [78.326, 17.452],
      [78.338, 17.452],
      [78.338, 17.463],
      [78.326, 17.463],
      [78.326, 17.452],
    ],
  },
  {
    name: "Agumbe Rainforest Sanctuary",
    shortName: "Agumbe",
    id: "western-ghats-zone-4",
    state: "Karnataka",
    risk_level: "High",
    canopy_cover_pct: 88.0,
    coordinates: [
      [75.08, 13.50],
      [75.12, 13.50],
      [75.12, 13.54],
      [75.08, 13.54],
      [75.08, 13.50],
    ],
  },
  {
    name: "Similipal Biosphere Tiger Reserve",
    shortName: "Similipal",
    id: "similipal-core-res-01",
    state: "Odisha",
    risk_level: "Critical",
    canopy_cover_pct: 82.5,
    coordinates: [
      [86.25, 21.80],
      [86.42, 21.80],
      [86.42, 22.05],
      [86.25, 22.05],
      [86.25, 21.80],
    ],
  },
  {
    name: "Bandipur National Park Buffer",
    shortName: "Bandipur",
    id: "bandipur-buffer-south",
    state: "Karnataka",
    risk_level: "Moderate",
    canopy_cover_pct: 74.0,
    coordinates: [
      [76.50, 11.65],
      [76.75, 11.65],
      [76.75, 11.85],
      [76.50, 11.85],
      [76.50, 11.65],
    ],
  },
  {
    name: "Dandeli Wildlife Corridor Compartment 3",
    shortName: "Dandeli",
    id: "dandeli-corridor-cmp3",
    state: "Karnataka",
    risk_level: "High",
    canopy_cover_pct: 85.0,
    coordinates: [
      [74.55, 15.15],
      [74.75, 15.15],
      [74.75, 15.35],
      [74.55, 15.35],
      [74.55, 15.15],
    ],
  },
];

function formatCompactGeoJson(coords: number[][]) {
  const coordLines = coords.map((c) => `      [${c[0]}, ${c[1]}]`).join(",\n");
  return `{\n  "type": "Polygon",\n  "coordinates": [\n    [\n${coordLines}\n    ]\n  ]\n}`;
}

interface RegisterAoiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterAoiModal({ isOpen, onClose }: RegisterAoiModalProps) {
  const { addRegion } = useApp();
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState("Kancha Gachibowli (SC Order 2025)");
  const [id, setId] = useState("kancha-gachibowli-hyd");
  const [state, setState] = useState("Telangana");
  const [riskLevel, setRiskLevel] = useState<"Low" | "Moderate" | "High" | "Critical">("Critical");
  const [canopyCover, setCanopyCover] = useState(62.0);
  const [geojsonText, setGeojsonText] = useState(formatCompactGeoJson(INDIAN_RESERVE_PRESETS[0].coordinates));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setError(null);
      setSuccess(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const loadPreset = (preset: (typeof INDIAN_RESERVE_PRESETS)[0]) => {
    setName(preset.name);
    setId(preset.id);
    setState(preset.state);
    setRiskLevel(preset.risk_level as any);
    setCanopyCover(preset.canopy_cover_pct);
    setGeojsonText(formatCompactGeoJson(preset.coordinates));
    setError(null);
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(geojsonText);
      if (parsed.type === "Polygon" && parsed.coordinates?.[0]) {
        setGeojsonText(formatCompactGeoJson(parsed.coordinates[0]));
      } else {
        setGeojsonText(JSON.stringify(parsed, null, 2));
      }
      setError(null);
    } catch {
      setError("Cannot format: Invalid JSON structure.");
    }
  };

  const getGeometrySummary = () => {
    try {
      const parsed = JSON.parse(geojsonText);
      let coords: number[][] = [];
      if (parsed.type === "Polygon" && parsed.coordinates?.[0]) {
        coords = parsed.coordinates[0];
      } else if (parsed.type === "Feature" && parsed.geometry?.coordinates?.[0]) {
        coords = parsed.geometry.coordinates[0];
      }
      if (coords.length >= 3) {
        const avgLng = coords.reduce((acc, c) => acc + c[0], 0) / coords.length;
        const avgLat = coords.reduce((acc, c) => acc + c[1], 0) / coords.length;
        return {
          valid: true,
          count: coords.length,
          centroidText: `${avgLat.toFixed(4)}° N, ${avgLng.toFixed(4)}° E`,
        };
      }
    } catch {
      // not valid json yet
    }
    return { valid: false, count: 0, centroidText: null };
  };

  const geomSummary = getGeometrySummary();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    let parsedGeom: any;
    try {
      parsedGeom = JSON.parse(geojsonText);
    } catch {
      setError("Invalid JSON format in polygon definition.");
      return;
    }

    if (!name.trim() || !id.trim()) {
      setError("Reserve name and AOI ID are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: AoiCreateRequest = {
        id: id.trim(),
        name: name.trim(),
        state: state.trim() || "Unspecified",
        risk_level: riskLevel,
        canopy_cover_pct: canopyCover,
        geometry_geojson: parsedGeom,
      };

      const res = await registerAoi(payload);

      // Create local Region object and switch global view
      const newRegion: Region = {
        id: res.aoi_id,
        name: `${res.name} — Core Transect`,
        state: state.trim() || "India",
        center: res.center,
        zoom: 12,
        canopy_cover_pct: canopyCover,
        risk_level: riskLevel,
        active_disturbances: 0,
      };

      addRegion(newRegion);
      setSuccess(`Reserve '${res.name}' successfully registered with centroid [${res.center[0].toFixed(4)}, ${res.center[1].toFixed(4)}].`);

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || "Failed to register AOI. Check geometry coordinates.");
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0B1710]/85 backdrop-blur-md modal-scrim-enter cursor-pointer overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-aoi-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-panel border border-sand-300 bg-bone p-5 sm:p-6 space-y-4 shadow-dialog modal-card-enter cursor-default my-auto text-ink-900 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sand pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-control bg-canopy-950 text-bone shadow-sm shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h2 id="register-aoi-title" className="text-base font-bold text-ink-900 leading-snug tracking-tight">
                Register Area of Interest (AOI)
              </h2>
              <p className="text-[11px] text-ink-600">
                Define protected reserve boundary for autonomous Sentinel-2 &amp; Dynamic World monitoring
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

        {/* Quick Presets Strip - Clean 5-Column Grid */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-ink-600">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-signal" />
              <span>Quick Reserve Presets (One-Click Fill)</span>
            </div>
            <span className="text-[10px] text-ink-400 font-mono font-normal">5 pre-seeded tracts</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {INDIAN_RESERVE_PRESETS.map((preset) => {
              const isSelected = id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => loadPreset(preset)}
                  className={`text-left p-2.5 rounded-control border text-xs transition-all relative overflow-hidden ${
                    isSelected
                      ? "bg-moss-100/90 border-canopy-900/60 text-canopy-950 font-semibold ring-1 ring-canopy-900/20 shadow-sm"
                      : "bg-paper-100 hover:bg-paper-200/80 border-sand text-ink-700 font-medium"
                  }`}
                >
                  <div className="truncate font-bold text-[11px] text-ink-900 flex items-center justify-between">
                    <span>{preset.shortName}</span>
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-canopy-900 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-ink-600 truncate mt-0.5">
                    {preset.state} · {preset.canopy_cover_pct}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-0.5">
          {/* Row 1: Reserve Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1.5">
                Reserve / Corridor Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Similipal Biosphere Reserve"
                className="w-full bg-paper-100 border border-sand rounded-control px-3 h-10 text-ink-900 focus-visible:outline-none focus:border-canopy-900 focus:ring-1 focus:ring-canopy-900/20 text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1.5">
                Unique AOI Identifier (Slug)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-400 font-bold select-none pointer-events-none">
                  #
                </span>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g. similipal-core-01"
                  className="w-full bg-paper-100 border border-sand rounded-control pl-7 pr-3 h-10 text-ink-900 font-mono focus-visible:outline-none focus:border-canopy-900 focus:ring-1 focus:ring-canopy-900/20 text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 2: State + Risk Level + Canopy Cover */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1.5">
                State / Jurisdiction
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Odisha"
                className="w-full bg-paper-100 border border-sand rounded-control px-3 h-10 text-ink-900 focus-visible:outline-none focus:border-canopy-900 focus:ring-1 focus:ring-canopy-900/20 text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Risk Level */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1.5">
                  Risk Level
                </label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as any)}
                  className="w-full bg-paper-100 border border-sand rounded-control px-2.5 h-10 text-ink-900 focus-visible:outline-none focus:border-canopy-900 focus:ring-1 focus:ring-canopy-900/20 text-xs font-medium cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Canopy Cover Baseline with clean % suffix */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 truncate">
                    Canopy Cover
                  </label>
                  <span className="text-[10px] font-mono text-moss-700 font-bold num">
                    {canopyCover}%
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="100"
                    step="0.5"
                    value={canopyCover}
                    onChange={(e) => setCanopyCover(parseFloat(e.target.value) || 0)}
                    className="w-full bg-paper-100 border border-sand rounded-control pl-3 pr-7 h-10 text-ink-900 font-mono text-xs font-semibold focus-visible:outline-none focus:border-canopy-900 focus:ring-1 focus:ring-canopy-900/20"
                    required
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-400 font-bold select-none pointer-events-none">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: GeoJSON Boundary Geometry with Header Affordance */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600">
                GeoJSON Boundary Geometry (Polygon Coordinates)
              </label>

              <div className="flex items-center gap-2">
                {geomSummary.valid ? (
                  <span className="text-[10px] font-mono text-moss-700 font-semibold bg-moss-100/70 border border-moss-600/30 px-2 py-0.5 rounded">
                    {geomSummary.count} vertices · Centroid: {geomSummary.centroidText}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded">
                    Requires &gt;= 3 points
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleFormatJson}
                  className="text-[10px] font-mono text-ink-600 hover:text-ink-900 bg-paper-200 hover:bg-paper-300 border border-sand px-1.5 py-0.5 rounded transition-colors flex items-center gap-1"
                  title="Beautify GeoJSON formatting"
                >
                  <Code2 className="h-3 w-3" />
                  <span>Format</span>
                </button>
              </div>
            </div>

            <textarea
              rows={6}
              value={geojsonText}
              onChange={(e) => setGeojsonText(e.target.value)}
              className="w-full bg-paper-100 border border-sand rounded-control p-3 text-ink-900 font-mono text-[11px] leading-relaxed resize-none focus-visible:outline-none focus:border-canopy-900 focus:ring-1 focus:ring-canopy-900/20 font-medium"
              placeholder='{\n  "type": "Polygon",\n  "coordinates": [[[78.326, 17.452], ...]]\n}'
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-control text-xs font-medium border bg-critical-soft text-critical border-critical/30 animate-in fade-in flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
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
              disabled={isSubmitting || !geomSummary.valid}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control border border-canopy-950 bg-canopy-950 hover:bg-canopy-900 px-4 h-10 text-xs font-semibold text-bone shadow-sm transition-colors disabled:opacity-50 active:translate-y-px"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Validating &amp; Storing AOI...</span>
                </>
              ) : (
                <>
                  <MapPin className="h-3.5 w-3.5 text-moss-200" />
                  <span>Register &amp; Activate AOI</span>
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
