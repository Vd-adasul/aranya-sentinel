"use client";

import React from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { CopilotDrawer } from "../assistant/CopilotDrawer";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen md:h-screen w-full flex-col overflow-x-clip bg-canvas text-ink-900">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-canopy focus:text-bone rounded-control"
      >
        Skip to main content
      </a>

      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto bg-canvas flex flex-col focus:outline-none"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      <CopilotDrawer />
    </div>
  );
}
