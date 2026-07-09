"use client";

import { type ReactNode } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode | { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const renderAction = () => {
    if (!action) return null;
    if (typeof action === "object" && "label" in action && "onClick" in action) {
      return (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition-all"
        >
          {action.label}
        </button>
      );
    }
    return <>{action}</>;
  };

  return (
    <GlassCard
      className={cn("flex flex-col items-center justify-center text-center", className)}
    >
      {icon && <div className="mb-4 text-4xl opacity-60">{icon}</div>}
      <h3 className="text-lg font-semibold text-white/90">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-white/60 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{renderAction()}</div>}
    </GlassCard>
  );
}
