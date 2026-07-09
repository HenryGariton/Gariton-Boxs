"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Card, CardWithUser } from "@/lib/types/database";

export function useCard() {
  const supabase = createClient();

  // 获取用户的名片
  const getMyCard = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data as Card | null;
  }, [supabase]);

  // 按昵称获取名片
  const getCardByNickname = useCallback(
    async (nickname: string) => {
      const { data, error } = await supabase
        .from("cards")
        .select(
          `
          *,
          users:users!inner(nickname, avatar_url)
        `
        )
        .eq("users.nickname", nickname)
        .maybeSingle();
      if (error) throw error;
      return data as CardWithUser | null;
    },
    [supabase]
  );

  // 获取所有名片
  const getAllCards = useCallback(
    async (search?: string) => {
      let query = supabase
        .from("cards")
        .select(
          `
          *,
          users:users!inner(nickname, avatar_url)
        `
        )
        .order("updated_at", { ascending: false });

      if (search) {
        // 通过子查询过滤
        const { data: users } = await supabase
          .from("users")
          .select("id")
          .ilike("nickname", `%${search}%`);

        if (users && users.length > 0) {
          query = query.in(
            "user_id",
            users.map((u: { id: string }) => u.id)
          );
        } else {
          return [];
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as CardWithUser[];
    },
    [supabase]
  );

  // 创建名片
  const createCard = useCallback(
    async (userId: string, cardData: Partial<Card>) => {
      const { data, error } = await supabase
        .from("cards")
        .insert({ ...cardData, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data as Card;
    },
    [supabase]
  );

  // 更新名片
  const updateCard = useCallback(
    async (cardId: string, cardData: Partial<Card>) => {
      const { data, error } = await supabase
        .from("cards")
        .update({ ...cardData, updated_at: new Date().toISOString() })
        .eq("id", cardId)
        .select()
        .single();
      if (error) throw error;
      return data as Card;
    },
    [supabase]
  );

  return { getMyCard, getCardByNickname, getAllCards, createCard, updateCard };
}
