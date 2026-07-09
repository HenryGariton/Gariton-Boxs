"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

interface PostImagesProps {
  images: string[];
  className?: string;
}

/**
 * 动态图片展示组件
 * - 1 张: 大图全宽
 * - 2-3 张: 并排网格
 * - 4-9 张: 3 列网格
 * - 空数组不渲染
 * - 点击放大全屏预览
 */
export function PostImages({ images, className }: PostImagesProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const handlePrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setPreviewIndex((prev) =>
        prev !== null ? (prev - 1 + images.length) % images.length : null
      );
    },
    [images.length]
  );

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setPreviewIndex((prev) =>
        prev !== null ? (prev + 1) % images.length : null
      );
    },
    [images.length]
  );

  if (!images || images.length === 0) return null;

  const count = images.length;

  // 根据图片数量决定网格布局
  const gridClass =
    count === 1
      ? "grid-cols-1"
      : count === 2
        ? "grid-cols-2"
        : count === 3
          ? "grid-cols-3"
          : "grid-cols-3";

  return (
    <>
      <div className={cn("grid gap-1.5 sm:gap-2", gridClass, className)}>
        {images.map((src, index) => (
          <button
            key={index}
            onClick={() => setPreviewIndex(index)}
            className={cn(
              "relative overflow-hidden rounded-lg bg-white/10",
              "transition-transform duration-200 hover:scale-[1.02]",
              "active:scale-95",
              count === 1 && "aspect-video",
              count === 4 && index === 0 && "row-span-2 col-span-2",
              count > 1 && count <= 3 && "aspect-square",
              count > 3 && "aspect-square"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`图片 ${index + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* 全屏预览 */}
      {previewIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setPreviewIndex(null)}
        >
          {/* 关闭提示 */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewIndex(null);
            }}
          >
            ✕ 关闭
          </button>

          {/* 上一张 */}
          {images.length > 1 && (
            <button
              className="absolute left-2 sm:left-4 text-white/80 hover:text-white text-2xl px-2"
              onClick={handlePrev}
            >
              ‹
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[previewIndex]}
            alt={`图片 ${previewIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* 下一张 */}
          {images.length > 1 && (
            <button
              className="absolute right-2 sm:right-4 text-white/80 hover:text-white text-2xl px-2"
              onClick={handleNext}
            >
              ›
            </button>
          )}

          {/* 计数器 */}
          {images.length > 1 && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {previewIndex + 1} / {images.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
