"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface AvatarProps {
  url?: string | null;
  nickname?: string;
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
  userId?: string;
  onUploaded?: (url: string) => void;
  className?: string;
}

const SIZES = {
  sm: "h-8 w-8 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-20 w-20 text-2xl",
  xl: "h-32 w-32 text-4xl",
};

export function Avatar({
  url,
  nickname,
  size = "md",
  editable = false,
  userId,
  onUploaded,
  className,
}: AvatarProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!userId) return;
      setUploading(true);
      try {
        const supabase = createClient();
        const ext = file.name.split(".").pop();
        const path = `${userId}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, file, { cacheControl: "3600", upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);

        if (onUploaded && data.publicUrl) {
          onUploaded(data.publicUrl);
        }
      } catch (err) {
        console.error("Avatar upload error:", err);
        alert("头像上传失败");
      } finally {
        setUploading(false);
      }
    },
    [userId, onUploaded]
  );

  const initials = nickname?.charAt(0).toUpperCase() || "?";

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden flex items-center justify-center",
        "bg-white/20 ring-2 ring-white/30",
        SIZES[size],
        editable && "cursor-pointer hover:ring-white/50 transition-all",
        className
      )}
      onClick={() => editable && fileRef.current?.click()}
    >
      {uploading ? (
        <LoadingSpinner size="sm" />
      ) : url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={nickname || "头像"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-bold text-white/80">{initials}</span>
      )}

      {editable && (
        <>
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <svg
              className="w-1/3 h-1/3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.065 4h3.87a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </>
      )}
    </div>
  );
}
