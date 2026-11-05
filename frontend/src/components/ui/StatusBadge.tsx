import React from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  XCircle,
  Database,
  CloudOff,
  Radio,
  Sparkles,
  Info,
} from "lucide-react";

export type StatusVariant =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "warning"
  | "success"
  | "verified"
  | "review"
  | "escalated"
  | "rejected"
  | "resolved"
  | "new"
  | "info"
  | "neutral"
  | "server"
  | "cached"
  | "local-demo";

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
  size?: "sm" | "md";
}

export function getSeverityVariant(severity: string): StatusVariant {
  const norm = (severity || "").toUpperCase().trim();
  if (norm === "CRITICAL") return "critical";
  if (norm === "HIGH") return "high";
  if (norm === "MEDIUM") return "medium";
  if (norm === "LOW") return "low";
  return "neutral";
}

export function getStatusVariant(status: string): StatusVariant {
  const norm = (status || "").toLowerCase().trim();
  if (norm === "new") return "new";
  if (norm === "under review" || norm === "review") return "review";
  if (norm === "verified") return "verified";
  if (norm === "escalated") return "escalated";
  if (norm === "resolved") return "resolved";
  if (norm === "rejected") return "rejected";
  return "neutral";
}

export function StatusBadge({
  label,
  variant = "neutral",
  className = "",
  size = "md",
}: StatusBadgeProps) {
  const getStyles = () => {
    switch (variant) {
      case "critical":
        return "bg-critical-soft text-critical border-critical/30";
      case "high":
        return "bg-signal-soft text-signal border-signal/30";
      case "medium":
        return "bg-[#FDF3E7] text-[#B85D30] border-[#E8C2A8]/60";
      case "low":
        return "bg-moss-100 text-moss-600 border-moss-600/30";
      case "warning":
        return "bg-signal-soft text-signal border-signal/30";
      case "escalated":
        return "bg-signal-soft text-signal border-signal/40 font-semibold";
      case "success":
      case "verified":
        return "bg-moss-100 text-canopy border-moss-600/40";
      case "resolved":
        return "bg-moss-100 text-moss-600 border-moss-600/30";
      case "new":
        return "bg-[#EBF3F5] text-water border-water/35";
      case "review":
        return "bg-paper text-ink-900 border-sand shadow-sm";
      case "rejected":
        return "bg-sand text-ink-600 border-sand";
      case "server":
        return "bg-moss-100 text-canopy border-moss-600/30";
      case "cached":
        return "bg-paper text-ink-600 border-sand";
      case "local-demo":
        return "bg-water-soft text-water border-water/30";
      case "info":
        return "bg-water-soft text-water border-water/30";
      default:
        return "bg-sand text-ink-600 border-sand";
    }
  };

  const getIcon = () => {
    const iconClass = size === "sm" ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0";
    switch (variant) {
      case "critical":
        return <AlertCircle className={iconClass} />;
      case "high":
      case "warning":
      case "medium":
        return <AlertTriangle className={iconClass} />;
      case "low":
        return <Info className={iconClass} />;
      case "escalated":
        return <ShieldAlert className={iconClass} />;
      case "success":
      case "verified":
      case "resolved":
        return <CheckCircle2 className={iconClass} />;
      case "new":
        return <Sparkles className={iconClass} />;
      case "review":
        return <Clock className={iconClass} />;
      case "rejected":
        return <XCircle className={iconClass} />;
      case "server":
        return <Radio className={iconClass} />;
      case "cached":
        return <Database className={iconClass} />;
      case "local-demo":
        return <CloudOff className={iconClass} />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans font-medium border rounded-full whitespace-nowrap shrink-0 leading-none select-none ${
        size === "sm"
          ? "px-2.5 py-1 text-[11px] h-6"
          : "px-3 py-1.5 text-xs h-7"
      } ${getStyles()} ${className}`}
    >
      {getIcon()}
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}

export function SeverityBadge({
  severity,
  size = "sm",
  className = "",
}: {
  severity: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <StatusBadge
      label={severity.toUpperCase()}
      variant={getSeverityVariant(severity)}
      size={size}
      className={className}
    />
  );
}

export function WorkflowStatusBadge({
  status,
  size = "sm",
  className = "",
}: {
  status: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <StatusBadge
      label={status}
      variant={getStatusVariant(status)}
      size={size}
      className={className}
    />
  );
}

export function ProvenanceBadge({
  source = "server",
  className = "",
}: {
  source?: "server" | "cached" | "local-demo";
  className?: string;
}) {
  const map = {
    server: { label: "Server Confirmed", variant: "server" as const },
    cached: { label: "Cached Sample", variant: "cached" as const },
    "local-demo": { label: "Local Demo", variant: "local-demo" as const },
  };
  const item = map[source] || map["local-demo"];
  return <StatusBadge label={item.label} variant={item.variant} size="sm" className={className} />;
}
