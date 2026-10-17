"use client";

import { DailyQuestionData } from "@/types/play";
import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { DailyAnswersDisplay } from "./daily-answers-display";
import { DailyAnswerForm } from "./daily-answer-form";

interface DailyQuestionViewProps {
  initialData: DailyQuestionData;
}

const CATEGORY_MAP: Record<string, { label: string; bg: string; text: string }> = {
  fun: { label: "Vui vẻ", bg: "bg-[#FFF8E2]", text: "text-[#B88812]" },
  discover: { label: "Tìm hiểu", bg: "bg-[#E8F0FE]", text: "text-[#1A73E8]" },
  emotion: { label: "Cảm xúc", bg: "bg-[#FFEBF0]", text: "text-[#FA5271]" },
  deep: { label: "Sâu sắc", bg: "bg-[#F3E8FF]", text: "text-[#8B5CF6]" },
};

export function DailyQuestionView({ initialData }: DailyQuestionViewProps) {
  const { question, status, session } = initialData;
  const categoryInfo = CATEGORY_MAP[question.category] || {
    label: "Câu hỏi hôm nay",
    bg: "bg-[#F6EFF0]",
    text: "text-[#786D73]",
  };

  return (
    <div className="space-y-4">
      {/* Question Card */}
      <Card className="p-5 bg-gradient-to-br from-white via-white to-[#FFF6F8] border border-[#F2EAE5] shadow-xs rounded-3xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${categoryInfo.bg} ${categoryInfo.text}`}
            >
              {categoryInfo.label}
            </span>
            <div className="flex items-center text-[#FA5271] text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FFEBF0]">
              <Flame className="w-3 h-3 mr-0.5 fill-current" />
              <span>Cấp {question.intimacy_level}</span>
            </div>
          </div>

          <span className="text-[11px] text-[#A89DA3] font-medium">
            {new Date(session.session_date).toLocaleDateString("vi-VN", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>

        <h3 className="text-lg font-bold text-[#201A1D] leading-relaxed mb-2">
          {question.text}
        </h3>
        <p className="text-xs text-[#786D73]">
          {status === "not_answered"
            ? "Cứ viết điều đầu tiên xuất hiện trong lòng bạn. Đáp án sẽ được mở khóa khi cả hai cùng hoàn thành."
            : status === "waiting_partner"
            ? "Bạn đã gửi câu trả lời. Hệ thống đang bảo mật đáp án cho đến khi người ấy hoàn thành."
            : "Cả hai đã hoàn thành câu hỏi hôm nay! Dưới đây là đáp án của hai bạn."}
        </p>
      </Card>

      {/* Form or Answers */}
      {status === "not_answered" ? (
        <DailyAnswerForm sessionId={session.id} />
      ) : (
        <DailyAnswersDisplay data={initialData} />
      )}
    </div>
  );
}
