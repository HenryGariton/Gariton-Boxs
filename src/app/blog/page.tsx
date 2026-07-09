"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaPen, FaNewspaper } from "react-icons/fa";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePosts } from "@/lib/hooks/usePosts";
import type { PostWithUser } from "@/lib/types/database";

export default function BlogPage() {
  const router = useRouter();
  const { appUser } = useAuth();
  const { getPosts } = usePosts();

  const [articles, setArticles] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // 获取文章列表
  const fetchArticles = useCallback(
    async (pageNum: number) => {
      if (pageNum === 1) setLoading(true);
      try {
        const result = await getPosts({ type: "article", page: pageNum });
        if (pageNum === 1) {
          setArticles(result.posts);
        } else {
          setArticles((prev) => [...prev, ...result.posts]);
        }
        setHasMore(result.hasMore);
      } catch (err) {
        console.error("获取文章失败:", err);
      } finally {
        setLoading(false);
      }
    },
    [getPosts]
  );

  useEffect(() => {
    fetchArticles(1);
  }, [fetchArticles]);

  // 加载更多
  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArticles(nextPage);
  }, [page, fetchArticles]);

  return (
    <PageContainer maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* 页面标题 */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaNewspaper className="text-xl text-white/80" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">博客文章</h1>
              <p className="mt-1 text-sm text-white/60">阅读和分享深度内容</p>
            </div>
          </div>

          {/* 写文章按钮（仅登录后显示） */}
          {appUser && (
            <Button
              onClick={() => router.push("/blog/new")}
              size="md"
            >
              <FaPen className="text-xs" />
              写文章
            </Button>
          )}
        </div>

        {/* Loading 状态 */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {/* 文章网格 */}
        {!loading && articles.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* 加载更多按钮 */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  loading={loading}
                >
                  加载更多
                </Button>
              </div>
            )}
          </>
        )}

        {/* 空状态 */}
        {!loading && articles.length === 0 && (
          <EmptyState
            icon={<FaNewspaper className="w-12 h-12" />}
            title="还没有文章"
            description={appUser ? "来写第一篇文章吧！" : "登录后可以发布文章"}
            action={
              appUser
                ? {
                    label: "写文章",
                    onClick: () => router.push("/blog/new"),
                  }
                : undefined
            }
          />
        )}
      </motion.div>
    </PageContainer>
  );
}
