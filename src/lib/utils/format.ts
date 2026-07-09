/**
 * 格式化相对时间（如 "3 分钟前"、"2 小时前"）
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 30) return `${days} 天前`;
  if (months < 12) return `${months} 个月前`;
  return `${years} 年前`;
}

/**
 * 格式化绝对时间（如 "2025-01-15 14:30"）
 */
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 格式化日期（如 "2025-01-15"）
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 格式化数字（如 1.2k、3.5w）
 */
export function formatCount(num: number): string {
  if (num < 1000) return String(num);
  if (num < 10000) return `${(num / 1000).toFixed(1)}k`;
  return `${(num / 10000).toFixed(1)}w`;
}

/**
 * 截断文本
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * 从 Markdown 内容生成摘要
 */
export function generateExcerpt(markdown: string, maxLength = 200): string {
  // 移除 Markdown 语法标记
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, "") // 代码块
    .replace(/!\[.*?\]\(.*?\)/g, "") // 图片
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // 链接保留文字
    .replace(/[#*`>~_-]/g, "") // 标记符号
    .replace(/\n+/g, " ") // 换行变空格
    .trim();

  return truncate(plainText, maxLength);
}
