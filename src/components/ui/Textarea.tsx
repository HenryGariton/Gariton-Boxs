"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
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
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full glass rounded-xl",
            "px-4 py-2.5 text-white placeholder:text-white/40",
            "focus:outline-none focus:ring-2 focus:ring-white/30",
            "transition-all duration-200",
            "resize-none min-h-[100px]",
            error && "ring-2 ring-red-400/50",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-300">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
