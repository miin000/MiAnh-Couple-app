"use client";

import { useState, useTransition } from "react";
import {
  DailyLessonViewData,
  LessonWordItem,
  DueReviewItem,
  CoupleChallengeViewData,
  CoupleLearnStatsViewData,
} from "@/types/learn";
import { LearnFlipCard } from "./learn-flip-card";
import { PartnerProgressCard } from "./partner-progress-card";
import { LearnQuiz } from "./learn-quiz";
import { LeitnerReview } from "./leitner-review";
import { CoupleChallengeCard } from "./couple-challenge-card";
import { LearnStatsCard } from "./learn-stats-card";
import { recordWordReviewAction } from "../actions";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CheckSquare,
  Check,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Layers,
  Heart,
} from "lucide-react";

interface LearnScreenProps {
  initialData: DailyLessonViewData;
  dueWords?: DueReviewItem[];
  challengeData?: CoupleChallengeViewData | null;
  stats?: CoupleLearnStatsViewData | null;
}

const TOPIC_NAMES: Record<string, string> = {
  communication: "Giao tiếp hằng ngày",
  emotions: "Cảm xúc & Tâm trạng",
  dating: "Hẹn hò & Gắn kết",
  food_dining: "Ăn uống & Ẩm thực",
  travel: "Du lịch & Khám phá",
  work_study: "Công việc & Học tập",
};

