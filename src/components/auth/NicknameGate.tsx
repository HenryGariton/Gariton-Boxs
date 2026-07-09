"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/GlassCard";
import { NICKNAME_RULES } from "@/lib/utils/constants";

export function NicknameGate() {
  const router = useRouter();
  const { signInWithNickname } = useAuth();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  // 防抖检查昵称唯一性
  const checkAvailability = useCallback(async (name: string) => {
    if (
      name.length < NICKNAME_RULES.minLength ||
      !NICKNAME_RULES.pattern.test(name)
    ) {
      setAvailable(null);
      return;
    }

    setChecking(true);
    try {
      const res = await fetch(
        `/api/check-nickname?nickname=${encodeURIComponent(name)}`
      );
      const data = await res.json();
      setAvailable(data.available);
    } catch {
      setAvailable(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (nickname) checkAvailability(nickname);
      else setAvailable(null);
    }, 500);
    return () => clearTimeout(timer);
  }, [nickname, checkAvailability]);

  const validate = (name: string): string | null => {
    if (name.length < NICKNAME_RULES.minLength)
      return `昵称至少 ${NICKNAME_RULES.minLength} 个字符`;
    if (name.length > NICKNAME_RULES.maxLength)
      return `昵称最多 ${NICKNAME_RULES.maxLength} 个字符`;
    if (!NICKNAME_RULES.pattern.test(name))
      return "昵称只能包含中英文、数字和下划线";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate(nickname);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    const { error: signInError } = await signInWithNickname(nickname);
    setLoading(false);

    if (signInError) {
      setError(signInError);
    } else {
      router.push(`/u/${nickname}/edit`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8 sm:p-10">
          {/* Logo / 标题 */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full glass-strong mb-4"
            >
              <FaUserCircle className="text-4xl text-white/80" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              欢迎来到名片社交
            </h1>
            <p className="mt-2 text-sm text-white/60">
              输入一个昵称，创建你的专属名片
            </p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="你的昵称"
              placeholder="2-20 个字符，中英文数字下划线"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError("");
              }}
              error={error}
              icon={<FaUserCircle />}
              autoFocus
            />

            {/* 昵称可用性提示 */}
            {nickname && !error && (
              <div className="text-sm">
                {checking ? (
                  <span className="text-white/50">检查中...</span>
                ) : available === true ? (
                  <span className="text-green-300">✓ 昵称可用</span>
                ) : available === false ? (
                  <span className="text-red-300">✗ 昵称已被占用</span>
                ) : null}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              loading={loading}
              disabled={!nickname || available === false || checking}
              className="w-full"
            >
              {loading ? "正在进入..." : "开始使用"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-white/40">
            无需注册密码，输入昵称即可使用
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
