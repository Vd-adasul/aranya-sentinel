"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map as MapIcon,
  Satellite,
  Crosshair,
  ShieldAlert,
  GitMerge,
  BarChart3,
  FileText,
  Users,
  Sliders,
  Terminal,
  X,
} from "lucide-react";
import { useApp } from "@/lib/store";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "critical" | "signal" | "moss";
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { activeAlertCount, backendStatus, isSidebarOpen, setIsSidebarOpen } = useApp();

  // Escape key closes mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen, setIsSidebarOpen]);

  const navGroups: NavGroup[] = [
    {
      label: "Operations",
      items: [
        {
          title: "Command",
          href: "/command",
          icon: LayoutDashboard,
          badge: activeAlertCount > 0 ? `${activeAlertCount}` : undefined,
          badgeVariant: "critical",
        },
        {
          title: "Geospatial map",
          href: "/map",
          icon: MapIcon,
        },
      ],
    },
    {
      label: "Sensors",
      items: [
        {
          title: "Satellite",
          href: "/satellite",
          icon: Satellite,
        },
        {
          title: "Drone aerial CV",
          href: "/drone",
          icon: Crosshair,
        },
      ],
    },
    {
      label: "Review",
      items: [
        {
          title: "Incident ledger",
          href: "/incidents",
          icon: ShieldAlert,
        },
        {
          title: "Evidence fusion",
          href: "/verification",
          icon: GitMerge,
        },
      ],
    },
    {
      label: "Intelligence",
      items: [
        {
          title: "Forest velocity",
          href: "/analytics",
          icon: BarChart3,
        },
        {
          title: "Court dossiers",
          href: "/reports",
          icon: FileText,
        },
      ],
    },
    {
      label: "Governance",
      items: [
        {
          title: "Public transparency",
          href: "/public",
          icon: Users,
        },
        {
          title: "System settings",
          href: "/admin",
          icon: Sliders,
        },
      ],
    },
  ];

  const renderNavigationContent = (isMobile = false) => (
    <div className="flex h-full flex-col justify-between select-none bg-bone">
      <div className="py-4 flex-1 overflow-y-auto">
        <div className="px-5 mb-3 flex items-center justify-between border-b border-sand pb-3">
          <div className="text-xs font-sans font-semibold text-ink-600">
            Workspace
          </div>
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-control text-ink-600 hover:text-ink-900 hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="space-y-5 px-3">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-3 text-xs font-sans font-semibold text-ink-600 mb-1">
                {group.label}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    className={`relative flex items-center justify-between px-3 h-11 min-h-[44px] rounded-control text-sm font-sans font-medium transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy ${
                      isActive
                        ? "bg-moss-100 text-canopy font-semibold"
                        : "text-ink-900 hover:bg-paper"
                    }`}
                  >
                    {/* Active vertical indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 inset-y-2 w-[3px] bg-canopy rounded-r" />
                    )}

                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? "text-canopy" : "text-ink-600 group-hover:text-ink-900"
                        }`}
                      />
                      <span>{item.title}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                          item.badgeVariant === "critical"
                            ? "bg-critical-soft text-critical border border-critical/30"
                            : item.badgeVariant === "signal"
                            ? "bg-signal-soft text-signal border border-signal/30"
                            : "bg-moss-100 text-moss-600 border border-moss-600/30"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sand bg-paper text-xs font-sans text-ink-600 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium text-ink-900">
            <Terminal className="h-3.5 w-3.5 text-moss-600" />
            Backend link:
          </span>
          <span className="font-mono text-ink-900 num font-semibold">
            {backendStatus.status === "healthy" ? "PyTorch (Port 8000)" : "Local Demo"}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-ink-600">
          <span>Cadastral grid:</span>
          <span className="font-mono num">v2026.11-atlas</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-[248px] border-r border-sand bg-bone flex-col justify-between shrink-0 shadow-sm">
        {renderNavigationContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="relative flex w-72 max-w-[80vw] flex-col border-r border-sand bg-bone shadow-dialog">
            {renderNavigationContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
