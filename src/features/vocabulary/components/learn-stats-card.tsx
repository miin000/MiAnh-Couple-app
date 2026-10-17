"use client";

import { CoupleLearnStatsViewData } from "@/types/learn";
import { TrendingUp } from "lucide-react";

interface LearnStatsCardProps {
  stats: CoupleLearnStatsViewData;
}

export function LearnStatsCard({ stats }: LearnStatsCardProps) {
  const { myStats, partnerStats } = stats;

  const partnerName = partnerStats?.displayName || "Người ấy";

  return (
    <div className="rounded-3xl bg-white border border-[#EFE5E0] p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFF0F3] text-[#FA5271] flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E9096] block">
              TIẾN ĐỘ HỌC ĐÔI
            </span>
            <h4 className="text-sm font-bold text-[#201A1D]">
              Thống kê ghi nhớ & Quiz
            </h4>
          </div>
        </div>

        <span className="text-[11px] font-bold text-[#FA5271] bg-[#FFEBF0] px-2.5 py-1 rounded-full">
          Leitner 5 Hộp
        </span>
      </div>

      {/* Grid so sánh 2 người */}
      <div className="grid grid-cols-2 gap-3">
        {/* Cột Bạn */}
        <div className="p-3.5 rounded-2xl bg-[#FBF7F5] border border-[#EFE5E0] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#201A1D]">Bạn</span>
            <span className="text-[10px] font-bold text-[#FA5271] bg-white px-2 py-0.5 rounded-full border border-[#EFE5E0]">
              Cá nhân
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[#786D73]">
              <span>Đã học:</span>
              <span className="font-bold text-[#201A1D]">{myStats.totalLearned} từ</span>
            </div>
            <div className="flex items-center justify-between text-[#786D73]">
              <span>Nhớ tốt (Hộp 5):</span>
              <span className="font-bold text-emerald-600">{myStats.masteredCount} từ</span>
            </div>
            <div className="flex items-center justify-between text-[#786D73]">
              <span>Cần ôn hôm nay:</span>
              <span className="font-bold text-[#FA5271]">{myStats.dueReviewsCount} từ</span>
            </div>
            <div className="flex items-center justify-between text-[#786D73] pt-1 border-t border-[#EFE5E0]">
              <span>Quiz gần nhất:</span>
              <span className="font-bold text-[#201A1D]">
                {myStats.latestQuiz
                  ? `${myStats.latestQuiz.correct}/${myStats.latestQuiz.total}`
                  : "Chưa thi"}
              </span>
            </div>
          </div>
        </div>

        {/* Cột Partner */}
        <div className="p-3.5 rounded-2xl bg-[#FFF8FA] border border-[#FFEBF0] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#FA5271]">{partnerName}</span>
            <span className="text-[10px] font-bold text-[#FA5271] bg-white px-2 py-0.5 rounded-full border border-[#FFEBF0]">
              Đối phương
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[#786D73]">
              <span>Đã học:</span>
              <span className="font-bold text-[#201A1D]">
                {partnerStats ? `${partnerStats.totalLearned} từ` : "Chưa kết nối"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#786D73]">
              <span>Nhớ tốt (Hộp 5):</span>
              <span className="font-bold text-emerald-600">
                {partnerStats ? `${partnerStats.masteredCount} từ` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#786D73]">
              <span>Trạng thái:</span>
              <span className="font-bold text-[#201A1D]">
                {partnerStats ? "Đang học" : "Đang chờ"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#786D73] pt-1 border-t border-[#FFEBF0]">
              <span>Quiz gần nhất:</span>
              <span className="font-bold text-[#201A1D]">
                {partnerStats?.latestQuiz
                  ? `${partnerStats.latestQuiz.correct}/${partnerStats.latestQuiz.total}`
                  : "Chưa thi"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
