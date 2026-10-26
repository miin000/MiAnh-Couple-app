import { createClient } from "@/lib/supabase/client";
import { decodeVapidPublicKey } from "@/lib/push/config";

export async function enablePushNotifications(key: string) {
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Thiết bị hoặc trình duyệt này chưa hỗ trợ thông báo đẩy.");
  }
  const applicationServerKey = decodeVapidPublicKey(key);
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent) &&
      !window.matchMedia("(display-mode: standalone)").matches &&
      !(navigator as Navigator & { standalone?: boolean }).standalone) {
    throw new Error("Trên iPhone, hãy thêm Mi & Anh vào Màn hình chính rồi mở ứng dụng để bật thông báo.");
  }

  // Call requestPermission before the first await so browsers retain the tap's user activation.
  const permissionRequest: Promise<NotificationPermission> = Notification.permission === "granted"
    ? Promise.resolve("granted")
    : Notification.requestPermission();
  const permission = await permissionRequest;
  if (permission !== "granted") {
    throw new Error(permission === "denied"
      ? "Thông báo đang bị chặn. Hãy cho phép Mi & Anh trong cài đặt trình duyệt hoặc thiết bị."
      : "Hộp thoại xin quyền chưa được xác nhận. Hãy thử lại và chọn Cho phép trong hộp thoại của trình duyệt.");
  }

  const registration = await navigator.serviceWorker.ready;
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
