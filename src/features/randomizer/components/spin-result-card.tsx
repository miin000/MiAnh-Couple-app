"use client";

import { useState } from "react";
import { RandomItem, PriceLevelConfig } from "@/types/discover";
import {
  getItemEmoji,
  getPriceLevelText,
  formatGoogleMapsUrl,
} from "./discover-helpers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  RefreshCw,
  Check,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface SpinResultCardProps {
  item: RandomItem;
  categoryLabel: string;
  priceConfigs?: PriceLevelConfig[];
  onSpinAgain: () => void;
  onSelect: () => void;
}

export function SpinResultCard({
  item,
  categoryLabel,
  priceConfigs,
  onSpinAgain,
  onSelect,
}: SpinResultCardProps) {
  const [imageError, setImageError] = useState(false);
  const emoji = getItemEmoji(item);
  const mapsUrl = formatGoogleMapsUrl(item.map_url);
  const hasValidImage = Boolean(item.image_url && !imageError);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Celebration Header */}
      <div className="text-center pt-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C4DFF] mb-1">
          ✨ VŨ TRỤ Đà CHỌN
        </p>
        <h2 className="text-2xl font-black text-[#201A1D]">
          Gợi ý tuyệt vời cho hai đứa!
        </h2>
      </div>

      {/* Main Result Card */}
      <Card className="p-5 sm:p-6 text-center bg-white border border-[#F2EAE5] shadow-[0_8px_30px_rgba(250,82,113,0.08)] rounded-3xl space-y-4 overflow-hidden">
        {/* Visual Image / Large Emoji Badge */}
        {hasValidImage ? (
          <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden bg-stone-100 border border-[#F2EAE5] shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url!}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={() => setImageError(true)}
            />
            <div className="absolute top-2.5 right-2.5 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-xs flex items-center justify-center text-xl shadow-xs">
              {emoji}
            </div>
          </div>
        ) : (
          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FFF2EB] flex items-center justify-center text-4xl shadow-inner">
            {emoji}
          </div>
        )}

        <div>
          <div className="inline-block text-[11px] font-bold text-[#7C4DFF] bg-[#F0E9FF] px-3 py-1 rounded-full uppercase tracking-wider mb-1.5">
            {categoryLabel} · {getPriceLevelText(item.price_level, priceConfigs)}
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

        {/* NÚT DẪN TỚI GOOGLE MAPS THEO ĐỊA CHỈ TỪ ADMIN */}
        {mapsUrl && (
          <div className="pt-1">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1967D2] border border-[#C2D7FA] text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
            >
              <MapPin className="w-4 h-4 text-[#EA4335] shrink-0" />
              <span>Xem địa chỉ trên Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 shrink-0" />
            </a>
          </div>
        )}

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
          className="rounded-2xl h-12 text-xs font-bold gap-2 bg-[#7C4DFF] hover:bg-[#7C4DFF]/90 text-white shadow-md shadow-[#7C4DFF]/20"
        >
          <Check className="w-4 h-4" /> Chọn cái này
        </Button>
      </div>
    </div>
  );
}

