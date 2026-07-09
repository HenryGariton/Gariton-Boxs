import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const nickname = searchParams.get("nickname");

  if (!nickname || nickname.trim().length < 2) {
    return NextResponse.json({ available: false });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("nickname", nickname.trim())
    .maybeSingle();

  return NextResponse.json({ available: !data });
}
