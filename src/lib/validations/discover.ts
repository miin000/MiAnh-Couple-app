import { z } from "zod";

export const createDatePlanSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên kế hoạch")
    .max(100, "Tên kế hoạch tối đa 100 ký tự"),
  planned_for: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "Ngày không hợp lệ (định dạng YYYY-MM-DD)",
    }),
  planned_budget: z.coerce
    .number()
    .nonnegative("Ngân sách dự kiến không được âm")
    .optional()
    .default(0),
});

export type CreateDatePlanInput = z.infer<typeof createDatePlanSchema>;

export const updateDatePlanSchema = z.object({
  id: z.string().uuid("ID kế hoạch không hợp lệ"),
  title: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên kế hoạch")
    .max(100, "Tên kế hoạch tối đa 100 ký tự"),
  planned_for: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "Ngày không hợp lệ (định dạng YYYY-MM-DD)",
    }),
  planned_budget: z.coerce
    .number()
    .nonnegative("Ngân sách không được âm")
    .optional()
    .default(0),
});

export type UpdateDatePlanInput = z.infer<typeof updateDatePlanSchema>;

export const createDatePlanItemSchema = z.object({
  plan_id: z.string().uuid("ID kế hoạch không hợp lệ"),
  title: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên món/địa điểm/hoạt động")
    .max(120, "Tên tối đa 120 ký tự"),
  random_item_id: z.string().uuid().optional().nullable(),
  estimated_cost: z.coerce
    .number()
    .nonnegative("Chi phí Æ°ớc tính không được âm")
    .optional()
    .default(0),
  actual_cost: z.coerce
    .number()
    .nonnegative("Chi phí thực tế không được âm")
    .optional()
    .nullable(),
});

export type CreateDatePlanItemInput = z.infer<typeof createDatePlanItemSchema>;

export const updateDatePlanItemSchema = z.object({
  id: z.string().uuid("ID mục không hợp lệ"),
  title: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên mục")
    .max(120, "Tên tối đa 120 ký tự")
    .optional(),
  estimated_cost: z.coerce
    .number()
    .nonnegative("Chi phí Æ°ớc tính không được âm")
    .optional(),
  actual_cost: z.coerce
    .number()
    .nonnegative("Chi phí thực tế không được âm")
    .optional()
    .nullable(),
});

export type UpdateDatePlanItemInput = z.infer<typeof updateDatePlanItemSchema>;
