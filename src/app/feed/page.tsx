"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaPen } from "react-icons/fa";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { PostList } from "@/components/post/PostList";
import { usePosts } from "@/lib/hooks/usePosts";
import type { PostWithUser } from "@/lib/types/database";

export default function FeedPage() {
  const router = useRouter();
  const { getPosts } = usePosts();

  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchPosts = useCallback(
    async (pageNum: number) => {
      if (pageNum === 1) setLoading(true);
      try {
        const result = await getPosts({ type: "short", page: pageNum });
        if (pageNum === 1) {
          setPosts(result.posts);
        } else {
          setPosts((prev) => [...prev, ...result.posts]);
        }
        setHasMore(result.hasMore);
      } catch (err) {
        console.error("获取动态失败:", err);
      } finally {
        setLoading(false);
      }
    },
    [getPosts]
  );

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  }, [page, fetchPosts]);

  const handleDelete = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  return (
    <PageContainer maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* 页面标题 */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              动态广场
            </h1>
            <p className="mt-2 text-sm text-white/60">
              看看大家都在分享什么
            </p>
          </div>
          <Button onClick={() => router.push("/feed/new")} size="md">
            <FaPen className="text-xs" />
            发布动态
          </Button>
        </div>

        {/* 动态列表 */}
        <PostList
          posts={posts}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onDelete={handleDelete}
        />
      </motion.div>
    </PageContainer>
  );
}
