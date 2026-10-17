"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { anniversarySchema, bucketItemSchema, memorySchema } from "./validations";

export interface MemoryActionResult {
  success: boolean;
  message: string;
  memoryId?: string;
  coupleId?: string;
}

async function currentUserAndCouple() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: coupleId } = await supabase.rpc("current_couple_id");
  return { supabase, user, coupleId };
}

export async function createMemoryAction(formData: FormData): Promise<MemoryActionResult> {
  const parsed = memorySchema.safeParse({
    title: formData.get("title"),
    note: formData.get("note") || "",
    happened_at: formData.get("happened_at"),
  });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
  const { supabase, user, coupleId } = await currentUserAndCouple();
  if (!user || !coupleId) return { success: false, message: "Vui lòng ghép đôi trước khi lưu kỷ niệm." };

  const { data: memory, error } = await supabase.from("memories").insert({
    couple_id: coupleId, created_by: user.id, ...parsed.data,
  }).select("id").single();
  if (error || !memory) return { success: false, message: "Không thể lưu kỷ niệm." };

  revalidatePath("/our-space");
  return { success: true, message: "Đã lưu kỷ niệm.", memoryId: memory.id, coupleId };
}

export async function deleteMemoryAction(id: string): Promise<MemoryActionResult> {
  const { supabase, coupleId } = await currentUserAndCouple();
  if (!coupleId) return { success: false, message: "Không tìm thấy không gian của hai bạn." };
  const { data: photos } = await supabase.from("memory_photos").select("storage_path").eq("memory_id", id);
  if (photos?.length) {
    const { error: storageError } = await supabase.storage.from("memories").remove(photos.map((photo) => photo.storage_path));
    if (storageError) return { success: false, message: "Không thể xóa ảnh của kỷ niệm." };
  }
  const { error } = await supabase.from("memories").delete().eq("id", id).eq("couple_id", coupleId);
  if (error) return { success: false, message: "Không thể xóa kỷ niệm." };
  revalidatePath("/our-space");
  return { success: true, message: "Đã xóa kỷ niệm." };
}

export async function updateMemoryAction(input: { id: string; title: string; note?: string; happened_at: string }): Promise<MemoryActionResult> {
  const parsed = memorySchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
  const { supabase, coupleId } = await currentUserAndCouple();
  if (!coupleId) return { success: false, message: "Không tìm thấy không gian của hai bạn." };
  const { error } = await supabase.from("memories").update(parsed.data).eq("id", input.id).eq("couple_id", coupleId);
  if (error) return { success: false, message: "Không thể cập nhật kỷ niệm." };
  revalidatePath("/our-space");
  return { success: true, message: "Đã cập nhật kỷ niệm." };
}

export async function saveAnniversaryAction(input: { id?: string; title: string; event_date: string; repeat_yearly: boolean }): Promise<MemoryActionResult> {
  const parsed = anniversarySchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
  const { supabase, user, coupleId } = await currentUserAndCouple();
  if (!user || !coupleId) return { success: false, message: "Vui lòng ghép đôi trước." };
  const query = input.id
    ? supabase.from("anniversaries").update(parsed.data).eq("id", input.id).eq("couple_id", coupleId)
    : supabase.from("anniversaries").insert({ ...parsed.data, couple_id: coupleId, created_by: user.id });
  const { error } = await query;
  if (error) return { success: false, message: "Không thể lưu ngày kỷ niệm." };
  revalidatePath("/our-space"); revalidatePath("/home");
  return { success: true, message: "Đã lưu ngày kỷ niệm." };
}

export async function deleteAnniversaryAction(id: string): Promise<MemoryActionResult> {
  const { supabase, coupleId } = await currentUserAndCouple();
  if (!coupleId) return { success: false, message: "Vui lòng ghép đôi trước." };
  const { error } = await supabase.from("anniversaries").delete().eq("id", id).eq("couple_id", coupleId);
  if (error) return { success: false, message: "Không thể xóa ngày kỷ niệm." };
  revalidatePath("/our-space"); revalidatePath("/home");
  return { success: true, message: "Đã xóa ngày kỷ niệm." };
}

export async function addBucketItemAction(title: string): Promise<MemoryActionResult> {
  const parsed = bucketItemSchema.safeParse({ title });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
  const { supabase, user, coupleId } = await currentUserAndCouple();
  if (!user || !coupleId) return { success: false, message: "Vui lòng ghép đôi trước." };
  const { error } = await supabase.from("bucket_list_items").insert({ ...parsed.data, couple_id: coupleId, created_by: user.id });
  if (error) return { success: false, message: "Không thể thêm vào Bucket List." };
  revalidatePath("/our-space");
  return { success: true, message: "Đã thêm vào danh sách." };
}

export async function toggleBucketItemAction(id: string, isDone: boolean): Promise<MemoryActionResult> {
  const { supabase, coupleId } = await currentUserAndCouple();
  if (!coupleId) return { success: false, message: "Vui lòng ghép đôi trước." };
  const { error } = await supabase.from("bucket_list_items").update({ is_done: isDone, done_at: isDone ? new Date().toISOString() : null }).eq("id", id).eq("couple_id", coupleId);
  if (error) return { success: false, message: "Không thể cập nhật Bucket List." };
  revalidatePath("/our-space");
  return { success: true, message: isDone ? "Đã đánh dấu hoàn thành." : "Đã đưa về chưa hoàn thành." };
}

export async function deleteBucketItemAction(id: string): Promise<MemoryActionResult> {
  const { supabase, coupleId } = await currentUserAndCouple();
  if (!coupleId) return { success: false, message: "Vui lòng ghép đôi trước." };
  const { error } = await supabase.from("bucket_list_items").delete().eq("id", id).eq("couple_id", coupleId);
  if (error) return { success: false, message: "Không thể xóa mục." };
  revalidatePath("/our-space");
  return { success: true, message: "Đã xóa mục." };
}
