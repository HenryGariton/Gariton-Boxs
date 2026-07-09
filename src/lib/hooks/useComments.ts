"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CommentWithUser } from "@/lib/types/database";
import { PAGE_SIZE } from "@/lib/utils/constants";

type TargetType = "card" | "post";

export function useComments(targetType: TargetType, targetId: string) {
  const supabase = createClient();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // 获取评论
  const fetchComments = useCallback(
    async (page = 1) => {
      setLoading(true);
      const offset = (page - 1) * PAGE_SIZE;
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          users:users!inner(nickname, avatar_url)
        `
        )
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .is("parent_id", null)
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) throw error;

      const result = (data || []) as CommentWithUser[];
      if (page === 1) {
        setComments(result);
      } else {
        setComments((prev) => [...prev, ...result]);
      }
      setHasMore(result.length === PAGE_SIZE);
      setLoading(false);
      return result;
    },
    [supabase, targetType, targetId]
  );

  // 获取回复
  const fetchReplies = useCallback(
    async (parentId: string) => {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          users:users!inner(nickname, avatar_url)
        `
        )
        .eq("parent_id", parentId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as CommentWithUser[];
    },
    [supabase]
  );

  // 发送评论
  const addComment = useCallback(
    async (userId: string, content: string, parentId?: string) => {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          user_id: userId,
          target_type: targetType,
          target_id: targetId,
          content,
          parent_id: parentId || null,
        })
        .select(
          `
          *,
          users:users!inner(nickname, avatar_url)
        `
        )
        .single();

      if (error) throw error;
      const newComment = data as CommentWithUser;

      if (parentId) {
        // 回复，加到对应父评论的回复中（由组件处理）
        return newComment;
      } else {
        // 顶级评论，加到列表头部
        setComments((prev) => [newComment, ...prev]);
        return newComment;
      }
    },
    [supabase, targetType, targetId]
  );

  return {
    comments,
    loading,
    hasMore,
    fetchComments,
    fetchReplies,
    addComment,
  };
}
