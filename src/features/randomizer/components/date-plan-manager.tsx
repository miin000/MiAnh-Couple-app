"use client";

import { useState } from "react";
import { DatePlan } from "@/types/discover";
import { PlanCard } from "./plan-card";
import { CreatePlanModal, EditPlanModal } from "./plan-modals";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, Sparkles, Archive } from "lucide-react";

interface DatePlanManagerProps {
  plans: DatePlan[];
  isPaired: boolean;
  selectedPlanId?: string | null;
  onSelectPlan?: (planId: string) => void;
}

export function DatePlanManager({
  plans,
  isPaired,
  selectedPlanId,
  onSelectPlan,
}: DatePlanManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DatePlan | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const activePlans = plans.filter((plan) => showArchive ? Boolean(plan.archived_at) : !plan.archived_at);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(
    selectedPlanId || plans[0]?.id || null
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#201A1D]">
            Kế hoạch hẹn hò & Chi phí
          </h3>
          <p className="text-xs text-[#786D73]">
            Cùng nhau lên lịch và quản lý chi tiêu
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="rounded-2xl h-9 px-3.5 text-xs font-semibold gap-1.5"
          disabled={!isPaired}
        >
          <Plus className="w-4 h-4" /> Tạo kế hoạch
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowArchive(!showArchive)} className="ml-2 rounded-2xl text-xs">
          <Archive className="mr-1 h-4 w-4" /> {showArchive ? "Kế hoạch đang dùng" : "Kho lưu trữ"}
        </Button>
      </div>

      {!isPaired && (
        <div className="rounded-2xl bg-[#FFF2EB] border border-[#FAD8C3] p-3 text-xs text-[#9E5A27] flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-[#E56A2E]" />
          <span>
            Ghép đôi cùng người ấy để cùng tạo và theo dõi kế hoạch nhé!
          </span>
        </div>
      )}

      {/* Danh sách kế hoạch */}
      {activePlans.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center bg-white border border-[#F2EAE5]">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] text-[#E56A2E] flex items-center justify-center mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[#201A1D]">
            Chưa có kế hoạch hẹn hò nào
          </h4>
          <p className="text-xs text-[#786D73] mt-1 max-w-[260px]">
            Tạo kế hoạch để lưu các món ăn, địa điểm hai đứa sẽ đi và quản lý
            ngân sách dễ dàng.
          </p>
          {isPaired && (
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="outline"
              className="mt-4 rounded-xl text-xs font-semibold"
            >
              <Plus className="w-4 h-4 mr-1" /> Tạo kế hoạch đầu tiên
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {activePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isExpanded={expandedPlanId === plan.id}
              onToggleExpand={() => {
                const nextId = expandedPlanId === plan.id ? null : plan.id;
                setExpandedPlanId(nextId);
                if (nextId) onSelectPlan?.(nextId);
              }}
              onEdit={(p) => setEditingPlan(p)}
              archived={showArchive}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreatePlanModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newPlanId) => {
            setShowCreateModal(false);
            if (newPlanId) {
              setExpandedPlanId(newPlanId);
              onSelectPlan?.(newPlanId);
            }
          }}
        />
      )}

      {editingPlan && (
        <EditPlanModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSuccess={() => setEditingPlan(null)}
        />
      )}
    </div>
  );
}
