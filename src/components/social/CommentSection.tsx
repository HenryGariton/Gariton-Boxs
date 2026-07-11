"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaComment, FaTrash, FaPaperPlane, FaReply } from "react-icons/fa";
import { GlassCard } from "@/components/ui/GlassCard";
import { Avatar } from "@/components/ui/Avatar";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/lib/hooks/useAuth";
import { useComments } from "@/lib/hooks/useComments";
import { formatRelativeTime } from "@/lib/utils/format";
import { COMMENT_LIMITS } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";
import type { CommentWithUser } from "@/lib/types/database";

interface CommentSectionProps {
  targetType: "card" | "post";
  targetId: string;
  className?: string;
}

/**
 * 评论区组件 — 评论列表 + 发布评论 + 回复
 */
export function CommentSection({
  targetType,
  targetId,
  className,
}: CommentSectionProps) {
  const { appUser } = useAuth();
  const { comments, loading, replyCounts, fetchComments, addComment, fetchReplies } =
    useComments(targetType, targetId);

  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<CommentWithUser | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [repliesMap, setRepliesMap] = useState<Record<string, CommentWithUser[]>>(
    {}
  );
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  // 初始化加载评论
  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  // 发布评论
  const handleSubmit = useCallback(async () => {
    if (!appUser || !content.trim()) return;
    setSubmitting(true);
    try {
      await addComment(appUser.id, content.trim());
      setContent("");
    } catch (err) {
      console.error("发布评论失败:", err);
      alert("评论失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }, [appUser, content, addComment]);

  // 回复评论
  const handleReply = useCallback(
    async (parent: CommentWithUser) => {
      if (!appUser || !replyContent.trim()) return;
      setSubmitting(true);
      try {
        const newReply = await addComment(
          appUser.id,
          replyContent.trim(),
          parent.id
        );
        setRepliesMap((prev) => ({
          ...prev,
          [parent.id]: [...(prev[parent.id] || []), newReply],
        }));
        setReplyContent("");
        setReplyTo(null);
        setExpandedReplies((prev) => new Set(prev).add(parent.id));
      } catch (err) {
        console.error("回复失败:", err);
        alert("回复失败，请重试");
      } finally {
        setSubmitting(false);
      }
    },
    [appUser, replyContent, addComment]
  );

  // 展开/折叠回复
  const toggleReplies = useCallback(
    async (comment: CommentWithUser) => {
      const id = comment.id;
      setExpandedReplies((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });

      // 首次展开时加载回复
      if (!repliesMap[id]) {
        try {
          const replies = await fetchReplies(id);
          setRepliesMap((prev) => ({ ...prev, [id]: replies }));
        } catch (err) {
          console.error("获取回复失败:", err);
        }
      }
    },
    [repliesMap, fetchReplies]
  );

  // 删除评论（仅本人）
  const handleDelete = useCallback(
    async (commentId: string) => {
      if (!confirm("确定删除这条评论吗？")) return;
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);
      if (error) {
        alert("删除失败");
        return;
      }
      // 重新加载
      fetchComments(1);
    },
    [fetchComments]
  );

  return (
    <div className={cn("w-full", className)}>
      {/* 评论输入 */}
      {appUser ? (
        <GlassCard className="mb-4 p-4">
          <div className="flex gap-3">
            <Avatar
              url={appUser.avatar_url}
              nickname={appUser.nickname}
              size="sm"
            />
            <div className="flex-1">
              <Textarea
                placeholder="写下你的评论..."
                value={content}
                maxLength={COMMENT_LIMITS.contentMax}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-white/40">
                  {content.length}/{COMMENT_LIMITS.contentMax}
                </span>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  loading={submitting}
                  disabled={!content.trim()}
                >
                  <FaPaperPlane className="text-xs" />
                  发布评论
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="mb-4 p-4 text-center text-white/60 text-sm">
          请先登录后再评论
        </GlassCard>
      )}

      {/* 评论列表 */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : comments.length === 0 ? (
        <EmptyState
          icon={<FaComment />}
          title="还没有评论"
          description="来说点什么吧"
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {comments.map((comment) => {
              const replies = repliesMap[comment.id] || [];
              const replyCount = replyCounts[comment.id] || 0;
              const isExpanded = expandedReplies.has(comment.id);
              const isOwn = appUser?.id === comment.user_id;

              return (
                <motion.div
                  key={comment.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <GlassCard className="p-4">
                    <div className="flex gap-3">
                      <Avatar
                        url={comment.users.avatar_url}
                        nickname={comment.users.nickname}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        {/* 评论头部 */}
                        <div className="flex items-center gap-2">
                          <a
                            href={`/u/${comment.users.nickname}`}
                            className="text-sm font-medium text-white/90 hover:text-white truncate"
                          >
                            {comment.users.nickname}
                          </a>
                          <span className="text-xs text-white/40">
                            {formatRelativeTime(comment.created_at)}
                          </span>
                        </div>

                        {/* 评论内容 */}
                        <p className="mt-1 text-sm text-white/80 whitespace-pre-wrap break-words">
                          {comment.content}
                        </p>

                        {/* 操作按钮 */}
                        <div className="mt-2 flex items-center gap-4">
                          {appUser && (
                            <button
                              onClick={() => {
                                setReplyTo(
                                  replyTo?.id === comment.id ? null : comment
                                );
                                setReplyContent("");
                              }}
                              className="text-xs text-white/50 hover:text-white/80 transition-colors flex items-center gap-1"
                            >
                              <FaReply className="text-[10px]" />
                              回复
                            </button>
                          )}
                          {isOwn && (
                            <button
                              onClick={() => handleDelete(comment.id)}
                              className="text-xs text-white/50 hover:text-red-400 transition-colors flex items-center gap-1"
                            >
                              <FaTrash className="text-[10px]" />
                              删除
                            </button>
                          )}
                        </div>

                        {/* 回复输入框 */}
                        {replyTo?.id === comment.id && (
                          <div className="mt-3 flex gap-2">
                            <input
                              type="text"
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder={`回复 @${comment.users.nickname}`}
                              maxLength={COMMENT_LIMITS.contentMax}
                              className="flex-1 glass rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleReply(comment)}
                              loading={submitting}
                              disabled={!replyContent.trim()}
                            >
                              发送
                            </Button>
                          </div>
                        )}

                        {/* 展开/折叠回复 — 始终显示回复数 */}
                        {replyCount > 0 && (
                          <button
                            onClick={() => toggleReplies(comment)}
                            className="mt-2 text-xs text-white/50 hover:text-white/80 transition-colors"
                          >
                            {isExpanded
                              ? "收起回复"
                              : `展开 ${replyCount} 条回复`}
                          </button>
                        )}

                        {/* 回复列表 */}
                        {isExpanded && replies.length > 0 && (
                          <div className="mt-3 space-y-2 pl-2 border-l border-white/10">
                            {replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="flex gap-2 pl-2"
                              >
                                <Avatar
                                  url={reply.users.avatar_url}
                                  nickname={reply.users.nickname}
                                  size="sm"
                                  className="!h-6 !w-6 !text-xs"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-white/80">
                                      {reply.users.nickname}
                                    </span>
                                    <span className="text-[10px] text-white/30">
                                      {formatRelativeTime(reply.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-white/70 mt-0.5 break-words">
                                    {reply.content}
                                  </p>
                                </div>
                                {appUser?.id === reply.user_id && (
                                  <button
                                    onClick={() => handleDelete(reply.id)}
                                    className="text-xs text-white/40 hover:text-red-400 transition-colors"
                                  >
                                    <FaTrash className="text-[10px]" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
