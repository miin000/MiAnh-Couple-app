"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

export async function loginAction(data: LoginInput): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Dữ liệu đăng nhập không hợp lệ.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { success: false, error: "Email hoặc mật khẩu không chính xác." };
    }
    if (error.message.includes("Email not confirmed")) {
      return {
        success: false,
        error: "Email chưa được kích hoạt. Vui lòng kiểm tra hòm thư của bạn.",
      };
    }
    return { success: false, error: `Đăng nhập thất bại: ${error.message}` };
  }

  // Check couple status to redirect appropriately
  const { data: coupleId } = await supabase.rpc("current_couple_id");

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

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered") || error.message.includes("User already exists")) {
      return { success: false, error: "Email này đã được sử dụng. Hãy chọn đăng nhập." };
    }
    if (error.message.includes("rate limit") || error.message.includes("over_email_send_rate_limit")) {
      return {
        success: false,
        error: "Supabase giới hạn gửi tối đa 3-4 email xác nhận/giờ trên gói miễn phí. Bạn hãy tắt tính năng 'Confirm email' trong Supabase Dashboard (Authentication > Providers > Email) để đăng ký ngay mà không cần chờ gửi email.",
      };
    }
    return { success: false, error: `Đăng ký thất bại: ${error.message}` };
  }

  // If Supabase has email confirmation enabled and session is not immediately returned
  if (!authData.session) {
    return {
      success: true,
      error: "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập.",
    };
  }

  redirect("/pair");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
