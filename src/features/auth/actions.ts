"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

function isEnvReady() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return url.length > 0 && key.length > 0 && !url.includes("placeholder");
}

export async function loginAction(data: LoginInput): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Dữ liệu đăng nhập không hợp lệ.",
    };
  }

  if (!isEnvReady()) {
    return {
      success: false,
      error: "Hệ thống chưa tìm thấy cấu hình Supabase hợp lệ. Vui lòng kiểm tra file .env.local và khởi động lại dev server.",
    };
  }

  const supabase = await createClient();

  let authError: { message?: string; name?: string } | null = null;

  // Tự động thử lại 1 lần nếu gặp lỗi mạng tạm thời (fetch failed / timeout)
  for (let attempt = 1; attempt <= 2; attempt++) {
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (!error) {
      authError = null;
      break;
    }

    authError = error;
    const isNetwork =
      error.message?.includes("fetch failed") ||
      error.name === "AuthRetryableFetchError" ||
      error.message?.toLowerCase().includes("failed to fetch") ||
      error.message?.toLowerCase().includes("network");

    if (isNetwork && attempt < 2) {
      await new Promise((r) => setTimeout(r, 600));
      continue;
    }
    break;
  }

  if (authError) {
    const msg = authError.message || "";
    if (msg.includes("Invalid login credentials")) {
      return { success: false, error: "Email hoặc mật khẩu không chính xác." };
    }
    if (msg.includes("Email not confirmed")) {
      return {
        success: false,
        error: "Email chưa được kích hoạt. Vui lòng kiểm tra hòm thư của bạn.",
      };
    }
    if (
      msg.includes("fetch failed") ||
      authError.name === "AuthRetryableFetchError" ||
      msg.toLowerCase().includes("failed to fetch") ||
      msg.toLowerCase().includes("network")
    ) {
      return {
        success: false,
        error:
          "Không thể kết nối đến máy chủ Supabase (lỗi mạng hoặc timeout). Vui lòng kiểm tra kết nối internet của bạn, tắt VPN nếu đang bật, rồi thử lại.",
      };
    }
    return { success: false, error: `Đăng nhập thất bại: ${msg}` };
  }

  // Check couple status to redirect appropriately
  let coupleId: string | null = null;
  try {
    const { data } = await supabase.rpc("current_couple_id");
    coupleId = data;
  } catch {
    // If RPC fails due to transient connection, proceed to default route
  }

  if (coupleId) {
    redirect("/home");
  } else {
    redirect("/pair");
  }
}

export async function registerAction(data: RegisterInput): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Dữ liệu đăng ký không hợp lệ.",
    };
  }

  if (!isEnvReady()) {
    return {
      success: false,
      error: "Hệ thống chưa tìm thấy cấu hình Supabase hợp lệ. Vui lòng kiểm tra file .env.local và khởi động lại dev server.",
    };
  }

  const supabase = await createClient();

  let authData: { session: unknown } | null = null;
  let authError: { message?: string; name?: string } | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const res = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          display_name: parsed.data.displayName,
        },
      },
    });

    if (!res.error) {
      authData = res.data;
      authError = null;
      break;
    }

    authError = res.error;
    const isNetwork =
      res.error.message?.includes("fetch failed") ||
      res.error.name === "AuthRetryableFetchError" ||
      res.error.message?.toLowerCase().includes("failed to fetch") ||
      res.error.message?.toLowerCase().includes("network");

    if (isNetwork && attempt < 2) {
      await new Promise((r) => setTimeout(r, 600));
      continue;
    }
    break;
  }

  if (authError) {
    const msg = authError.message || "";
    if (msg.includes("already registered") || msg.includes("User already exists")) {
      return { success: false, error: "Email này đã được sử dụng. Hãy chọn đăng nhập." };
    }
    if (msg.includes("rate limit") || msg.includes("over_email_send_rate_limit")) {
      return {
        success: false,
        error: "Supabase giới hạn gửi tối đa 3-4 email xác nhận/giờ trên gói miễn phí. Bạn hãy tắt tính năng 'Confirm email' trong Supabase Dashboard (Authentication > Providers > Email) để đăng ký ngay mà không cần chờ gửi email.",
      };
    }
    if (
      msg.includes("fetch failed") ||
      authError.name === "AuthRetryableFetchError" ||
      msg.toLowerCase().includes("failed to fetch") ||
      msg.toLowerCase().includes("network")
    ) {
      return {
        success: false,
        error:
          "Không thể kết nối đến máy chủ Supabase (lỗi mạng hoặc timeout). Vui lòng kiểm tra kết nối internet của bạn và thử lại.",
      };
    }
    return { success: false, error: `Đăng ký thất bại: ${msg}` };
  }

  // If Supabase has email confirmation enabled and session is not immediately returned
  if (!authData?.session) {
    return {
      success: true,
      error: "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập.",
    };
  }

  redirect("/pair");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  try {
    await supabase.auth.signOut();
  } catch {
    // Ignore sign out network failures and continue redirect
  }
  redirect("/login");
}
