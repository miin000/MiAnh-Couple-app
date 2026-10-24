"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LOCATION_SHARING_CHANGED_EVENT,
  LOCATION_UPDATED_EVENT,
  type LocationUpdatedEventDetail,
} from "../location-sharing-events";

export function LocationSharingTracker() {
  const [trackingMessage, setTrackingMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let watchId: number | null = null;
    let disposed = false;
    let lastSaved: { lat: number; lng: number; at: number } | null = null;

    const stopWatching = () => {
      if (watchId !== null) navigator.geolocation?.clearWatch(watchId);
      watchId = null;
      lastSaved = null;
    };

    const sendPosition = (position: GeolocationPosition) => {
      const point = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy_m: position.coords.accuracy,
      };
      const now = Date.now();
      const previous = lastSaved;
      const movedMeters = previous
        ? Math.hypot((point.lat - previous.lat) * 111000, (point.lng - previous.lng) * 111000)
        : Number.POSITIVE_INFINITY;
      const shouldSave = !previous || movedMeters >= 25 || now - previous.at >= 15000;

      if (!shouldSave) return;
      lastSaved = { lat: point.lat, lng: point.lng, at: now };
      const updatedAt = new Date(now).toISOString();
      const detail: LocationUpdatedEventDetail = { ...point, updated_at: updatedAt };
      void supabase.rpc("update_my_location", {
        p_lat: point.lat,
        p_lng: point.lng,
        p_accuracy: point.accuracy_m,
      }).then(({ error }) => {
        if (error) {
          lastSaved = null;
          setTrackingMessage("Không thể lưu vị trí mới. Hãy kiểm tra kết nối mạng.");
        } else {
          setTrackingMessage(null);
          window.dispatchEvent(new CustomEvent(LOCATION_UPDATED_EVENT, { detail }));
        }
      });
    };

    const syncSharing = async () => {
      const { data, error } = await supabase.rpc("get_my_sharing_status");
      if (disposed) return;
      if (error) {
        setTrackingMessage("Không kiểm tra được trạng thái chia sẻ vị trí.");
        return;
      }
      const row = data?.[0] as { is_sharing?: boolean } | undefined;
      if (row?.is_sharing && watchId === null) {
        if (!navigator.geolocation) {
          setTrackingMessage("Trình duyệt không hỗ trợ định vị.");
        } else {
          watchId = navigator.geolocation.watchPosition(
            sendPosition,
            (positionError) => setTrackingMessage(positionError.code === positionError.PERMISSION_DENIED
              ? "Quyền vị trí đã bị chặn. Hãy cấp lại quyền trong cài đặt trình duyệt."
              : "Không lấy được vị trí mới. Hãy thử lại khi GPS ổn định hơn."),
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
          );
        }
      } else if (!row?.is_sharing) {
        stopWatching();
        setTrackingMessage(null);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void syncSharing();
    };

    window.addEventListener(LOCATION_SHARING_CHANGED_EVENT, syncSharing);
    document.addEventListener("visibilitychange", onVisibilityChange);
    void syncSharing();
    const statusRefresh = window.setInterval(() => void syncSharing(), 60000);

    return () => {
      disposed = true;
      window.clearInterval(statusRefresh);
      window.removeEventListener(LOCATION_SHARING_CHANGED_EVENT, syncSharing);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopWatching();
    };
  }, []);

  if (!trackingMessage) return null;
  return <div role="status" className="fixed bottom-24 left-4 right-4 z-50 rounded-2xl border border-[#F6D0D6] bg-white px-4 py-3 text-xs font-semibold text-[#6840B8] shadow-lg">{trackingMessage}</div>;
}
