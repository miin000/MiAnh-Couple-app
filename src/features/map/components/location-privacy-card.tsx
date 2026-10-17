"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck } from "lucide-react";

export function LocationPrivacyCard() {
  const [until, setUntil] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  useEffect(() => {
    void supabase.rpc("get_my_sharing_status").then(({ data }) => {
      const row = data?.[0] as { is_sharing?: boolean; sharing_until?: string } | undefined;
      if (row?.is_sharing) setUntil(row.sharing_until || null);
    });
  }, [supabase]);
  async function stop() {
    setPending(true);
    const { error } = await supabase.rpc("stop_location_sharing");
    if (!error) setUntil(null);
    setPending(false);
  }
  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#7C4DFF]" /><h3 className="text-sm font-extrabold">Quyền riêng tư vị trí</h3></div>
      <p className="text-xs leading-relaxed text-[#786D73]">Vị trí chỉ lưu bản mới nhất, chỉ người ấy được xem khi bạn đang chia sẻ. Dữ liệu sẽ được xóa tọa độ khi dừng hoặc hết hạn.</p>
      {until ? <div className="flex items-center justify-between gap-3"><span className="text-xs font-bold text-[#167A57]">Đang chia sẻ đến {new Date(until).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span><Button size="sm" variant="outline" disabled={pending} onClick={() => void stop()}>Dừng</Button></div> : <p className="text-xs font-semibold text-[#8E8287]">Hiện chưa chia sẻ vị trí.</p>}
    </Card>
  );
}
