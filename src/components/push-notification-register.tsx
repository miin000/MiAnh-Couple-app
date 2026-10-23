"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function PushNotificationRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    void navigator.serviceWorker.ready.then(async (registration) => {
      if (Notification.permission !== "granted") return;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return;
      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) return;
      const supabase = createClient();
      await supabase.from("push_subscriptions").upsert({
        endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth,
      }, { onConflict: "user_id,endpoint" });
    }).catch((error) => console.error("Push registration error:", error));
  }, []);
  return null;
}
