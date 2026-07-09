"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { PostComposer } from "@/components/post/PostComposer";

export default function NewPostPage() {
  const router = useRouter();

  const handleSuccess = useCallback(() => {
    router.push("/feed");
  }, [router]);

  return (
    <PageContainer maxWidth="sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* 页面标题 */}
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <FaArrowLeft />
            返回
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            发布动态
          </h1>
        </div>

        {/* 发布器 */}
        <PostComposer onSuccess={handleSuccess} />
      </motion.div>
    </PageContainer>
  );
}
