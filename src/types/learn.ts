export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "preposition"
  | "conjunction"
  | "pronoun"
  | "interjection"
  | "phrase"
  | "other";

export type WordProgressStatus = "learning" | "review" | "mastered";

export interface VocabularyCollocation {
  id: string;
  word_id: string;
  phrase: string;
  position: number;
}

export interface VocabularyWord {
  id: string;
  external_key: string | null;
  entry_type: "word" | "phrase" | "collocation" | "idiom";
  tags: string[];
  note: string | null;
  word: string;
  ipa: string | null;
  part_of_speech: PartOfSpeech;
  meaning_vi: string;
  example_en: string | null;
  example_vi: string | null;
  topic: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyLesson {
  id: string;
  lesson_date: string;
  topic: string;
  level: string | null;
  is_published: boolean;
  created_at: string;
}

export interface UserWordProgress {
  user_id: string;
  word_id: string;
  status: WordProgressStatus;
  box: number;
  next_review_at: string | null;
  correct_count: number;
  wrong_count: number;
  first_seen_at: string;
  last_reviewed_at: string | null;
}

export interface LessonWordItem {
  id: string;
  external_key: string | null;
  entry_type: "word" | "phrase" | "collocation" | "idiom";
  tags: string[];
  note: string | null;
  word: string;
  ipa: string | null;
  part_of_speech: PartOfSpeech;
  meaning_vi: string;
  example_en: string | null;
  example_vi: string | null;
  topic: string;
  level: string | null;
  position: number;
  collocations: string[];
  user_progress: {
    status: WordProgressStatus;
    box: number;
    next_review_at: string | null;
    correct_count: number;
    wrong_count: number;
  } | null;
}

export interface PartnerProgress {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  learned_count: number;
  mastered_count: number;
  total_words: number;
}

export interface DailyLessonViewData {
  lesson: DailyLesson;
  words: LessonWordItem[];
  myProgress: PartnerProgress;
  partnerProgress: PartnerProgress | null;
  currentUserId: string;
}

// PHASE 5: QUIZ, REVIEW & CHALLENGE TYPES

export type QuizQuestionType = "choose_meaning" | "choose_word" | "fill_blank";

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  wordId: string;
  word: string;
  ipa?: string | null;
  partOfSpeech?: PartOfSpeech;
  type: QuizQuestionType;
  prompt: string;
  contextSentence?: string | null;
  options: QuizOption[];
  correctAnswerText: string;
  explanation: string;
}

export interface QuizAnswerSubmission {
  word_id: string;
  question_type: QuizQuestionType;
  is_correct: boolean;
}

export interface QuizResultSummary {
  attemptId: string;
  total: number;
  correct: number;
  kind: "lesson" | "review";
  details: Array<{
    wordId: string;
    word: string;
    meaningVi: string;
    isCorrect: boolean;
    questionType: QuizQuestionType;
  }>;
}

export interface DueReviewItem {
  user_id: string;
  word_id: string;
  status: WordProgressStatus;
  box: number;
  next_review_at: string;
  correct_count: number;
  wrong_count: number;
  word: VocabularyWord;
}

export interface CoupleChallenge {
  id: string;
  couple_id: string;
  lesson_id: string | null;
  challenge_date: string;
  challenge_type: "use_words" | "guess_word" | "situation_dialog";
  prompt: string;
  created_at: string;
}

export interface ChallengeSubmission {
  id: string;
  challenge_id: string;
  couple_id: string;
  user_id: string;
  content: string;
  created_at: string;
  display_name?: string;
  avatar_url?: string | null;
}

export interface CoupleChallengeViewData {
  challenge: CoupleChallenge;
  mySubmission: ChallengeSubmission | null;
  partnerSubmission: ChallengeSubmission | null;
  partnerInfo: {
    userId: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  isUnlocked: boolean;
  partnerHasSubmitted: boolean;
}

export interface LeitnerBoxesDistribution {
  b1: number;
  b2: number;
  b3: number;
  b4: number;
  b5: number;
}

export interface UserLearnStats {
  totalLearned: number;
  masteredCount: number;
  dueReviewsCount: number;
  boxes: LeitnerBoxesDistribution;
  latestQuiz: {
    total: number;
    correct: number;
    kind: string;
    createdAt: string;
  } | null;
}

export interface PartnerLearnStats {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  totalLearned: number;
  masteredCount: number;
  latestQuiz: {
    total: number;
    correct: number;
    kind: string;
    createdAt: string;
  } | null;
}

export interface CoupleLearnStatsViewData {
  myStats: UserLearnStats;
  partnerStats: PartnerLearnStats | null;
}
