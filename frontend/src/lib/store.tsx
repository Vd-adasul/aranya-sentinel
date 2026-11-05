"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Region, Incident } from "./types";
import { MONITORING_REGIONS, INITIAL_INCIDENTS } from "./data";
import { getBackendHealth, getIncidents, getRegions, updateIncidentStatus } from "./api";

interface AppContextType {
  regions: Region[];
  selectedRegion: Region;
  setSelectedRegion: (r: Region) => void;
  refreshRegions: () => Promise<void>;
  addRegion: (r: Region) => void;
  incidents: Incident[];
  refreshIncidents: () => Promise<void>;
  addIncident: (inc: Incident) => void;
  updateIncident: (id: string, update: { status?: string; assigned_analyst?: string; investigation_notes?: string }) => Promise<{ success: boolean; error?: string; incident?: Incident }>;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  backendStatus: { status: string; device?: string; dino_loaded?: boolean };
  activeAlertCount: number;
  lastActiveIncidentId: string | null;
  setLastActiveIncidentId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [regions, setRegions] = useState<Region[]>(MONITORING_REGIONS);
  const [selectedRegion, setSelectedRegion] = useState<Region>(MONITORING_REGIONS[0]);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [lastActiveIncidentId, setLastActiveIncidentIdState] = useState<string | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<{ status: string; device?: string; dino_loaded?: boolean }>({
    status: "checking",
  });

  const setLastActiveIncidentId = (id: string | null) => {
    setLastActiveIncidentIdState(id);
    try {
      if (id) localStorage.setItem("aranya_last_incident_id", id);
      else localStorage.removeItem("aranya_last_incident_id");
    } catch { /* Storage may be unavailable in private browsing. */ }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("aranya_last_incident_id");
        if (saved) setLastActiveIncidentIdState(saved);
      } catch { /* Keep session state when storage is unavailable. */ }
    }
  }, []);

  const refreshRegions = async () => {
    try {
      const data = await getRegions();
      if (data && data.length > 0) {
        setRegions(data);
      }
    } catch {
      // keep existing
    }
  };

  const addRegion = (newRegion: Region) => {
    setRegions((prev) => {
      const exists = prev.some((r) => r.id === newRegion.id);
      if (exists) return prev.map((r) => (r.id === newRegion.id ? newRegion : r));
      return [newRegion, ...prev];
    });
    setSelectedRegion(newRegion);
  };

  const addIncident = (newInc: Incident) => {
    setIncidents((prev) => [newInc, ...prev.filter((i) => i.id !== newInc.id)]);
  };

  const refreshIncidents = async () => {
    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch {
      // keep cached
    }
  };

  const updateIncident = async (
    id: string,
    update: { status?: string; assigned_analyst?: string; investigation_notes?: string }
  ): Promise<{ success: boolean; error?: string; incident?: Incident }> => {
    try {
      const updated = await updateIncidentStatus(id, update);
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
      return { success: true, incident: updated };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e?.message || "Failed to persist update to server" };
    }
  };

  useEffect(() => {
    getBackendHealth().then(setBackendStatus);
    refreshRegions();
    refreshIncidents();
  }, []);

  const activeAlertCount = incidents.filter(
    (i) => !["Resolved", "Rejected"].includes(i.status) &&
      (i.severity === "CRITICAL" || i.status === "New" || i.status === "Escalated")
  ).length;

  return (
    <AppContext.Provider
      value={{
        regions,
        selectedRegion,
        setSelectedRegion,
        refreshRegions,
        addRegion,
        incidents,
        refreshIncidents,
        addIncident,
        updateIncident,
        isCopilotOpen,
        setIsCopilotOpen,
        isSidebarOpen,
        setIsSidebarOpen,
        backendStatus,
        activeAlertCount,
        lastActiveIncidentId,
        setLastActiveIncidentId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}

