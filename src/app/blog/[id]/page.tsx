"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaHeart, FaRegHeart, FaComment, FaArrowLeft, FaNewspaper, FaTrash } from "react-icons/fa";
import { PageContainer } from "@/components/layout/PageContainer";
import { Avatar } from "@/components/ui/Avatar";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { CommentSection } from "@/components/social/CommentSection";
import { usePosts } from "@/lib/hooks/usePosts";
import { useLikes } from "@/lib/hooks/useLikes";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatRelativeTime, formatCount } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { appUser } = useAuth();
  const { getPost, deletePost } = usePosts();

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const id = params.id as string;

  // 点赞
  const { liked, likeCount, checkLiked, getLikeCount, toggleLike, error: likeError } = useLikes(
    "post",
    id,
    appUser?.id
  );

  // 获取文章详情
  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true);
        setNotFound(false);
        const data = await getPost(id);
        if (data.type !== "article") {
          // 不是文章类型，标记为未找到
          setNotFound(true);
          return;
        }
        setArticle(data);
      } catch (err) {
        console.error("获取文章失败:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchArticle();
    }
  }, [id, getPost]);

  // 文章加载完成后初始化点赞状态
  useEffect(() => {
    if (article && appUser) {
      checkLiked();
      getLikeCount();
    }
  }, [article, appUser, checkLiked, getLikeCount]);

  // 点赞操作
  const handleLike = () => {
    if (!appUser) {
      alert("请先登录");
      return;
    }
    toggleLike();
  };

  // 删除文章
  const isAuthor = appUser?.id === article?.user_id;
  const handleDelete = async () => {
    console.log("[handleDelete Blog] 触发, postId:", id);
    if (!confirm("确定删除这篇文章吗？删除后无法恢复。")) {
      console.log("[handleDelete Blog] 用户取消");
      return;
    }
    try {
      console.log("[handleDelete Blog] 开始调用 deletePost...");
      await deletePost(id);
      console.log("[handleDelete Blog] 删除成功，跳转到 /blog");
      router.push("/blog");
    } catch (err: any) {
      console.error("[handleDelete Blog] 删除失败:", err?.message, err?.details, err?.hint, err);
      alert("删除失败: " + (err?.message || "未知错误"));
    }
  };

  // Loading 状态
  if (loading) {
    return (
      <PageContainer maxWidth="md">
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </PageContainer>
    );
  }

  // 未找到文章
  if (notFound || !article) {
    return (
      <PageContainer maxWidth="md">
        <EmptyState
          icon={<FaNewspaper className="w-12 h-12" />}
          title="文章不存在"
          description="该文章可能已被删除或不存在"
          action={{
            label: "返回博客",
            onClick: () => router.push("/blog"),
          }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* 返回按钮 */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl px-3 py-2 transition-all w-fit"
        >
          <FaArrowLeft className="text-sm" />
          <span className="text-sm">返回</span>
        </button>

        {/* 文章头部 */}
        <header className="mb-8">
          {/* 标题 */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-6">
            {article.title}
          </h1>

          {/* 作者信息 + 时间 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href={`/u/${article.users.nickname}`}>
                <Avatar
                  url={article.users.avatar_url}
                  nickname={article.users.nickname}
                  size="md"
                />
              </a>
              <div className="flex flex-col">
                <a
                  href={`/u/${article.users.nickname}`}
                  className="text-base font-medium text-white/90 hover:text-white transition-colors"
                >
                  {article.users.nickname}
                </a>
                <span className="text-sm text-white/40">
                  {formatRelativeTime(article.created_at)}
                </span>
              </div>
            </div>
            {isAuthor && (
              <button
                onClick={handleDelete}
                className="text-white/40 hover:text-red-400 transition-colors p-2"
                title="删除文章"
              >
                <FaTrash className="text-sm" />
              </button>
            )}
          </div>

          {/* 封面图（如有） */}
          {article.cover_image && (
            <div className="mt-6 rounded-xl overflow-hidden">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full max-h-[400px] object-cover"
              />
            </div>
          )}
        </header>

        {/* 文章正文：Markdown 渲染 */}
        <article className="mb-8">
          <MarkdownRenderer content={article.content} />
        </article>

        {/* 底部操作栏：可点赞 + 评论数 */}
        <div className="flex items-center gap-6 pt-6 border-t border-white/10">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              "active:scale-90 hover:scale-105",
              liked ? "text-red-400" : "text-white/60 hover:text-white/90"
            )}
          >
            <motion.span
              key={liked ? "liked" : "unliked"}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              {liked ? <FaHeart className="text-lg" /> : <FaRegHeart className="text-lg" />}
            </motion.span>
            <span className="text-sm">{formatCount(likeCount || article.likes_count || 0)} 赞</span>
          </button>
          {likeError && (
            <span className="text-xs text-red-400">{likeError}</span>
          )}
          <div className="flex items-center gap-2 text-white/60">
            <FaComment className="text-lg" />
            <span className="text-sm">{formatCount(article.comments_count)} 评论</span>
          </div>
        </div>

        {/* 评论区 */}
        <section className="mt-8">
          <CommentSection targetType="post" targetId={id} />
        </section>
      </motion.div>
    </PageContainer>
  );
}
