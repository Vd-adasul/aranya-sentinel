"use client";

import React, { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Telemetry Boundary Error:", error);
  }, [error]);

  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center font-sans max-w-lg mx-auto">
        <div className="h-16 w-16 rounded-full bg-critical-soft border border-critical/30 flex items-center justify-center text-critical mb-6">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="font-mono text-xs uppercase tracking-widest text-critical mb-2">
          Telemetry Stream Interruption
        </div>
        <h1 className="text-2xl font-display font-semibold text-ink-900 mb-3">
          Sensor Feed Processing Error
        </h1>
        <p className="text-sm text-ink-600 leading-relaxed mb-6 font-mono text-xs">
          {error.message || "An unexpected disturbance occurred while aggregating telemetry."}
        </p>
        <button onClick={() => reset()} className="btn btn-secondary">
          <RotateCcw className="h-4 w-4" />
          <span>Re-establish Stream</span>
        </button>
      </div>
    </AppShell>
  );
}

