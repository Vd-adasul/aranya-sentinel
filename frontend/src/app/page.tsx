"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Globe2,
  GitMerge,
  Satellite,
  Crosshair,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { CopilotDrawer } from "@/components/assistant/CopilotDrawer";
import { ContinuousCameraSequence } from "@/components/home/ContinuousCameraSequence";
import { useApp } from "@/lib/store";

export default function LandingPage() {
  const { incidents, regions } = useApp();
  const totalHectares = incidents.reduce((sum, i) => sum + (i.affected_area_ha ?? i.area_hectares ?? 0), 0).toFixed(1);

  return (
    <div className="min-h-screen bg-canvas text-ink-900 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section (5/7 Opening Split) */}
      <section className="relative border-b border-sand bg-bone pt-12 pb-16 lg:pt-16 lg:pb-20 contour-lines overflow-hidden">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-7">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Column (7 cols): Editorial Headline with Optical Craft & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-moss-100 border border-moss-600/30 text-moss-600 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-moss-600" />
                <span>Western Ghats Cadastral Survey &amp; Intelligence</span>
              </div>

              {/* Headline with 64px+ desktop optical kerning and Instrument Serif accent */}
              <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-sans font-extrabold tracking-[-0.035em] text-ink-900 leading-[1.04]">
                See change.{" "}
                <span className="font-editorial italic font-normal text-canopy tracking-[-0.01em]">
                  Follow the evidence.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-ink-600 leading-relaxed max-w-xl font-normal">
                Inspect forest change, compare observations, and review incidents in one unified workspace. Powered by Sentinel-2 multispectral passes, Dynamic World 10-meter land cover models, and drone computer vision.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/command" className="btn btn-primary h-11 min-h-[44px]">
                  <span>Open command centre</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link href="/map" className="btn btn-secondary h-11 min-h-[44px]">
                  <Globe2 className="h-4 w-4 text-signal" />
                  <span>Explore the map</span>
                </Link>

                <Link href="/verification?id=AS-2026-088" className="btn btn-secondary h-11 min-h-[44px]">
                  <GitMerge className="h-4 w-4 text-moss-600" />
                  <span>Review docket AS-088</span>
                </Link>
              </div>
            </div>

            {/* Right Column (5 cols): Real Terrain Evidence Plate */}
            <div className="lg:col-span-5">
              <div className="relative rounded-panel overflow-hidden border border-sand bg-paper shadow-lift">
                <div className="h-[360px] sm:h-[400px] w-full bg-[#183C2D] relative overflow-hidden flex flex-col justify-between p-5 text-bone">
                  {/* Real Western Ghats Regional Terrain Imagery */}
                  <img
                    src="/imagery/terrain-regional.jpg"
                    alt="Western Ghats Agumbe Core Terrain"
                    className="absolute inset-0 w-full h-full object-cover object-center filter saturate-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-canopy-950/80 via-transparent to-canopy-950/40 pointer-events-none" />

                  {/* Disturbance boundary overlay */}
                  <div className="relative z-10 self-center w-52 h-36 rounded-card border-2 border-signal bg-signal/20 backdrop-blur-[1.5px] flex items-center justify-center shadow-[0_0_20px_rgba(201,108,61,0.5)]">
                    <div className="bg-bone text-ink-900 text-xs font-mono font-bold px-2.5 py-1 rounded shadow-sm">
                      DIST-WG-01 · 14.8 ha
                    </div>
                  </div>

                  {/* Cartographic plate annotations */}
                  <div className="relative z-10 flex items-center justify-between text-xs font-mono">
                    <span className="px-2.5 py-1 rounded bg-canopy-950/85 backdrop-blur border border-moss-600/40 text-bone">
                      TRANSECT: AGUMBE CORE
                    </span>
                    <span className="px-2.5 py-1 rounded bg-canopy-950/85 backdrop-blur border border-moss-600/40 text-moss-200">
                      SENTINEL-2 MSI · 10M
                    </span>
                  </div>

                  {/* Bottom caption strip */}
                  <div className="relative z-10 flex items-center justify-between text-xs font-mono border-t border-moss-600/30 pt-3 bg-canopy-950/60 backdrop-blur rounded px-2 -mx-2">
                    <div>
                      <div className="text-[11px] text-moss-200">COORDINATES</div>
                      <div className="num font-semibold text-bone">13.5165° N, 75.0934° E</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-moss-200">SPECTRAL DELTA</div>
                      <div className="num text-signal font-semibold">ΔNDVI -0.38 (CANOPY LOSS)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Facts Strip */}
      <section className="border-b border-sand bg-paper py-6">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-7">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs font-sans divide-y md:divide-y-0 md:divide-x divide-sand">
            <div className="pt-2 md:pt-0">
              <div className="text-ink-600 font-medium">Monitored holdings</div>
              <div className="text-xl font-bold text-ink-900 num mt-0.5">4 biosphere reserves</div>
              <div className="text-[11px] text-moss-600 mt-0.5 font-medium">Agumbe, Sundarbans, Corbett, Similipal</div>
            </div>

            <div className="pt-2 md:pt-0 md:pl-6">
              <div className="text-ink-600 font-medium">Canopy loss recorded</div>
              <div className="text-xl font-bold text-critical num mt-0.5">{totalHectares} hectares</div>
              <div className="text-[11px] text-ink-600 mt-0.5">Past 30 d observation cycle</div>
            </div>

            <div className="pt-2 md:pt-0 md:pl-6">
              <div className="text-ink-600 font-medium">Machinery geolocated</div>
              <div className="text-xl font-bold text-signal num mt-0.5">7 equipment units</div>
              <div className="text-[11px] text-ink-600 mt-0.5">Excavators and timber haulers</div>
            </div>

            <div className="pt-2 md:pt-0 md:pl-6">
              <div className="text-ink-600 font-medium">Evidence custody seal</div>
              <div className="text-xl font-bold text-moss-600 num mt-0.5">SHA-256 validated</div>
              <div className="text-[11px] text-ink-600 mt-0.5">Court-admissible legal dossier</div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Moment: Continuous Camera Sequence (Regional -> Boundary -> Evidence) */}
      <ContinuousCameraSequence />

      {/* How Evidence Becomes Action: 3-Step Process */}
      <section className="py-16 bg-canvas border-t border-sand relative z-10">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-7 space-y-8">
          <div>
            <div className="text-xs font-sans font-semibold text-ink-600">
              Methodology
            </div>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-ink-900 mt-1">
              How evidence becomes legal action.
            </h2>
            <p className="text-sm text-ink-600 font-sans mt-1 max-w-2xl">
              An unforgeable forensic chain linking satellite sensor telemetry to criminal forest court filings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="atlas-card p-6 space-y-4">
              <div className="h-10 w-10 rounded-control bg-moss-100 border border-moss-600/30 flex items-center justify-center text-moss-600">
                <Satellite className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-moss-600">STEP 01 / SENSORS</div>
                <h3 className="text-lg font-bold text-ink-900">Multispectral change</h3>
                <p className="text-sm text-ink-600 leading-relaxed">
                  Sentinel-2 passes every 14 days calculate drops in NDVI and NBR. Google Dynamic World 10m models verify true tree cover loss versus seasonal crop transitions.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="atlas-card p-6 space-y-4">
              <div className="h-10 w-10 rounded-control bg-signal-soft border border-signal/30 flex items-center justify-center text-signal">
                <Crosshair className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-signal">STEP 02 / RECONNAISSANCE</div>
                <h3 className="text-lg font-bold text-ink-900">Drone aerial computer vision</h3>
                <p className="text-sm text-ink-600 leading-relaxed">
                  Autonomous drone orthomosaics run Grounding DINO Tiny zero-shot object detection to tag excavators, haulers and felled logs, paired with SAM 2 organic segmentation masks.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="atlas-card p-6 space-y-4">
              <div className="h-10 w-10 rounded-control bg-moss-100 border border-moss-600/30 flex items-center justify-center text-canopy">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-canopy">STEP 03 / ENFORCEMENT</div>
                <h3 className="text-lg font-bold text-ink-900">Spatiotemporal correlation</h3>
                <p className="text-sm text-ink-600 leading-relaxed">
                  Correlates centroid offset (&lt;500 m) and observation delta (&lt;7 days) under Wildlife Protection Act 1972, generating SHA-256 certified court dossiers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Monitored Biosphere Reserves Transect Ledger */}
      <section className="py-12 border-t border-sand bg-bone">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-sans font-semibold text-ink-600">
                Coverage
              </div>
              <h2 className="text-2xl font-sans font-bold tracking-tight text-ink-900 mt-1">
                Active biosphere reserve transects.
              </h2>
            </div>
            <Link href="/command" className="btn btn-secondary text-xs h-10 min-h-[40px]">
              <span>View live in command desk →</span>
            </Link>
          </div>

          <div className="atlas-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-sans">
                <thead className="bg-paper border-b border-sand text-xs font-bold text-ink-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Reserve transect</th>
                    <th className="py-3.5 px-5">State</th>
                    <th className="py-3.5 px-5">Area</th>
                    <th className="py-3.5 px-5">Canopy cover</th>
                    <th className="py-3.5 px-5">Active breaches</th>
                    <th className="py-3.5 px-5">Risk tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand">
                  {regions.map((reg) => (
                    <tr key={reg.id} className="hover:bg-sand/30 transition-colors">
                      <td className="py-4 px-5 font-semibold text-ink-900 flex items-center gap-2.5">
                        <MapPin className="h-4 w-4 text-signal shrink-0" />
                        <span>{reg.name}</span>
                      </td>
                      <td className="py-4 px-5 text-ink-600">{reg.state}</td>
                      <td className="py-4 px-5 text-ink-900 font-mono num">{reg.area_sq_km || 650} km²</td>
                      <td className="py-4 px-5 text-ink-900 font-mono num">{reg.canopy_cover_pct}%</td>
                      <td className="py-4 px-5 text-ink-900 font-mono num">{reg.active_incidents ?? reg.active_disturbances} active</td>
                      <td className="py-4 px-5">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                            reg.risk_level === "Critical"
                              ? "border-critical/30 text-critical bg-critical-soft"
                              : reg.risk_level === "High"
                              ? "border-signal/30 text-signal bg-signal-soft"
                              : "border-moss-600/30 text-moss-600 bg-moss-100"
                          }`}
                        >
                          {reg.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sand bg-paper py-8 text-xs text-ink-600 font-sans mt-auto">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-ink-900">Aranya Sentinel</span>
            <span>·</span>
            <span>State Forest Department Environmental Crime Wing</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/command" className="hover:text-ink-900 transition-colors">Command desk</Link>
            <Link href="/map" className="hover:text-ink-900 transition-colors">GIS map</Link>
            <Link href="/reports" className="hover:text-ink-900 transition-colors">Forensic dossiers</Link>
            <Link href="/public" className="hover:text-ink-900 transition-colors">Citizen tip-off</Link>
          </div>
        </div>
      </footer>

      <CopilotDrawer />
    </div>
  );
}
