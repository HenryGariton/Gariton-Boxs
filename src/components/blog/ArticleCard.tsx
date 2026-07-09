"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaHeart, FaComment } from "react-icons/fa";
import { GlassCard } from "@/components/ui/GlassCard";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime, formatCount } from "@/lib/utils/format";
import type { PostWithUser } from "@/lib/types/database";

interface ArticleCardProps {
  article: PostWithUser;
}

/**
 * 文章列表卡片
 * - 封面图（如有）
 * - 标题、摘要
 * - 作者信息 + 时间
 * - 点赞数 + 评论数
 */
export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/blog/${article.id}`}>
        <GlassCard hover className="p-0 overflow-hidden cursor-pointer">
          {/* 封面图 */}
          {article.cover_image && (
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          {/* 内容区 */}
          <div className="p-4 sm:p-5">
            {/* 标题 */}
            <h3 className="text-lg font-bold text-white line-clamp-2 leading-snug hover:text-white/80 transition-colors">
              {article.title}
            </h3>

            {/* 摘要 */}
            {article.excerpt && (
              <p className="mt-2 text-sm text-white/60 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            {/* 作者信息 + 时间 */}
            <div className="mt-4 flex items-center gap-2.5">
              <a
                href={`/u/${article.users.nickname}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Avatar
                  url={article.users.avatar_url}
                  nickname={article.users.nickname}
                  size="sm"
                />
              </a>
              <div className="flex items-center gap-2 min-w-0">
                <a
                  href={`/u/${article.users.nickname}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm text-white/70 hover:text-white transition-colors truncate"
                >
                  {article.users.nickname}
                </a>
                <span className="text-xs text-white/40 flex-shrink-0">
                  {formatRelativeTime(article.created_at)}
                </span>
              </div>
            </div>

            {/* 底部：点赞 + 评论 */}
            <div className="mt-4 flex items-center gap-5 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-sm text-white/50">
                <FaHeart className="text-xs" />
                <span>{formatCount(article.likes_count)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/50">
                <FaComment className="text-xs" />
                <span>{formatCount(article.comments_count)}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}
