"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MarkdownEditor } from "@/components/blog/MarkdownEditor";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePosts } from "@/lib/hooks/usePosts";
import { generateExcerpt } from "@/lib/utils/format";

export default function NewArticlePage() {
  const router = useRouter();
  const { appUser } = useAuth();
  const { createPost } = usePosts();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [loading, setLoading] = useState(false);

  // 检查是否可以发布
  const canPublish = title.trim().length > 0 && content.trim().length >= 10;

  // 发布文章
  const handlePublish = useCallback(async () => {
    if (!canPublish || !appUser) return;

    setLoading(true);
    try {
      // 生成摘要
      const excerpt = generateExcerpt(content);

      const data = await createPost({
        user_id: appUser.id,
        type: "article",
        title: title.trim(),
        content: content.trim(),
        excerpt,
        cover_image: coverImage.trim() || null,
      });

      router.push(`/blog/${data.id}`);
    } catch (err) {
      console.error("发布失败:", err);
      alert("发布失败，请重试");
    } finally {
      setLoading(false);
    }
  }, [title, content, coverImage, canPublish, appUser, createPost, router]);

  return (
    <PageContainer maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* 页面标题 + 返回按钮 */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-white">写文章</h1>
        </div>

        {/* 标题输入 */}
        <Input
          label="文章标题"
          placeholder="请输入文章标题..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4"
        />

        {/* 封面图 URL（可选） */}
        <Input
          label="封面图链接（可选）"
          placeholder="https://example.com/image.jpg"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          className="mb-4"
        />

        {/* Markdown 编辑器 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white/70 mb-2">
            文章内容
          </label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="开始编写你的文章...支持 Markdown 语法"
          />
        </div>

        {/* 底部操作栏：字数统计 + 发布按钮 */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <span className="text-sm text-white/40">
            {content.length} 字{content.length < 10 && content.length > 0 && "（至少需要 10 字）"}
          </span>
          <Button
            onClick={handlePublish}
            loading={loading}
            disabled={!canPublish}
          >
            发布文章
          </Button>
        </div>
      </motion.div>
    </PageContainer>
  );
}
