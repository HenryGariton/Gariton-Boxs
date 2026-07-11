"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaCog, FaSignOutAlt, FaUserEdit } from "react-icons/fa";
import { useAuth } from "@/lib/hooks/useAuth";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageContainer } from "@/components/layout/PageContainer";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const { appUser, user, signOut, loading, refreshUser } = useAuth();
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!appUser || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 已在上方守卫确认 user 非 null
  const userId = user.id;

  async function handleSaveNickname() {
    if (!newNickname.trim()) {
      setError("昵称不能为空");
      return;
    }
    if (newNickname.length < 2 || newNickname.length > 20) {
      setError("昵称需 2-20 个字符");
      return;
    }
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(newNickname)) {
      setError("只能包含中英文、数字和下划线");
      return;
    }

    // 检查昵称是否被占用（排除自己）
    const res = await fetch(
      `/api/check-nickname?nickname=${encodeURIComponent(newNickname)}`
    );
    const data = await res.json();

    if (!data.available) {
      setError("昵称已被占用");
      return;
    }

    setSaving(true);
    setError("");
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      const { error: updateError } = await supabase
        .from("users")
        .update({ nickname: newNickname.trim() })
        .eq("id", userId);

      if (updateError) throw updateError;

      localStorage.setItem("nickname", newNickname.trim());
      refreshUser();
      setEditingNickname(false);
    } catch {
      setError("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer maxWidth="sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* 标题 */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
          <FaCog />
          设置
        </h1>

        {/* 用户信息卡片 */}
        <GlassCard className="space-y-6">
          {/* 头像 + 昵称 */}
          <div className="flex items-center gap-4">
            <Avatar
              url={appUser.avatar_url}
              nickname={appUser.nickname}
              size="xl"
              editable={true}
              userId={user.id}
              onUploaded={async () => {
                refreshUser();
              }}
            />
            <div>
              <p className="font-semibold text-lg">{appUser.nickname}</p>
              <p className="text-sm text-white/50">ID: {user.id.slice(0, 8)}...</p>
            </div>
          </div>

          <hr className="border-white/10" />

          {/* 昵称修改 */}
          <div>
            <h3 className="text-sm font-medium text-white/70 mb-2">
              修改昵称
            </h3>
            {editingNickname ? (
              <div className="space-y-2">
                <Input
                  value={newNickname}
                  onChange={(e) => {
                    setNewNickname(e.target.value);
                    setError("");
                  }}
                  error={error}
                  placeholder="输入新昵称"
                  icon={<FaUserEdit />}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveNickname}
                    loading={saving}
                    disabled={!newNickname.trim()}
                    size="sm"
                    variant="primary"
                  >
                    保存
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingNickname(false);
                      setError("");
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between glass rounded-xl px-4 py-2.5 min-h-[44px]">
                <span className="text-white/80">{appUser.nickname}</span>
                <Button
                  onClick={() => {
                    setNewNickname(appUser.nickname);
                    setEditingNickname(true);
                    setError("");
                  }}
                  size="sm"
                  variant="ghost"
                >
                  修改
                </Button>
              </div>
            )}
          </div>

          <hr className="border-white/10" />

          {/* 快捷操作 */}
          <div className="space-y-2">
            <Button
              onClick={() => router.push(`/u/${appUser.nickname}/edit`)}
              variant="outline"
              className="w-full justify-start"
            >
              编辑我的名片 →
            </Button>

            <Button
              onClick={() => router.push("/discover")}
              variant="outline"
              className="w-full justify-start"
            >
              浏览名片广场 →
            </Button>
          </div>
        </GlassCard>

        {/* 退出登录 */}
        <GlassCard>
          <Button
            onClick={() => {
              signOut();
              router.replace("/");
            }}
            variant="ghost"
            className="w-full text-red-300 hover:text-red-200 justify-start"
          >
            <FaSignOutAlt className="mr-2" />
            退出当前身份
          </Button>
          <p className="mt-2 text-xs text-white/40 text-center">
            退出后需重新输入昵称进入（设备级身份）
          </p>
        </GlassCard>

        {/* 应用信息 */}
        <p className="text-center text-xs text-white/30">
          名片社交平台 · Next.js 16 + Supabase
        </p>
      </motion.div>
    </PageContainer>
  );
}
