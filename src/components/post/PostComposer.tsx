"use client";

import { useState, useRef, useCallback } from "react";
import { FaImage, FaTimes } from "react-icons/fa";
import { GlassCard } from "@/components/ui/GlassCard";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePosts } from "@/lib/hooks/usePosts";
import { createClient } from "@/lib/supabase/client";
import { POST_LIMITS } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";

interface PostComposerProps {
  onSuccess?: () => void;
  className?: string;
}

/**
 * 动态发布器
 * - 文本输入（最多 500 字）
 * - 图片上传（最多 9 张，Supabase Storage post-images bucket）
 * - 发布后清空表单
 */
export function PostComposer({ onSuccess, className }: PostComposerProps) {
  const { appUser } = useAuth();
  const { createPost } = usePosts();

  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const maxLen = POST_LIMITS.shortContentMax;
  const maxImages = POST_LIMITS.maxImages;
  const canSubmit = content.trim().length > 0 && !submitting;

  // 图片上传
  const handleImageUpload = useCallback(
    async (files: FileList) => {
      if (!appUser) return;
      const remaining = maxImages - imageUrls.length;
      const toUpload = Array.from(files).slice(0, remaining);
      if (toUpload.length === 0) return;

      setUploading(true);
      try {
        const supabase = createClient();
        const uploadedUrls: string[] = [];

        for (const file of toUpload) {
          const ext = file.name.split(".").pop() || "jpg";
          const path = `${appUser.id}/${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("post-images")
            .upload(path, file, { cacheControl: "3600", upsert: false });

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from("post-images")
            .getPublicUrl(path);

          if (data.publicUrl) {
            uploadedUrls.push(data.publicUrl);
          }
        }

        setImageUrls((prev) => [...prev, ...uploadedUrls]);
      } catch (err) {
        console.error("图片上传失败:", err);
        alert("图片上传失败，请重试");
      } finally {
        setUploading(false);
      }
    },
    [appUser, imageUrls.length, maxImages]
  );

  // 删除已上传图片
  const handleRemoveImage = useCallback((index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // 发布动态
  const handleSubmit = useCallback(async () => {
    if (!appUser || !content.trim()) return;
    setSubmitting(true);
    try {
      await createPost({
        user_id: appUser.id,
        type: "short",
        content: content.trim(),
        images: imageUrls.length > 0 ? imageUrls : [],
        likes_count: 0,
        comments_count: 0,
      });

      // 清空表单
      setContent("");
      setImageUrls([]);

      // 成功回调
      onSuccess?.();
    } catch (err) {
      console.error("发布失败:", err);
      alert("发布失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }, [appUser, content, imageUrls, createPost, onSuccess]);

  const charCount = content.length;
  const isOverLimit = charCount > maxLen * 0.9;

  return (
    <GlassCard className={cn("p-4 sm:p-5", className)}>
      {/* 文本输入 */}
      <Textarea
        placeholder="分享你的想法..."
        value={content}
        maxLength={maxLen}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[120px] text-base"
        autoFocus
      />

      {/* 字数统计 */}
      <div className="mt-2 flex items-center justify-end">
        <span
          className={cn(
            "text-xs",
            isOverLimit ? "text-orange-400" : "text-white/40"
          )}
        >
          {charCount}/{maxLen}
        </span>
      </div>

      {/* 图片预览 */}
      {imageUrls.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {imageUrls.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`预览 ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                title="删除图片"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 底部操作栏 */}
      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
        {/* 图片上传按钮 */}
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleImageUpload(e.target.files);
                // 重置 input 以便重复选择同一文件
                e.target.value = "";
              }
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={
              uploading ||
              !appUser ||
              imageUrls.length >= maxImages
            }
          >
            {uploading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <FaImage />
            )}
            <span className="text-xs">
              {imageUrls.length}/{maxImages}
            </span>
          </Button>
        </div>

        {/* 发布按钮 */}
        <Button
          size="sm"
          onClick={handleSubmit}
          loading={submitting}
          disabled={!canSubmit}
        >
          发布
        </Button>
      </div>
    </GlassCard>
  );
}
