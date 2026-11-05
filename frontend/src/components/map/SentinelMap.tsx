"use client";

import React, { useEffect, useRef, useState } from "react";
import { Incident, DisturbancePolygon, Region } from "@/lib/types";
import { Compass, Crosshair } from "lucide-react";

export interface SentinelMapProps {
  region: Region;
  incidents?: Incident[];
  disturbances?: DisturbancePolygon[];
  selectedIncidentId?: string | null;
  onSelectIncident?: (id: string) => void;
  onSelectDisturbance?: (id: string) => void;
  showDroneMarkers?: boolean;
  className?: string;
  showInternalHud?: boolean;
  showInternalLayerSwitcher?: boolean;
  showInternalLegend?: boolean;
  mapType?: "satellite" | "dark" | "topo";
  onMapTypeChange?: (type: "satellite" | "dark" | "topo") => void;
  onMouseMoveCoords?: (coords: { lat: number; lng: number }) => void;
}

export function SentinelMap({
  region,
  incidents = [],
  disturbances = [],
  selectedIncidentId,
  onSelectIncident,
  onSelectDisturbance,
  showDroneMarkers = true,
  className = "h-[500px] w-full",
  showInternalHud = true,
  showInternalLayerSwitcher = true,
  showInternalLegend = true,
  mapType: propMapType,
  onMapTypeChange,
  onMouseMoveCoords,
}: SentinelMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const [internalMapType, setInternalMapType] = useState<"satellite" | "dark" | "topo">("satellite");
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);

  const activeMapType = propMapType || internalMapType;

  const handleMapTypeSelect = (type: "satellite" | "dark" | "topo") => {
    if (onMapTypeChange) {
      onMapTypeChange(type);
    } else {
      setInternalMapType(type);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      const L = (await import("leaflet")).default;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: region.center,
          zoom: region.zoom,
          zoomControl: false,
          attributionControl: false,
        });

        // Standard bottom-right scale control
        L.control.scale({ imperial: false, position: "bottomright" }).addTo(map);

        map.on("mousemove", (e: any) => {
          if (isMounted) {
            const coords = {
              lat: Number(e.latlng.lat.toFixed(5)),
              lng: Number(e.latlng.lng.toFixed(5)),
            };
            setMouseCoords(coords);
            if (onMouseMoveCoords) {
              onMouseMoveCoords(coords);
            }
          }
        });

        mapInstanceRef.current = map;
        layerGroupRef.current = L.layerGroup().addTo(map);
      }

      const map = mapInstanceRef.current;
      map.setView(region.center, region.zoom);

      // Base tile layers (Free, public GIS services with zero watermarks or key gating)
      const tileLayers: Record<string, string> = {
        satellite:
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        dark:
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        topo: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      };

      map.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });

      L.tileLayer(tileLayers[activeMapType], {
        maxZoom: 18,
      }).addTo(map);

      // Overlay layers
      const lg = layerGroupRef.current;
      lg.clearLayers();

      // 1. Protected Geofence
      const reserveCircle = L.circle(region.center, {
        radius: 12000,
        color: "#52765C",
        weight: 2,
        dashArray: "6, 8",
        fillColor: "#52765C",
        fillOpacity: 0.05,
      }).bindTooltip(`PROTECTED RESERVE GEOFENCE: ${region.name}`, {
        className: "bg-bone text-ink-900 border border-sand text-xs font-sans shadow-md",
      });
      lg.addLayer(reserveCircle);

      // 2. Disturbance Polygons
      disturbances.forEach((dist) => {
        const latLngs: [number, number][] = dist.coordinates.map(([lng, lat]) => [lat, lng]);

        const isCrit = dist.ndvi_drop < -0.35;
        const poly = L.polygon(latLngs, {
          color: isCrit ? "#B94236" : "#C96C3D",
          weight: 2.5,
          fillColor: isCrit ? "#B94236" : "#C96C3D",
          fillOpacity: 0.35,
        });

        poly.bindPopup(`
          <div class="font-sans text-xs p-1 space-y-1.5">
            <div class="font-bold text-ink-900 flex items-center justify-between border-b border-sand pb-1">
              <span class="font-mono">${dist.id}</span>
              <span class="text-critical font-mono font-bold">${dist.area_hectares} ha</span>
            </div>
            <div class="text-ink-600">
              Driver: <span class="font-semibold text-ink-900">${dist.primary_driver}</span>
            </div>
            <div class="text-ink-600">
              Tree Cover Loss: <span class="text-critical font-bold">${Math.round((dist.tree_prob_before - dist.tree_prob_after) * 100)}%</span>
            </div>
            <div class="text-[11px] text-ink-600 font-mono">
              NDVI Δ: ${dist.ndvi_drop} · Conf: ${(dist.confidence * 100).toFixed(0)}%
            </div>
          </div>
        `);

        poly.on("click", () => {
          if (onSelectDisturbance) onSelectDisturbance(dist.id);
        });

        lg.addLayer(poly);
      });

      // 3. Incident Beacons
      incidents.forEach((inc) => {
        const isSelected = inc.id === selectedIncidentId;
        const isCrit = inc.severity === "CRITICAL";

        const iconHtml = `
          <div class="relative flex items-center justify-center">
            <div class="absolute h-7 w-7 rounded-full ${
              isCrit ? "bg-critical/30" : "bg-signal/30"
            } animate-ping"></div>
            <div class="h-4 w-4 rounded-full border-2 border-white ${
              isCrit ? "bg-critical" : "bg-signal"
            } ${isSelected ? "ring-2 ring-canopy scale-125" : ""} shadow-sm"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "custom-beacon",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker(inc.coordinates, { icon: customIcon });

        marker.bindPopup(`
          <div class="font-sans text-xs p-1 space-y-1.5 max-w-[240px]">
            <div class="flex items-center justify-between border-b border-sand pb-1">
              <span class="font-bold text-ink-900 font-mono">${inc.id}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isCrit ? "bg-critical-soft text-critical border border-critical/30" : "bg-signal-soft text-signal border border-signal/30"
              }">${inc.severity}</span>
            </div>
            <div class="font-medium text-ink-900 line-clamp-2 leading-snug">
              ${inc.title}
            </div>
            <div class="text-[11px] text-ink-600 flex justify-between border-t border-sand pt-1">
              <span>Area: ${inc.affected_area_ha} ha</span>
              <span class="text-critical font-bold">-${inc.tree_loss_pct}% canopy</span>
            </div>
          </div>
        `);

        marker.on("click", () => {
          if (onSelectIncident) onSelectIncident(inc.id);
        });

        lg.addLayer(marker);
      });

      // 4. Drone Recon Flight Markers
      if (showDroneMarkers) {
        const dronePositions = [
          {
            id: "DRN-MSSN-101",
            coords: [13.5165, 75.0934],
            desc: "Active Drone Recon Flight · 120m AGL · Zenmuse H20T",
          },
        ];

        dronePositions.forEach((d) => {
          const droneHtml = `
            <div class="relative flex items-center justify-center">
              <div class="h-3.5 w-3.5 rounded-full bg-water border-2 border-white shadow"></div>
              <div class="absolute -top-4 text-[10px] font-mono font-bold text-bone px-1.5 rounded bg-canopy-950 border border-sand whitespace-nowrap shadow-sm">
                DRN-101
              </div>
            </div>
          `;
          const droneIcon = L.divIcon({
            html: droneHtml,
            className: "drone-pin",
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });
          const dMarker = L.marker(d.coords as [number, number], { icon: droneIcon });
          dMarker.bindPopup(`
            <div class="font-sans text-xs p-1">
              <div class="font-bold text-canopy font-mono">${d.id}</div>
              <div class="text-xs text-ink-600 mt-0.5">${d.desc}</div>
              <div class="text-[11px] text-moss-600 font-semibold mt-1">STATUS: TELEMETRY STREAMING</div>
            </div>
          `);
          lg.addLayer(dMarker);
        });
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [region, incidents, disturbances, activeMapType, selectedIncidentId, showDroneMarkers]);

  return (
    <div className={`relative overflow-hidden rounded-card border border-sand bg-[#17241D] ${className}`}>
      {/* Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Cartographic Crosshair overlay in center */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
        <div className="h-8 w-8 border border-white/50 rounded-full flex items-center justify-center">
          <Crosshair className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Optional Top Left: GIS HUD & Coordinate Bar */}
      {showInternalHud && (
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 font-sans text-xs max-w-[280px]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-control border border-sand bg-bone/95 backdrop-blur text-ink-900 shadow-lift">
            <Compass className="h-3.5 w-3.5 text-signal shrink-0" />
            <span className="font-bold truncate">{region.name.split("—")[0].trim()}</span>
            <span className="text-sand">·</span>
            <span className="font-mono text-ink-600 num text-[11px] shrink-0">
              {mouseCoords
                ? `${mouseCoords.lat}° N, ${mouseCoords.lng}° E`
                : `${region.center[0]}° N, ${region.center[1]}° E`}
            </span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-control border border-sand bg-bone/90 backdrop-blur text-[10px] font-mono text-ink-600">
            <span>780M</span>
            <span>·</span>
            <span className="text-moss-600 font-semibold">EPSG:4326</span>
          </div>
        </div>
      )}

      {/* Optional Top Right: Layer Switcher */}
      {showInternalLayerSwitcher && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-control border border-sand bg-bone/95 backdrop-blur p-1 text-xs font-sans shadow-lift">
          <button
            onClick={() => handleMapTypeSelect("satellite")}
            className={`px-2.5 py-1 rounded-md transition-colors text-xs font-medium ${
              activeMapType === "satellite"
                ? "bg-canopy text-bone font-semibold"
                : "text-ink-600 hover:text-ink-900"
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => handleMapTypeSelect("dark")}
            className={`px-2.5 py-1 rounded-md transition-colors text-xs font-medium ${
              activeMapType === "dark"
                ? "bg-canopy text-bone font-semibold"
                : "text-ink-600 hover:text-ink-900"
            }`}
          >
            Tactical
          </button>
          <button
            onClick={() => handleMapTypeSelect("topo")}
            className={`px-2.5 py-1 rounded-md transition-colors text-xs font-medium ${
              activeMapType === "topo"
                ? "bg-canopy text-bone font-semibold"
                : "text-ink-600 hover:text-ink-900"
            }`}
          >
            Topo
          </button>
        </div>
      )}

      {/* Optional Bottom Left: Map Legend */}
      {showInternalLegend && (
        <div className="absolute bottom-3 left-3 z-10 rounded-control border border-sand bg-bone/95 backdrop-blur px-3 py-2 text-[11px] font-sans text-ink-800 shadow-lift max-w-[340px]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-critical" />
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded bg-signal/50 border border-signal" />
              <span>Disturbance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full border border-moss-600 border-dashed" />
              <span>Geofence</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-water" />
              <span>Drone</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
