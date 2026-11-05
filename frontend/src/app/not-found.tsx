import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center font-sans max-w-lg mx-auto">
        <div className="h-16 w-16 rounded-full bg-sand/50 border border-sand flex items-center justify-center text-moss-600 mb-6">
          <Compass className="h-8 w-8" />
        </div>
        <div className="font-mono text-xs uppercase tracking-widest text-ink-600 mb-2">
          Cadastral Boundary 404
        </div>
        <h1 className="text-2xl font-display font-semibold text-ink-900 mb-3">
          Unmapped Forest Sector
        </h1>
        <p className="text-sm text-ink-600 leading-relaxed mb-6">
          The requested coordinate or docket record does not exist within the active biosphere survey grid.
        </p>
        <Link href="/command" className="btn btn-primary">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Command Centre</span>
        </Link>
      </div>
    </AppShell>
  );
}

