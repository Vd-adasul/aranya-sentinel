"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import {
  Globe2,
  ChevronDown,
  Activity,
  Bot,
  ShieldAlert,
  Menu,
  ExternalLink,
  Check,
  X,
  Plus,
} from "lucide-react";
import { RegisterAoiModal } from "@/components/aoi/RegisterAoiModal";

export function Navbar() {
  const {
    regions,
    selectedRegion,
    setSelectedRegion,
    incidents,
    isCopilotOpen,
    setIsCopilotOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    activeAlertCount,
    backendStatus,
  } = useApp();

  const [regionMenuOpen, setRegionMenuOpen] = useState(false);
  const [alertDrawerOpen, setAlertDrawerOpen] = useState(false);
  const [isRegisterAoiOpen, setIsRegisterAoiOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const regionMenuRef = useRef<HTMLDivElement>(null);
  const alertMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (regionMenuRef.current && !regionMenuRef.current.contains(e.target as Node)) {
        setRegionMenuOpen(false);
      }
      if (alertMenuRef.current && !alertMenuRef.current.contains(e.target as Node)) {
        setAlertDrawerOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setRegionMenuOpen(false);
        setAlertDrawerOpen(false);
      }
      // Keyboard shortcut for Copilot (Cmd+K or Ctrl+K), avoiding input/textarea focus
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (
        activeTag === "input" ||
        activeTag === "textarea" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCopilotOpen(!isCopilotOpen);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCopilotOpen, setIsCopilotOpen]);

  const isLandingPage = pathname === "/";
  const urgentIncidents = incidents
    .filter((i) => i.severity === "CRITICAL" || i.status === "New" || i.status === "Escalated")
    .slice(0, 4);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sand bg-bone/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-7 max-w-[1600px] mx-auto w-full">
        {/* Brand & Wordmark */}
        <div className="flex items-center gap-3">
          {!isLandingPage && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex md:hidden items-center justify-center h-11 w-11 rounded-control border border-sand bg-bone hover:bg-paper text-ink-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Link
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy rounded-control py-1 px-1.5"
            aria-label="Aranya Sentinel Field Intelligence Home"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-control bg-canopy text-bone shadow-sm group-hover:bg-canopy-800 transition-colors shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 18c2-4 5-6 8-6s6 2 8 6" />
                <path d="M7 12c1.5-2.5 3.5-3.5 5-3.5s3.5 1 5 3.5" />
                <circle cx="12" cy="5" r="2" fill="currentColor" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans font-bold text-base tracking-tight text-ink-900">
                  Aranya Sentinel
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-sand text-ink-600 bg-paper">
                  अरण्य
                </span>
              </div>
              <p className="text-[11px] font-mono tracking-widest text-ink-600 uppercase -mt-0.5">
                FIELD INTELLIGENCE
              </p>
            </div>
          </Link>

          {!isLandingPage && (
            <div className="hidden lg:flex items-center pl-5 border-l border-sand text-xs text-ink-600 gap-3 font-sans">
              <span className="flex items-center gap-1.5 font-medium text-ink-900">
                <Activity className="h-3.5 w-3.5 text-moss-600" />
                Sentinel-2 Orbit:
              </span>
              <span className="font-mono text-ink-900 num font-medium">14 d pass</span>
              <span className="text-sand">/</span>
              <span>Dynamic World 10m active</span>
            </div>
          )}
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-3">
          {/* Jurisdiction Dropdown Switcher */}
          <div className="relative" ref={regionMenuRef}>
            <button
              onClick={() => setRegionMenuOpen(!regionMenuOpen)}
              className="flex items-center gap-2 px-3.5 h-11 min-h-[44px] rounded-control border border-sand bg-bone hover:bg-paper text-xs font-sans font-semibold text-ink-900 transition-colors shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy"
              aria-expanded={regionMenuOpen}
              aria-haspopup="listbox"
              aria-label={`Active monitoring region: ${selectedRegion.name}`}
            >
              <Globe2 className="h-4 w-4 text-signal shrink-0" />
              <span className="max-w-[130px] sm:max-w-[200px] truncate text-left">
                {selectedRegion.name.split("—")[0].trim()}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-ink-600 shrink-0" />
            </button>

            {regionMenuOpen && (
              <div
                role="listbox"
                className="absolute right-0 mt-2 w-80 rounded-card border border-sand bg-bone shadow-dialog py-1.5 z-50 text-xs font-sans"
              >
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-sand">
                  <span className="text-[11px] font-bold text-ink-600 uppercase tracking-wider">
                    Select Monitoring Transect
                  </span>
                  <button
                    onClick={() => setRegionMenuOpen(false)}
                    className="text-ink-600 hover:text-ink-900 p-0.5 rounded"
                    aria-label="Close region selector"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {regions.map((reg) => {
                  const isSelected = reg.id === selectedRegion.id;
                  return (
                    <button
                      key={reg.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setSelectedRegion(reg);
                        setRegionMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-paper transition-colors ${
                        isSelected ? "bg-moss-100 font-semibold" : ""
                      }`}
                    >
                      <div className="pr-2">
                        <div className="font-semibold text-ink-900 flex items-center gap-1.5">
                          {isSelected && <Check className="h-3.5 w-3.5 text-canopy shrink-0" />}
                          <span>{reg.name}</span>
                        </div>
                        <div className="text-[11px] text-ink-600 font-sans mt-0.5">
                          {reg.state} · <span className="num">{reg.canopy_cover_pct}%</span> canopy
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border shrink-0 ${
                          reg.risk_level === "Critical"
                            ? "border-critical/30 text-critical bg-critical-soft"
                            : reg.risk_level === "High"
                            ? "border-signal/30 text-signal bg-signal-soft"
                            : "border-moss-600/30 text-moss-600 bg-moss-100"
                        }`}
                      >
                        {reg.risk_level}
                      </span>
                    </button>
                  );
                })}
                <div className="p-2 border-t border-sand bg-paper-100">
                  <button
                    type="button"
                    onClick={() => {
                      setRegionMenuOpen(false);
                      setIsRegisterAoiOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-control border border-dashed border-canopy-900/40 hover:border-canopy-950 bg-bone hover:bg-moss-50 text-canopy-950 font-semibold flex items-center justify-center gap-1.5 transition-colors text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 text-signal" />
                    <span>+ Register New AOI Reserve</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Alert Center Trigger */}
          <div className="relative" ref={alertMenuRef}>
            <button
              onClick={() => setAlertDrawerOpen(!alertDrawerOpen)}
              className="relative flex items-center justify-center h-11 w-11 min-h-[44px] rounded-control border border-sand bg-bone hover:bg-paper text-ink-900 transition-colors shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy"
              aria-expanded={alertDrawerOpen}
              aria-label={`Active disturbance alerts, ${activeAlertCount} pending`}
            >
              <ShieldAlert className="h-4 w-4 text-signal" />
              {activeAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-critical text-[10px] font-bold text-bone num shadow-sm">
                  {activeAlertCount}
                </span>
              )}
            </button>

            {alertDrawerOpen && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-card border border-sand bg-bone shadow-dialog z-50 text-xs font-sans overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-paper border-b border-sand">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-signal" />
                    <span className="font-bold text-ink-900">
                      Active Disturbance Alerts
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-critical-soft text-critical text-[11px] font-bold num">
                      {activeAlertCount} active
                    </span>
                    <button
                      onClick={() => setAlertDrawerOpen(false)}
                      className="text-ink-600 hover:text-ink-900 p-0.5 rounded"
                      aria-label="Close alerts panel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-sand max-h-80 overflow-y-auto">
                  {urgentIncidents.length === 0 ? (
                    <div className="p-6 text-center text-ink-600 text-xs">
                      No active critical disturbances in this cycle.
                    </div>
                  ) : (
                    urgentIncidents.map((inc) => (
                      <div
                        key={inc.id}
                        className="p-3.5 hover:bg-paper transition-colors cursor-pointer"
                        onClick={() => {
                          setAlertDrawerOpen(false);
                          router.push(`/incidents?id=${inc.id}`);
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-bold text-ink-900 num">{inc.id}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                              inc.severity === "CRITICAL"
                                ? "bg-critical-soft text-critical border border-critical/30"
                                : "bg-signal-soft text-signal border border-signal/30"
                            }`}
                          >
                            {inc.severity}
                          </span>
                        </div>
                        <p className="text-xs text-ink-600 line-clamp-1 mb-1 font-sans">
                          {inc.description || inc.title}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-ink-600">
                          <span className="num">
                            {inc.affected_area_ha ?? inc.area_hectares ?? 0} ha · {inc.jurisdiction ?? inc.region}
                          </span>
                          <span className="text-canopy font-bold hover:underline flex items-center gap-0.5">
                            Inspect case <ExternalLink className="h-2.5 w-2.5" />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 border-t border-sand bg-paper flex items-center justify-between">
                  <Link
                    href="/incidents"
                    onClick={() => setAlertDrawerOpen(false)}
                    className="w-full py-1 text-center text-xs font-bold text-canopy hover:underline transition-colors block"
                  >
                    View all cases in Incident Matrix →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Ask Sentinel / AI Copilot Trigger */}
          <button
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            className={`flex items-center gap-2 px-3.5 h-11 min-h-[44px] rounded-control border text-xs font-sans font-semibold transition-all shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy ${
              isCopilotOpen
                ? "bg-canopy text-bone border-canopy"
                : "border-sand bg-bone hover:bg-paper text-ink-900"
            }`}
            aria-label="Open Ask Sentinel Copilot drawer"
          >
            <Bot className="h-4 w-4 text-signal shrink-0" />
            <span className="hidden sm:inline">Ask Sentinel</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded border border-sand bg-paper text-ink-600 hidden md:inline">
              ⌘K
            </span>
          </button>

          {/* Truthful System Status */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 h-11 min-h-[44px] rounded-control border border-sand bg-bone text-xs font-sans text-ink-600 shadow-card"
            title={
              backendStatus.status === "healthy"
                ? "PyTorch GPU service active on port 8000"
                : "Standalone demo mode active with sample data"
            }
          >
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                backendStatus.status === "healthy" ? "bg-moss-600" : "bg-signal"
              }`}
            />
            <span className="text-xs font-medium text-ink-900 whitespace-nowrap">
              {backendStatus.status === "healthy" ? "Live PyTorch" : "Local Demo"}
            </span>
          </div>
        </div>
      </div>

      {/* Register New AOI Dialog */}
      <RegisterAoiModal
        isOpen={isRegisterAoiOpen}
        onClose={() => setIsRegisterAoiOpen(false)}
      />
    </header>
  );
}
