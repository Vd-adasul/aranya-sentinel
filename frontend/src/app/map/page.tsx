"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SentinelMap } from "@/components/map/SentinelMap";
import { useApp } from "@/lib/store";
import { DisturbancePolygon } from "@/lib/types";
import { getDisturbances } from "@/lib/api";
import {
  Layers,
  Compass,
  Calendar,
  X,
  ChevronRight,
  TrendingDown,
  Info,
  Clock,
  MapPin,
  Plus,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { RegisterAoiModal } from "@/components/aoi/RegisterAoiModal";

export default function GeospatialMapPage() {
  const { selectedRegion, incidents } = useApp();
  const [disturbances, setDisturbances] = useState<DisturbancePolygon[]>([]);
  const [selectedDisturbanceId, setSelectedDisturbanceId] = useState<string | null>("DIST-WG-01");
  const [timeWindow, setTimeWindow] = useState<"7d" | "14d" | "30d" | "90d">("30d");
  const [mapType, setMapType] = useState<"satellite" | "dark" | "topo">("satellite");
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Layer toggles
  const [showPolygons, setShowPolygons] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showDrones, setShowDrones] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [isRegisterAoiOpen, setIsRegisterAoiOpen] = useState(false);

  useEffect(() => {
    getDisturbances(selectedRegion.id).then(setDisturbances);
  }, [selectedRegion]);

  // Actual filtering by time window based on observation timestamp
  const filteredDisturbances = useMemo(() => {
    if (disturbances.length === 0) return [];
    if (timeWindow === "90d") return disturbances;

    // Use latest timestamp in dataset as reference point
    const timestamps = disturbances.map((d) => new Date(d.timestamp).getTime());
    const maxTime = Math.max(...timestamps);
    const windowDays = timeWindow === "7d" ? 7 : timeWindow === "14d" ? 14 : 30;
    const cutoff = maxTime - windowDays * 24 * 60 * 60 * 1000;

    return disturbances.filter((d) => new Date(d.timestamp).getTime() >= cutoff);
  }, [disturbances, timeWindow]);

  // Active disturbance in inspector
  const activeDisturbance = useMemo(() => {
    const found = filteredDisturbances.find((d) => d.id === selectedDisturbanceId);
    return found || filteredDisturbances[0] || null;
  }, [filteredDisturbances, selectedDisturbanceId]);

  return (
    <AppShell>
      <div className="relative flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden font-sans">
        {/* Unified Top Control Bar (Cleanly separated from the navbar, no overlaps) */}
        <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
          {/* Left Title & Telemetry Pill */}
          <div className="pointer-events-auto flex items-center gap-2.5 rounded-card border border-sand bg-bone/95 backdrop-blur px-3.5 py-2 text-xs shadow-lift text-ink-900">
            <Compass className="h-4 w-4 text-signal shrink-0" />
            <span className="font-bold text-sm text-ink-900 tracking-tight">GIS Intelligence Canvas</span>
            <span className="text-sand">·</span>
            <span className="text-ink-700 font-medium hidden sm:inline">{selectedRegion.name}</span>
            <span className="text-sand hidden sm:inline">·</span>
            <span className="font-mono text-ink-600 num text-[11px]">
              {mouseCoords
                ? `${mouseCoords.lat}° N, ${mouseCoords.lng}° E`
                : `${selectedRegion.center[0]}° N, ${selectedRegion.center[1]}° E`}
            </span>
            <span className="text-sand hidden md:inline">·</span>
            <span className="text-[10px] font-mono text-moss-600 font-semibold bg-moss-50 px-1.5 py-0.5 rounded border border-moss-200 hidden md:inline">
              780M · EPSG:4326
            </span>
          </div>

          {/* Right Combined Bar: Map Mode Switcher + Time Window Filter */}
          <div className="pointer-events-auto flex items-center gap-2 rounded-card border border-sand bg-bone/95 backdrop-blur p-1 text-xs shadow-lift">
            {/* Tile Layer Selector */}
            <div className="flex items-center gap-0.5">
              {(["satellite", "dark", "topo"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMapType(t)}
                  className={`px-2.5 py-1 rounded-md transition-colors text-xs font-semibold capitalize ${
                    mapType === t
                      ? "bg-canopy text-bone shadow-sm"
                      : "text-ink-600 hover:text-ink-900"
                  }`}
                  aria-label={`Switch to ${t} tile layer`}
                >
                  {t === "dark" ? "Tactical" : t}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-sand mx-0.5" />

            {/* Time Window Selector */}
            <div className="flex items-center gap-1">
              <span className="text-ink-600 px-1 text-[11px] font-medium hidden sm:inline">
                Window:
              </span>
              {(["7d", "14d", "30d", "90d"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setTimeWindow(w)}
                  className={`px-2 py-1 rounded-md transition-colors text-xs font-semibold num ${
                    timeWindow === w
                      ? "bg-signal text-bone shadow-sm"
                      : "text-ink-600 hover:text-ink-900"
                  }`}
                  aria-label={`Filter observations within ${w}`}
                >
                  {w}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-sand mx-0.5" />

            {/* Quick Register AOI Button */}
            <button
              type="button"
              onClick={() => setIsRegisterAoiOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-bone hover:bg-paper text-ink-900 border border-sand transition-colors text-xs font-semibold shadow-sm"
              title="Register a new custom Area of Interest"
            >
              <Plus className="h-3.5 w-3.5 text-signal" />
              <span>AOI</span>
            </button>
          </div>
        </div>

        {/* The Fullscreen Map Component (Internal overlays disabled to avoid conflict) */}
        <SentinelMap
          region={selectedRegion}
          incidents={showIncidents ? incidents : []}
          disturbances={showPolygons ? filteredDisturbances : []}
          selectedIncidentId={null}
          onSelectDisturbance={(id) => {
            setSelectedDisturbanceId(id);
            setInspectorOpen(true);
          }}
          showDroneMarkers={showDrones}
          className="h-full w-full rounded-none border-0"
          showInternalHud={false}
          showInternalLayerSwitcher={false}
          showInternalLegend={false}
          mapType={mapType}
          onMapTypeChange={setMapType}
          onMouseMoveCoords={setMouseCoords}
        />

        {/* Unified Bottom Left: Vector Layers & Integrated Visual Legend (No overlap!) */}
        <div className="absolute bottom-4 left-4 z-20 rounded-card border border-sand bg-bone/95 backdrop-blur p-3.5 text-xs shadow-lift space-y-2.5 w-72 text-ink-900">
          <div className="text-xs text-ink-900 font-bold flex items-center justify-between border-b border-sand pb-1.5">
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-signal" />
              <span className="uppercase tracking-wider text-[11px]">Vector Layers &amp; Legend</span>
            </div>
            <span className="text-[10px] font-mono text-ink-600 bg-paper px-1.5 py-0.5 rounded border border-sand">
              {filteredDisturbances.length} active
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Disturbances Layer with Swatch */}
            <label className="flex items-center justify-between cursor-pointer text-ink-900 font-medium hover:text-signal transition-colors">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded bg-signal/60 border border-signal shrink-0" />
                <span>Disturbances</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-ink-600">({filteredDisturbances.length})</span>
                <input
                  type="checkbox"
                  checked={showPolygons}
                  onChange={(e) => setShowPolygons(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-canopy cursor-pointer"
                />
              </div>
            </label>

            {/* Reported Incidents Layer with Swatch */}
            <label className="flex items-center justify-between cursor-pointer text-ink-900 font-medium hover:text-signal transition-colors">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-critical shrink-0 shadow-sm" />
                <span>Reported Incidents</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-ink-600">({incidents.length})</span>
                <input
                  type="checkbox"
                  checked={showIncidents}
                  onChange={(e) => setShowIncidents(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-canopy cursor-pointer"
                />
              </div>
            </label>

            {/* Drone Sorties Layer with Swatch */}
            <label className="flex items-center justify-between cursor-pointer text-ink-900 font-medium hover:text-signal transition-colors">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-water shrink-0 shadow-sm" />
                <span>Drone Sorties</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-water font-semibold">1 Active</span>
                <input
                  type="checkbox"
                  checked={showDrones}
                  onChange={(e) => setShowDrones(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-canopy cursor-pointer"
                />
              </div>
            </label>

            {/* Reserve Geofence (Static Boundary Swatch) */}
            <div className="flex items-center justify-between text-ink-700 text-xs pt-1 border-t border-sand/60">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full border border-dashed border-moss-600 shrink-0" />
                <span>Reserve Geofence</span>
              </div>
              <span className="text-[10px] font-mono text-moss-600 font-medium">12 km buffer</span>
            </div>
          </div>

          {filteredDisturbances.length === 0 && (
            <div className="pt-1.5 text-[11px] text-critical font-medium border-t border-sand/60">
              No disturbances in {timeWindow} window. Try expanding to 90d.
            </div>
          )}
        </div>

        {/* Right Inspector Drawer (Sits below the top bar, clean margins) */}
        {inspectorOpen && activeDisturbance && (
          <aside
            role="dialog"
            aria-label="Disturbance Inspector"
            className="absolute top-16 right-4 bottom-4 z-30 w-80 sm:w-96 rounded-card border border-sand bg-bone shadow-dialog p-5 flex flex-col justify-between text-xs space-y-4 animate-in slide-in-from-right duration-200 overflow-y-auto"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-sand pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-ink-900 text-sm num">
                    {activeDisturbance.id}
                  </span>
                  <StatusBadge
                    label={activeDisturbance.change_type || "Canopy Loss"}
                    variant="high"
                    size="sm"
                  />
                </div>
                <button
                  onClick={() => setInspectorOpen(false)}
                  className="p-1 rounded-control text-ink-600 hover:text-ink-900 hover:bg-paper"
                  aria-label="Close inspector"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <div className="text-[11px] text-ink-600">Primary Encroachment Driver</div>
                <div className="text-base font-bold text-ink-900 mt-0.5">
                  {activeDisturbance.primary_driver}
                </div>
                <div className="text-[11px] text-ink-600 flex items-center gap-1 mt-1 font-mono">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(activeDisturbance.timestamp).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Data Grid */}
              <div className="p-3.5 rounded-control bg-paper border border-sand space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-ink-600">Holdings footprint:</span>
                  <span className="font-mono font-bold text-ink-900 num text-sm">
                    {activeDisturbance.area_hectares} ha
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-600">Spectral delta:</span>
                  <span className="font-mono font-bold text-critical num">
                    ΔNDVI {activeDisturbance.ndvi_drop}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-600">Dynamic World transition:</span>
                  <span className="font-semibold text-ink-900">
                    {activeDisturbance.dominant_class_before || "Trees (84%)"} → {activeDisturbance.dominant_class_after || "Bare Ground"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-600">Model confidence:</span>
                  <span className="font-mono font-bold text-moss-600 num">
                    {(activeDisturbance.confidence * 100).toFixed(0)}% (PyTorch)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-control bg-paper border border-sand text-[11px] text-ink-600 leading-relaxed">
                <div className="flex items-center gap-1 font-semibold text-ink-900 mb-0.5">
                  <Info className="h-3.5 w-3.5 text-moss-600 shrink-0" />
                  <span>Model Output Notice</span>
                </div>
                Probabilities reflect Sentinel-2 multispectral inference. Final legal confirmation requires drone corroboration and forest officer sign-off.
              </div>
            </div>

            <div className="pt-3 border-t border-sand">
              <Link
                href="/satellite"
                className="btn btn-primary w-full text-xs h-10 min-h-[40px]"
              >
                <span>Inspect in bi-temporal swipe</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        )}
        {/* Quick Register AOI Modal */}
        <RegisterAoiModal
          isOpen={isRegisterAoiOpen}
          onClose={() => setIsRegisterAoiOpen(false)}
        />
      </div>
    </AppShell>
  );
}
