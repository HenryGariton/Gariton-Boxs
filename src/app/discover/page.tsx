"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { CardGrid } from "@/components/card/CardGrid";
import { useCard } from "@/lib/hooks/useCard";
import type { CardWithUser } from "@/lib/types/database";

export default function DiscoverPage() {
  const router = useRouter();
  const { getAllCards } = useCard();
  const [cards, setCards] = useState<CardWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCards = useCallback(
    async (query?: string) => {
      setLoading(true);
      try {
        const data = await getAllCards(query);
        setCards(data);
      } catch (err) {
        console.error("获取名片列表失败:", err);
      } finally {
        setLoading(false);
      }
    },
    [getAllCards]
  );

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearch(query);
      fetchCards(query);
    },
    [fetchCards]
  );

  const handleCardClick = useCallback(
    (card: CardWithUser) => {
      router.push(`/u/${card.users.nickname}`);
    },
    [router]
  );

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* 页面标题 */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            名片广场
          </h1>
          <p className="mt-2 text-sm text-white/60">
            发现更多优秀的开发者，建立你的社交网络
          </p>
        </div>

        {/* 名片网格 */}
        <CardGrid
          cards={cards}
          loading={loading}
          onSearch={handleSearch}
          onCardClick={handleCardClick}
        />
      </motion.div>
    </PageContainer>
  );
}
