"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Database, User as AppUser } from "@/lib/types/database";

interface AuthContextValue {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signInWithNickname: (nickname: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化：检查已有 session
  useEffect(() => {
    let mounted = true;

    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        // 查询 users 表
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (mounted) {
          setAppUser(data);
        }
      }

      if (mounted) {
        setLoading(false);
      }
    }

    init();

    // 监听 auth 状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      if (!mounted) return;

      setUser(session?.user ?? null);

      if (session?.user) {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (mounted) setAppUser(data);
      } else {
        setAppUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 昵称登录流程
  async function signInWithNickname(nickname: string): Promise<{
    error: string | null;
  }> {
    try {
      // 1. 匿名登录
      const { data: authData, error: authError } =
        await supabase.auth.signInAnonymously();

      if (authError || !authData.user) {
        return { error: authError?.message || "登录失败" };
      }

      // 2. 创建 users 记录
      const { error: insertError } = await supabase.from("users").insert({
        id: authData.user.id,
        nickname,
      });

      if (insertError) {
        // 如果插入失败（昵称已存在），登出并返回错误
        if (insertError.code === "23505") {
          await supabase.auth.signOut();
          return { error: "昵称已被占用" };
        }
        await supabase.auth.signOut();
        return { error: insertError.message };
      }

      // 3. 查询并设置 appUser
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      setAppUser(data);
      setUser(authData.user);

      // 4. 缓存昵称
      localStorage.setItem("nickname", nickname);

      return { error: null };
    } catch {
      return { error: "发生未知错误" };
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setAppUser(null);
    localStorage.removeItem("nickname");
  }

  async function refreshUser() {
    if (!user) return;
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    setAppUser(data);
  }

  return (
    <AuthContext.Provider
      value={{ user, appUser, loading, signInWithNickname, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
