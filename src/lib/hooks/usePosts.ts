"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Post, PostWithUser } from "@/lib/types/database";
import { PAGE_SIZE } from "@/lib/utils/constants";

export function usePosts() {
  const supabase = createClient();

  // 获取动态/文章列表
  const getPosts = useCallback(
    async (params: {
      type?: "short" | "article";
      userId?: string;
      page?: number;
      limit?: number;
    }) => {
      const { type, userId, page = 1, limit = PAGE_SIZE } = params;
      const offset = (page - 1) * limit;

      let query = supabase
        .from("posts")
        .select(
          `
          *,
          users:users!inner(nickname, avatar_url)
        `
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (type) query = query.eq("type", type);
      if (userId) query = query.eq("user_id", userId);

      const { data, error, count } = await query;
      if (error) throw error;
      return {
        posts: (data || []) as PostWithUser[],
        total: count || 0,
        hasMore: (data?.length || 0) === limit,
      };
    },
    [supabase]
  );

  // 获取单条
  const getPost = useCallback(
    async (id: string) => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          users:users!inner(nickname, avatar_url)
        `
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as PostWithUser;
    },
    [supabase]
  );

  // 创建
  const createPost = useCallback(
    async (postData: Partial<Post> & { user_id: string }) => {
      const { data, error } = await supabase
        .from("posts")
        .insert(postData)
        .select()
        .single();
      if (error) throw error;
      return data as Post;
    },
    [supabase]
  );

  // 更新
  const updatePost = useCallback(
    async (id: string, postData: Partial<Post>) => {
      const { data, error } = await supabase
        .from("posts")
        .update({ ...postData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Post;
    },
    [supabase]
  );

  // 删除
  const deletePost = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    [supabase]
  );

  return { getPosts, getPost, createPost, updatePost, deletePost };
}
