"use client";

import { RandomItem } from "@/types/discover";
import { getItemEmoji, getPriceLevelText } from "./discover-helpers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, RefreshCw, Check } from "lucide-react";

interface SpinResultCardProps {
  item: RandomItem;
  categoryLabel: string;
  onSpinAgain: () => void;
  onSelect: () => void;
}

export function SpinResultCard({
  item,
  categoryLabel,
  onSpinAgain,
  onSelect,
}: SpinResultCardProps) {
  const emoji = getItemEmoji(item);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Celebration Header */}
      <div className="text-center pt-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#FA5271] mb-1">
          ✨ VŨ TRỤ ĐÃ CHỌN
        </p>
        <h2 className="text-2xl font-black text-[#201A1D]">
          Gợi ý tuyệt vời cho hai đứa!
        </h2>
      </div>

      {/* Main Result Card */}
      <Card className="p-6 text-center bg-white border border-[#F2EAE5] shadow-[0_8px_30px_rgba(250,82,113,0.08)] rounded-3xl space-y-4">
        {/* Large Emoji Badge */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FFF2EB] flex items-center justify-center text-4xl shadow-inner">
          {emoji}
        </div>

        <div>
          <div className="inline-block text-[11px] font-bold text-[#FA5271] bg-[#FFEBF0] px-3 py-1 rounded-full uppercase tracking-wider mb-1.5">
            {categoryLabel} · {getPriceLevelText(item.price_level)}
          </div>
          <h3 className="text-xl font-extrabold text-[#201A1D] mt-1">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-xs text-[#52464D] mt-2 leading-relaxed max-w-xs mx-auto">
              {item.description}
            </p>
          )}
        </div>

        {/* Tip Box */}
        {item.tip && (
          <div className="rounded-2xl bg-[#FFF8E2] border border-[#FDE8AD] p-3 text-left flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#FFEBB3] text-[#B88812] flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs text-[#7A5A0A] leading-snug">
              <strong className="block font-bold text-[#5C4305] mb-0.5">
                Mẹo nhỏ cho hai đứa:
              </strong>
              {item.tip}
            </div>
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onSpinAgain}
          className="rounded-2xl h-12 text-xs font-bold gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Quay lại
        </Button>
        <Button
          type="button"
          onClick={onSelect}
          className="rounded-2xl h-12 text-xs font-bold gap-2 bg-[#FA5271] hover:bg-[#FA5271]/90 text-white shadow-md shadow-[#FA5271]/20"
        >
          <Check className="w-4 h-4" /> Chọn cái này
        </Button>
      </div>
    </div>
  );
}
