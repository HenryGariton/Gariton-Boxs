import { NextResponse } from "next/server";

// 不执行任何逻辑，纯透传
export function middleware() {
  return NextResponse.next();
}
