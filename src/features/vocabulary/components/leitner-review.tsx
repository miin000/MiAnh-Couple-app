"use client";

import { useState, useTransition } from "react";
import { DueReviewItem, LessonWordItem } from "@/types/learn";
import { recordWordReviewAction } from "../actions";
import { LearnFlipCard } from "./learn-flip-card";
import { LearnQuiz } from "./learn-quiz";
import { Button } from "@/components/ui/button";
import {
  Check,
  RefreshCw,
  CheckCircle2,
  Layers,
} from "lucide-react";

interface LeitnerReviewProps {
  dueWords: DueReviewItem[];
  allWords?: LessonWordItem[];
  boxesDistribution?: { b1: number; b2: number; b3: number; b4: number; b5: number };
}

export function LeitnerReview({
  dueWords: initialDueWords,
  allWords,
  boxesDistribution = { b1: 0, b2: 0, b3: 0, b4: 0, b5: 0 },
}: LeitnerReviewProps) {
  const [dueList, setDueList] = useState<DueReviewItem[]>(initialDueWords);
  const [mode, setMode] = useState<"card" | "quiz">("card");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentItem = dueList[currentIndex];
  const totalDue = dueList.length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  const handleReviewWord = (isCorrect: boolean) => {
    if (!currentItem || isPending) return;

    const wordId = currentItem.word_id;
    const wordText = currentItem.word.word;

    startTransition(async () => {
      await recordWordReviewAction(wordId, isCorrect);
    });

    if (isCorrect) {
      showToast(`Tuyệt vời! "${wordText}" đã được chuyển lên hộp tiếp theo.`);
    } else {
      showToast(`"${wordText}" được chuyển về Hộp 1 để ôn sớm.`);
    }

    // Bỏ từ đã ôn khỏi danh sách hôm nay
    const updated = dueList.filter((_, idx) => idx !== currentIndex);
    setDueList(updated);
    setFlipped(false);
    if (currentIndex >= updated.length) {
      setCurrentIndex(Math.max(0, updated.length - 1));
    }
  };

  // Chuyển DueReviewItem sang LessonWordItem để tái sử dụng FlipCard
  const currentWordAsLessonItem: LessonWordItem | null = currentItem
    ? {
        id: currentItem.word.id,
        external_key: currentItem.word.external_key,
        entry_type: currentItem.word.entry_type,
        tags: currentItem.word.tags,
        note: currentItem.word.note,
        word: currentItem.word.word,
        ipa: currentItem.word.ipa,
        part_of_speech: currentItem.word.part_of_speech,
        meaning_vi: currentItem.word.meaning_vi,
        example_en: currentItem.word.example_en,
        example_vi: currentItem.word.example_vi,
        topic: currentItem.word.topic,
        level: currentItem.word.level,
        position: 1,
        collocations: [],
        user_progress: {
          status: currentItem.status,
          box: currentItem.box,
          next_review_at: currentItem.next_review_at,
          correct_count: currentItem.correct_count,
          wrong_count: currentItem.wrong_count,
        },
      }
    : null;

  // Chuyển dueList sang LessonWordItem[] cho quiz
  const dueAsLessonItems: LessonWordItem[] = dueList.map((item, i) => ({
    id: item.word.id,
    external_key: item.word.external_key,
    entry_type: item.word.entry_type,
    tags: item.word.tags,
    note: item.word.note,
    word: item.word.word,
    ipa: item.word.ipa,
    part_of_speech: item.word.part_of_speech,
    meaning_vi: item.word.meaning_vi,
    example_en: item.word.example_en,
    example_vi: item.word.example_vi,
    topic: item.word.topic,
    level: item.word.level,
    position: i + 1,
    collocations: [],
    user_progress: {
      status: item.status,
      box: item.box,
      next_review_at: item.next_review_at,
      correct_count: item.correct_count,
      wrong_count: item.wrong_count,
      last_reviewed_at: null,
    },
  }));

  return (
    <div className="space-y-4">
      {/* Phân bố 5 hộp Leitner */}
      <div className="rounded-3xl bg-white border border-[#EFE5E0] p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#201A1D]">
            <Layers className="w-4 h-4 text-[#7C4DFF]" />
            <span>Phân bố 5 hộp Leitner</span>
          </div>
          <span className="text-[11px] text-[#786D73]">Khoảng cách nhớ</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 text-center">
          {[
            { box: 1, days: "1 ngày", count: boxesDistribution.b1 },
            { box: 2, days: "2 ngày", count: boxesDistribution.b2 },
            { box: 3, days: "4 ngày", count: boxesDistribution.b3 },
            { box: 4, days: "7 ngày", count: boxesDistribution.b4 },
            { box: 5, days: "14 ngày", count: boxesDistribution.b5 },
          ].map((item) => (
            <div
              key={item.box}
              className={`p-2 rounded-2xl border text-center transition-all ${
                item.box === 5
                  ? "bg-[#F5F0FF] border-[#F0E9FF]"
                  : "bg-[#FBF7F5] border-[#EFE5E0]"
              }`}
            >
              <span className="text-[10px] font-bold text-[#9E9096] block">
                Hộp {item.box}
              </span>
              <span className="text-sm font-black text-[#201A1D] block my-0.5">
                {item.count}
              </span>
              <span className="text-[9px] text-[#786D73] block truncate">
                {item.days}
              </span>
            </div>
          ))}
        </div>
      </div>

      {totalDue === 0 ? (
        <div className="rounded-3xl bg-white border border-[#EFE5E0] p-8 text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F8F0] text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-[#201A1D]">
              Không có từ nào cần ôn tập hôm nay!
            </h4>
            <p className="text-xs text-[#786D73] max-w-xs mx-auto leading-relaxed">
              Bạn đã hoàn thành tốt các bài học. Các từ vựng đang được lưu giữ trong các hộp Leitner theo chu kỳ ôn cách quãng.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#201A1D]">
                Cần ôn hôm nay:
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-[#F0E9FF] text-[#7C4DFF]">
                {totalDue} từ
              </span>
            </div>

            <div className="flex items-center bg-[#ECE2DC] p-0.5 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setMode("card")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  mode === "card"
                    ? "bg-white text-[#7C4DFF] shadow-2xs"
                    : "text-[#786D73]"
                }`}
              >
                Lật thẻ
              </button>
              <button
                type="button"
                onClick={() => setMode("quiz")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  mode === "quiz"
                    ? "bg-white text-[#7C4DFF] shadow-2xs"
                    : "text-[#786D73]"
                }`}
              >
                Làm Quiz
              </button>
            </div>
          </div>
          {toastMessage && (
            <div className="rounded-xl bg-[#201A1D] text-white px-3.5 py-2 text-xs font-medium text-center shadow-md animate-in fade-in slide-in-from-top-1 duration-200">
              {toastMessage}
            </div>
          )}

          {mode === "quiz" ? (
            <LearnQuiz
              lessonId={null}
              words={dueAsLessonItems}
              allWords={allWords || dueAsLessonItems}
              kind="review"
              onFinish={() => {
                setMode("card");
                setDueList([]);
              }}
            />
          ) : currentWordAsLessonItem ? (
            <div className="space-y-3">
              <LearnFlipCard
                word={currentWordAsLessonItem}
                flipped={flipped}
                onToggleFlip={() => setFlipped(!flipped)}
              />

              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isPending}
                  onClick={() => handleReviewWord(false)}
                  className="h-12 rounded-2xl font-bold text-xs sm:text-sm bg-[#F6EFF0] text-[#362B30] hover:bg-[#EFE5E0] active:scale-98 transition-all gap-1.5"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`}
                  />
                  Chưa chắc (Về Hộp 1)
                </Button>

                <Button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleReviewWord(true)}
                  className="h-12 rounded-2xl font-bold text-xs sm:text-sm bg-[#7C4DFF] text-white hover:bg-[#e04563] active:scale-98 shadow-sm transition-all gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Đã nhớ (Lên Hộp)
                </Button>
              </div>

              <p className="text-[11px] text-center text-[#9E9096]">
                Từ {currentIndex + 1} / {totalDue} cần ôn
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
