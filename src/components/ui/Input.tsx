"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-white/80 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full glass rounded-xl",
              "px-4 py-2.5 text-white placeholder:text-white/40",
              "focus:outline-none focus:ring-2 focus:ring-white/30",
              "transition-all duration-200",
              "min-h-[44px]",
              icon && "pl-10",
              error && "ring-2 ring-red-400/50",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-300">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
