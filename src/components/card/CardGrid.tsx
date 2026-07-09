"use client";

import { useState, useCallback, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { BusinessCard } from "@/components/card/BusinessCard";
import type { CardWithUser } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";

interface CardGridProps {
  cards: CardWithUser[];
  loading?: boolean;
  onSearch?: (query: string) => void;
  onCardClick?: (card: CardWithUser) => void;
  className?: string;
}

// 骨架屏卡片
function SkeletonCard() {
  return (
    <GlassCard className="p-4 sm:p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-white/20" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 rounded bg-white/20" />
          <div className="h-3 w-1/4 rounded bg-white/10" />
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-4/5 rounded bg-white/10" />
      </div>
      <div className="mt-3 flex gap-1.5">
        <div className="h-5 w-12 rounded-full bg-white/10" />
        <div className="h-5 w-16 rounded-full bg-white/10" />
      </div>
    </GlassCard>
  );
}

export function CardGrid({
  cards,
  loading = false,
  onSearch,
  onCardClick,
  className,
}: CardGridProps) {
  const [searchValue, setSearchValue] = useState("");

  // 搜索防抖
  const debouncedSearch = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>;
      return (value: string) => {
        clearTimeout(timer);
        timer = setTimeout(() => onSearch?.(value), 300);
      };
    })(),
    [onSearch]
  );

  useEffect(() => {
    if (onSearch) {
      debouncedSearch(searchValue);
    }
  }, [searchValue, debouncedSearch, onSearch]);

  return (
    <div className={cn("w-full", className)}>
      {/* 搜索框 */}
      {onSearch && (
        <div className="mb-6">
          <Input
            placeholder="搜索用户名..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            icon={<FaSearch />}
          />
        </div>
      )}

      {/* 加载中骨架屏 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <EmptyState
          icon={<FaSearch />}
          title={searchValue ? "没有找到匹配的名片" : "还没有人创建名片"}
          description={
            searchValue
              ? "试试其他关键词"
              : "成为第一个创建名片的人吧"
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <BusinessCard
              key={card.id}
              card={card}
              compact
              onClick={() => onCardClick?.(card)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
