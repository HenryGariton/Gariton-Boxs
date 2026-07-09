"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { NicknameGate } from "@/components/auth/NicknameGate";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function Home() {
  const router = useRouter();
  const { appUser, loading } = useAuth();

  useEffect(() => {
    // 已登录用户跳转到广场
    if (!loading && appUser) {
      router.replace("/discover");
    }
  }, [appUser, loading, router]);

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 已登录（跳转中）
  if (appUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 未登录 → 显示昵称入口
  return <NicknameGate />;
}
