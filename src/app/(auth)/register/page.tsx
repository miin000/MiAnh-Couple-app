"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { registerAction } from "@/features/auth/actions";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      setServerSuccess(null);
      const res = await registerAction(data);
      if (res && !res.success) {
        setServerError(res.error || "Đăng ký thất bại.");
      } else if (res && res.success && res.error) {
        // Confirmation message
        setServerSuccess(res.error);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        throw err;
      }
      setServerError(
        err instanceof Error ? err.message : "Đã có lỗi xảy ra khi đăng ký."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F2] flex justify-center p-4">
      <div className="w-full max-w-md flex flex-col justify-between py-6">
        <div>
          <PageHeader
            title="Tạo tài khoản mới"
            subtitle="Bắt đầu hành trình lưu giữ kỷ niệm cùng người thương."
            backHref="/login"
          />

          <div className="mt-6 space-y-4 rounded-3xl bg-white border border-[#EFE5E0] p-6 shadow-sm">
            {serverError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                {serverError}
              </div>
            )}

            {serverSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium leading-relaxed">
                {serverSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-xs font-bold text-[#52464D] mb-1.5"
                >
                  Tên hiển thị
                </label>
                <Input
                  id="displayName"
                  placeholder="Ví dụ: Minh"
                  {...register("displayName")}
                />
                {errors.displayName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.displayName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-[#52464D] mb-1.5"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tenban@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-[#52464D] mb-1.5"
                >
                  Mật khẩu
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2"
              >
                {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
              </Button>
            </form>
          </div>
        </div>

        <div className="text-center text-xs text-[#8E8287] pt-4">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-bold text-[#FA5271]">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

