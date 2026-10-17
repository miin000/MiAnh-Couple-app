"use client";

import { RandomItem } from "@/types/discover";
import { getItemEmoji } from "./discover-helpers";

interface SlotMachineProps {
  items: RandomItem[];
  currentIndex: number;
  isSpinning: boolean;
}

export function SlotMachine({
  items,
  currentIndex,
  isSpinning,
}: SlotMachineProps) {
  if (items.length === 0) return null;

  const len = items.length;
  const prevItem = items[(currentIndex - 1 + len) % len];
  const currentItem = items[currentIndex % len];
  const nextItem = items[(currentIndex + 1) % len];

  return (
    <div className="relative w-full max-w-sm mx-auto bg-white rounded-3xl border border-[#F2EAE5] shadow-[0_4px_20px_rgba(0,0,0,0.04)] py-6 px-4 overflow-hidden select-none">
      {/* Top fade gradient */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-10" />

      {/* Options Stack */}
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        {/* Top muted item */}
        <div
          className={`text-sm text-[#A89DA3] font-medium transition-all duration-150 line-clamp-1 h-6 flex items-center ${
            isSpinning ? "opacity-40 blur-[0.5px]" : "opacity-60"
          }`}
        >
          {prevItem?.title}
        </div>

        {/* Divider above center */}
        <div className="w-4/5 h-[1px] bg-[#F2EAE5]" />

        {/* Center Active Item */}
        <div className="relative w-full py-2 flex items-center justify-center">
          {/* Left marker */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-[#7C4DFF] rounded-r-full shadow-xs" />

          {/* Center text with emoji */}
          <div
            className={`text-lg sm:text-xl font-extrabold text-[#7C4DFF] px-4 flex items-center justify-center gap-2 max-w-[90%] truncate transition-all duration-100 ${
              isSpinning ? "scale-95 opacity-80" : "scale-100 opacity-100"
            }`}
          >
            <span className="text-2xl shrink-0">
              {currentItem ? getItemEmoji(currentItem) : "✨"}
            </span>
            <span className="truncate">{currentItem?.title}</span>
          </div>

          {/* Right marker */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-[#7C4DFF] rounded-l-full shadow-xs" />
        </div>

        {/* Divider below center */}
        <div className="w-4/5 h-[1px] bg-[#F2EAE5]" />

        {/* Bottom muted item */}
        <div
          className={`text-sm text-[#A89DA3] font-medium transition-all duration-150 line-clamp-1 h-6 flex items-center ${
            isSpinning ? "opacity-40 blur-[0.5px]" : "opacity-60"
          }`}
        >
          {nextItem?.title}
        </div>
      </div>

      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />
    </div>
  );
}
