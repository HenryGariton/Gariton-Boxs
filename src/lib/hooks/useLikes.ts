"use client";

import { useCallback, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type TargetType = "card" | "post";

export function useLikes(targetType: TargetType, targetId: string, userId?: string) {
  const supabase = createClient();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // 用 ref 追踪最新 liked 状态，避免 useCallback 闭包过期
  const likedRef = useRef(liked);
  likedRef.current = liked;

  // 检查是否已点赞
  const checkLiked = useCallback(async () => {
    if (!userId) return false;
    const { data, error: err } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", userId)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .maybeSingle();
    if (err) {
      console.error("[useLikes] checkLiked 失败:", err);
      return false;
    }
    setLiked(!!data);
    return !!data;
  }, [supabase, userId, targetType, targetId]);

  // 获取点赞数
  const getLikeCount = useCallback(async () => {
    const { count, error: err } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("target_type", targetType)
      .eq("target_id", targetId);
    if (err) {
      console.error("[useLikes] getLikeCount 失败:", err);
      return 0;
    }
    setLikeCount(count || 0);
    return count || 0;
  }, [supabase, targetType, targetId]);

  // 切换点赞
  const toggleLike = useCallback(async () => {
    setError(null);
    if (!userId) {
      setError("请先登录");
      return;
    }

    const wasLiked = likedRef.current;

    if (wasLiked) {
      // 取消点赞
      setLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
      const { error: err } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", userId)
        .eq("target_type", targetType)
        .eq("target_id", targetId);
      if (err) {
        console.error("[useLikes] 取消点赞失败:", err.message, err.details, err.hint);
        setError(err.message);
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } else {
      // 点赞
      setLiked(true);
      setLikeCount((c) => c + 1);
      const { error: err } = await supabase.from("likes").insert({
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
      });
      if (err) {
        console.error("[useLikes] 点赞失败:", err.message, err.details, err.hint);
        setError(err.message);
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      }
    }
  }, [supabase, userId, targetType, targetId]);

  const clearError = useCallback(() => setError(null), []);

  return { liked, likeCount, error, checkLiked, getLikeCount, toggleLike, clearError };
}
