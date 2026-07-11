"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { FaHeart, FaRegHeart, FaComment, FaTrash } from "react-icons/fa";
import { GlassCard } from "@/components/ui/GlassCard";
import { Avatar } from "@/components/ui/Avatar";
import { PostImages } from "@/components/post/PostImages";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLikes } from "@/lib/hooks/useLikes";
import { usePosts } from "@/lib/hooks/usePosts";
import { formatRelativeTime, formatCount } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { PostWithUser } from "@/lib/types/database";

interface PostCardProps {
  post: PostWithUser;
  /** 是否显示评论按钮（详情页可隐藏） */
  showCommentButton?: boolean;
  /** 删除后的回调 */
  onDelete?: () => void;
  className?: string;
}

/**
 * 单条动态卡片
 */
export function PostCard({
  post,
  showCommentButton = true,
  onDelete,
  className,
}: PostCardProps) {
  const { appUser } = useAuth();
  const { liked, likeCount, checkLiked, getLikeCount, toggleLike, error: likeError } = useLikes(
    "post",
    post.id,
    appUser?.id
  );
  const { deletePost } = usePosts();

  const isOwn = appUser?.id === post.user_id;

  // 初始化点赞状态
  useEffect(() => {
    checkLiked();
    getLikeCount();
  }, [checkLiked, getLikeCount]);

  const handleLike = () => {
    if (!appUser) {
      alert("请先登录");
      return;
    }
    toggleLike();
  };

  const handleDelete = async () => {
    if (!confirm("确定删除这条动态吗？删除后无法恢复。")) return;
    try {
      await deletePost(post.id);
      onDelete?.();
    } catch (err) {
      console.error("删除失败:", err);
      alert("删除失败，请重试");
    }
  };

  const handleCommentClick = () => {
    window.location.href = `/feed/${post.id}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className={cn("p-4 sm:p-5", className)}>
        {/* 顶部：用户信息 */}
        <div className="flex items-start gap-3">
          <a href={`/u/${post.users.nickname}`}>
            <Avatar
              url={post.users.avatar_url}
              nickname={post.users.nickname}
              size="sm"
            />
          </a>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`/u/${post.users.nickname}`}
                className="text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                {post.users.nickname}
              </a>
              <span className="text-xs text-white/40">
                {formatRelativeTime(post.created_at)}
              </span>
            </div>
          </div>

          {/* 删除按钮 */}
          {isOwn && (
            <button
              onClick={handleDelete}
              className="text-white/40 hover:text-red-400 transition-colors p-1"
              title="删除动态"
            >
              <FaTrash className="text-sm" />
            </button>
          )}
        </div>

        {/* 内容 */}
        {post.content && (
          <p className="mt-3 text-sm sm:text-base text-white/85 whitespace-pre-wrap break-words leading-relaxed">
            {post.content}
          </p>
        )}

        {/* 图片 */}
        {post.images && post.images.length > 0 && (
          <div className="mt-3">
            <PostImages images={post.images} />
          </div>
        )}

        {/* 底部操作栏 */}
        <div className="mt-4 flex items-center gap-6 border-t border-white/10 pt-3">
          {/* 点赞按钮 */}
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 text-sm transition-all duration-200",
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
              {liked ? <FaHeart /> : <FaRegHeart />}
            </motion.span>
            <span>{formatCount(likeCount)}</span>
          </button>

          {/* 点赞错误提示 */}
          {likeError && (
            <span className="text-xs text-red-400">{likeError}</span>
          )}

          {/* 评论按钮 */}
          {showCommentButton && (
            <button
              onClick={handleCommentClick}
              className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white/90 transition-all duration-200 active:scale-90 hover:scale-105"
            >
              <FaComment />
              <span>{formatCount(post.comments_count)}</span>
            </button>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
