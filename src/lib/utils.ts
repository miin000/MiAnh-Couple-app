import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const RPC_ERROR_MAP: Record<string, string> = {
  NOT_AUTHENTICATED: "Bạn cần đăng nhập lại.",
  NOT_IN_COUPLE: "Bạn chưa có không gian chung.",
  ALREADY_IN_COUPLE: "Bạn đã ở trong một không gian có đủ 2 người rồi.",
  INVITE_NOT_FOUND: "Mã mời không đúng hoặc không tồn tại.",
  INVITE_EXPIRED: "Mã mời đã hết hạn (chỉ có hiệu lực trong 48 giờ).",
  INVITE_REVOKED: "Mã mời đã bị thu hồi.",
  INVITE_USED_UP: "Mã mời đã được sử dụng.",
  COUPLE_FULL: "Không gian này đã đủ hai người tham gia.",
  CANNOT_JOIN_OWN_COUPLE: "Bạn không thể nhập mã do chính mình tạo ra.",
  CANNOT_LEAVE_PAIRED_COUPLE: "Bạn đã ghép đôi hoàn tất, không thể tự hủy cặp.",
  INVALID_ARGUMENT: "Dữ liệu không hợp lệ.",
  NO_QUESTION_AVAILABLE: "Chưa có câu hỏi nào, hãy thử lại sau.",
  NO_LESSON_AVAILABLE: "Chưa có bài học nào.",
  WORD_NOT_FOUND: "Không tìm thấy từ này.",
};

export function getErrorMessage(
  error: unknown,
  fallback = "Có lỗi xảy ra, vui lòng thử lại."
): string {
  if (!error) return fallback;
  const msg =
    typeof error === "string"
      ? error
      : (error as { message?: string }).message || "";

  for (const [code, vietnamese] of Object.entries(RPC_ERROR_MAP)) {
    if (msg.includes(code)) {
      return vietnamese;
    }
  }
  return msg || fallback;
}
