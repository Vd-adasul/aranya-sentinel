"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/lib/store";
import {
  BarChart3,
  TrendingDown,
  TreeDeciduous,
  Flame,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, ProvenanceBadge } from "@/components/ui/StatusBadge";

export default function AnalyticsPage() {
  const { incidents, regions, selectedRegion } = useApp();
  const [showMethodology, setShowMethodology] = useState(false);

  const totalAreaLoss = incidents.reduce((sum, i) => sum + i.affected_area_ha, 0);
  // IPCC Tier-1 calculation: 180 Mg C / ha in tropical wet evergreen, 3.667 CO2e multiplier
  const carbonLossMg = Math.round(totalAreaLoss * 180);
  const co2Equivalent = Math.round(carbonLossMg * 3.667);

  // Monthly disturbance velocity data (Sample historical observation cycle)
  const monthlyData = [
    { month: "May", hectares: 4.2 },
    { month: "Jun", hectares: 6.8 },
    { month: "Jul", hectares: 5.1 },
    { month: "Aug", hectares: 8.4 },
    { month: "Sep", hectares: 11.2 },
    { month: "Oct", hectares: 14.8 },
  ];

  const maxHectares = Math.max(...monthlyData.map((d) => d.hectares));

  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-7 space-y-6 max-w-[1500px] w-full mx-auto font-sans text-xs">
        {/* Page Header */}
        <PageHeader
          title="Deforestation Velocity &amp; Carbon Accounting"
          scope={`Baseline: IPCC Wet Evergreen · ${selectedRegion.name.split("—")[0].trim()}`}
          description="IPCC Tier-1 biomass carbon emissions and geospatial disturbance velocity ledger across monitored forest transects."
          actions={
            <div className="flex items-center gap-3">
              <ProvenanceBadge source="cached" />
              <button
                onClick={() => setShowMethodology(!showMethodology)}
                className="btn btn-secondary text-xs h-11 min-h-[44px]"
              >
                <Info className="h-4 w-4 text-signal" />
                <span>Methodology &amp; Constants</span>
                {showMethodology ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>
          }
        />

        {/* Methodology Disclosure Accordion */}
        {showMethodology && (
          <div className="atlas-card p-5 space-y-3 bg-paper border border-sand animate-in fade-in">
            <div className="font-bold text-ink-900 text-sm flex items-center gap-2">
              <Info className="h-4 w-4 text-moss-600" />
              <span>IPCC Tier-1 Estimation Methodology &amp; Mathematical Constants</span>
            </div>
            <p className="text-xs text-ink-600 leading-relaxed">
              Biomass calculations adhere to IPCC 2019 Refinement guidelines for National Greenhouse Gas Inventories (Volume 4: Agriculture, Forestry and Other Land Use).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 font-mono text-xs">
              <div className="p-3 rounded-control bg-bone border border-sand">
                <div className="text-ink-600 text-[11px]">Carbon Density Factor</div>
                <div className="text-ink-900 font-bold mt-0.5">180 Mg C / hectare</div>
                <div className="text-[10px] text-ink-600 mt-0.5">Tropical Wet Evergreen Biome</div>
              </div>
              <div className="p-3 rounded-control bg-bone border border-sand">
                <div className="text-ink-600 text-[11px]">CO₂ Equivalent Ratio</div>
                <div className="text-ink-900 font-bold mt-0.5">3.667 (44/12 molecular weight)</div>
                <div className="text-[10px] text-ink-600 mt-0.5">Stoichiometric conversion</div>
              </div>
              <div className="p-3 rounded-control bg-bone border border-sand">
                <div className="text-ink-600 text-[11px]">Passenger Vehicle Benchmark</div>
                <div className="text-ink-900 font-bold mt-0.5">4.6 Metric Tons CO₂ / year</div>
                <div className="text-[10px] text-ink-600 mt-0.5">EPA standard consumer fleet</div>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 High-Impact Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Deforested Area */}
          <div className="atlas-card p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-ink-600 font-medium">
              <span>Total recorded canopy loss</span>
              <TrendingDown className="h-4 w-4 text-critical" />
            </div>
            <div className="text-3xl font-bold text-critical num">
              {totalAreaLoss.toFixed(1)} ha
            </div>
            <div className="text-xs text-ink-600">
              Recorded across {incidents.length} independent disturbance dockets.
            </div>
          </div>

          {/* Carbon Loss */}
          <div className="atlas-card p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-ink-600 font-medium">
              <span>Biomass carbon stock loss</span>
              <TreeDeciduous className="h-4 w-4 text-canopy" />
            </div>
            <div className="text-3xl font-bold text-ink-900 num">
              {carbonLossMg.toLocaleString()} Mg C
            </div>
            <div className="text-xs text-ink-600">
              Estimated ~180 Mg sequestered carbon per hectare released to atmosphere.
            </div>
          </div>

          {/* CO2 Equivalent */}
          <div className="atlas-card p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-ink-600 font-medium">
              <span>CO₂ equivalent impact</span>
              <Flame className="h-4 w-4 text-signal" />
            </div>
            <div className="text-3xl font-bold text-signal num">
              {co2Equivalent.toLocaleString()} MT CO₂e
            </div>
            <div className="text-xs text-ink-600">
              Equivalent to annual emissions of 6,280 passenger automobiles.
            </div>
          </div>
        </div>

        {/* 6-Month Deforestation Velocity Graph */}
        <div className="atlas-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-sand pb-3">
            <div>
              <div className="font-bold text-ink-900 text-sm">
                6-Month clearing acceleration velocity (Sample Observation Series)
              </div>
              <div className="text-xs text-ink-600 mt-0.5">
                Monthly verified canopy disturbance rate in hectares
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-critical-soft text-critical border border-critical/30 font-bold num">
              +252% acceleration vs May
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-4 pt-4 px-2">
            {monthlyData.map((d) => {
              const heightPct = Math.round((d.hectares / maxHectares) * 100);
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-xs text-ink-600 font-mono font-bold num opacity-80 group-hover:opacity-100 group-hover:text-ink-900">
                    {d.hectares} ha
                  </span>
                  <div className="w-full bg-paper rounded-control h-40 flex items-end overflow-hidden p-1 border border-sand shadow-inner">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-control transition-all ${
                        d.month === "Oct"
                          ? "bg-critical"
                          : d.month === "Sep"
                          ? "bg-signal"
                          : "bg-moss-600"
                      }`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-ink-900">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Biosphere Reserves Vulnerability Index Table */}
        <div className="atlas-card overflow-hidden">
          <div className="p-4 border-b border-sand bg-paper font-bold text-ink-900 text-xs">
            Reserve vulnerability and disturbance index
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bone text-ink-600 border-b border-sand font-semibold">
                <tr>
                  <th className="py-3 px-4">Biosphere reserve</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Total area</th>
                  <th className="py-3 px-4">Remaining canopy</th>
                  <th className="py-3 px-4">Active disturbances</th>
                  <th className="py-3 px-4">Encroachment risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand font-sans">
                {regions.map((reg) => (
                  <tr key={reg.id} className="hover:bg-sand/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-ink-900">{reg.name}</td>
                    <td className="py-3 px-4 text-ink-600">{reg.state}</td>
                    <td className="py-3 px-4 text-ink-900 font-mono num">{reg.area_sq_km || 650} km²</td>
                    <td className="py-3 px-4 text-ink-900 font-mono num">{reg.canopy_cover_pct}%</td>
                    <td className="py-3 px-4 text-ink-900 font-mono num">{reg.active_disturbances}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
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
    </AppShell>
  );
}
