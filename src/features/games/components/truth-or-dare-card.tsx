"use client";

import { Question, QuestionKind } from "@/types/play";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw, SkipForward, CheckCircle, Flame } from "lucide-react";

interface TruthOrDareCardProps {
  kind: QuestionKind;
  question: Question | null;
  answerText: string;
  setAnswerText: (val: string) => void;
  isPending: boolean;
  onComplete: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export function TruthOrDareCard({
  kind,
  question,
  answerText,
  setAnswerText,
  isPending,
  onComplete,
  onNext,
  onSkip,
}: TruthOrDareCardProps) {
  if (!question) {
    return (
      <Card className="p-8 text-center bg-white border border-[#F2EAE5] rounded-3xl space-y-3">
        <p className="text-xs text-[#786D73]">Chưa có câu hỏi nào được chọn.</p>
        <Button size="sm" onClick={onNext} disabled={isPending}>
          Bốc câu hỏi mới
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-white via-white to-[#FFF5F8] border border-[#F2EAE5] shadow-xs rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C4DFF] bg-[#F0E9FF] px-2.5 py-0.5 rounded-full">
          {kind === "truth" ? "Câu hỏi Thật" : "Thử thách Thách"}
        </span>
        <div className="flex items-center text-xs font-semibold text-[#7C4DFF] bg-[#F0E9FF] px-2 py-0.5 rounded-full">
          <Flame className="w-3.5 h-3.5 mr-0.5 fill-current" />
          <span>Mức {question.intimacy_level}</span>
        </div>
      </div>

      <p className="text-base font-bold text-[#201A1D] leading-relaxed min-h-[70px] flex items-center">
        {question.text}
      </p>

      {kind === "truth" && (
        <input
          type="text"
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder="Ghi lại câu trả lời (tùy chọn hoặc trả lời trực tiếp)..."
          className="w-full h-11 px-3.5 text-xs rounded-xl border border-[#E9DFDA] bg-white placeholder:text-[#A89DA3] focus:outline-none focus:border-[#7C4DFF]"
          disabled={isPending}
        />
      )}

      <div className="space-y-2 pt-2">
        <Button
          className="w-full font-bold shadow-sm"
          size="lg"
          onClick={onComplete}
          disabled={isPending}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {kind === "truth" ? "Đã trả lời xong" : "Đã hoàn thành thử thách"}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={onNext}
            disabled={isPending}
            className="min-h-[44px] text-xs font-semibold border-[#EAE2DC] text-[#52464D]"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Đổi câu khác
          </Button>
          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={isPending}
            className="min-h-[44px] text-xs font-semibold text-[#8E8287] hover:text-red-600"
          >
            <SkipForward className="w-3.5 h-3.5 mr-1.5" /> Bỏ qua lượt
          </Button>
        </div>
      </div>
    </Card>
  );
}
