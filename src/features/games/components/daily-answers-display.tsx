"use client";

import { DailyQuestionData } from "@/types/play";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Sparkles, Heart, CheckCircle2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface DailyAnswersDisplayProps {
  data: DailyQuestionData;
}

export function DailyAnswersDisplay({ data }: DailyAnswersDisplayProps) {
  const router = useRouter();
  const { myAnswer, partnerAnswer, status, partnerProfile, myProfile } = data;

  if (status === "waiting_partner") {
    return (
      <div className="space-y-4">
        {/* User's Answer */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE2DC] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#201A1D] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FA5271]"></span>
              Câu trả lời của bạn
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Đã gửi
            </span>
          </div>
          {myAnswer?.skipped ? (
            <p className="text-xs italic text-[#8E8287]">
              Bạn đã chọn bỏ qua câu hỏi này.
            </p>
          ) : (
            <p className="text-sm text-[#201A1D] leading-relaxed whitespace-pre-wrap">
              {myAnswer?.answer_text}
            </p>
          )}
        </div>

        {/* Waiting Box */}
        <Card className="p-6 bg-gradient-to-br from-[#FFF8E2] to-[#FFF1F4] border border-[#F5E2E6] text-center space-y-3 rounded-3xl">
          <div className="w-12 h-12 rounded-full bg-white shadow-xs mx-auto flex items-center justify-center text-[#FA5271] animate-pulse">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#201A1D]">
              Đang chờ {partnerProfile?.display_name || "người ấy"} trả lời
            </h4>
            <p className="text-xs text-[#786D73] max-w-xs mx-auto">
              Khi {partnerProfile?.display_name || "người ấy"} hoàn thành lượt, cả hai đáp án sẽ lập tức hiển thị!
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.refresh()}
            className="mt-2 text-xs bg-white/90 border-[#E5D7D9] text-[#52464D] hover:text-[#FA5271] min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Kiểm tra trạng thái
          </Button>
        </Card>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Cả hai bạn đã mở khóa câu hỏi hôm nay! Cùng đọc và thấu hiểu nhau hơn nhé.
          </span>
        </div>

        {/* Your Answer */}
        <Card className="p-4 bg-white border border-[#E9DFDA] rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#201A1D] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FA5271]"></span>
              {myProfile?.display_name || "Bạn"}
            </span>
            <span className="text-[10px] text-[#A89DA3]">
              {myAnswer?.created_at &&
                new Date(myAnswer.created_at).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </span>
          </div>
          {myAnswer?.skipped ? (
            <p className="text-xs italic text-[#8E8287]">
              Đã chọn bỏ qua câu hỏi này.
            </p>
          ) : (
            <p className="text-sm text-[#201A1D] leading-relaxed whitespace-pre-wrap">
              {myAnswer?.answer_text}
            </p>
          )}
        </Card>

        {/* Partner Answer */}
        <Card className="p-4 bg-gradient-to-br from-white to-[#FFF7F9] border border-[#F3E2E6] rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#FA5271] flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-current" />
              {partnerProfile?.display_name || "Người ấy"}
            </span>
            <span className="text-[10px] text-[#A89DA3]">
              {partnerAnswer?.created_at &&
                new Date(partnerAnswer.created_at).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </span>
          </div>
          {partnerAnswer?.skipped ? (
            <p className="text-xs italic text-[#8E8287]">
              Người ấy đã chọn bỏ qua câu hỏi này.
            </p>
          ) : (
            <p className="text-sm text-[#201A1D] leading-relaxed whitespace-pre-wrap font-medium">
              {partnerAnswer?.answer_text || "Chưa có đáp án."}
            </p>
          )}
        </Card>
      </div>
    );
  }

  return null;
}
