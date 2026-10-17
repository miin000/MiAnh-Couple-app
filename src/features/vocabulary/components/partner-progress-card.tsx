"use client";

import { PartnerProgress } from "@/types/learn";
import { CoupleAvatars } from "@/components/shared/couple-avatars";
import { ChevronRight, Sparkles } from "lucide-react";

interface PartnerProgressCardProps {
  myProgress: PartnerProgress;
  partnerProgress: PartnerProgress | null;
}

export function PartnerProgressCard({
  myProgress,
  partnerProgress,
}: PartnerProgressCardProps) {
  if (!partnerProgress) {
    return (
      <div className="rounded-2xl bg-white border border-[#EFE5E0] p-3.5 flex items-center justify-between text-xs text-[#786D73]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FFEBF0] text-[#FA5271] font-bold flex items-center justify-center text-xs">
            {myProgress.display_name.charAt(0).toUpperCase()}
          </div>
          <span>Kết nối với người ấy để cùng theo dõi tiến độ mỗi ngày nhé</span>
        </div>
      </div>
    );
  }

  const myInitial = myProgress.display_name.charAt(0).toUpperCase() || "T";
  const partnerInitial = partnerProgress.display_name.charAt(0).toUpperCase() || "N";
  const partnerName = partnerProgress.display_name;
  const count = partnerProgress.learned_count;
  const total = partnerProgress.total_words || 10;
  const isDone = count >= total;

  return (
    <div className="rounded-2xl bg-white border border-[#EFE5E0] p-3.5 flex items-center justify-between transition-all">
      <div className="flex items-center gap-2.5">
        <CoupleAvatars initials={[myInitial, partnerInitial]} size="sm" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-[#201A1D]">
            {count === 0 ? (
              `${partnerName} chưa bắt đầu học hôm nay`
            ) : isDone ? (
              <span className="text-[#FA5271] font-bold inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {partnerName} đã hoàn thành cả 10 từ hôm nay!
              </span>
            ) : (
              `${partnerName} đã học ${count}/${total} từ hôm nay`
            )}
          </span>
          <span className="text-[11px] text-[#8E8287]">
            {count === 0
              ? "Cùng nhắc người ấy vào học nhé"
              : isDone
                ? "Thật tuyệt vời, cả hai cùng cố gắng nhé"
                : "Tiến độ học riêng biệt & bảo mật"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[#8E8287]">
        <span className="text-xs font-bold text-[#FA5271]">
          {count}/{total}
        </span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
}
