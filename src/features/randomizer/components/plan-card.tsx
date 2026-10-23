"use client";

import { useState, useTransition } from "react";
import { DatePlan } from "@/types/discover";
import { PlanItemRow } from "./plan-item-row";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDatePlanItemAction, deleteDatePlanAction, confirmAllDatePlanItemsAction, archiveDatePlanAction, restoreDatePlanAction } from "../actions";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Wallet,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface PlanCardProps {
  plan: DatePlan;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (plan: DatePlan) => void;
  archived?: boolean;
}

export function PlanCard({
  plan,
  isExpanded,
  onToggleExpand,
  onEdit,
  archived = false,
}: PlanCardProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newParticipantsCount, setNewParticipantsCount] = useState<1 | 2>(2);
  const [isPending, startTransition] = useTransition();

  const formatVND = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " ₫";
  };

  const diffBudget = (plan.planned_budget || 0) - (plan.total_actual || 0);
  const isOverBudget =
    (plan.total_actual || 0) > (plan.planned_budget || 0) &&
    (plan.planned_budget || 0) > 0;
  const pendingItems = plan.items?.filter((item) => item.actual_cost === null) ?? [];

  const handleDeletePlan = () => {
    if (!confirm(`Xóa kế hoạch "${plan.title}"?`)) return;
    startTransition(async () => {
      await deleteDatePlanAction(plan.id);
    });
  };

  const handleAddItem = () => {
    if (!newTitle.trim()) return;
    const cost = parseInt(newCost.replace(/\D/g, ""), 10) || 0;

    startTransition(async () => {
      const res = await addDatePlanItemAction(plan.id, newTitle.trim(), cost, null, newParticipantsCount);
      if (res.success) {
        setNewTitle("");
        setNewCost("");
        setShowAddForm(false);
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      const result = archived ? await restoreDatePlanAction(plan.id) : await archiveDatePlanAction(plan.id);
      if (result.success) router.refresh();
    });
  };

  const handleConfirmAll = () => {
    if (pendingItems.length === 0) return;
    startTransition(async () => {
      const result = await confirmAllDatePlanItemsAction(plan.id);
      if (result.success) router.refresh();
    });
  };

  return (
    <Card
      className={`overflow-hidden transition-all border ${
        isExpanded ? "border-[#7C4DFF]/40 shadow-sm" : "border-[#F2EAE5]"
      }`}
    >
      <div
        className="p-4 bg-white cursor-pointer hover:bg-stone-50/50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-[#201A1D] truncate">
                {plan.title}
              </h4>
              {plan.planned_for && (
                <span className="text-[10px] font-semibold text-[#786D73] bg-[#F6EFF0] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                  <Calendar className="w-3 h-3" />
                  {plan.planned_for}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-[#52464D] flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-[#9E9096]" />
                Hạn mức:{" "}
                <strong className="text-[#201A1D]">
                  {formatVND(plan.planned_budget)}
                </strong>
              </span>
              <span className="text-xs text-[#52464D]">
                Tổng dự tính:{" "}
                <strong className="text-[#201A1D]">
                  {formatVND(plan.total_estimated || 0)}
                </strong>
              </span>
              <span className="text-xs text-[#52464D]">
                Đã chi:{" "}
                <strong className="text-[#7C4DFF]">
                  {formatVND(plan.total_actual || 0)}
                </strong>
              </span>
              {plan.planned_budget > 0 && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isOverBudget
                      ? "bg-[#F0E9FF] text-[#6B46C1]"
                      : "bg-[#E8F8F2] text-[#1B9B68]"
                  }`}
                >
                  {isOverBudget
                    ? `Vượt ${formatVND(Math.abs(diffBudget))}`
                    : `Còn ${formatVND(diffBudget)}`}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(plan);
              }}
              className="p-1.5 text-[#9E9096] hover:text-[#201A1D] rounded-lg"
              title="Sửa kế hoạch"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); handleArchive(); }} disabled={isPending} className="rounded-lg p-1.5 text-[#9E9096] hover:text-[#7C4DFF]" title={archived ? "Khôi phục kế hoạch" : "Lưu trữ kế hoạch"}>
              {archived ? "↩" : "⌑"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePlan();
              }}
              disabled={isPending}
              className="p-1.5 text-[#9E9096] hover:text-[#6B46C1] rounded-lg"
              title="Xóa kế hoạch"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="p-1 text-[#9E9096]">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-[#F2EAE5] bg-[#FDFBF7]/40 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#786D73]">
            <span>CÁC MỤC CHI TIẾT ({plan.items?.length || 0})</span>
            {pendingItems.length > 0 && (
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmAll}
                disabled={isPending}
                className="h-7 rounded-lg px-2 text-[10px]"
              >
                Xác nhận tất cả ({pendingItems.length})
              </Button>
            )}
          </div>

          {(!plan.items || plan.items.length === 0) && (
            <p className="text-xs text-center text-[#9E9096] py-2">
              Chưa có mục nào trong kế hoạch này.
            </p>
          )}

          <div className="space-y-2">
            {plan.items?.map((item) => (
              <PlanItemRow key={item.id} item={item} />
            ))}
          </div>

          {showAddForm ? (
            <div className="bg-white rounded-xl p-3 border border-[#7C4DFF]/50 space-y-2">
              <Input
                placeholder="Tên món ăn / vé xem phim / hoạt động..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-xs h-8"
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Chi phí Æ°ớc tính..."
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                  className="text-xs h-8 flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleAddItem}
                  disabled={isPending || !newTitle.trim()}
                  className="h-8 text-xs px-3"
                >
                  Lưu
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowAddForm(false)}
                  className="h-8 text-xs px-2"
                >
                  Hủy
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setNewParticipantsCount(count as 1 | 2)}
                    className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold ${
                      newParticipantsCount === count
                        ? "border-[#7C4DFF] bg-[#F0E9FF] text-[#7C4DFF]"
                        : "border-[#E5DAD5] text-[#786D73]"
                    }`}
                  >
                    {count === 1 ? "1 người" : "2 người (x2)"}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAddForm(true);
                setNewTitle("");
                setNewCost("");
              }}
              className="w-full h-8 text-xs border-dashed text-[#786D73] rounded-xl hover:text-[#7C4DFF]"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Thêm mục chi phí
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
