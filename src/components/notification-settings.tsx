"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { enablePushNotifications } from "@/lib/push/subscribe";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function isInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

export function NotificationSettings() {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [preferences, setPreferences] = useState({
    daily_learning: true, daily_question: true, partner_status: true, partner_activity: true,
    reminder_time: "09:00", quiet_start: "22:30", quiet_end: "07:00",
  });
  const supabase = useMemo(() => createClient(), []);
  useEffect(() => {
    void supabase.rpc("get_notification_settings").then(({ data }) => {
      const row = data?.[0] as Partial<typeof preferences> | undefined;
      if (row) setPreferences((current) => ({ ...current, ...row }));
    });
    void navigator.serviceWorker?.ready.then(async (registration) => {
      setEnabled(Boolean(await registration.pushManager.getSubscription()));
    });
  }, [supabase]);
  const savePreferences = async (key: keyof typeof preferences, value: boolean | string) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    const { error } = await supabase.from("notification_settings").upsert(next);
    if (error) {
      console.error("Save notification settings error:", error);
      setMessage("Không thể lưu cài đặt thông báo.");
    }
  };
  const toggle = async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setMessage("Thiết bị hoặc trình duyệt này chưa hỗ trợ thông báo đẩy.");
      return;
    }
    if (!enabled && /iPhone|iPad|iPod/i.test(navigator.userAgent) && !isInstalled()) {
      setMessage("Trên iPhone, hãy chọn Chia sẻ → Thêm vào MH chính rồi mở ứng dụng từ màn hình chính.");
      return;
    }
    try {
      const registration = await navigator.serviceWorker.ready;
      if (enabled) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await supabase.rpc("unregister_push_subscription", { p_endpoint: subscription.endpoint });
          await subscription.unsubscribe();
        }
        setEnabled(false);
        setMessage("Đã tắt thông báo trên thiết bị này.");
        return;
      }
      await enablePushNotifications();
      setEnabled(true);
      setMessage("Đã bật thông báo trên thiết bị này.");
    } catch (error) {
      console.error("Toggle push error:", error);
      setMessage("Không thể cập nhật thông báo. Hãy thử lại.");
    }
  };
  return <Card className="space-y-3 p-4"><div className="flex items-center gap-3"><div className="rounded-xl bg-[#F0E9FF] p-2 text-[#7C4DFF]">{enabled ? <Bell /> : <BellOff />}</div><div><h3 className="text-sm font-extrabold">Thông báo</h3><p className="text-xs text-[#786D73]">{enabled ? "Đã bật trên thiết bị này" : "Nhắc học và cập nhật từ người ấy"}</p></div></div><p className="text-xs leading-relaxed text-[#786D73]">Sau khi cho phép, thông báo có thể đến cả khi bạn đóng ứng dụng. Quyền duy trì đến khi bạn tắt hoặc thu hồi; trình duyệt và thiết bị có thể làm mới đăng ký push.</p><Button type="button" variant={enabled ? "secondary" : "primary"} className="w-full" onClick={() => void toggle()}>{enabled ? "Tắt thông báo" : "Bật thông báo"}</Button><div className="space-y-2 border-t border-[#F2EAE5] pt-3">{([["daily_learning", "Nhắc học hằng ngày"], ["daily_question", "Nhắc câu hỏi trong ngày"], ["partner_status", "Người ấy cập nhật trạng thái"], ["partner_activity", "Người ấy trả lời/nộp bài"]] as const).map(([key, label]) => <label key={key} className="flex items-center justify-between text-xs font-semibold"><span>{label}</span><input type="checkbox" checked={preferences[key]} onChange={(event) => void savePreferences(key, event.target.checked)} /></label>)}<div className="grid grid-cols-3 gap-2 text-[11px]"><label>Giờ nhắc<input type="time" value={preferences.reminder_time} onChange={(event) => void savePreferences("reminder_time", event.target.value)} className="mt-1 w-full rounded-lg border p-2" /></label><label>Yên tĩnh từ<input type="time" value={preferences.quiet_start} onChange={(event) => void savePreferences("quiet_start", event.target.value)} className="mt-1 w-full rounded-lg border p-2" /></label><label>Đến<input type="time" value={preferences.quiet_end} onChange={(event) => void savePreferences("quiet_end", event.target.value)} className="mt-1 w-full rounded-lg border p-2" /></label></div></div>{message && <p className="text-xs text-[#6840B8]">{message}</p>}</Card>;
}
