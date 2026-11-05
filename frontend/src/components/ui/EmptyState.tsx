import React from "react";
import { FolderSearch, AlertTriangle, RefreshCw } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  variant?: "card" | "table" | "media" | "inline";
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function EmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  action,
  variant = "card",
  onRetry,
  isRetrying = false,
}: EmptyStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center text-center space-y-3 p-8">
      <div className="h-12 w-12 rounded-control bg-paper border border-sand flex items-center justify-center text-ink-600">
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-1 max-w-md">
        <h4 className="text-base font-sans font-bold text-ink-900">{title}</h4>
        <p className="text-sm text-ink-600 font-sans leading-relaxed">
          {description}
        </p>
      </div>
      {(action || onRetry) && (
        <div className="pt-2 flex items-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="btn btn-secondary text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
              <span>{isRetrying ? "Retrying..." : "Retry request"}</span>
            </button>
          )}
          {action}
        </div>
      )}
    </div>
  );

  if (variant === "table") {
    return (
      <div className="py-12 bg-bone border-t border-sand">
        {content}
      </div>
    );
  }

  if (variant === "media") {
    return (
      <div className="h-full min-h-[300px] w-full rounded-panel bg-paper border border-sand flex items-center justify-center">
        {content}
      </div>
    );
  }

  if (variant === "inline") {
    return <div className="py-6">{content}</div>;
  }

  return (
    <div className="atlas-card">
      {content}
    </div>
  );
}
