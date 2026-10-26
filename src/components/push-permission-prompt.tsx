"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { enablePushNotifications } from "@/lib/push/subscribe";
import { getVapidPublicKey } from "@/lib/push/config";

export function PushPermissionPrompt() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [vapidConfigured, setVapidConfigured] = useState(false);

  useEffect(() => {
    let active = true;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    void Promise.all([navigator.serviceWorker.ready, getVapidPublicKey()]).then(async ([registration, key]) => {
      const subscription = await registration.pushManager.getSubscription();
      if (active) {
        setVapidConfigured(Boolean(key));
        setVisible(Notification.permission !== "granted" || !subscription);
      }
    }).catch(() => {
      if (active) {
        setVapidConfigured(false);
        setVisible(Notification.permission !== "granted");
      }
    });
    return () => { active = false; };
  }, []);

  if (!visible) return null;
  const enable = async () => {
    setBusy(true);
    setMessage("");
    try {
      await enablePushNotifications();
      setVisible(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể bật thông báo. Hãy thử lại.");
    } finally {
      setBusy(false);
    }
  };

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#201A1D]/45 px-5 py-8" onMouseDown={(event) => {
    if (event.target === event.currentTarget) setVisible(false);
  }}>
    <Card role="dialog" aria-modal="true" aria-labelledby="push-permission-title" className="relative w-full max-w-sm space-y-4 border-[#E5D8FF] bg-[#FBF8FF] p-5 shadow-[0_20px_60px_rgba(32,26,29,0.22)]">
      <button type="button" onClick={() => setVisible(false)} aria-label="Để sau" className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-[#786D73] hover:bg-white">
        <X className="h-5 w-5" />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <span className="rounded-xl bg-white p-2 text-[#7C4DFF]"><Bell className="h-5 w-5" /></span>
        <div><h2 id="push-permission-title" className="text-sm font-extrabold">{vapidConfigured ? "Bật thông báo trên thiết bị" : "Thông báo chưa sẵn sàng"}</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#786D73]">{vapidConfigured
            ? "Nhận tin khi người ấy cập nhật ghi chú và nhắc học mỗi ngày. Bạn có thể tắt bất cứ lúc nào trong Cài đặt."
            : "Thông báo đẩy chưa được cấu hình trên máy chủ nên hiện chưa thể bật trên thiết bị này."}</p>
        </div>
      </div>
      {vapidConfigured
        ? <Button type="button" disabled={busy} onClick={() => void enable()} className="min-h-11 w-full">{busy ? "Đang bật…" : "Cho phép thông báo"}</Button>
        : <p role="status" className="rounded-xl bg-white px-3 py-2 text-xs leading-relaxed text-[#6840B8]">Hãy báo quản trị viên cấu hình khóa VAPID rồi triển khai lại ứng dụng.</p>}
      {message && <p role="status" className="rounded-xl bg-white px-3 py-2 text-xs leading-relaxed text-[#6840B8]">{message}</p>}
      <button type="button" onClick={() => setVisible(false)} className="min-h-11 w-full text-xs font-semibold text-[#786D73]">Để sau</button>
    </Card>
  </div>;
}
