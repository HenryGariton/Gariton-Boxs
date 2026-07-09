import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

const MAX_WIDTHS = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
};

export function PageContainer({
  children,
  className,
  maxWidth = "lg",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8",
        MAX_WIDTHS[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}
