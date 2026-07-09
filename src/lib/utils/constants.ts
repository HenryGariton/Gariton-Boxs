// 社交平台配置
export const SOCIAL_PLATFORMS = [
  { key: "github", label: "GitHub", icon: "FaGithub", placeholder: "https://github.com/username" },
  { key: "twitter", label: "Twitter", icon: "FaTwitter", placeholder: "https://twitter.com/username" },
  { key: "weibo", label: "微博", icon: "FaWeibo", placeholder: "https://weibo.com/username" },
  { key: "zhihu", label: "知乎", icon: "SiZhihu", placeholder: "https://zhihu.com/people/username" },
  { key: "juejin", label: "掘金", icon: "SiJuejin", placeholder: "https://juejin.cn/user/xxx" },
  { key: "website", label: "个人网站", icon: "FaGlobe", placeholder: "https://yoursite.com" },
  { key: "wechat", label: "微信", icon: "FaWeixin", placeholder: "微信号" },
] as const;

// 名片主题色
export const THEME_COLORS = [
  { key: "violet", label: "紫色", gradient: "from-purple-500 to-indigo-500" },
  { key: "blue", label: "蓝色", gradient: "from-blue-500 to-cyan-500" },
  { key: "green", label: "绿色", gradient: "from-green-500 to-teal-500" },
  { key: "orange", label: "橙色", gradient: "from-orange-500 to-red-500" },
  { key: "pink", label: "粉色", gradient: "from-pink-500 to-rose-500" },
] as const;

// 昵称验证规则
export const NICKNAME_RULES = {
  minLength: 2,
  maxLength: 20,
  pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/, // 中英文数字下划线
};

// 动态内容限制
export const POST_LIMITS = {
  shortContentMax: 500,
  maxImages: 9,
  articleTitleMax: 100,
  articleContentMax: 50000,
};

// 评论限制
export const COMMENT_LIMITS = {
  contentMax: 500,
};

// 分页
export const PAGE_SIZE = 10;

// 应用信息
export const APP_CONFIG = {
  name: "名片社交",
  description: "创建你的个人名片，分享动态与文章，与更多人连接",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};
