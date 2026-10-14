import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email.")
    .email("Email không đúng định dạng."),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu.")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  displayName: z
    .string()
    .min(1, "Vui lòng nhập tên hiển thị.")
    .max(50, "Tên hiển thị tối đa 50 ký tự."),
  email: z
    .string()
    .min(1, "Vui lòng nhập email.")
    .email("Email không đúng định dạng."),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu.")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const joinCoupleSchema = z.object({
  code: z
    .string()
    .min(1, "Vui lòng nhập mã ghép đôi.")
    .transform((val) => val.toUpperCase().trim())
    .refine((val) => /^[A-Z2-9]{10}$/.test(val), {
      message: "Mã ghép đôi gồm đúng 10 ký tự chữ và số (VD: J97XZZDGPZ).",
    }),
});

export type JoinCoupleInput = z.infer<typeof joinCoupleSchema>;

export const createCoupleSchema = z.object({
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu mối quan hệ."),
});

export type CreateCoupleInput = z.infer<typeof createCoupleSchema>;

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, "Vui lòng nhập tên hiển thị.")
    .max(50, "Tên hiển thị tối đa 50 ký tự."),
  startDate: z.string().min(1, "Vui lòng chọn ngày kỷ niệm bắt đầu."),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
