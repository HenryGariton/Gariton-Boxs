"use client";

import { useAuthContext } from "@/lib/providers/AuthProvider";

/**
 * 认证 Hook — 获取当前用户状态和操作
 */
export function useAuth() {
  return useAuthContext();
}
