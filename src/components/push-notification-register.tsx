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
      await supabase.rpc("register_push_subscription", {
        p_endpoint: json.endpoint,
        p_p256dh: json.keys.p256dh,
        p_auth_key: json.keys.auth,
        p_user_agent: navigator.userAgent,
      });
    }).catch((error) => console.error("Push registration error:", error));
  }, []);
  return null;
}
