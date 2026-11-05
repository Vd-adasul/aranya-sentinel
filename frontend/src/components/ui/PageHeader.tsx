import React from "react";

interface PageHeaderProps {
  title: string;
  scope?: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
  editorialAccent?: string;
}

export function PageHeader({
  title,
  scope,
  description,
  actions,
  eyebrow,
  editorialAccent,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-sand pb-4 mb-6">
      <div className="space-y-1.5 max-w-3xl">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-[28px] font-sans font-bold tracking-tight text-ink-900 leading-tight">
            {title}
            {editorialAccent && (
              <span className="font-editorial italic font-normal text-canopy ml-2.5">
                {editorialAccent}
              </span>
            )}
          </h1>
          {scope && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sand/60 text-ink-900 border border-sand">
              {scope}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-ink-600 font-sans leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}
