"use client";

import { useState, useTransition } from "react";
import { DatePlanItem } from "@/types/discover";
import { updateDatePlanItemAction, deleteDatePlanItemAction } from "../actions";
import { useRouter } from "next/navigation";
import { Check, X, Trash2, Edit2 } from "lucide-react";

interface PlanItemRowProps {
  item: DatePlanItem;
}

export function PlanItemRow({ item }: PlanItemRowProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [actualCost, setActualCost] = useState(
    String(item.actual_cost ?? item.estimated_cost)
  );
  const [isPending, startTransition] = useTransition();
  const [participantsCount, setParticipantsCount] = useState<1 | 2>(
    item.participants_count === 1 ? 1 : 2
  );

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
      router.refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteDatePlanItemAction(item.id);
    });
  };

  const handleParticipantsChange = (value: 1 | 2) => {
    setParticipantsCount(value);
    const costPerPerson = item.estimated_cost_per_person ?? item.estimated_cost / (item.participants_count || 1);
    startTransition(async () => {
      await updateDatePlanItemAction(item.id, item.actual_cost, costPerPerson, item.title, value);
      router.refresh();
    });
  };

  return (
    <div className="bg-white rounded-xl p-3 border border-[#F2EAE5] flex items-center justify-between gap-3 text-xs">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#201A1D] truncate">{item.title}</p>
        <p className="text-[11px] text-[#9E9096] mt-0.5">
          Dự tính tổng: {formatVND(item.estimated_cost)}
          {typeof item.estimated_cost_per_person === "number" && (
            <span> ({formatVND(item.estimated_cost_per_person)}/người × {item.participants_count})</span>
          )}
        </p>
        <div className="mt-1 flex gap-1">
          {[1, 2].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => handleParticipantsChange(count as 1 | 2)}
              disabled={isPending}
              className={`rounded-md border px-1.5 py-0.5 text-[10px] ${
                participantsCount === count
                  ? "border-[#7C4DFF] bg-[#F0E9FF] font-bold text-[#7C4DFF]"
                  : "border-[#E5DAD5] text-[#786D73]"
              }`}
            >
              {count === 1 ? "1 người" : "2 người"}
            </button>
          ))}
        </div>
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
          <div className="flex items-center gap-1">
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
                  Xác nhận {formatVND(item.estimated_cost)}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isPending}
              className="rounded-lg p-1.5 text-[#9E9096] hover:bg-[#F0E9FF] hover:text-[#7C4DFF]"
              title="Sửa tiền thực tế"
              aria-label="Sửa tiền thực tế"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          </div>
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
