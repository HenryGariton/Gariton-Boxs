import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 text-xs font-medium",
        "glass rounded-full text-white/80",
        className
      )}
    >
      {children}
    </span>
  );
}
