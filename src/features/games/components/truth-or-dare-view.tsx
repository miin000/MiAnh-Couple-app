"use client";

import { useState, useTransition, useEffect } from "react";
import { Question, QuestionKind } from "@/types/play";
import { drawTruthOrDareQuestionAction, recordTruthOrDareSessionAction } from "../actions";
import { Sparkles, AlertCircle, HelpCircle, Zap } from "lucide-react";
import { TruthOrDareCard } from "./truth-or-dare-card";

interface TruthOrDareViewProps {
  initialQuestion?: Question | null;
}

const INTIMACY_LEVELS = [
  { level: 0, label: "Tất cả mức" },
  { level: 1, label: "Mức 1 (Nhẹ nhàng)" },
  { level: 2, label: "Mức 2 (Gần gũi)" },
  { level: 3, label: "Mức 3 (Cảm xúc)" },
  { level: 4, label: "Mức 4 (Sâu sắc)" },
];

export function TruthOrDareView({ initialQuestion }: TruthOrDareViewProps) {
  const [kind, setKind] = useState<QuestionKind>("truth");
  const [intimacyLevel, setIntimacyLevel] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(initialQuestion || null);
  const [historyIds, setHistoryIds] = useState<string[]>(initialQuestion ? [initialQuestion.id] : []);
  const [answerText, setAnswerText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchQuestion = (targetKind: QuestionKind, targetLevel: number, exclude: string[]) => {
    startTransition(async () => {
      setToastMsg(null);
      const res = await drawTruthOrDareQuestionAction({
        kind: targetKind,
        intimacyLevel: targetLevel > 0 ? targetLevel : undefined,
        excludeIds: exclude,
      });

      if (res.success && res.data) {
        setCurrentQuestion(res.data);
        setHistoryIds((prev) => [...prev.slice(-15), res.data!.id]);
        setAnswerText("");
      } else {
        setToastMsg({ type: "error", text: !res.success ? res.error : "Không tìm thấy câu hỏi phù hợp." });
      }
    });
  };

  useEffect(() => {
    if (!initialQuestion) {
      startTransition(async () => {
        const res = await drawTruthOrDareQuestionAction({
          kind: "truth",
          intimacyLevel: undefined,
          excludeIds: [],
        });
        if (res.success && res.data) {
          setCurrentQuestion(res.data);
          setHistoryIds([res.data.id]);
        }
      });
    }
  }, [initialQuestion]);

  const handleKindChange = (newKind: QuestionKind) => {
    if (newKind === kind) return;
    setKind(newKind);
    fetchQuestion(newKind, intimacyLevel, historyIds);
  };

  const handleLevelChange = (newLevel: number) => {
    setIntimacyLevel(newLevel);
    fetchQuestion(kind, newLevel, historyIds);
  };

  const handleSkip = () => {
    if (!currentQuestion) return;
    startTransition(async () => {
      const res = await recordTruthOrDareSessionAction({ questionId: currentQuestion.id, skipped: true });
      if (res.success) {
        setToastMsg({ type: "success", text: "Đã ghi nhận bỏ qua lượt chơi." });
        fetchQuestion(kind, intimacyLevel, historyIds);
      } else {
        setToastMsg({ type: "error", text: res.error });
      }
    });
  };

  const handleComplete = () => {
    if (!currentQuestion) return;
    startTransition(async () => {
      const res = await recordTruthOrDareSessionAction({
        questionId: currentQuestion.id,
        answerText: kind === "truth" && answerText.trim() ? answerText.trim() : "Đã hoàn thành",
        skipped: false,
      });
      if (res.success) {
        setToastMsg({ type: "success", text: "Tuyệt vời! Lượt chơi đã hoàn thành 🎉" });
        fetchQuestion(kind, intimacyLevel, historyIds);
      } else {
        setToastMsg({ type: "error", text: res.error });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-2 bg-[#F6EFF0] p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => handleKindChange("truth")}
          className={`min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            kind === "truth" ? "bg-white text-[#7C4DFF] shadow-2xs" : "text-[#786D73] hover:text-[#201A1D]"
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Thật (Nói thật 🤫)
        </button>
        <button
          type="button"
          onClick={() => handleKindChange("dare")}
          className={`min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            kind === "dare" ? "bg-white text-[#7C4DFF] shadow-2xs" : "text-[#786D73] hover:text-[#201A1D]"
          }`}
        >
          <Zap className="w-4 h-4" /> Thách (Hành động ⚡)
        </button>
      </div>

      {/* Intimacy Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {INTIMACY_LEVELS.map((item) => (
          <button
            key={item.level}
            type="button"
            onClick={() => handleLevelChange(item.level)}
            className={`min-h-[36px] px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              intimacyLevel === item.level
                ? "bg-[#201A1D] text-white"
                : "bg-white text-[#786D73] border border-[#EAE2DC] hover:text-[#201A1D]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {toastMsg && (
        <div className={`flex items-start gap-2 p-3 rounded-2xl text-xs ${
          toastMsg.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {toastMsg.type === "success" ? <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Challenge Card */}
      <TruthOrDareCard
        kind={kind}
        question={currentQuestion}
        answerText={answerText}
        setAnswerText={setAnswerText}
        isPending={isPending}
        onComplete={handleComplete}
        onNext={() => fetchQuestion(kind, intimacyLevel, historyIds)}
        onSkip={handleSkip}
      />
    </div>
  );
}
