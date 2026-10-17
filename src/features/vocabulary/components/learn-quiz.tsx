"use client";

import { useState, useTransition, useMemo } from "react";
import { LessonWordItem, QuizQuestion, QuizAnswerSubmission } from "@/types/learn";
import { generateQuizQuestions } from "../utils/quiz-generator";
import { submitQuizAction } from "../actions";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Volume2,
} from "lucide-react";

interface LearnQuizProps {
  lessonId: string | null;
  words: LessonWordItem[];
  allWords?: LessonWordItem[];
  kind?: "lesson" | "review";
  onFinish?: () => void;
}

export function LearnQuiz({
  lessonId,
  words,
  allWords,
  kind = "lesson",
  onFinish,
}: LearnQuizProps) {
  const questions: QuizQuestion[] = useMemo(() => {
    return generateQuizQuestions(words, allWords || words);
  }, [words, allWords]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<
    Array<{
      questionId: string;
      wordId: string;
      word: string;
      meaningVi: string;
      isCorrect: boolean;
      questionType: "choose_meaning" | "choose_word" | "fill_blank";
      chosenText: string;
      correctText: string;
    }>
  >([]);

  const [isCompleted, setIsCompleted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;

  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (isAnswered || !currentQ) return;

    setSelectedOptionId(optionId);
    setIsAnswered(true);

    const chosenOption = currentQ.options.find((o) => o.id === optionId);
    const isCorrect = !!chosenOption?.isCorrect;

    if (isCorrect && currentQ.word) {
      handleSpeak(currentQ.word);
    }

    const newRecord = {
      questionId: currentQ.id,
      wordId: currentQ.wordId,
      word: currentQ.word,
      meaningVi: currentQ.options.find((o) => o.isCorrect)?.text || currentQ.correctAnswerText,
      isCorrect,
      questionType: currentQ.type,
      chosenText: chosenOption?.text || "",
      correctText: currentQ.correctAnswerText,
    };

    setUserAnswers((prev) => [...prev, newRecord]);
  };

  const handleNext = () => {
    if (currentIndex < totalQ - 1) {
      setCurrentIndex((p) => p + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
      submitResults(userAnswers);
    }
  };

  const submitResults = (
    answersList: Array<{
      wordId: string;
      questionType: "choose_meaning" | "choose_word" | "fill_blank";
      isCorrect: boolean;
    }>
  ) => {
    const payload: QuizAnswerSubmission[] = answersList.map((a) => ({
      word_id: a.wordId,
      question_type: a.questionType,
      is_correct: a.isCorrect,
    }));

    startTransition(async () => {
      const res = await submitQuizAction({
        lessonId: kind === "lesson" ? lessonId : null,
        kind,
        answers: payload,
      });
      if (res.success) {
        setSaveSuccess(true);
      }
    });
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setUserAnswers([]);
    setIsCompleted(false);
    setSaveSuccess(false);
  };

  if (totalQ === 0) {
    return (
      <div className="rounded-3xl bg-white border border-[#EFE5E0] p-8 text-center space-y-3">
        <HelpCircle className="w-10 h-10 text-[#786D73] mx-auto" />
        <h4 className="text-sm font-bold text-[#201A1D]">Chưa có câu hỏi</h4>
        <p className="text-xs text-[#786D73]">
          Không có từ vựng nào để làm quiz. Vui lòng quay lại sau!
        </p>
      </div>
    );
  }

  if (isCompleted) {
    const correctCount = userAnswers.filter((a) => a.isCorrect).length;
    const scorePercent = Math.round((correctCount / totalQ) * 100);

    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="rounded-3xl bg-white border border-[#EFE5E0] p-6 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-3xl bg-[#FFF0F3] text-[#FA5271] flex items-center justify-center mx-auto shadow-sm">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E9096]">
              KẾT QUẢ QUIZ {kind === "lesson" ? "HÔM NAY" : "ÔN TẬP"}
            </span>
            <h3 className="text-2xl font-black text-[#201A1D]">
              {correctCount} / {totalQ} câu đúng
            </h3>
            <p className="text-xs text-[#786D73]">
              {scorePercent >= 80
                ? "Xuất sắc! Bạn ghi nhớ từ rất tốt và phản xạ cực nhanh!"
                : scorePercent >= 50
                ? "Khá tốt! Những từ chưa đúng sẽ được lên lịch ôn sớm để bạn nhớ chắc hơn."
                : "Cố lên! Bạn có thể xem lại thẻ từ và làm lại bài quiz nhé."}
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#F6EFF0] text-[#786D73]">
            {isPending ? (
              <span>Đang đồng bộ tiến độ Leitner...</span>
            ) : saveSuccess ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã cập nhật hộp ghi nhớ Leitner
              </span>
            ) : (
              <span>Đã hoàn thành</span>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={handleRestart}
              className="rounded-xl text-xs font-bold gap-1.5 bg-[#F6EFF0] text-[#362B30] hover:bg-[#EFE5E0]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Làm lại quiz
            </Button>
            {onFinish && (
              <Button
                onClick={onFinish}
                className="rounded-xl text-xs font-bold bg-[#FA5271] text-white hover:bg-[#e04563]"
              >
                Tiếp tục học
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#786D73] px-1 uppercase tracking-wider">
            Chi tiết từng từ ({userAnswers.length})
          </h4>
          <div className="space-y-2">
            {userAnswers.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-3 bg-white ${
                  item.isCorrect
                    ? "border-emerald-200 bg-emerald-50/20"
                    : "border-rose-200 bg-rose-50/20"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#201A1D] text-sm">{item.word}</span>
                    <button
                      type="button"
                      onClick={() => handleSpeak(item.word)}
                      className="text-[#786D73] hover:text-[#FA5271] transition-colors"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-[#786D73] bg-[#F6EFF0] px-1.5 py-0.5 rounded">
                      {item.questionType === "choose_meaning"
                        ? "Nghĩa"
                        : item.questionType === "choose_word"
                        ? "Từ vựng"
                        : "Điền câu"}
                    </span>
                  </div>
                  <p className="text-[#524349] mt-0.5">{item.meaningVi}</p>
                  {!item.isCorrect && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      Bạn đã chọn: <span className="line-through">{item.chosenText}</span> • Đúng:{" "}
                      <span className="font-bold">{item.correctText}</span>
                    </p>
                  )}
                </div>
                <div className="shrink-0 mt-0.5">
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const questionTypeLabel =
    currentQ.type === "choose_meaning"
      ? "Chọn nghĩa tiếng Việt"
      : currentQ.type === "choose_word"
      ? "Chọn từ tiếng Anh đúng"
      : "Điền từ vào câu ví dụ";

  const progressPercent = Math.round(((currentIndex + 1) / totalQ) * 100);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FFEBF0] text-[#FA5271]">
              {questionTypeLabel}
            </span>
          </div>
          <span className="font-bold text-[#786D73]">
            Câu {currentIndex + 1} / {totalQ}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[#EFE5E0] overflow-hidden">
          <div
            className="h-full bg-[#FA5271] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-[#EFE5E0] p-5 shadow-2xs space-y-4">
        <div className="text-center space-y-2 py-2">
          <p className="text-xs font-semibold text-[#786D73]">{currentQ.prompt}</p>

          {currentQ.type === "choose_meaning" ? (
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-2xl font-black text-[#201A1D] tracking-wide">
                  {currentQ.word}
                </h3>
                <button
                  type="button"
                  onClick={() => handleSpeak(currentQ.word)}
                  className="p-1.5 rounded-full text-[#FA5271] bg-[#FFEBF0] hover:bg-[#ffd5df] transition-colors"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              {currentQ.ipa && (
                <p className="text-xs font-mono text-[#8E8287]">{currentQ.ipa}</p>
              )}
            </div>
          ) : currentQ.type === "choose_word" ? (
            <div className="py-1">
              <h3 className="text-xl font-black text-[#201A1D]">
                &ldquo;{currentQ.options.find((o) => o.isCorrect)?.text || currentQ.correctAnswerText}&rdquo;
              </h3>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[#FBF7F5] border border-[#EFE5E0] text-center">
              <p className="text-sm font-medium text-[#201A1D] leading-relaxed">
                {currentQ.contextSentence}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let btnStyle = "border-[#EFE5E0] bg-white text-[#201A1D] hover:bg-[#FDF9F8]";

            if (isAnswered) {
              if (opt.isCorrect) {
                btnStyle = "border-emerald-400 bg-emerald-50 text-emerald-800 font-bold shadow-xs";
              } else if (isSelected && !opt.isCorrect) {
                btnStyle = "border-rose-400 bg-rose-50 text-rose-800 font-bold";
              } else {
                btnStyle = "border-[#EFE5E0] bg-white text-[#8E8287] opacity-60";
              }
            } else if (isSelected) {
              btnStyle = "border-[#FA5271] bg-[#FFF0F3] text-[#FA5271] font-bold";
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt.id)}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs font-medium transition-all flex items-center justify-between gap-3 ${btnStyle}`}
              >
                <span>{opt.text}</span>
                {isAnswered && (
                  <span>
                    {opt.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isSelected ? (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : null}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="p-3 rounded-2xl bg-[#F6EFF0] border border-[#EFE5E0] text-xs text-[#524349] animate-in fade-in duration-200">
            <span className="font-bold text-[#201A1D] block mb-0.5">Giải thích:</span>
            <span>{currentQ.explanation}</span>
          </div>
        )}

        {isAnswered && (
          <Button
            type="button"
            onClick={handleNext}
            className="w-full h-11 rounded-2xl font-bold text-xs bg-[#FA5271] text-white hover:bg-[#e04563] shadow-sm gap-1.5 animate-in fade-in duration-200"
          >
            <span>{currentIndex < totalQ - 1 ? "Câu tiếp theo" : "Xem kết quả"}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

