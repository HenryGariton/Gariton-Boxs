"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaTrash } from "react-icons/fa";
import { PageContainer } from "@/components/layout/PageContainer";
import { CardForm } from "@/components/card/CardForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCard } from "@/lib/hooks/useCard";
import type { Card } from "@/lib/types/database";

export default function EditCardPage() {
  const params = useParams();
  const router = useRouter();
  const nickname = params.nickname as string;

  const { user, appUser, loading: authLoading } = useAuth();
  const { getMyCard, deleteCard } = useCard();

  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  // 权限检查 & 获取名片数据
  useEffect(() => {
    async function fetchData() {
      if (authLoading) return;

      // 未登录
      if (!user || !appUser) {
        router.replace("/");
        return;
      }

      // 不是本人
      if (appUser.nickname !== nickname) {
        router.replace(`/u/${nickname}`);
        return;
      }

      // 获取已有名片
      try {
        const data = await getMyCard(user.id);
        setCard(data);
      } catch (err) {
        console.error("获取名片失败:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [authLoading, user, appUser, nickname, router, getMyCard]);

  // 保存成功回调
  const handleSave = () => {
    setRedirecting(true);
    router.push(`/u/${nickname}`);
  };

  // 删除名片
  const handleDelete = useCallback(async () => {
    console.log("[handleDelete] 触发，cardId:", card?.id);
    if (!card) return;
    if (!confirm("确定删除你的名片吗？此操作不可恢复。")) {
      console.log("[handleDelete] 用户取消");
      return;
    }
    try {
      console.log("[handleDelete] 开始调用 deleteCard...");
      await deleteCard(card.id);
      console.log("[handleDelete] deleteCard 成功，跳转到 /discover");
      router.push("/discover");
    } catch (err: any) {
      console.error("[handleDelete] 删除失败:", err?.message, err?.details, err?.hint, err);
      alert("删除失败: " + (err?.message || "未知错误，请打开控制台查看详情"));
    }
  }, [card, deleteCard, router]);

  // 加载中
  if (authLoading || loading || redirecting) {
    return (
      <PageContainer maxWidth="md">
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  // 未登录或无权限（跳转中）
  if (!user || !appUser || appUser.nickname !== nickname) {
    return (
      <PageContainer maxWidth="md">
        <EmptyState title="无权访问" description="正在跳转..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {card ? "编辑名片" : "创建名片"}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {card
              ? "更新你的名片信息，保持与时俱进"
              : "填写以下信息，创建你的个人名片"}
          </p>
        </div>

        {/* 表单 */}
        <CardForm initialData={card} onSave={handleSave} />

        {/* 删除名片（仅已有名片时显示） */}
        {card && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-400 border-red-400/30 hover:bg-red-400/10 hover:border-red-400/50"
            >
              <FaTrash />
              删除名片
            </Button>
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}
