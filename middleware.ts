import { type NextRequest, NextResponse } from "next/server";

/**
 * 轻量级 middleware —— 仅透传请求
 * Supabase 认证由客户端在 AuthProvider 中处理
 * 这样避免 Edge Runtime 兼容性问题
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，排除：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico
     * - 公共资源文件
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|map)$).*)",
  ],
};
