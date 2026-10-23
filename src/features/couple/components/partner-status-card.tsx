"use client";

import { useState, useTransition } from "react";
import { updatePartnerStatusAction } from "../status-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";

const statuses = ["đang nhớ", "vui", "bận", "muốn nói chuyện"];

export function PartnerStatusCard({ statusesForCouple }: { statusesForCouple: Array<{ user_id: string; status: string; expires_at: string }> }) {
  const [status, setStatus] = useState(statuses[0]);
  const [hours, setHours] = useState("4");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const save = () => startTransition(async () => {
    const result = await updatePartnerStatusAction(status, Number(hours));
    setMessage(result.success ? "Đã cập nhật, người ấy sẽ thấy trạng thái này." : result.message ?? "Không thể cập nhật.");
  });
  return <Card className="space-y-3 border-[#F2EAE5] p-4">
    <div className="flex items-center gap-2"><Heart className="h-4 w-4 text-[#F45B69]" /><div><h3 className="text-sm font-bold">Tâm trạng gửi người ấy</h3><p className="text-[11px] text-[#786D73]">Chia sẻ chủ động, tự hết hạn tối đa 8 giờ</p></div></div>
    <div className="grid grid-cols-2 gap-2"><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border p-2 text-xs">{statuses.map((item) => <option key={item}>{item}</option>)}</select><select value={hours} onChange={(e) => setHours(e.target.value)} className="rounded-xl border p-2 text-xs">{[1, 2, 4, 8].map((item) => <option key={item} value={item}>{item} giờ</option>)}</select></div>
    <Button className="w-full" disabled={pending} onClick={save}>Cập nhật trạng thái</Button>
    {statusesForCouple.filter((item) => item.expires_at > new Date().toISOString()).map((item) => <p key={item.user_id} className="text-[11px] text-[#786D73]">Đang chia sẻ: <strong>{item.status}</strong>.</p>)}
    {message && <p className="text-[11px] text-[#1B9B68]">{message}</p>}
  </Card>;
}
