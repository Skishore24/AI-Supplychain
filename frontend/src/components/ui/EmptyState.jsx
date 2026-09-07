import React from "react";
import { PackageOpen } from "lucide-react";
import Button from "./Button";

export function EmptyState({
  icon: Icon = PackageOpen,
  title = "No records found",
  description = "Get started by creating your first entry or adjusting your filters.",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 p-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 shadow-xs mb-3.5">
        <Icon size={26} />
      </div>

      <h3 className="text-base font-heading font-black text-slate-900 tracking-tight">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-500 max-w-sm leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
