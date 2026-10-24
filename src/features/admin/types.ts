import { PriceLevelConfig } from "@/types/discover";

export interface AdminStats {
  totalItems: number;
  foodCount: number;
  drinkCount: number;
  placeCount: number;
  activityCount: number;
  totalUsers: number;
  adminCount: number;
  totalWords: number;
  totalQuestions: number;
  dailyCount: number;
  truthCount: number;
  dareCount: number;
  priceStats: {
    level1: number; // Mức 1
    level2: number; // Mức 2
    level3: number; // Mức 3
    level4: number; // Mức 4
  };
  priceConfigs?: PriceLevelConfig[];
}

export interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface VocabularyWord {
  id: string;
  external_key: string | null;
  entry_type: "word" | "phrase" | "collocation" | "idiom";
  tags: string[];
  note: string | null;
  word: string;
  ipa: string | null;
  part_of_speech: string;
  meaning_vi: string;
  example_en: string | null;
  example_vi: string | null;
  topic: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
  collocations?: string[];
  phrase?: string | null;
  sentence_en?: string | null;
  sentence_vi?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionItem {
  id: string;
  external_key: string | null;
  kind: "daily" | "truth" | "dare";
  category: "fun" | "discover" | "emotion" | "deep";
  intimacy_level: number;
  text: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminDailyLesson {
  id: string;
  lesson_date: string;
  topic: string;
  level: VocabularyWord["level"];
  is_published: boolean;
  word_count: number;
}

export type AdminTab = "overview" | "questions" | "vocabulary" | "lessons" | "discover" | "users";
