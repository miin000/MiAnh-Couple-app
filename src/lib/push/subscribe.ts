import { createClient } from "@/lib/supabase/client";

export async function enablePushNotifications() {
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Thiết bị hoặc trình duyệt này chưa hỗ trợ thông báo đẩy.");
  }
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent) &&
      !window.matchMedia("(display-mode: standalone)").matches &&
      !(navigator as Navigator & { standalone?: boolean }).standalone) {
    throw new Error("Trên iPhone, hãy thêm Mi & Anh vào Màn hình chính rồi mở ứng dụng để bật thông báo.");
  }

  const permission = Notification.permission === "granted"
    ? "granted"
    : await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(permission === "denied"
      ? "Thông báo đang bị chặn. Hãy cho phép Mi & Anh trong cài đặt trình duyệt hoặc thiết bị."
      : "Hộp thoại xin quyền chưa được xác nhận. Hãy thử lại và chọn Cho phép trong hộp thoại của trình duyệt.");
  }

  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) throw new Error("Ứng dụng chưa được cấu hình khóa thông báo.");

  const registration = await navigator.serviceWorker.ready;
  const padding = "=".repeat((4 - key.length % 4) % 4);
  const applicationServerKey = Uint8Array.from(
    atob((key + padding).replace(/-/g, "+").replace(/_/g, "/")),
    (character) => character.charCodeAt(0),
  );
  const subscription = await registration.pushManager.getSubscription() ??
    await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error("Không đọc được đăng ký thông báo trên thiết bị.");
  }

  const supabase = createClient();
  const { error } = await supabase.rpc("register_push_subscription", {
    p_endpoint: json.endpoint,
    p_p256dh: json.keys.p256dh,
    p_auth_key: json.keys.auth,
    p_user_agent: navigator.userAgent,
  });
  if (error) throw error;
}
