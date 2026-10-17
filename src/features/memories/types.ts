export interface MemoryPhoto {
  id: string;
  storage_path: string;
  signed_url: string;
}

export interface Memory {
  id: string;
  title: string;
  note: string | null;
  happened_at: string;
  photos: MemoryPhoto[];
}

export interface Anniversary {
  id: string;
  title: string;
  event_date: string;
  repeat_yearly: boolean;
  next_date: string;
  days_left: number;
}

export interface BucketListItem {
  id: string;
  title: string;
  is_done: boolean;
  done_at: string | null;
}

export interface OurSpaceData {
  coupleId: string;
  startDate: string | null;
  timezone: string;
  memories: Memory[];
  anniversaries: Anniversary[];
  bucketList: BucketListItem[];
}
