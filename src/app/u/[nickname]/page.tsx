"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaUserEdit, FaFileAlt, FaBolt, FaTrash } from "react-icons/fa";
import { PageContainer } from "@/components/layout/PageContainer";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { BusinessCard } from "@/components/card/BusinessCard";
import { CommentSection } from "@/components/social/CommentSection";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCard } from "@/lib/hooks/useCard";
import { usePosts } from "@/lib/hooks/usePosts";
import type { CardWithUser, PostWithUser } from "@/lib/types/database";
import { formatRelativeTime, truncate } from "@/lib/utils/format";

export default function UserCardPage() {
  const params = useParams();
  const router = useRouter();
  const nickname = params.nickname as string;

  const { appUser } = useAuth();
  const { getCardByNickname } = useCard();
  const { getPosts, deletePost } = usePosts();

  const [card, setCard] = useState<CardWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [shortPosts, setShortPosts] = useState<PostWithUser[]>([]);
  const [articles, setArticles] = useState<PostWithUser[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const isOwner = appUser?.nickname === nickname;

  // 获取名片
  useEffect(() => {
    async function fetchCard() {
      setLoading(true);
      try {
        const data = await getCardByNickname(nickname);
        setCard(data);
      } catch (err) {
        console.error("获取名片失败:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCard();
  }, [nickname, getCardByNickname]);

  // 获取动态和文章
  const fetchPosts = useCallback(async () => {
    if (!card) return;
    setPostsLoading(true);
    try {
      const [shorts, arts] = await Promise.all([
        getPosts({ userId: card.user_id, type: "short" }),
        getPosts({ userId: card.user_id, type: "article" }),
      ]);
      setShortPosts(shorts.posts);
      setArticles(arts.posts);
    } catch (err) {
      console.error("获取动态失败:", err);
    } finally {
      setPostsLoading(false);
    }
  }, [card, getPosts]);

  useEffect(() => {
    if (card) fetchPosts();
  }, [card, fetchPosts]);

  // 删除动态/文章
  const handleDeletePost = useCallback(
    async (postId: string) => {
      console.log("[handleDeletePost] 触发, postId:", postId);
      if (!confirm("确定删除吗？删除后无法恢复。")) {
        console.log("[handleDeletePost] 用户取消");
        return;
      }
      try {
        console.log("[handleDeletePost] 开始调用 deletePost...");
        await deletePost(postId);
        console.log("[handleDeletePost] 删除成功");
        setShortPosts((prev) => prev.filter((p) => p.id !== postId));
        setArticles((prev) => prev.filter((p) => p.id !== postId));
      } catch (err: any) {
        console.error("[handleDeletePost] 删除失败:", err?.message, err?.details, err?.hint, err);
        alert("删除失败: " + (err?.message || "未知错误，请打开控制台查看详情"));
      }
    },
    [deletePost]
  );

  // 加载中
  if (loading) {
    return (
      <PageContainer maxWidth="md">
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  // 名片不存在
  if (!card) {
    return (
      <PageContainer maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <EmptyState
            title="该用户还没有创建名片"
            description="也许换个昵称试试？"
          />
        </motion.div>
      </PageContainer>
    );
  }

  // 动态列表
  const ShortPostsList = () => {
    if (postsLoading) {
      return (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      );
    }
    if (shortPosts.length === 0) {
      return (
        <EmptyState
          icon={<FaBolt />}
          title="还没有发布动态"
          description="这里空空如也"
        />
      );
    }
    return (
      <div className="space-y-3">
        {shortPosts.map((post) => (
          <GlassCard key={post.id} className="p-4">
            <p className="text-sm text-white/90 whitespace-pre-wrap">
              {post.content}
            </p>
            {post.images && post.images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {post.images.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-white/40">
                {formatRelativeTime(post.created_at)}
              </span>
              {isOwner && (
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="text-white/30 hover:text-red-400 transition-colors p-1"
                  title="删除"
                >
                  <FaTrash className="text-xs" />
                </button>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    );
  };

  // 文章列表
  const ArticlesList = () => {
    if (postsLoading) {
      return (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      );
    }
    if (articles.length === 0) {
      return (
        <EmptyState
          icon={<FaFileAlt />}
          title="还没有发布文章"
          description="这里空空如也"
        />
      );
    }
    return (
      <div className="space-y-3">
        {articles.map((article) => (
          <GlassCard
            key={article.id}
            hover
            className="p-4 cursor-pointer"
            onClick={() => router.push(`/post/${article.id}`)}
          >
            <h3 className="text-base font-semibold text-white">
              {article.title}
            </h3>
            <p className="mt-1.5 text-sm text-white/60">
              {truncate(article.excerpt || article.content, 120)}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-white/40">
                <span>{formatRelativeTime(article.created_at)}</span>
                <span>{article.likes_count} 赞</span>
                <span>{article.comments_count} 评论</span>
              </div>
              {isOwner && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleDeletePost(article.id);
                  }}
                  className="text-white/30 hover:text-red-400 transition-colors p-1"
                  title="删除"
                >
                  <FaTrash className="text-xs" />
                </button>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    );
  };

  return (
    <PageContainer maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* 名片展示 */}
        <BusinessCard card={card} showActions={!isOwner} />

        {/* 评论区（访客可见） */}
        {!isOwner && (
          <div className="mt-6">
            <CommentSection targetType="card" targetId={card.id} />
          </div>
        )}

        {/* 编辑按钮（本人可见） */}
        {isOwner && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => router.push(`/u/${nickname}/edit`)}
            >
              <FaUserEdit />
              编辑名片
            </Button>
          </div>
        )}

        {/* Tabs — 动态 / 文章 */}
        <div className="mt-8">
          <Tabs
            tabs={[
              {
                key: "short",
                label: "动态",
                content: <ShortPostsList />,
              },
              {
                key: "article",
                label: "文章",
                content: <ArticlesList />,
              },
            ]}
          />
        </div>
      </motion.div>
    </PageContainer>
  );
}
