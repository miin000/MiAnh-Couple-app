export interface CoupleStatus {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  is_me: boolean;
  emoji: string;
  note_text: string | null;
  updated_at: string | null;
  seconds_left: number;
}

export interface StatusPreset {
  id: string;
  emoji: string;
  label: string;
}
