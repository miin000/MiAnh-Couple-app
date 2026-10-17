import { z } from "zod";

export const memorySchema = z.object({
  title: z.string().trim().min(1, "Vui lòng nhập tiêu đề.").max(120, "Tiêu đề tối đa 120 ký tự."),
  note: z.string().max(5000, "Ghi chú tối đa 5.000 ký tự.").optional().default(""),
  happened_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ."),
});

export const anniversarySchema = z.object({
  title: z.string().trim().min(1, "Vui lòng nhập tên ngày kỷ niệm.").max(100, "Tên tối đa 100 ký tự."),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ."),
  repeat_yearly: z.boolean(),
});

export const bucketItemSchema = z.object({
  title: z.string().trim().min(1, "Vui lòng nhập điều muốn làm.").max(200, "Tối đa 200 ký tự."),
});

export const MAX_MEMORY_PHOTO_BYTES = 10 * 1024 * 1024;
export const ALLOWED_MEMORY_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function validateMemoryPhoto(file: File) {
  if (!ALLOWED_MEMORY_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_MEMORY_PHOTO_TYPES)[number])) {
    return "Ảnh chỉ được là JPEG, PNG hoặc WebP.";
  }
  if (file.size > MAX_MEMORY_PHOTO_BYTES) {
    return "Ảnh vượt quá giới hạn 10 MB.";
  }
  return null;
}
