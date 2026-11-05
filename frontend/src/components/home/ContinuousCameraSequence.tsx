"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Crosshair, ShieldCheck, MapPin } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ContinuousCameraSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cameraTargetRef = useRef<HTMLDivElement>(null);
  const satelliteRecentRef = useRef<HTMLDivElement>(null);
  const boundaryOverlayRef = useRef<HTMLDivElement>(null);
  const evidenceRecordRef = useRef<HTMLDivElement>(null);
  const hudStage1Ref = useRef<HTMLDivElement>(null);
  const hudStage2Ref = useRef<HTMLDivElement>(null);
  const hudStage3Ref = useRef<HTMLDivElement>(null);

  const [activeStage, setActiveStage] = useState<1 | 2 | 3>(1);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current || !cameraTargetRef.current) return;

    const ctx = gsap.context(() => {
      // Single continuous camera timeline:
      // Stage 1 (Regional Terrain: 0.0 - 0.25)
      // Transition 1 -> 2 (0.25 - 0.50)
      // Stage 2 Hold (Boundary Lifts: 0.50 - 0.65)
      // Transition 2 -> 3 (0.65 - 0.82)
      // Stage 3 Hold (Forensic Evidence Settles: 0.82 - 1.00)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 64px", // Pins comfortably below the 64px sticky navbar
          end: "+=2200",    // Generous scroll distance allowing every stage to hold
          scrub: 0.8,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.35) {
              setActiveStage(1);
            } else if (p < 0.68) {
              setActiveStage(2);
            } else {
              setActiveStage(3);
            }
          },
        },
      });

      timelineRef.current = tl;

      // Initial state (Stage 1: Regional Terrain)
      gsap.set(cameraTargetRef.current, {
        scale: 1,
        transformOrigin: "42% 48%",
      });
      gsap.set(satelliteRecentRef.current, {
        opacity: 0,
      });
      gsap.set(boundaryOverlayRef.current, {
        opacity: 0,
        scale: 0.85,
        borderColor: "#C96C3D",
        backgroundColor: "rgba(201, 108, 61, 0.18)",
      });
      gsap.set(evidenceRecordRef.current, {
        opacity: 0,
        y: 35,
        pointerEvents: "none",
      });
      gsap.set(hudStage1Ref.current, { opacity: 1, y: 0 });
      gsap.set(hudStage2Ref.current, { opacity: 0, y: -8 });
      gsap.set(hudStage3Ref.current, { opacity: 0, y: -8 });

      // Unbroken Camera Movement Timeline (3.0s total normalized duration)
      tl
        // Phase 1 Hold: Regional overview holds from 0.0 to 0.4s
        .to({}, { duration: 0.4 })

        // Phase 1 -> Phase 2 Transition (0.4s - 1.3s)
        .to(
          cameraTargetRef.current,
          {
            scale: 2.15,
            ease: "power2.inOut",
            duration: 0.9,
          },
          "zoomToBoundary"
        )
        .to(
          boundaryOverlayRef.current,
          {
            opacity: 1,
            scale: 1,
            ease: "power2.out",
            duration: 0.6,
          },
          "zoomToBoundary+=0.2"
        )
        .to(
          hudStage1Ref.current,
          {
            opacity: 0,
            y: 8,
            duration: 0.3,
          },
          "zoomToBoundary"
        )
        .to(
          hudStage2Ref.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
          },
          "zoomToBoundary+=0.3"
        )

        // Phase 2 Hold: Boundary inspection holds steady from 1.3s to 1.8s
        .to({}, { duration: 0.5 })

        // Phase 2 -> Phase 3 Transition (1.8s - 2.5s): Settles into Forensic Record
        .to(
          cameraTargetRef.current,
          {
            scale: 2.7,
            ease: "power1.inOut",
            duration: 0.7,
          },
          "settleEvidence"
        )
        .to(
          satelliteRecentRef.current,
          {
            opacity: 1,
            ease: "power1.out",
            duration: 0.6,
          },
          "settleEvidence"
        )
        .to(
          boundaryOverlayRef.current,
          {
            borderColor: "#B94236",
            backgroundColor: "rgba(185, 66, 54, 0.28)",
            boxShadow: "0 0 30px rgba(185, 66, 54, 0.7)",
            duration: 0.5,
          },
          "settleEvidence"
        )
        .to(
          hudStage2Ref.current,
          {
            opacity: 0,
            y: 8,
            duration: 0.3,
          },
          "settleEvidence"
        )
        .to(
          hudStage3Ref.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
          },
          "settleEvidence+=0.2"
        )
        .to(
          evidenceRecordRef.current,
          {
            opacity: 1,
            y: 0,
            pointerEvents: "auto",
            duration: 0.5,
            ease: "power2.out",
          },
          "settleEvidence+=0.2"
        )

        // Phase 3 Hold: Forensic evidence record holds steady from 2.5s to 3.2s
        .to({}, { duration: 0.7 });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const jumpToStage = (stage: 1 | 2 | 3) => {
    setActiveStage(stage);
    if (!timelineRef.current || !timelineRef.current.scrollTrigger) return;
    // Normalized targets inside the hold phases:
    // Stage 1: 0.08, Stage 2: 0.52, Stage 3: 0.90
    const targets = { 1: 0.08, 2: 0.52, 3: 0.90 };
    const progress = targets[stage];
    const trigger = timelineRef.current.scrollTrigger;
    if (trigger) {
      const scrollPos = trigger.start + progress * (trigger.end - trigger.start);
      window.scrollTo({ top: scrollPos, behavior: "smooth" });
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full relative z-20 bg-canvas overflow-hidden pt-6 sm:pt-8 pb-10 border-b border-sand"
    >
      <div className="w-full flex flex-col justify-start px-4 sm:px-7 max-w-[1440px] mx-auto">
        {/* Sequence Super-Header (Safely below sticky navbar with 28px+ clearance) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-canopy-950 text-bone text-xs font-mono font-medium border border-moss-600/40">
              <span className="h-2 w-2 rounded-full bg-signal animate-pulse" />
              <span>SIGNATURE MOTION SEQUENCE · UNBROKEN CAMERA MOVE</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-sans font-bold tracking-tight text-ink-900 mt-1.5">
              From regional topography to court evidence in one sweep.
            </h2>
          </div>

          {/* Interactive Stage Selectors */}
          <div className="flex items-center gap-2 bg-paper p-1 rounded-control border border-sand shadow-sm self-start md:self-auto">
            <button
              onClick={() => jumpToStage(1)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${
                activeStage === 1
                  ? "bg-canopy text-bone shadow-sm"
                  : "text-ink-600 hover:text-ink-900"
              }`}
            >
              01 · REGION
            </button>
            <span className="text-sand">/</span>
            <button
              onClick={() => jumpToStage(2)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${
                activeStage === 2
                  ? "bg-signal text-bone shadow-sm"
                  : "text-ink-600 hover:text-ink-900"
              }`}
            >
              02 · BOUNDARY
            </button>
            <span className="text-sand">/</span>
            <button
              onClick={() => jumpToStage(3)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${
                activeStage === 3
                  ? "bg-critical text-bone shadow-sm"
                  : "text-ink-600 hover:text-ink-900"
              }`}
            >
              03 · FORENSIC
            </button>
          </div>
        </div>

        {/* Forensic Cartography Viewport (Bounded height fits cleanly on all screens) */}
        <div
          ref={viewportRef}
          className="relative w-full h-[400px] sm:h-[460px] lg:h-[490px] rounded-panel border-2 border-canopy-950 bg-[#0F251B] overflow-hidden shadow-dialog select-none"
        >
          {/* Continuous Zoom Camera Container */}
          <div
            ref={cameraTargetRef}
            className="absolute inset-0 w-full h-full will-change-transform"
          >
            {/* Real Regional Terrain Raster */}
            <img
              src="/imagery/terrain-regional.jpg"
              alt="Western Ghats Agumbe regional topography"
              className="absolute inset-0 w-full h-full object-cover object-center filter saturate-[1.1] contrast-[1.05]"
            />

            {/* GSAP-Controlled Real Satellite Deforestation Layer */}
            <div
              ref={satelliteRecentRef}
              className="absolute inset-0 w-full h-full will-change-opacity pointer-events-none"
            >
              <img
                src="/imagery/satellite-recent.jpg"
                alt="Sentinel-2 verified logging breach"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Cartographic Coordinate Crosshairs Grid */}
            <svg
              className="absolute inset-0 w-full h-full opacity-25 pointer-events-none stroke-moss-200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid-cross-cam" width="110" height="110" patternUnits="userSpaceOnUse">
                  <path d="M 55 45 L 55 65 M 45 55 L 65 55" strokeWidth="0.75" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-cross-cam)" />
            </svg>

            {/* Cadastral Boundary Polygon (Lifts, zooms, turns forensic red) */}
            <div
              ref={boundaryOverlayRef}
              className="absolute top-[38%] left-[36%] w-[22%] h-[24%] rounded-xl border-2 shadow-[0_0_25px_rgba(201,108,61,0.6)] backdrop-blur-[1px] flex flex-col justify-between p-2 pointer-events-none will-change-transform will-change-opacity"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold bg-signal text-bone px-1.5 py-0.5 rounded shadow">
                  DIST-WG-01 · 14.8 HA
                </span>
                <span className="font-mono text-[8px] bg-black/70 text-bone px-1 rounded">
                  13.5165°N
                </span>
              </div>
              <div className="text-[8px] font-mono text-bone bg-black/75 px-1 py-0.5 rounded flex items-center justify-between">
                <span>COMPARTMENT 4B</span>
                <span className="text-signal font-bold">CANOPY LOSS</span>
              </div>
            </div>
          </div>

          {/* Cartographic Plate Frame Vignette */}
          <div className="absolute inset-0 pointer-events-none border border-moss-600/30 rounded-panel bg-[radial-gradient(circle_at_center,transparent_60%,rgba(15,37,27,0.75)_100%)]" />

          {/* Stage 1 HUD Overlay: Regional Terrain Telemetry */}
          <div
            ref={hudStage1Ref}
            className="absolute inset-x-5 top-5 flex items-start justify-between text-bone font-mono text-xs pointer-events-none"
          >
            <div className="bg-canopy-950/90 border border-moss-600/50 backdrop-blur px-3 py-2 rounded-control space-y-0.5 shadow-lift">
              <div className="text-[10px] text-moss-200">STAGE 01 · REGIONAL CARTOGRAPHY</div>
              <div className="font-bold flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-signal" />
                <span>AGUMBE RAINFOREST BIOSPHERE (ELEV 820m)</span>
              </div>
              <div className="text-[11px] text-moss-200 num">GRID 13.5165° N, 75.0934° E · SCALE 1:50,000</div>
            </div>

            <div className="bg-canopy-950/90 border border-moss-600/50 backdrop-blur px-3 py-2 rounded-control text-right space-y-0.5 shadow-lift hidden sm:block">
              <div className="text-[10px] text-moss-200">ACTIVE OBSERVATION</div>
              <div className="font-bold text-bone">SENTINEL-2 MSI MULTISPECTRAL</div>
              <div className="text-[11px] text-signal font-bold">SCROLL DOWN TO ENGAGE CAMERA →</div>
            </div>
          </div>

          {/* Stage 2 HUD Overlay: Cadastral Boundary Selection */}
          <div
            ref={hudStage2Ref}
            className="absolute inset-x-5 top-5 flex items-start justify-between text-bone font-mono text-xs pointer-events-none"
          >
            <div className="bg-canopy-950/90 border border-signal/60 backdrop-blur px-3.5 py-2 rounded-control space-y-0.5 shadow-lift">
              <div className="text-[10px] text-signal font-bold">STAGE 02 · BOUNDARY SELECTION &amp; LIFT</div>
              <div className="font-bold flex items-center gap-1.5 text-bone">
                <Crosshair className="h-3.5 w-3.5 text-signal" />
                <span>PARCEL DIST-WG-01 · 14.8 HECTARES</span>
              </div>
              <div className="text-[11px] text-moss-200 num">CADASTRAL SURVEY COMPARTMENT 4B · HIGH RISK</div>
            </div>

            <div className="bg-canopy-950/90 border border-signal/60 backdrop-blur px-3.5 py-2 rounded-control text-right space-y-0.5 shadow-lift hidden sm:block">
              <div className="text-[10px] text-moss-200">DYNAMIC WORLD 10M CLASSIFIER</div>
              <div className="font-bold text-signal">TREE COVER DELTA: -49.0%</div>
              <div className="text-[11px] text-moss-200">BARE GROUND PROBABILITY: 44%</div>
            </div>
          </div>

          {/* Stage 3 HUD Overlay: Forensic Evidence Telemetry */}
          <div
            ref={hudStage3Ref}
            className="absolute inset-x-5 top-5 flex items-start justify-between text-bone font-mono text-xs pointer-events-none"
          >
            <div className="bg-canopy-950/95 border border-critical/60 backdrop-blur px-3.5 py-2 rounded-control space-y-0.5 shadow-lift">
              <div className="text-[10px] text-critical font-bold">STAGE 03 · ADMISSIBLE FORENSIC EVIDENCE</div>
              <div className="font-bold flex items-center gap-1.5 text-bone">
                <ShieldCheck className="h-3.5 w-3.5 text-moss-500" />
                <span>LEGAL DOCKET AS-2026-088 VERIFIED</span>
              </div>
              <div className="text-[11px] text-moss-200 num">SHA-256 DIGEST: e8f3a9c4... · SEC. 35 WPA 1972</div>
            </div>

            <div className="bg-canopy-950/95 border border-critical/60 backdrop-blur px-3.5 py-2 rounded-control text-right space-y-0.5 shadow-lift hidden sm:block">
              <div className="text-[10px] text-moss-200">GROUND RECONNAISSANCE</div>
              <div className="font-bold text-critical">2 EXCAVATORS GEOLOCATED</div>
              <div className="text-[11px] text-moss-200 num">DRONE SORTIE AGUMBE-04</div>
            </div>
          </div>

          {/* Settled Evidence Docket Floating Card (At Stage 3: Fully Visible & Clickable) */}
          <div
            ref={evidenceRecordRef}
            className="absolute bottom-5 inset-x-4 sm:inset-x-6 z-30"
          >
            <div className="bg-paper/95 border border-sand rounded-card p-3.5 sm:p-4 shadow-dialog backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-ink-900">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="font-mono text-xs font-bold text-critical bg-critical-soft px-2 py-0.5 rounded border border-critical/30">
                    CRITICAL BREACH CONFIRMED
                  </span>
                  <span className="text-xs text-ink-600 font-mono">DOCKET: AS-2026-088</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-ink-900">
                  Agumbe Rainforest Compartment 4B · 14.8 ha illegal timber harvesting corridor
                </div>
                <div className="text-[11px] text-ink-600">
                  Correlated across Sentinel-2 pass S2A (25 Oct 2026) and RTK Drone Sortie #4 (26 Oct 2026).
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/verification?id=AS-2026-088"
                  className="btn btn-signal text-xs h-9 min-h-[36px]"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Inspect dossier</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  href="/command"
                  className="btn btn-secondary text-xs h-9 min-h-[36px]"
                >
                  <span>Command desk</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Permanent Coordinate Bar */}
          <div className="absolute bottom-1.5 left-5 right-5 flex items-center justify-between text-[10px] font-mono text-moss-200/70 pointer-events-none border-t border-moss-600/20 pt-0.5">
            <span>ARANYA SENTINEL · CADASTRAL TELEMETRY CORE</span>
            <span className="num">LAT 13.5165° N · LON 75.0934° E · WGS 84</span>
          </div>
        </div>
      </div>
    </div>
  );
}
