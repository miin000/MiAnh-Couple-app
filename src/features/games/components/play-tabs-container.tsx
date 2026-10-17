"use client";

import { useState } from "react";
import { DailyQuestionData, Question } from "@/types/play";
import { DailyQuestionView } from "./daily-question-view";
import { TruthOrDareView } from "./truth-or-dare-view";
import { MessageCircleHeart, Sparkles } from "lucide-react";

interface PlayTabsContainerProps {
  dailyData: DailyQuestionData | null;
  initialTruthOrDareQuestion: Question | null;
  isInCouple: boolean;
}

export function PlayTabsContainer({
  dailyData,
  initialTruthOrDareQuestion,
  isInCouple,
}: PlayTabsContainerProps) {
  const [activeTab, setActiveTab] = useState<"daily" | "truth_or_dare">("daily");

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex border-b border-[#F2EAE5] gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("daily")}
          className={`pb-3 text-sm font-bold transition-all relative min-h-[44px] flex items-center gap-1.5 ${
            activeTab === "daily"
              ? "text-[#7C4DFF]"
              : "text-[#786D73] hover:text-[#201A1D]"
          }`}
        >
          <MessageCircleHeart className="w-4 h-4" />
          Câu hỏi hôm nay
          {activeTab === "daily" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C4DFF] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("truth_or_dare")}
          className={`pb-3 text-sm font-bold transition-all relative min-h-[44px] flex items-center gap-1.5 ${
            activeTab === "truth_or_dare"
              ? "text-[#7C4DFF]"
              : "text-[#786D73] hover:text-[#201A1D]"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Thật hay Thách
          {activeTab === "truth_or_dare" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C4DFF] rounded-full" />
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === "daily" ? (
        !isInCouple || !dailyData ? (
          <div className="p-8 text-center bg-white border border-[#F2EAE5] rounded-3xl space-y-3">
            <MessageCircleHeart className="w-10 h-10 text-[#7C4DFF] mx-auto opacity-70" />
            <h3 className="text-base font-bold text-[#201A1D]">
              Chưa kết nối với người ấy
            </h3>
            <p className="text-xs text-[#786D73] max-w-xs mx-auto">
              Hãy ghép đôi cùng người ấy tại trang Cài đặt để cùng nhau trả lời câu hỏi mỗi ngày.
            </p>
          </div>
        ) : (
          <DailyQuestionView initialData={dailyData} />
        )
      ) : (
        <TruthOrDareView initialQuestion={initialTruthOrDareQuestion} />
      )}
    </div>
  );
}
