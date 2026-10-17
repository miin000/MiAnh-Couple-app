import { createClient } from "@/lib/supabase/server";
import type { OurSpaceData } from "./types";
import type { Anniversary } from "./types";

export async function getOurSpaceData(): Promise<OurSpaceData | null> {
  const supabase = await createClient();
  const { data: coupleId } = await supabase.rpc("current_couple_id");
  if (!coupleId) return null;

  const [coupleResult, memoriesResult, anniversariesResult, bucketResult] = await Promise.all([
    supabase.from("couples").select("start_date").eq("id", coupleId).single(),
    supabase.from("memories").select("id, title, note, happened_at, memory_photos(id, storage_path)").eq("couple_id", coupleId).order("happened_at", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("anniversary_countdowns").select("id, title, event_date, repeat_yearly, next_date, days_left").eq("couple_id", coupleId).order("next_date", { ascending: true }),
    supabase.from("bucket_list_items").select("id, title, is_done, done_at").eq("couple_id", coupleId).order("is_done", { ascending: true }).order("created_at", { ascending: false }),
  ]);

  if (coupleResult.error || memoriesResult.error || anniversariesResult.error || bucketResult.error) {
    console.error("Load Our Space error:", coupleResult.error || memoriesResult.error || anniversariesResult.error || bucketResult.error);
    return null;
  }

  const memories = await Promise.all((memoriesResult.data ?? []).map(async (memory) => {
    const photos = await Promise.all((memory.memory_photos ?? []).map(async (photo) => {
      const { data, error } = await supabase.storage.from("memories").createSignedUrl(photo.storage_path, 3600);
      if (error || !data?.signedUrl) return null;
      return { id: photo.id, storage_path: photo.storage_path, signed_url: data.signedUrl };
    }));
    return { ...memory, photos: photos.filter((photo): photo is NonNullable<typeof photo> => photo !== null) };
  }));

  return {
    coupleId,
    startDate: coupleResult.data.start_date,
    memories,
    anniversaries: anniversariesResult.data ?? [],
    bucketList: bucketResult.data ?? [],
  };
}

export async function getUpcomingAnniversary(): Promise<Anniversary | null> {
  const supabase = await createClient();
  const { data: coupleId } = await supabase.rpc("current_couple_id");
  if (!coupleId) return null;
  const { data, error } = await supabase
    .from("anniversary_countdowns")
    .select("id, title, event_date, repeat_yearly, next_date, days_left")
    .eq("couple_id", coupleId)
    .gte("days_left", 0)
    .order("next_date", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("Load upcoming anniversary error:", error);
    return null;
  }
  return data;
}