export function LearnScreen({
  initialData,
  dueWords = [],
  challengeData = null,
  stats = null,
}: LearnScreenProps) {
  const { lesson, words: initialWords, myProgress, partnerProgress } = initialData;

  const [words, setWords] = useState<LessonWordItem[]>(initialWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<"cards" | "quiz" | "review" | "challenge">("cards");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentWord = words[currentIndex] || words[0];
  const learnedCount = words.filter((w) => w.user_progress !== null).length;
  const totalWords = words.length;
  const progressPercent = Math.round((learnedCount / totalWords) * 100);
  const dueCount = dueWords.length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  const handleReview = (isCorrect: boolean) => {
    if (!currentWord || isPending) return;

    const wordId = currentWord.id;
    const wordText = currentWord.word;

    setWords((prev) =>
      prev.map((w) =>
        w.id === wordId
          ? {
              ...w,
              user_progress: {
                status: "learning",
                box: isCorrect ? Math.min((w.user_progress?.box || 1) + 1, 5) : 1,
                next_review_at: new Date(
                  Date.now() + (isCorrect ? 2 : 1) * 86400000
                ).toISOString(),
                correct_count: (w.user_progress?.correct_count || 0) + (isCorrect ? 1 : 0),
                wrong_count: (w.user_progress?.wrong_count || 0) + (isCorrect ? 0 : 1),
              },
            }
          : w
      )
    );

    if (isCorrect) {
      showToast(`Tuyệt vời! Đã ghi nhớ: ${wordText}`);
    } else {
      showToast(`Sẽ ôn lại sớm: ${wordText}`);
    }

    startTransition(async () => {
      await recordWordReviewAction(wordId, isCorrect);
    });

    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setFlipped(false);
    }
  };

  const topicDisplay = TOPIC_NAMES[lesson.topic] || lesson.topic;

  return (
    <div className="space-y-4">
      {/* 4 Tabs: Thẻ từ, Quiz, Ôn tập, Thử thách */}
      <div className="grid grid-cols-4 p-1 rounded-2xl bg-[#ECE2DC] text-[11px] font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("cards")}
          className={`flex items-center justify-center gap-1 py-2 rounded-xl transition-all ${
            activeTab === "cards"
              ? "bg-white text-[#7C4DFF] shadow-2xs"
              : "text-[#786D73] hover:text-[#201A1D]"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Thẻ từ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center justify-center gap-1 py-2 rounded-xl transition-all ${
            activeTab === "quiz"
              ? "bg-white text-[#7C4DFF] shadow-2xs"
              : "text-[#786D73] hover:text-[#201A1D]"
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Quiz</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("review")}
          className={`flex items-center justify-center gap-1 py-2 rounded-xl transition-all relative ${
            activeTab === "review"
              ? "bg-white text-[#7C4DFF] shadow-2xs"
              : "text-[#786D73] hover:text-[#201A1D]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Ôn tập</span>
          {dueCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#7C4DFF] absolute top-1.5 right-1.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("challenge")}
          className={`flex items-center justify-center gap-1 py-2 rounded-xl transition-all ${
            activeTab === "challenge"
              ? "bg-white text-[#7C4DFF] shadow-2xs"
              : "text-[#786D73] hover:text-[#201A1D]"
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Thử thách</span>
        </button>
      </div>

      {/* Thống kê thu gọn / mở rộng */}
      {stats && (
        <LearnStatsCard stats={stats} />
      )}

      {/* Nội dung theo Tab */}
      {activeTab === "quiz" ? (
        <LearnQuiz
          lessonId={lesson.id}
          words={words}
          allWords={words}
          kind="lesson"
          onFinish={() => setActiveTab("cards")}
        />
      ) : activeTab === "review" ? (
        <LeitnerReview
          dueWords={dueWords}
          allWords={words}
          boxesDistribution={stats?.myStats.boxes}
        />
      ) : activeTab === "challenge" ? (
        challengeData ? (
          <CoupleChallengeCard challengeData={challengeData} words={words} />
        ) : (
          <div className="rounded-3xl bg-white border border-[#EFE5E0] p-8 text-center space-y-3">
            <Heart className="w-8 h-8 text-[#7C4DFF] mx-auto" />
            <h4 className="text-sm font-bold text-[#201A1D]">Thử thách đang được tạo</h4>
            <p className="text-xs text-[#786D73]">
              Vui lòng kết nối cặp đôi để tham gia thử thách từ vựng hằng ngày nhé!
            </p>
          </div>
        )
      ) : (
        <>
          {/* Progress Header */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[#8E8287] font-medium">Chủ đề:</span>
                <span className="font-bold text-[#201A1D]">{topicDisplay}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#8E8287] font-medium">Đã học</span>
                <span className="font-bold text-[#7C4DFF]">
                  {learnedCount}/{totalWords}
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-[#EFE5E0] overflow-hidden">
              <div
                className="h-full bg-[#7C4DFF] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="rounded-xl bg-[#201A1D] text-white px-3.5 py-2 text-xs font-medium text-center shadow-md animate-in fade-in slide-in-from-top-1 duration-200">
              {toastMessage}
            </div>
          )}

          {/* Carousel Navigation */}
          <div className="flex items-center justify-between text-xs font-semibold text-[#8E8287] px-1">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex((p) => Math.max(p - 1, 0));
                setFlipped(false);
              }}
              className="flex items-center gap-0.5 hover:text-[#201A1D] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Từ trước
            </button>

            <span className="text-xs font-bold text-[#201A1D] bg-[#F6EFF0] px-3 py-1 rounded-full">
              {currentIndex + 1} / {totalWords}
            </span>

            <button
              type="button"
              disabled={currentIndex === words.length - 1}
              onClick={() => {
                setCurrentIndex((p) => Math.min(p + 1, words.length - 1));
                setFlipped(false);
              }}
              className="flex items-center gap-0.5 hover:text-[#201A1D] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              Từ sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Flashcard */}
          <LearnFlipCard
            word={currentWord}
            flipped={flipped}
            onToggleFlip={() => setFlipped(!flipped)}
          />

          {/* Actions: "Chưa chắc" / "Đã nhớ" */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => handleReview(false)}
              className="h-12 rounded-2xl font-bold text-xs sm:text-sm bg-[#F6EFF0] text-[#362B30] hover:bg-[#EFE5E0] active:scale-98 transition-all gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
              Chưa chắc
            </Button>

            <Button
              type="button"
              disabled={isPending}
              onClick={() => handleReview(true)}
              className="h-12 rounded-2xl font-bold text-xs sm:text-sm bg-[#7C4DFF] text-white hover:bg-[#e04563] active:scale-98 shadow-sm transition-all gap-1.5"
            >
              <Check className="w-4 h-4" />
              Đã nhớ
            </Button>
          </div>

          {/* Completion celebration if 10/10 */}
          {learnedCount === totalWords && (
            <div className="rounded-2xl bg-[#FFF5F7] border border-[#F0E9FF] p-3 text-center flex items-center justify-center gap-2 text-xs font-bold text-[#7C4DFF]">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Bạn đã hoàn thành bài học 10 từ của ngày hôm nay!</span>
            </div>
          )}

          {/* Partner Progress footer card */}
          <PartnerProgressCard
            myProgress={myProgress}
            partnerProgress={partnerProgress}
          />
        </>
      )}
    </div>
  );
}

