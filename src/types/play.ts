export type QuestionKind = "daily" | "truth" | "dare";

export type QuestionCategory = "fun" | "discover" | "emotion" | "deep";

export interface Question {
  id: string;
  external_key: string | null;
  kind: QuestionKind;
  category: QuestionCategory;
  intimacy_level: number;
  text: string;
  is_active: boolean;
  created_at: string;
}

export interface Game {
  id: string;
  slug: string;
  name: string;
  type: "daily_question" | "truth_dare";
  is_active: boolean;
}

export interface GameSession {
  id: string;
  couple_id: string;
  game_id: string;
  question_id: string;
  session_date: string;
  is_daily: boolean;
  status: "open" | "completed";
  created_by: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface GameAnswer {
  id: string;
  session_id: string;
  couple_id: string;
  user_id: string;
  answer_text: string | null;
  skipped: boolean;
  created_at: string;
}

export interface DailyQuestionData {
  session: GameSession;
  question: Question;
  myAnswer: GameAnswer | null;
  partnerAnswer: GameAnswer | null;
  status: "not_answered" | "waiting_partner" | "completed";
  partnerProfile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
  myProfile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}
