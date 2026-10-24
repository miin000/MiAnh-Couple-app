"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  data: { url?: string };
  created_at: string;
}

export function NotificationsInbox() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const supabase = createClient();
  const refresh = async () => {
    const [{ data: countData }, { data: rows }] = await Promise.all([
      supabase.rpc("unread_notification_count"),
      supabase.from("notifications").select("id,title,body,data,created_at").order("created_at", { ascending: false }).limit(20),
    ]);
    setCount(typeof countData === "number" ? countData : 0);
    setItems((rows ?? []) as NotificationRow[]);
  };
  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    const channel = supabase.channel("my-notifications").on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => void refresh()).subscribe();
    return () => { window.clearTimeout(initial); void supabase.removeChannel(channel); };
  }, [supabase]);
  const showInbox = async () => {
    setOpen(true);
    await supabase.rpc("mark_notifications_read");
    setCount(0);
  };
  return <><button type="button" onClick={() => void showInbox()} aria-label="Mở hộp thư" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#786D73] shadow-sm"><Bell className="h-5 w-5" />{count > 0 && <span className="absolute right-0 top-0 h-4 min-w-4 rounded-full bg-[#F45B69] px-1 text-[10px] font-bold leading-4 text-white">{count > 9 ? "9+" : count}</span>}</button>{open && <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setOpen(false)}><aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-[#FAF8FF] p-4 shadow-xl" onClick={(event) => event.stopPropagation()}><div className="mb-4 flex items-center justify-between"><h2 className="font-extrabold">Hộp thư</h2><button type="button" onClick={() => setOpen(false)}><X /></button></div>{items.length === 0 ? <p className="rounded-2xl bg-white p-5 text-center text-sm text-[#786D73]">Chưa có thông báo mới.</p> : <div className="space-y-2">{items.map((item) => <Link key={item.id} href={item.data?.url || "/home"} onClick={() => setOpen(false)} className="block rounded-2xl bg-white p-4 shadow-sm"><p className="text-sm font-bold">{item.title}</p><p className="mt-1 text-xs text-[#786D73]">{item.body}</p><p className="mt-2 text-[10px] text-[#9E9096]">{new Date(item.created_at).toLocaleString("vi-VN")}</p></Link>)}</div>}</aside></div>}</>;
}
