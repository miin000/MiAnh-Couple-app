"use client";

import { useState, useTransition } from "react";
import { RandomItem, DatePlan } from "@/types/discover";
import { addDatePlanItemAction, createDatePlanAction } from "../actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Check } from "lucide-react";

interface AddToPlanModalProps {
  item: RandomItem;
  plans: DatePlan[];
  isPaired: boolean;
  onClose: () => void;
  onSuccess: (planId: string, itemTitle: string) => void;
}

export function AddToPlanModal({
  item,
  plans,
  isPaired,
  onClose,
  onSuccess,
}: AddToPlanModalProps) {
  const [mode, setMode] = useState<"select" | "create">(
    plans.length > 0 ? "select" : "create"
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    plans[0]?.id || ""
  );
  const [estimatedCost, setEstimatedCost] = useState("");
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const [newPlanDate, setNewPlanDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [newPlanBudget, setNewPlanBudget] = useState("500000");

  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cost = parseInt(estimatedCost.replace(/\D/g, ""), 10) || 0;

    startTransition(async () => {
      let planId = selectedPlanId;

      if (mode === "create") {
        if (!newPlanTitle.trim()) {
          setErrorMsg("Vui lòng nhập tên kế hoạch mới.");
          return;
        }

        const formData = new FormData();
        formData.set("title", newPlanTitle.trim());
        formData.set("planned_for", newPlanDate);
        formData.set("planned_budget", newPlanBudget);

        const createRes = await createDatePlanAction(null, formData);
        if (!createRes.success || !createRes.data?.id) {
          setErrorMsg(createRes.message || "Không thể tạo kế hoạch mới.");
          return;
        }
        planId = createRes.data.id;
      }

      if (!planId) {
        setErrorMsg("Vui lòng chọn một kế hoạch.");
        return;
      }

      const res = await addDatePlanItemAction(planId, item.title, cost, item.id);
      if (res.success) {
        onSuccess(planId, item.title);
      } else {
        setErrorMsg(res.message || "Không thể thêm mục vào kế hoạch.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white p-5 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#201A1D]">
              Thêm vào kế hoạch
            </h3>
            <p className="text-xs text-[#786D73] truncate max-w-[240px]">
              {item.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#9E9096] hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-[#F0E9FF] text-[#6B46C1] p-2.5 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {!isPaired ? (
          <div className="space-y-3 py-2 text-center">
            <p className="text-xs text-[#786D73]">
              Bạn cần ghép đôi cùng người ấy trước khi có thể lưu vào kế hoạch chung của hai bạn.
            </p>
            <Button onClick={onClose} className="w-full rounded-xl">
              Đã hiểu
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {plans.length > 0 && (
              <div className="grid grid-cols-2 p-1 bg-[#F5EFEB] rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMode("select")}
                  className={`py-1.5 rounded-lg transition-all ${
                    mode === "select"
                      ? "bg-white text-[#7C4DFF] shadow-2xs"
                      : "text-[#786D73]"
                  }`}
                >
                  Chọn kế hoạch
                </button>
                <button
                  type="button"
                  onClick={() => setMode("create")}
                  className={`py-1.5 rounded-lg transition-all ${
                    mode === "create"
                      ? "bg-white text-[#7C4DFF] shadow-2xs"
                      : "text-[#786D73]"
                  }`}
                >
                  + Kế hoạch mới
                </button>
              </div>
            )}

            {mode === "select" && plans.length > 0 ? (
              <div>
                <label className="text-xs font-semibold text-[#52464D] block mb-1">
                  Chọn kế hoạch
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full rounded-xl border border-[#E5DAD5] px-3 py-2 text-xs text-[#201A1D] bg-white focus:outline-none focus:border-[#7C4DFF]"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} {p.planned_for ? `(${p.planned_for})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div>
                  <label className="text-xs font-semibold text-[#52464D] block mb-1">
                    Tên kế hoạch mới *
                  </label>
                  <Input
                    value={newPlanTitle}
                    onChange={(e) => setNewPlanTitle(e.target.value)}
                    placeholder="Ví dụ: Hẹn hò cuối tuần..."
                    required
                    className="text-xs rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-[#52464D] block mb-1">
                      Ngày dự kiến
                    </label>
                    <Input
                      type="date"
                      value={newPlanDate}
                      onChange={(e) => setNewPlanDate(e.target.value)}
                      className="text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#52464D] block mb-1">
                      Ngân sách (₫)
                    </label>
                    <Input
                      type="number"
                      value={newPlanBudget}
                      onChange={(e) => setNewPlanBudget(e.target.value)}
                      step={50000}
                      className="text-xs rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-[#52464D] block mb-1">
                Chi phí Æ°ớc tính cho mục này (₫)
              </label>
              <Input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="Ví dụ: 150000 (tuỳ chọn)"
                step={10000}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1 rounded-xl text-xs"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-xl text-xs gap-1"
              >
                <Check className="w-4 h-4" />
                {isPending ? "Đang lưu..." : "Lưu vào kế hoạch"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
