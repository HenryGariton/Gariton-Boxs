"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface TabsProps {
  tabs: { key: string; label: string; content: ReactNode }[];
  defaultActive?: string;
  className?: string;
}

export function Tabs({ tabs, defaultActive, className }: TabsProps) {
  const [active, setActive] = useState(defaultActive || tabs[0]?.key);

  return (
    <div className={cn("w-full", className)}>
      {/* Tab 按钮 */}
      <div className="flex gap-1 mb-4 glass rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              "min-h-[40px]",
              active === tab.key
                ? "bg-white/20 text-white shadow-sm"
                : "text-white/60 hover:text-white/90 hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      <div>
        {tabs.find((t) => t.key === active)?.content}
      </div>
    </div>
  );
}
