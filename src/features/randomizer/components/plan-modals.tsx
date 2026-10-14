"use client";

import { useTransition } from "react";
import { DatePlan } from "@/types/discover";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { createDatePlanAction, updateDatePlanAction } from "../actions";

interface CreatePlanModalProps {
  onClose: () => void;
  onSuccess: (newPlanId?: string) => void;
}

export function CreatePlanModal({ onClose, onSuccess }: CreatePlanModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createDatePlanAction(null, formData);
      if (res.success) {
        onSuccess(res.data?.id);
      } else {
        alert(res.message || "Lỗi tạo kế hoạch.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white p-5 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#201A1D]">Tạo kế hoạch hẹn hò</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#9E9096] hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#52464D] block mb-1">
              Tên buổi hẹn *
            </label>
            <Input
              name="title"
              placeholder="Ví dụ: Cuối tuần lãng mạn, Đi dạo phố cổ..."
              required
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#52464D] block mb-1">
              Ngày dự kiến
            </label>
            <Input
              type="date"
              name="planned_for"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#52464D] block mb-1">
              Ngân sách dự kiến (VND)
            </label>
            <Input
              type="number"
              name="planned_budget"
              placeholder="500000"
              defaultValue={500000}
              step={50000}
              className="rounded-xl"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-xl"
            >
              {isPending ? "Đang tạo..." : "Tạo kế hoạch"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

interface EditPlanModalProps {
  plan: DatePlan;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPlanModal({ plan, onClose, onSuccess }: EditPlanModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", plan.id);

    startTransition(async () => {
      const res = await updateDatePlanAction(null, formData);
      if (res.success) {
        onSuccess();
      } else {
        alert(res.message || "Lỗi cập nhật.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white p-5 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#201A1D]">Sửa kế hoạch</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#9E9096] hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#52464D] block mb-1">
              Tên buổi hẹn *
            </label>
            <Input
              name="title"
              defaultValue={plan.title}
              required
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#52464D] block mb-1">
              Ngày dự kiến
            </label>
            <Input
              type="date"
              name="planned_for"
              defaultValue={plan.planned_for || ""}
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#52464D] block mb-1">
              Ngân sách dự kiến (VND)
            </label>
            <Input
              type="number"
              name="planned_budget"
              defaultValue={plan.planned_budget}
              step={50000}
              className="rounded-xl"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-xl"
            >
              {isPending ? "Đang lưu..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
