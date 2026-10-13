import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const isEnvConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );

  const supabaseStatus = {
    configured: isEnvConfigured,
    connected: false,
    message: isEnvConfigured
      ? "Đã cấu hình biến môi trường Supabase"
      : "Chưa thiết lập NEXT_PUBLIC_SUPABASE_URL/ANON_KEY (dùng placeholder)",
    error: null as string | null,
  };

  if (isEnvConfigured) {
    try {
      const supabase = await createClient();
      // Test basic query to verify connectivity
      const { error } = await supabase.from("_health_check").select("*").limit(1);
      // If table doesn't exist (PGRST204 or 42P01), it still confirms server reached Supabase!
      if (!error || error.code === "PGRST204" || error.code === "42P01" || error.message?.includes("relation")) {
        supabaseStatus.connected = true;
        supabaseStatus.message = "Kết nối Supabase thành công từ server";
      } else {
        supabaseStatus.error = error.message;
        supabaseStatus.message = `Lỗi phản hồi từ Supabase: ${error.message}`;
      }
    } catch (err) {
      supabaseStatus.error = err instanceof Error ? err.message : String(err);
      supabaseStatus.message = "Không thể kết nối đến máy chủ Supabase";
    }
  }

  return NextResponse.json({
    status: "ok",
    app: "mianh",
    version: "0.1.0 (Phase 0)",
    timestamp: new Date().toISOString(),
    supabase: supabaseStatus,
  });
}
