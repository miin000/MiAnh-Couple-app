"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck } from "lucide-react";

export function LocationPrivacyCard() {
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  useEffect(() => {
    void supabase.rpc("get_my_sharing_status").then(({ data }) => {
      const row = data?.[0] as { is_sharing?: boolean; sharing_until?: string } | undefined;
      setSharing(row?.is_sharing === true);
    });
  }, [supabase]);
  async function stop() {
    setPending(true);
    const { error } = await supabase.rpc("stop_location_sharing");
    if (!error) setSharing(false);
    setPending(false);
  }
  async function start() {
    if (!navigator.geolocation) { setMessage("Trình duyệt không hỗ trợ định vị."); return; }
    setPending(true);
    setMessage("");
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { data, error } = await supabase.rpc("start_location_sharing");
      if (error || data !== true) {
        setMessage(error?.message || "Không thể bật chia sẻ vị trí.");
        setPending(false);
        return;
      }
      const { error: updateError } = await supabase.rpc("update_my_location", {
        p_lat: position.coords.latitude,
        p_lng: position.coords.longitude,
        p_accuracy: position.coords.accuracy,
      });
      if (updateError) setMessage("Đã bật nhưng chưa gửi được vị trí đầu tiên.");
      else setSharing(true);
      setPending(false);
    }, (error) => {
      setMessage(error.code === error.PERMISSION_DENIED ? "Bạn chưa cấp quyền vị trí cho website." : "Không lấy được vị trí.");
      setPending(false);
    }, { enableHighAccuracy: false, maximumAge: 15000, timeout: 15000 });
  }
  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#7C4DFF]" /><h3 className="text-sm font-extrabold">Quyền riêng tư vị trí</h3></div>
      <p className="text-xs leading-relaxed text-[#786D73]">Vị trí chỉ lưu bản mới nhất, chỉ người ấy được xem khi bạn đang chia sẻ. Dữ liệu sẽ được xóa tọa độ khi dừng hoặc hết hạn.</p>
      {message && <p role="alert" className="rounded-xl bg-[#FFF1F2] px-3 py-2 text-xs font-semibold text-[#B4233D]">{message}</p>}
      {sharing ? <div className="flex items-center justify-between gap-3"><span className="text-xs font-bold text-[#167A57]">Đang chia sẻ cho đến khi bạn tự tắt</span><Button size="sm" variant="outline" disabled={pending} onClick={() => void stop()}>Tắt</Button></div> : <div className="space-y-3"><p className="text-xs font-semibold text-[#8E8287]">Hiện chưa chia sẻ vị trí.</p><Button className="w-full" disabled={pending} onClick={() => void start()}>{pending ? "Đang bật..." : "Bật chia sẻ vị trí"}</Button></div>}
    </Card>
  );
}
