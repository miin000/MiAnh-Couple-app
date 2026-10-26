"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Heart, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { saveMyStatusAction, clearMyStatusAction } from "../status-actions";
import type { CoupleStatus, StatusPreset } from "../status-types";

function remaining(seconds: number) {
  return `${Math.max(1, Math.ceil(seconds / 3600))} giờ`;
}

function Avatar({ person }: { person: CoupleStatus }) {
  return <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E9E9ED] text-2xl font-extrabold text-[#6E56B8] ring-2 ring-white shadow-[0_4px_14px_rgba(32,26,29,0.12)]">
    {person.avatar_url ? <img src={person.avatar_url} alt="" className="h-full w-full object-cover" /> : person.display_name.charAt(0).toUpperCase()}
  </div>;
}

export function CoupleStatusBoard({ initialStatuses, presets }: { initialStatuses: CoupleStatus[]; presets: StatusPreset[] }) {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [selected, setSelected] = useState<CoupleStatus | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [note, setNote] = useState(initialStatuses.find((item) => item.is_me)?.note_text ?? "");
  const [emoji, setEmoji] = useState(initialStatuses.find((item) => item.is_me)?.emoji ?? "💬");
  const [hours, setHours] = useState(12);
  const [notify, setNotify] = useState(true);
  const [actionError, setActionError] = useState("");
  const [pending, startTransition] = useTransition();
  const supabase = useMemo(() => createClient(), []);
  const refresh = async () => {
    const { data, error } = await supabase.rpc("get_couple_statuses");
    if (!error) setStatuses((data ?? []) as CoupleStatus[]);
  };
  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => void refresh(), 60_000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    const channel = supabase.channel("partner-statuses").on("postgres_changes", { event: "*", schema: "public", table: "partner_statuses" }, () => void refresh()).subscribe();
    return () => { window.clearTimeout(initial); window.clearInterval(interval); window.removeEventListener("focus", onFocus); void supabase.removeChannel(channel); };
  }, [supabase]);
  useEffect(() => {
    const timer = window.setInterval(() => setStatuses((current) => current.map((item) => ({ ...item, seconds_left: Math.max(0, item.seconds_left - 1) }))), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const me = statuses.find((item) => item.is_me);
  const partner = statuses.find((item) => !item.is_me);
  const save = () => startTransition(async () => {
    setActionError("");
    try {
      const result = await saveMyStatusAction({ emoji, noteText: note.trim(), hours, notifyPartner: notify });
      if (result.success) { setEditorOpen(false); await refresh(); }
      else setActionError(result.message || "Không thể lưu ghi chú. Hãy thử lại.");
    } catch (error) {
      console.error("Save note action failed:", error);
      setActionError("Máy chủ chưa phản hồi được thao tác lưu. Hãy tải lại trang rồi thử lại.");
    }
  });
  const clear = () => startTransition(async () => {
    setActionError("");
    try {
      const result = await clearMyStatusAction();
      if (result.success) { setEditorOpen(false); await refresh(); }
      else setActionError(result.message || "Không thể xóa ghi chú. Hãy thử lại.");
    } catch (error) {
      console.error("Clear note action failed:", error);
      setActionError("Máy chủ chưa phản hồi được thao tác xóa. Hãy tải lại trang rồi thử lại.");
    }
  });
  if (!me || !partner) return null;
  const myNote = me.seconds_left > 0 ? me.note_text : null;
  const partnerNote = partner.seconds_left > 0 ? partner.note_text : null;
  return <section className="px-3 pb-1 pt-1">
    <div className="flex items-end justify-center gap-4 sm:gap-9">
      <div className="flex w-[140px] flex-col items-center gap-2">
        {myNote ? <button type="button" onClick={() => setEditorOpen(true)} className="relative min-h-[42px] max-w-[140px] rounded-[1.15rem] bg-[#C92543] px-3 py-2 text-center text-xs font-semibold leading-4 text-white shadow-sm after:absolute after:bottom-[-7px] after:left-1/2 after:border-x-[7px] after:border-t-[7px] after:border-x-transparent after:border-t-[#C92543]"><span className="line-clamp-2">{me.emoji} {myNote}</span><span className="mt-0.5 block text-[10px] font-normal text-white/75">còn {remaining(me.seconds_left)}</span></button> : <button type="button" onClick={() => setEditorOpen(true)} className="relative min-h-[42px] max-w-[140px] rounded-[1.15rem] bg-[#343438] px-3 py-2 text-xs font-medium text-white/80 shadow-sm after:absolute after:bottom-[-7px] after:left-6 after:border-x-[7px] after:border-t-[7px] after:border-x-transparent after:border-t-[#343438]">+ Thêm ghi chú</button>}
        <div className="relative">
          <button type="button" onClick={() => setEditorOpen(true)} aria-label="Sửa ghi chú của bạn"><Avatar person={me} /></button>
          {!myNote && <button type="button" onClick={() => setEditorOpen(true)} aria-label="Thêm ghi chú" className="absolute -bottom-1 -right-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#343438] text-3xl font-light leading-none text-white shadow-md">+</button>}
        </div>
        <span className="text-xs font-bold text-[#52464D]">Mình</span>
      </div>
      <Heart className="mb-10 h-4 w-4 fill-[#F45B69] text-[#F45B69]" />
      <div className="flex w-[140px] flex-col items-center gap-2">
        {partnerNote && <button type="button" onClick={() => setSelected(partner)} className="relative min-h-[42px] max-w-[140px] rounded-[1.15rem] bg-[#343438] px-3 py-2 text-center text-xs font-semibold leading-4 text-white shadow-sm after:absolute after:bottom-[-7px] after:left-1/2 after:border-x-[7px] after:border-t-[7px] after:border-x-transparent after:border-t-[#343438]"><span className="line-clamp-2">{partner.emoji} {partnerNote}</span></button>}
        <button type="button" onClick={() => partnerNote && setSelected(partner)} aria-label="Xem ghi chú của người ấy"><Avatar person={partner} /></button>
        <span className="text-xs font-bold text-[#52464D]">{partner.display_name}</span>
      </div>
    </div>
    {selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4" onClick={() => setSelected(null)}><div className="w-full max-w-md rounded-3xl bg-white p-5" onClick={(event) => event.stopPropagation()}><button type="button" className="float-right" onClick={() => setSelected(null)}><X className="h-5 w-5" /></button><p className="font-bold">{selected.emoji} {selected.note_text}</p><p className="mt-2 text-xs text-[#786D73]">Cập nhật {selected.updated_at ? new Date(selected.updated_at).toLocaleString("vi-VN") : "vừa xong"}</p></div></div>}
    {editorOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4" onClick={() => setEditorOpen(false)}><div className="w-full max-w-md space-y-4 rounded-t-3xl bg-white p-5" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="font-extrabold">Ghi chú của mình</h2><button type="button" onClick={() => setEditorOpen(false)}><X /></button></div><div className="grid grid-cols-6 gap-2">{presets.map((preset) => <button key={preset.id} type="button" onClick={() => { setEmoji(preset.emoji); setNote(preset.label); }} className={`rounded-xl border p-2 text-xl ${emoji === preset.emoji ? "border-[#7C4DFF] bg-[#F0E9FF]" : ""}`}>{preset.emoji}</button>)}</div><label className="block text-xs font-bold">Tự viết<textarea value={note} maxLength={80} onChange={(event) => setNote(event.target.value)} className="mt-1 min-h-20 w-full rounded-xl border border-[#E5D8FF] p-3 text-sm" /><span className="text-[10px] text-[#9E9096]">{note.length}/80</span></label><div className="flex gap-2"><select value={hours} onChange={(event) => setHours(Number(event.target.value))} className="min-h-11 flex-1 rounded-xl border px-3 text-sm">{[1, 4, 12, 24].map((value) => <option key={value} value={value}>{value} giờ</option>)}</select><label className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border px-3 text-xs"><input type="checkbox" checked={notify} onChange={(event) => setNotify(event.target.checked)} /> Báo cho người ấy</label></div><Button className="w-full" disabled={pending} onClick={save}>Lưu ghi chú</Button>{actionError && <p role="alert" className="text-xs text-red-600">{actionError}</p>}{me.note_text && <button type="button" disabled={pending} onClick={clear} className="w-full text-xs font-bold text-red-500">Xóa ghi chú</button>}</div></div>}
  </section>;
}
