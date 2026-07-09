import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

/**
 * Markdown 渲染组件（Server/Client 通用）
 * 使用 react-markdown + remark-gfm
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 链接：新窗口打开
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          // 图片：懒加载
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt || ""}
              loading="lazy"
              className="rounded-lg max-w-full h-auto"
              {...props}
            />
          ),
          // 代码块：暗色背景
          pre: ({ children, ...props }) => (
            <pre
              className="bg-black/40 rounded-xl p-4 overflow-x-auto my-4 border border-white/10"
              {...props}
            >
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            // 行内代码
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            // 代码块
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
