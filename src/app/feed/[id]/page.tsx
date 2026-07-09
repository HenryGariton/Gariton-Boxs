"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft, FaRegComment } from "react-icons/fa";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PostCard } from "@/components/post/PostCard";
import { CommentSection } from "@/components/social/CommentSection";
import { usePosts } from "@/lib/hooks/usePosts";
import type { PostWithUser } from "@/lib/types/database";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getPost } = usePosts();

  const id = params?.id as string;

  const [post, setPost] = useState<PostWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPost(id);
      setPost(data);
    } catch (err) {
      console.error("获取动态失败:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id, getPost]);

  useEffect(() => {
    if (id) fetchPost();
  }, [id, fetchPost]);

  // 删除后跳转
  const handleDelete = useCallback(() => {
    router.push("/feed");
  }, [router]);

  // 加载中
  if (loading) {
    return (
      <PageContainer maxWidth="sm">
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  // 未找到
  if (notFound || !post) {
    return (
      <PageContainer maxWidth="sm">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/feed")}
          >
            <FaArrowLeft />
            返回动态广场
          </Button>
        </div>
        <EmptyState
          icon={<FaRegComment />}
          title="动态不存在"
          description="这条动态可能已被删除"
          action={
            <Button onClick={() => router.push("/feed")}>
              去动态广场看看
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* 返回按钮 */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/feed")}
          >
            <FaArrowLeft />
            返回动态广场
          </Button>
        </div>

        {/* 动态详情 */}
        <PostCard post={post} showCommentButton={false} onDelete={handleDelete} />

        {/* 评论区 */}
        <div className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
            <FaRegComment />
            评论
          </h2>
          <CommentSection targetType="post" targetId={id} />
        </div>
      </motion.div>
    </PageContainer>
  );
}
