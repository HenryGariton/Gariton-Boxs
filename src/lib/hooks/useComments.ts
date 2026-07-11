"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CommentWithUser } from "@/lib/types/database";
import { PAGE_SIZE } from "@/lib/utils/constants";

type TargetType = "card" | "post";

// 评论区用到的评论对象，额外携带回复数
export type CommentWithReplyCount = CommentWithUser & { reply_count: number };

export function useComments(targetType: TargetType, targetId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [replyCounts, setReplyCounts] = useState<Record<string, number>>({});

  // 获取评论（含回复数）
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

      if (error) {
        console.error("[useComments] fetchComments 失败:", error);
        setLoading(false);
        throw error;
      }

      const result = (data || []) as CommentWithUser[];

      // 批量查询每条评论的回复数
      if (result.length > 0) {
        const counts: Record<string, number> = {};
        await Promise.all(
          result.map(async (comment) => {
            const { count, error: countErr } = await supabase
              .from("comments")
              .select("*", { count: "exact", head: true })
              .eq("parent_id", comment.id);
            if (!countErr) {
              counts[comment.id] = count || 0;
            }
          })
        );
        setReplyCounts((prev) => ({ ...prev, ...counts }));
      }

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
      if (error) {
        console.error("[useComments] fetchReplies 失败:", error);
        throw error;
      }
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

      if (error) {
        console.error("[useComments] addComment 失败:", error.message, error.details, error.hint);
        throw error;
      }

      const newComment = data as CommentWithUser;

      if (parentId) {
        // 回复：更新该父评论的回复计数
        setReplyCounts((prev) => ({
          ...prev,
          [parentId]: (prev[parentId] || 0) + 1,
        }));
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
    replyCounts,
    fetchComments,
    fetchReplies,
    addComment,
  };
}
