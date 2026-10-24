"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck } from "lucide-react";
import { notifyLocationSharingChanged } from "../location-sharing-events";

const PROMPT_KEY = "mianh-location-sharing-prompted";

export function LocationSharingPrompt() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (localStorage.getItem(PROMPT_KEY) !== "1") setOpen(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem(PROMPT_KEY, "1");
    setOpen(false);
  }

  async function enable() {
    if (!navigator.geolocation) {
      setMessage("Trình duyệt không hỗ trợ định vị.");
      return;
    }
    setPending(true);
    setMessage("");
    navigator.geolocation.getCurrentPosition(async (position) => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("start_location_sharing");
      if (error || data !== true) {
        setMessage(error?.message || "Không thể bật chia sẻ vị trí. Hãy thử lại trong Cài đặt.");
        setPending(false);
        return;
      }
      notifyLocationSharingChanged();
      const { error: updateError } = await supabase.rpc("update_my_location", {
        p_lat: position.coords.latitude,
        p_lng: position.coords.longitude,
        p_accuracy: position.coords.accuracy,
      });
      if (updateError) {
        setMessage("Đã bật chia sẻ nhưng chưa gửi được vị trí đầu tiên. Hãy thử lại trong Cài đặt.");
        setPending(false);
        return;
      }
      dismiss();
      setPending(false);
    }, (error) => {
      setMessage(error.code === error.PERMISSION_DENIED
        ? "Bạn đã từ chối quyền vị trí. Có thể bật lại trong Cài đặt."
        : "Không lấy được vị trí. Bạn có thể bật lại trong Cài đặt.");
      setPending(false);
    }, { enableHighAccuracy: false, maximumAge: 15000, timeout: 15000 });
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-black/30 p-4">
      <Card className="w-full space-y-4 p-5">
        <ShieldCheck className="h-8 w-8 text-[#7C4DFF]" />
        <div>
          <h2 className="text-base font-extrabold">Chia sẻ vị trí với người ấy?</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#786D73]">
            Chỉ lưu vị trí mới nhất. Khi bật chia sẻ, vị trí tự cập nhật lúc ứng dụng đang mở. Trình duyệt có thể tạm dừng định vị khi app ở nền hoặc đã đóng; GPS thường xuyên có thể dùng nhiều pin. Bạn có thể dừng trong Cài đặt.
          </p>
        </div>
        {message && <p role="alert" className="rounded-xl bg-[#FFF1F2] px-3 py-2 text-xs font-semibold text-[#B4233D]">{message}</p>}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" disabled={pending} onClick={dismiss}>Để sau</Button>
          <Button className="flex-1" disabled={pending} onClick={() => void enable()}>{pending ? "Đang bật..." : "Đồng ý & bật"}</Button>
        </div>
      </Card>
    </div>
  );
}
