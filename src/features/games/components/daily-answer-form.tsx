"use client";

import { useState, useTransition } from "react";
import { submitDailyAnswerAction, skipDailyQuestionAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Send, SkipForward, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface DailyAnswerFormProps {
  sessionId: string;
}

export function DailyAnswerForm({ sessionId }: DailyAnswerFormProps) {
  const router = useRouter();
  const [answerText, setAnswerText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const handleSendAnswer = () => {
    if (!answerText.trim()) {
      setErrorMsg("Vui lòng viết câu trả lời trước khi gửi nhé!");
      return;
    }
    setErrorMsg(null);
    startTransition(async () => {
      const res = await submitDailyAnswerAction(sessionId, answerText);
      if (!res.success) {
        setErrorMsg(res.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleSkipQuestion = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await skipDailyQuestionAction(sessionId);
      if (!res.success) {
        setErrorMsg(res.error);
      } else {
        setShowSkipConfirm(false);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-3">
      {errorMsg && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5 px-1">
          <label
            htmlFor="daily-answer-input"
            className="text-xs font-bold text-[#52464D]"
          >
            Câu trả lời của bạn
          </label>
          <span className="text-[11px] text-[#A89DA3]">
            {answerText.length}/1000
          </span>
        </div>
        <textarea
          id="daily-answer-input"
          rows={4}
          maxLength={1000}
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder="Viết câu trả lời chân thật nhất của bạn..."
          className="w-full rounded-2xl border border-[#E9DFDA] bg-white p-4 text-sm text-[#201A1D] placeholder:text-[#A89DA3] shadow-2xs focus:outline-none focus:border-[#7C4DFF] focus:ring-2 focus:ring-[#7C4DFF]/20 resize-none transition-all"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2 pt-1">
        <Button
          className="w-full font-bold shadow-sm"
          size="lg"
          onClick={handleSendAnswer}
          disabled={isPending || !answerText.trim()}
        >
          <Send className="w-4 h-4 mr-2" />
          {isPending ? "Đang gửi..." : "Gửi câu trả lời"}
        </Button>

        {!showSkipConfirm ? (
          <button
            type="button"
            onClick={() => setShowSkipConfirm(true)}
            disabled={isPending}
            className="w-full text-center py-2.5 text-xs font-semibold text-[#8E8287] hover:text-[#201A1D] min-h-[44px] flex items-center justify-center gap-1.5 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Bỏ qua câu hỏi này
          </button>
        ) : (
          <div className="p-3 bg-[#FBF8F6] border border-[#EFE5E0] rounded-2xl text-center space-y-2">
            <p className="text-xs text-[#52464D]">
              Bỏ qua câu hỏi sẽ tính là hoàn thành lượt của bạn. Bạn vẫn xem được đáp án của đối phương nếu họ trả lời.
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSkipConfirm(false)}
                disabled={isPending}
                className="h-9 px-3 text-xs"
              >
                Quay lại
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSkipQuestion}
                disabled={isPending}
                className="h-9 px-3 text-xs text-[#E11D48] border-[#FCA5A5] hover:bg-red-50"
              >
                Xác nhận bỏ qua
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
