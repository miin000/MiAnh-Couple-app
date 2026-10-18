"use client";

import { useEffect, useMemo, useState } from "react";
import { Album, CalendarDays, Check, History, Image as ImageIcon, ListChecks, Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addBucketItemAction, createMemoryAction, deleteAnniversaryAction, deleteBucketItemAction, deleteMemoryAction, saveAnniversaryAction, toggleBucketItemAction, updateMemoryAction } from "../actions";
import { type Anniversary, type BucketListItem, type Memory } from "../types";
import { validateMemoryPhoto } from "../validations";
import { getDaysTogether } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface OurSpaceViewProps {
  coupleId: string;
  startDate: string | null;
  timezone?: string;
  memories: Memory[];
  anniversaries: Anniversary[];
  bucketList: BucketListItem[];
}

type Tab = "timeline" | "album" | "bucket";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export function OurSpaceView({ startDate, timezone = "Asia/Ho_Chi_Minh", memories, anniversaries, bucketList }: OurSpaceViewProps) {
  const [tab, setTab] = useState<Tab>("timeline");
  const [showMemoryForm, setShowMemoryForm] = useState<false | true | Memory>(false);
  const [showAnniversaryForm, setShowAnniversaryForm] = useState(false);
  const [message, setMessage] = useState("");
  const together = getDaysTogether(startDate, timezone);

  async function run(action: Promise<{ success: boolean; message: string }>) {
    const result = await action;
    setMessage(result.message);
    if (result.success) window.location.reload();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-[#7C4DFF] to-[#FF8B9D] p-5 text-center text-white shadow-[0_10px_25px_rgba(250,82,113,0.3)]">
        <p className="text-xs font-bold uppercase tracking-widest text-white/80">Hành trình của hai đứa</p>
        <p className="my-1 text-5xl font-extrabold">{together?.toLocaleString("vi-VN") ?? "—"}</p>
        <p className="text-sm text-white/90">ngày bên nhau</p>
      </div>

      <div className="grid grid-cols-3 rounded-2xl bg-[#ECE2DC] p-1">
        {([["timeline", History, "Dòng thời gian"], ["album", ImageIcon, "Album"], ["bucket", ListChecks, "Bucket list"]] as const).map(([value, Icon, label]) => (
          <button key={value} type="button" onClick={() => setTab(value)} className={`flex min-h-[44px] items-center justify-center gap-1 rounded-xl text-[11px] font-bold ${tab === value ? "bg-white text-[#7C4DFF] shadow-2xs" : "text-[#786D73]"}`}>
            <Icon className="h-3.5 w-3.5" />{label}
          </button>
        ))}
      </div>

      {message && <div role="status" className="rounded-2xl bg-[#F5F0FF] px-4 py-3 text-xs font-semibold text-[#6840B8]">{message}</div>}

      {tab === "timeline" && (
        <>
          <div className="flex items-center justify-between">
            <div><p className="text-[11px] font-bold uppercase tracking-wider text-[#7C4DFF]">NHỮNG ĐIỀU ĐÁNG NHỚ</p><h2 className="text-lg font-extrabold">Chuyện của hai đứa</h2></div>
            <Button size="sm" onClick={() => setShowMemoryForm(true)}><Plus className="mr-1 h-4 w-4" /> Thêm</Button>
          </div>
          {memories.length === 0 ? <Empty title="Chưa có kỷ niệm nào" text="Lưu lại một khoảnh khắc để câu chuyện bắt đầu nhé." /> : (
            <div className="relative space-y-4 pl-6 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-0.5 before:bg-[#E8DCD6]">
              {memories.map((memory) => <MemoryCard key={memory.id} memory={memory} onDelete={() => run(deleteMemoryAction(memory.id))} onEdit={() => setShowMemoryForm(memory)} />)}
            </div>
          )}
          <AnniversarySection anniversaries={anniversaries} showForm={showAnniversaryForm} onShowForm={setShowAnniversaryForm} run={run} />
        </>
      )}

      {tab === "album" && <AlbumView memories={memories} />}
      {tab === "bucket" && <BucketList items={bucketList} run={run} />}
      {showMemoryForm && <MemoryForm memory={showMemoryForm === true ? undefined : showMemoryForm} onClose={() => setShowMemoryForm(false)} onResult={setMessage} />}
    </div>
  );
}

function MemoryCard({ memory, onDelete, onEdit }: { memory: Memory; onDelete: () => void; onEdit: () => void }) {
  return <article className="relative">
    <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-[#7C4DFF] ring-4 ring-[#FAF8FF]" />
    <p className="mb-1.5 text-[11px] font-bold text-[#8E8287]">{formatDate(memory.happened_at)}</p>
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2"><h3 className="text-sm font-bold">{memory.title}</h3><div className="flex"><button type="button" aria-label="Sửa kỷ niệm" onClick={onEdit} className="min-h-[44px] min-w-[44px] px-2 text-[#786D73]">Sửa</button><button type="button" aria-label="Xóa kỷ niệm" onClick={onDelete} className="min-h-[44px] min-w-[44px] p-2 text-[#A89DA3] hover:text-red-500"><Trash2 className="h-4 w-4" /></button></div></div>
      {memory.note && <p className="mt-1 text-xs leading-relaxed text-[#786D73]">{memory.note}</p>}
      {memory.photos.length > 0 && <div className="mt-3 grid grid-cols-3 gap-1.5">{memory.photos.map((photo) => <a key={photo.id} href={photo.signed_url} target="_blank" rel="noreferrer"><img src={photo.signed_url} alt="" className="aspect-square w-full rounded-xl object-cover" /></a>)}</div>}
    </Card>
  </article>;
}

function AlbumView({ memories }: { memories: Memory[] }) {
  const photos = memories.flatMap((memory) => memory.photos.map((photo) => ({ ...photo, title: memory.title })));
  return <section className="space-y-3"><div><p className="text-[11px] font-bold uppercase tracking-wider text-[#7C4DFF]">GÓC ẢNH CHUNG</p><h2 className="text-lg font-extrabold">Nhìn lại những ngày đã qua</h2></div>{photos.length === 0 ? <Empty title="Album đang trống" text="Ảnh trong các kỷ niệm sẽ xuất hiện ở đây." /> : <div className="grid grid-cols-3 gap-2">{photos.map((photo) => <a key={photo.id} href={photo.signed_url} target="_blank" rel="noreferrer" className="group"><img src={photo.signed_url} alt={photo.title} className="aspect-square w-full rounded-2xl object-cover transition group-hover:opacity-80" /></a>)}</div>}</section>;
}

function MemoryForm({ memory, onClose, onResult }: { memory?: Memory; onClose: () => void; onResult: (message: string) => void }) {
  const draftKey = "our-space-memory-draft";
  const [draft, setDraft] = useState(() => {
    const fallback = { title: memory?.title ?? "", note: memory?.note ?? "", happened_at: memory?.happened_at ?? new Date().toISOString().slice(0, 10) };
    if (typeof window === "undefined") return fallback;
    const saved = localStorage.getItem(draftKey);
    if (!saved) return fallback;
    try { return JSON.parse(saved) as typeof fallback; } catch { return fallback; }
  });
  const [files, setFiles] = useState<File[]>([]);
  const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previewUrls.forEach((url) => URL.revokeObjectURL(url)), [previewUrls]);
  useEffect(() => { localStorage.setItem(draftKey, JSON.stringify(draft)); }, [draft]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true);
    const data = new FormData(event.currentTarget);
    const result = memory ? await updateMemoryAction({ id: memory.id, ...draft }) : await createMemoryAction(data);
    if (!memory && result.success && result.memoryId && result.coupleId && files.length > 0) {
      const supabase = createClient();
      const uploads = await Promise.allSettled(files.map(async (file) => {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${result.coupleId}/${result.memoryId}/${crypto.randomUUID()}-${safeName}`;
        const upload = await supabase.storage.from("memories").upload(path, file, { contentType: file.type, upsert: false });
        if (upload.error) throw upload.error;
        return path;
      }));
      const paths = uploads
        .filter((upload): upload is PromiseFulfilledResult<string> => upload.status === "fulfilled")
        .map((upload) => upload.value);
      if (uploads.some((upload) => upload.status === "rejected")) {
        await supabase.storage.from("memories").remove(paths);
        await deleteMemoryAction(result.memoryId);
        onResult("Không thể tải đủ ảnh lên. Vui lòng kiểm tra kết nối rồi thử lại.");
        setPending(false);
        return;
      }
      const { error: photoError } = await supabase.from("memory_photos").insert(paths.map((storage_path) => ({ memory_id: result.memoryId, couple_id: result.coupleId, storage_path })));
      if (photoError) {
        await supabase.storage.from("memories").remove(paths);
        await deleteMemoryAction(result.memoryId);
        onResult("Không thể lưu thông tin ảnh. Vui lòng thử lại.");
        setPending(false);
        return;
      }
    }
    if (memory && result.success) {
      const supabase = createClient();
      const photosToRemove = memory.photos.filter((photo) => removedPhotoIds.includes(photo.id));
      if (photosToRemove.length > 0) {
        const { error: storageError } = await supabase.storage.from("memories").remove(photosToRemove.map((photo) => photo.storage_path));
        const { error: photoError } = storageError
          ? { error: storageError }
          : await supabase.from("memory_photos").delete().in("id", photosToRemove.map((photo) => photo.id)).eq("memory_id", memory.id);
        if (photoError) {
          onResult("Không thể xóa ảnh. Vui lòng thử lại.");
          setPending(false);
          return;
        }
      }
      if (files.length > 0) {
        const { data: coupleId } = await supabase.rpc("current_couple_id");
        if (!coupleId) {
          onResult("Không tìm thấy không gian của hai bạn.");
          setPending(false);
          return;
        }
        const uploads = await Promise.allSettled(files.map(async (file) => {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const path = `${coupleId}/${memory.id}/${crypto.randomUUID()}-${safeName}`;
          const upload = await supabase.storage.from("memories").upload(path, file, { contentType: file.type, upsert: false });
          if (upload.error) throw upload.error;
          return path;
        }));
        const paths = uploads.filter((upload): upload is PromiseFulfilledResult<string> => upload.status === "fulfilled").map((upload) => upload.value);
        if (uploads.some((upload) => upload.status === "rejected")) {
          await supabase.storage.from("memories").remove(paths);
          onResult("Không thể tải ảnh mới lên. Vui lòng thử lại.");
          setPending(false);
          return;
        }
        const { error: photoError } = await supabase.from("memory_photos").insert(paths.map((storage_path) => ({ memory_id: memory.id, couple_id: coupleId, storage_path })));
        if (photoError) {
          await supabase.storage.from("memories").remove(paths);
          onResult("Không thể lưu thông tin ảnh mới. Vui lòng thử lại.");
          setPending(false);
          return;
        }
      }
    }
    onResult(result.message); setPending(false);
    if (result.success) { localStorage.removeItem(draftKey); onClose(); window.location.reload(); }
  }
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-3"><form onSubmit={submit} className="max-h-[92vh] w-full max-w-md space-y-3 overflow-y-auto rounded-3xl bg-[#FAF8FF] p-5 shadow-xl"><div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">{memory ? "Sửa kỷ niệm" : "Thêm kỷ niệm"}</h2><button type="button" onClick={onClose} className="min-h-[44px] min-w-[44px]"><X className="mx-auto" /></button></div><Input name="title" placeholder="Tiêu đề kỷ niệm" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required /><textarea name="note" placeholder="Kể một chút về ngày hôm đó..." value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} className="min-h-28 w-full rounded-2xl border border-[#E9DFDA] bg-white p-4 text-sm outline-none focus:border-[#7C4DFF]" /><Input name="happened_at" type="date" value={draft.happened_at} onChange={(e) => setDraft({ ...draft, happened_at: e.target.value })} required />  {memory && memory.photos.length > 0 && <div className="space-y-2"><p className="text-xs font-semibold text-[#786D73]">Ảnh trong kỷ niệm · chạm để xem lớn hoặc xóa</p><div className="grid grid-cols-4 gap-2">{memory.photos.map((photo, index) => { const removed = removedPhotoIds.includes(photo.id); return <div key={photo.id} className={`relative ${removed ? "opacity-40" : ""}`}><button type="button" disabled={removed} onClick={() => setSelectedPreview(photo.signed_url)} className="block w-full overflow-hidden rounded-xl border border-[#E9DFDA]"><img src={photo.signed_url} alt={`Ảnh trong kỷ niệm ${index + 1}`} className="aspect-square w-full object-cover" /></button><button type="button" aria-label={removed ? "Khôi phục ảnh" : "Xóa ảnh"} onClick={() => setRemovedPhotoIds((current) => removed ? current.filter((id) => id !== photo.id) : [...current, photo.id])} className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#201A1D] text-white"><X className="h-3.5 w-3.5" /></button></div>; })}</div></div>}<><label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-[#E0D3CD] bg-white px-4 text-xs font-semibold text-[#786D73]"><Upload className="h-4 w-4 text-[#7C4DFF]" /> Thêm ảnh (tối đa 10 MB/ảnh)<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => { const selected = Array.from(e.target.files ?? []); const invalid = selected.map(validateMemoryPhoto).find(Boolean); if (invalid) { onResult(invalid); return; } setFiles((current) => [...current, ...selected]); e.currentTarget.value = ""; }} /></label>{files.length > 0 && <div className="space-y-2"><p className="text-xs font-semibold text-[#786D73]">{files.length} ảnh đã chọn · chạm để xem lớn</p><div className="grid grid-cols-4 gap-2">{files.map((file, index) => <div key={`${file.name}-${file.lastModified}-${index}`} className="relative"><button type="button" onClick={() => setSelectedPreview(previewUrls[index])} className="block w-full overflow-hidden rounded-xl border border-[#E9DFDA]"><img src={previewUrls[index]} alt={`Ảnh đã chọn ${index + 1}`} className="aspect-square w-full object-cover" /></button><button type="button" aria-label={`Bỏ ảnh ${file.name}`} onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#201A1D] text-white"><X className="h-3.5 w-3.5" /></button></div>)}  </div></div>    }</><div className="flex gap-2"><Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Hủy</Button><Button type="submit" className="flex-1" disabled={pending}>{pending ? "Đang lưu..." : "Lưu kỷ niệm"}</Button></div></form>{selectedPreview && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-5" onClick={() => setSelectedPreview(null)}><img src={selectedPreview} alt="Xem trước ảnh đã chọn" className="max-h-[80vh] max-w-full rounded-2xl object-contain" /><button type="button" aria-label="Đóng xem ảnh" onClick={() => setSelectedPreview(null)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#201A1D]"><X /></button></div>}</div>;
}

function AnniversarySection({ anniversaries, showForm, onShowForm, run }: { anniversaries: Anniversary[]; showForm: boolean; onShowForm: (value: boolean) => void; run: (action: Promise<{ success: boolean; message: string }>) => Promise<void> }) {
  const [editing, setEditing] = useState<Anniversary | null>(null);
  const [form, setForm] = useState({ title: "", event_date: "", repeat_yearly: true });
  const upcoming = anniversaries[0];
  function edit(item: Anniversary) {
    setEditing(item);
    setForm({ title: item.title, event_date: item.event_date, repeat_yearly: item.repeat_yearly });
    onShowForm(true);
  }
  return <section className="space-y-3"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-wider text-[#7C4DFF]">NGÀY ĐẶC BIỆT</p><h2 className="text-lg font-extrabold">Ngày kỷ niệm</h2></div><Button size="sm" variant="secondary" onClick={() => { setEditing(null); setForm({ title: "", event_date: "", repeat_yearly: true }); onShowForm(!showForm); }}><CalendarDays className="mr-1 h-4 w-4" /> Thêm</Button></div>{upcoming && <Card className="bg-[#F5F0FF] p-4"><p className="text-xs font-semibold text-[#6840B8]">Sắp tới: {upcoming.title}</p><p className="mt-1 text-2xl font-extrabold text-[#7C4DFF]">{upcoming.days_left === 0 ? "Hôm nay rồi!" : `Còn ${upcoming.days_left} ngày`}</p><p className="text-xs text-[#786D73]">{formatDate(upcoming.next_date)}{upcoming.repeat_yearly ? " · lặp hằng năm" : ""}</p></Card>}{showForm && <form onSubmit={(e) => { e.preventDefault(); void run(saveAnniversaryAction({ ...form, id: editing?.id })); onShowForm(false); }} className="space-y-2 rounded-2xl border border-[#EFE5E0] bg-white p-3"><Input placeholder="Tên ngày kỷ niệm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /><Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required /><label className="flex items-center gap-2 px-1 text-xs text-[#786D73]"><input type="checkbox" checked={form.repeat_yearly} onChange={(e) => setForm({ ...form, repeat_yearly: e.target.checked })} /> Lặp hằng năm</label><Button type="submit" size="sm">{editing ? "Cập nhật" : "Lưu ngày"}</Button></form>}{anniversaries.map((item) => <div key={item.id} className="flex items-center justify-between rounded-2xl border border-[#EFE5E0] bg-white px-3 py-2"><div><p className="text-sm font-bold">{item.title}</p><p className="text-xs text-[#786D73]">{formatDate(item.event_date)}</p></div><div className="flex"><button type="button" aria-label="Sửa ngày kỷ niệm" onClick={() => edit(item)} className="min-h-[44px] px-2 text-xs font-semibold text-[#786D73]">Sửa</button><button type="button" aria-label="Xóa ngày kỷ niệm" onClick={() => void run(deleteAnniversaryAction(item.id))} className="min-h-[44px] min-w-[44px] text-[#A89DA3]"><Trash2 className="mx-auto h-4 w-4" /></button></div></div>)}</section>;
}

function BucketList({ items, run }: { items: BucketListItem[]; run: (action: Promise<{ success: boolean; message: string }>) => Promise<void> }) {
  const [title, setTitle] = useState(""); const [filter, setFilter] = useState<"all" | "todo" | "done">("all");
  const filtered = useMemo(() => items.filter((item) => filter === "all" || (filter === "done" ? item.is_done : !item.is_done)), [items, filter]);
  return <section className="space-y-3"><div><p className="text-[11px] font-bold uppercase tracking-wider text-[#7C4DFF]">CÙNG NHAU THỰC HIỆN</p><h2 className="text-lg font-extrabold">Bucket List</h2></div><form onSubmit={(e) => { e.preventDefault(); void run(addBucketItemAction(title)); setTitle(""); }} className="flex gap-2"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Điều hai đứa muốn làm..." /><Button type="submit" size="icon" aria-label="Thêm mục"><Plus /></Button></form><div className="flex gap-2">{[["all", "Tất cả"], ["todo", "Chưa xong"], ["done", "Đã xong"]].map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value as typeof filter)} className={`rounded-full px-3 py-2 text-xs font-semibold ${filter === value ? "bg-[#7C4DFF] text-white" : "bg-white text-[#786D73]"}`}>{label}</button>)}</div>{filtered.length === 0 ? <Empty title="Chưa có mục nào" text="Thêm một điều hai bạn muốn cùng nhau thực hiện." /> : filtered.map((item) => <div key={item.id} className="flex items-center gap-2 rounded-2xl border border-[#EFE5E0] bg-white p-2"><button type="button" aria-label={item.is_done ? "Đánh dấu chưa xong" : "Đánh dấu đã xong"} onClick={() => void run(toggleBucketItemAction(item.id, !item.is_done))} className={`min-h-[44px] min-w-[44px] rounded-full ${item.is_done ? "bg-[#7C4DFF] text-white" : "border border-[#E0D3CD] text-transparent"}`}><Check className="mx-auto h-4 w-4" /></button><p className={`flex-1 text-sm ${item.is_done ? "text-[#9E9096] line-through" : "font-semibold"}`}>{item.title}</p><button type="button" aria-label="Xóa mục" onClick={() => void run(deleteBucketItemAction(item.id))} className="min-h-[44px] min-w-[44px] text-[#A89DA3]"><Trash2 className="mx-auto h-4 w-4" /></button></div>)}</section>;
}

function Empty({ title, text }: { title: string; text: string }) {
  return <div className="rounded-3xl border border-[#EFE5E0] bg-white px-5 py-10 text-center"><Album className="mx-auto mb-2 h-8 w-8 text-[#7C4DFF]" /><p className="font-bold">{title}</p><p className="mt-1 text-xs text-[#786D73]">{text}</p></div>;
}
