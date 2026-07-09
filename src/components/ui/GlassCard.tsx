"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  strong?: boolean;
}

/**
 * 玻璃拟态卡片容器
 * backdrop-blur + 半透明背景 + 边框 + 阴影
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, hover = false, strong = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          strong ? "glass-strong" : "glass",
          "rounded-2xl shadow-lg",
          hover && "hover-lift hover-scale transition-all duration-300",
          "p-4 sm:p-6 md:p-8",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
