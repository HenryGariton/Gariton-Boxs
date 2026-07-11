"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PostCard } from "@/components/post/PostCard";
import { FaComment, FaArrowDown } from "react-icons/fa";
import type { PostWithUser } from "@/lib/types/database";

interface PostListProps {
  posts: PostWithUser[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onDelete?: (postId: string) => void;
  className?: string;
}

// 骨架屏卡片
function SkeletonCard() {
  return (
    <GlassCard className="p-4 sm:p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-white/20" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/4 rounded bg-white/20" />
          <div className="h-2 w-1/6 rounded bg-white/10" />
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-4/5 rounded bg-white/10" />
        <div className="h-3 w-2/3 rounded bg-white/10" />
      </div>
      <div className="mt-3 flex gap-4">
        <div className="h-6 w-14 rounded bg-white/10" />
        <div className="h-6 w-14 rounded bg-white/10" />
      </div>
    </GlassCard>
  );
}

/**
 * 动态列表
 * - loading 时显示骨架屏
 * - 空列表显示 EmptyState
 * - hasMore 时显示加载更多按钮
 * - stagger 入场动画
 */
export function PostList({
  posts,
  loading = false,
  hasMore = false,
  onLoadMore,
  onDelete,
  className,
}: PostListProps) {
  // 加载中骨架屏
  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // 空列表
  if (!loading && posts.length === 0) {
    return (
      <EmptyState
        icon={<FaComment />}
        title="还没有动态"
        description="成为第一个分享动态的人吧"
      />
    );
  }

  return (
    <div className={className}>
      {/* 动态列表 */}
      <motion.div
        className="space-y-4"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
      >
        {posts.map((post) => (
          <motion.div
            key={post.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <PostCard post={post} onDelete={() => onDelete?.(post.id)} />
          </motion.div>
        ))}
      </motion.div>

      {/* 底部加载区域 */}
      {loading && posts.length > 0 && (
        <div className="mt-4 flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      {/* 加载更多 */}
      {hasMore && !loading && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={onLoadMore} size="md">
            <FaArrowDown className="text-xs" />
            加载更多
          </Button>
        </div>
      )}
    </div>
  );
}
