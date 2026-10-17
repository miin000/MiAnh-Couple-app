"use client";

import React from "react";
import { PriceLevelConfig } from "@/types/discover";

interface PriceLevelCardEditorProps {
  index: number;
  config: PriceLevelConfig;
  onChange: (index: number, field: keyof PriceLevelConfig, val: string | number | null) => void;
}

export function PriceLevelCardEditor({
  index,
  config,
  onChange,
}: PriceLevelCardEditorProps) {
  return (
    <div className="p-3.5 rounded-2xl border-2 border-[#7C4DFF]/40 bg-[#FFFBF8] space-y-2.5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-[#7C4DFF] uppercase tracking-wide">
          Mức {config.level}
        </span>
        <span className="text-[10px] text-stone-500 font-medium">Bậc {config.level}/4</span>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-stone-600 block">Tên nhãn mức</label>
        <input
          type="text"
          value={config.label}
          onChange={(e) => onChange(index, "label", e.target.value)}
          className="w-full text-xs font-bold p-1.5 bg-white border border-[#F2EAE5] rounded-lg focus:border-[#7C4DFF] outline-hidden"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-stone-600 block">Huy hiệu (Badge)</label>
        <input
          type="text"
          value={config.badge}
          onChange={(e) => onChange(index, "badge", e.target.value)}
          className="w-full text-[11px] p-1.5 bg-white border border-[#F2EAE5] rounded-lg focus:border-[#7C4DFF] outline-hidden"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-stone-600 block">Khoảng tiền hiển thị</label>
        <input
          type="text"
          value={config.rangeText}
          onChange={(e) => onChange(index, "rangeText", e.target.value)}
          className="w-full text-[11px] p-1.5 bg-white border border-[#F2EAE5] rounded-lg focus:border-[#7C4DFF] outline-hidden text-[#7C4DFF] font-semibold"
        />
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <div>
          <label className="text-[10px] font-bold text-stone-600 block">Tối thiểu (₫)</label>
          <input
            type="number"
            value={config.minCost ?? ""}
            onChange={(e) =>
              onChange(index, "minCost", e.target.value === "" ? null : Number(e.target.value))
            }
            className="w-full text-[11px] p-1.5 bg-white border border-[#F2EAE5] rounded-lg outline-hidden"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-stone-600 block">Tối đa (₫)</label>
          <input
            type="number"
            value={config.maxCost ?? ""}
            onChange={(e) =>
              onChange(index, "maxCost", e.target.value === "" ? null : Number(e.target.value))
            }
            className="w-full text-[11px] p-1.5 bg-white border border-[#F2EAE5] rounded-lg outline-hidden"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-stone-600 block">Mô tả / Gợi ý mẫu</label>
        <textarea
          rows={2}
          value={config.description}
          onChange={(e) => onChange(index, "description", e.target.value)}
          className="w-full text-[11px] p-1.5 bg-white border border-[#F2EAE5] rounded-lg focus:border-[#7C4DFF] outline-hidden leading-relaxed"
        />
      </div>
    </div>
  );
}
