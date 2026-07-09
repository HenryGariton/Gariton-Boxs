"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type TargetType = "card" | "post";

export function useLikes(targetType: TargetType, targetId: string, userId?: string) {
  const supabase = createClient();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 检查是否已点赞
  const checkLiked = useCallback(async () => {
    if (!userId) return false;
    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", userId)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .maybeSingle();
    setLiked(!!data);
    return !!data;
  }, [supabase, userId, targetType, targetId]);

  // 获取点赞数
  const getLikeCount = useCallback(async () => {
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("target_type", targetType)
      .eq("target_id", targetId);
    setLikeCount(count || 0);
    return count || 0;
  }, [supabase, targetType, targetId]);

  // 切换点赞
  const toggleLike = useCallback(async () => {
    if (!userId) return;

    if (liked) {
      // 取消点赞
      setLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", userId)
        .eq("target_type", targetType)
        .eq("target_id", targetId);
      if (error) {
        // 回滚
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } else {
      // 点赞
      setLiked(true);
      setLikeCount((c) => c + 1);
      const { error } = await supabase.from("likes").insert({
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
      });
      if (error) {
        // 回滚
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      }
    }
  }, [supabase, userId, liked, targetType, targetId]);

  return { liked, likeCount, checkLiked, getLikeCount, toggleLike };
}
