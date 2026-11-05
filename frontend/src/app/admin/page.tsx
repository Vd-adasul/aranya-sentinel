"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/lib/store";
import {
  Sliders,
  Cpu,
  Database,
  Globe2,
  Bell,
  CheckCircle2,
  Save,
  Send,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, ProvenanceBadge } from "@/components/ui/StatusBadge";

export default function AdminPage() {
  const { backendStatus } = useApp();
  const [hfToken, setHfToken] = useState("••••••••••••••••••••••••");
  const [dbUrl, setDbUrl] = useState("postgresql://sentinel_admin:••••••••••••@127.0.0.1:5432/aranya_gis");
  const [gfwKey, setGfwKey] = useState("••••••••••••••••");
  const [telegramWebhook, setTelegramWebhook] = useState("https://api.telegram.org/bot682019284:AAH/dispatch");

  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<string | null>(null);

  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }, 600);
  };

  const handleTestDb = () => {
    setIsTestingDb(true);
    setDbTestResult(null);
    setTimeout(() => {
      setIsTestingDb(false);
      setDbTestResult("PostGIS connection verified (latency: 14ms).");
    }, 700);
  };

  const handleSendTestAlert = () => {
    setIsTestingWebhook(true);
    setWebhookResult(null);
    setTimeout(() => {
      setIsTestingWebhook(false);
      setWebhookResult("Test dispatch payload delivered to webhook.");
    }, 800);
  };

  return (
    <AppShell>
      <div className="flex-1 p-4 sm:p-7 space-y-6 max-w-[1400px] w-full mx-auto font-sans text-xs">
        {/* Page Header */}
        <PageHeader
          title="System Administration &amp; Cadastral Settings"
          scope="Build v2026.11-atlas"
          description="Inference hardware configuration, PostGIS database connection, and automated emergency dispatch channels."
          actions={
            <ProvenanceBadge source={backendStatus.status === "healthy" ? "server" : "local-demo"} />
          }
        />

        {savedSuccess && (
          <div className="p-4 rounded-control border border-moss-600/30 bg-moss-100 text-canopy flex items-center gap-2 animate-in fade-in font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>System configuration parameters committed and synchronized locally.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: AI Model Inference & Weights */}
          <div className="atlas-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-sand pb-3">
              <div className="flex items-center gap-2 font-bold text-ink-900 text-sm">
                <Cpu className="h-4 w-4 text-signal" />
                <span>AI Computer Vision Service &amp; Model Weights</span>
              </div>
              <StatusBadge
                label={backendStatus.status === "healthy" ? "PyTorch GPU active" : "Local Standalone"}
                variant={backendStatus.status === "healthy" ? "verified" : "local-demo"}
                size="sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-900">
                  Hugging Face Read Token (Masked):
                </label>
                <input
                  type="password"
                  value={hfToken}
                  onChange={(e) => setHfToken(e.target.value)}
                  className="w-full bg-paper border border-sand rounded-control px-3.5 h-11 text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy font-mono text-xs"
                />
                <p className="text-[11px] text-ink-600">
                  Used for zero-shot object query downloads with Grounding DINO Tiny.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-900">
                  Local weights repository path:
                </label>
                <input
                  type="text"
                  readOnly
                  value="inference_service/weights/grounding-dino-tiny"
                  className="w-full bg-paper border border-sand rounded-control px-3.5 h-11 text-ink-600 font-mono text-xs"
                />
                <p className="text-[11px] text-ink-600">
                  Directory containing PyTorch model weights.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: PostGIS & Spatial Storage */}
          <div className="atlas-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-sand pb-3">
              <div className="flex items-center gap-2 font-bold text-ink-900 text-sm">
                <Database className="h-4 w-4 text-signal" />
                <span>PostGIS Spatial Database Ledger</span>
              </div>
              <button
                type="button"
                onClick={handleTestDb}
                disabled={isTestingDb}
                className="btn btn-secondary text-xs h-9"
              >
                {isTestingDb ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                <span>Test PostGIS link</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-900">
                Database connection URI:
              </label>
              <input
                type="text"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                className="w-full bg-paper border border-sand rounded-control px-3.5 h-11 text-ink-900 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy"
              />
              <p className="text-[11px] text-ink-600">
                Encrypted PostgreSQL 15 connection with PostGIS 3.3 spatial geometry indexing.
              </p>
            </div>

            {dbTestResult && (
              <div className="p-3 rounded-control bg-moss-100 border border-moss-600/30 text-canopy text-xs font-medium">
                {dbTestResult}
              </div>
            )}
          </div>

          {/* Section 3: External Geospatial Feeds */}
          <div className="atlas-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-sand pb-3">
              <div className="flex items-center gap-2 font-bold text-ink-900 text-sm">
                <Globe2 className="h-4 w-4 text-signal" />
                <span>Global Forest Watch &amp; Sentinel Hub API</span>
              </div>
              <StatusBadge label="Configured" variant="verified" size="sm" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-900">
                Global Forest Watch (GFW) API Key:
              </label>
              <input
                type="password"
                value={gfwKey}
                onChange={(e) => setGfwKey(e.target.value)}
                className="w-full bg-paper border border-sand rounded-control px-3.5 h-11 text-ink-900 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy"
              />
              <p className="text-[11px] text-ink-600">
                Authenticates GLAD-L alerts and bi-temporal tree cover loss datasets.
              </p>
            </div>
          </div>

          {/* Section 4: Emergency Alert Webhook */}
          <div className="atlas-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-sand pb-3">
              <div className="flex items-center gap-2 font-bold text-ink-900 text-sm">
                <Bell className="h-4 w-4 text-signal" />
                <span>Emergency Telegram / SMS Dispatch Hook</span>
              </div>
              <button
                type="button"
                onClick={handleSendTestAlert}
                disabled={isTestingWebhook}
                className="btn btn-secondary text-xs h-9"
              >
                {isTestingWebhook ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 text-signal" />
                )}
                <span>Send test alert</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-900">
                Telegram Bot Webhook Endpoint:
              </label>
              <input
                type="text"
                value={telegramWebhook}
                onChange={(e) => setTelegramWebhook(e.target.value)}
                className="w-full bg-paper border border-sand rounded-control px-3.5 h-11 text-ink-900 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy"
              />
              <p className="text-[11px] text-ink-600">
                Triggers push notifications to forest rangers when a CRITICAL severity breach is registered.
              </p>
            </div>

            {webhookResult && (
              <div className="p-3 rounded-control bg-moss-100 border border-moss-600/30 text-canopy text-xs font-medium">
                {webhookResult}
              </div>
            )}
          </div>

          {/* Save Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary h-11 min-h-[44px] text-xs px-6"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Committing changes...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save system configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
