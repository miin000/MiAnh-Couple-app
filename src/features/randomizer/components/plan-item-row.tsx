"use client";

import { useState, useTransition } from "react";
import { DatePlanItem } from "@/types/discover";
import { updateDatePlanItemAction, deleteDatePlanItemAction } from "../actions";
import { Check, X, Trash2 } from "lucide-react";

interface PlanItemRowProps {
  item: DatePlanItem;
}

export function PlanItemRow({ item }: PlanItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [actualCost, setActualCost] = useState(
    item.actual_cost !== null ? String(item.actual_cost) : ""
  );
  const [isPending, startTransition] = useTransition();

  const formatVND = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " ₫";
  };

  const handleSaveActualCost = () => {
    const cost =
      actualCost.trim() === ""
        ? null
        : parseInt(actualCost.replace(/\D/g, ""), 10) || 0;

    startTransition(async () => {
      await updateDatePlanItemAction(item.id, cost);
      setIsEditing(false);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteDatePlanItemAction(item.id);
    });
  };

  return (
    <div className="bg-white rounded-xl p-3 border border-[#F2EAE5] flex items-center justify-between gap-3 text-xs">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#201A1D] truncate">{item.title}</p>
        <p className="text-[11px] text-[#9E9096] mt-0.5">
          Dự tính: {formatVND(item.estimated_cost)}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={actualCost}
              onChange={(e) => setActualCost(e.target.value)}
              placeholder="Thực tế..."
              className="w-24 px-2 py-1 border border-[#7C4DFF] rounded-lg text-xs"
              autoFocus
            />
            <button
              onClick={handleSaveActualCost}
              disabled={isPending}
              className="p-1 bg-[#7C4DFF] text-white rounded-lg hover:opacity-90"
              title="Lưu"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1 bg-stone-200 text-[#52464D] rounded-lg hover:bg-stone-300"
              title="Hủy"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-right group cursor-pointer"
          >
            {item.actual_cost !== null ? (
              <span className="font-extrabold text-[#7C4DFF] block">
                {formatVND(item.actual_cost)}
              </span>
            ) : (
              <span className="text-[11px] text-[#9E9096] italic underline hover:text-[#7C4DFF]">
                + Nhập chi phí thực tế
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="text-[#A89DA3] hover:text-[#6B46C1] p-1 rounded transition-colors"
          title="Xóa mục"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
