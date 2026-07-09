"use client";

import { useState, useRef, useCallback } from "react";
import { FaBold, FaItalic, FaHeading, FaLink, FaImage, FaCode } from "react-icons/fa";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { cn } from "@/lib/utils/cn";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// 工具栏按钮配置
const TOOLBAR_BUTTONS = [
  { icon: FaBold, label: "加粗", prefix: "**", suffix: "**", placeholder: "粗体文本" },
  { icon: FaItalic, label: "斜体", prefix: "*", suffix: "*", placeholder: "斜体文本" },
  { icon: FaHeading, label: "标题", prefix: "# ", suffix: "", placeholder: "标题" },
  { icon: FaLink, label: "链接", prefix: "[", suffix: "](url)", placeholder: "链接文字" },
  { icon: FaImage, label: "图片", prefix: "![", suffix: "](url)", placeholder: "图片描述" },
  { icon: FaCode, label: "代码块", prefix: "```\n", suffix: "\n```", placeholder: "代码" },
] as const;

/**
 * Markdown 编辑器
 * - 桌面端：左右分栏（编辑 + 实时预览）
 * - 移动端：Tab 切换（编辑 / 预览）
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder = "开始编写 Markdown 内容...",
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // 在光标位置插入 Markdown 语法
  const insertSyntax = useCallback(
    (prefix: string, suffix: string, placeholderText: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.slice(start, end) || placeholderText;

      const newValue =
        value.slice(0, start) + prefix + selectedText + suffix + value.slice(end);

      onChange(newValue);

      // 设置光标位置到插入的文本中间
      requestAnimationFrame(() => {
        const newCursorPos = start + prefix.length + selectedText.length;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      });
    },
    [value, onChange]
  );

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* 编辑区 */}
      <div className={cn("flex-1 flex flex-col min-h-[400px]", activeTab === "preview" && "hidden md:flex")}>
        {/* 工具栏 */}
        <div className="flex items-center gap-1 p-2 glass rounded-t-xl border-b border-white/10">
          {TOOLBAR_BUTTONS.map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={() => insertSyntax(btn.prefix, btn.suffix, btn.placeholder)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title={btn.label}
            >
              <btn.icon className="text-sm" />
            </button>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "flex-1 w-full glass rounded-b-xl rounded-t-none p-4",
            "font-mono text-sm text-white resize-none",
            "focus:outline-none focus:ring-1 focus:ring-white/20",
            "min-h-[360px]"
          )}
        />
      </div>

      {/* 预览区 */}
      <div className={cn("flex-1 min-h-[400px]", activeTab === "edit" && "hidden md:block")}>
        <div className="glass rounded-xl p-4 h-full overflow-auto">
          <div className="text-xs text-white/40 mb-3 pb-2 border-b border-white/10">预览</div>
          {value ? (
            <div className="text-sm sm:text-base">
              <MarkdownRenderer content={value} />
            </div>
          ) : (
            <div className="text-white/30 text-center py-12">
              预览区域
            </div>
          )}
        </div>
      </div>

      {/* 移动端 Tab 切换 */}
      <div className="flex md:hidden gap-2 mt-2">
        <button
          type="button"
          onClick={() => setActiveTab("edit")}
          className={cn(
            "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all",
            activeTab === "edit"
              ? "bg-white/20 text-white"
              : "bg-white/5 text-white/60 hover:bg-white/10"
          )}
        >
          编辑
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={cn(
            "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all",
            activeTab === "preview"
              ? "bg-white/20 text-white"
              : "bg-white/5 text-white/60 hover:bg-white/10"
          )}
        >
          预览
        </button>
      </div>
    </div>
  );
}
