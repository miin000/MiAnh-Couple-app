"use client";

import React, { useState, useTransition } from "react";
import { PriceLevelConfig } from "@/types/discover";
import { DEFAULT_PRICE_LEVEL_CONFIGS } from "@/features/randomizer/components/discover-helpers";
import { savePriceLevelConfigsAdminAction, resetPriceLevelConfigsAdminAction } from "../actions";
import { PriceLevelCardEditor } from "./price-level-editor";
import { Button } from "@/components/ui/button";
import { Edit3, RotateCcw, Check, X, AlertCircle } from "lucide-react";

interface PriceLevelGuideProps {
  onSelectLevel?: (level: number | null) => void;
  selectedLevel?: number | null;
  initialConfigs?: PriceLevelConfig[];
  onConfigsChange?: (configs: PriceLevelConfig[]) => void;
  editable?: boolean;
}

export function PriceLevelGuide({
  onSelectLevel,
  selectedLevel,
  initialConfigs,
  onConfigsChange,
  editable = true,
}: PriceLevelGuideProps) {
  const [configs, setConfigs] = useState<PriceLevelConfig[]>(
    initialConfigs && initialConfigs.length === 4 ? initialConfigs : DEFAULT_PRICE_LEVEL_CONFIGS
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<PriceLevelConfig[]>(configs);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotify = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleStartEdit = () => {
    setEditValues(configs);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditValues(configs);
    setIsEditing(false);
  };

  const handleFieldChange = (
    index: number,
    field: keyof PriceLevelConfig,
    val: string | number | null
  ) => {
    setEditValues((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await savePriceLevelConfigsAdminAction(editValues);
      if (res.success && res.data) {
        setConfigs(res.data);
        if (onConfigsChange) onConfigsChange(res.data);
        setIsEditing(false);
        showNotify("success", res.message || "Đã lưu quy chuẩn thành công!");
      } else {
        showNotify("error", res.message || "Không thể lưu cấu hình.");
      }
    });
  };

  const handleReset = () => {
    if (!confirm("Bạn có chắc chắn muốn đặt lại toàn bộ 4 mức chi tiêu về mặc định ban đầu?")) return;
    startTransition(async () => {
      const res = await resetPriceLevelConfigsAdminAction();
      if (res.success && res.data) {
        setConfigs(res.data);
        setEditValues(res.data);
        if (onConfigsChange) onConfigsChange(res.data);
        setIsEditing(false);
        showNotify("success", "Đã khôi phục quy chuẩn chi tiêu mặc định!");
      } else {
        showNotify("error", res.message || "Lỗi khôi phục mặc định.");
      }
    });
  };

  return (
    <div className="bg-white border border-[#F2EAE5] rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F2EAE5] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold text-[#201A1D] uppercase tracking-wider">
              Quy chuẩn 4 mức chi tiêu hẹn hò
            </h4>
            <span className="text-[11px] font-bold text-[#7C4DFF] px-2 py-0.5 rounded-full bg-[#FFF2EB]">
              Tùy chỉnh hệ thống
            </span>
          </div>
          <p className="text-xs text-[#786D73] mt-0.5">
            Đơn vị tính: VNĐ / người · Điều chỉnh tên gọi, mức tiền và mô tả gợi ý.
          </p>
        </div>

        {editable && (
          <div className="flex items-center gap-2 shrink-0">
            {!isEditing ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStartEdit}
                  className="rounded-xl border-[#F2EAE5] text-stone-700 hover:text-[#7C4DFF] hover:bg-[#FFF2EB] text-xs font-bold gap-1.5 h-8 px-3"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Điều chỉnh quy chuẩn
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleReset}
                  disabled={isPending}
                  title="Khôi phục mặc định"
                  className="rounded-xl text-stone-500 hover:text-[#201A1D] text-xs font-medium h-8 px-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isPending}
                  className="rounded-xl bg-[#7C4DFF] hover:bg-[#E03A59] text-white text-xs font-bold gap-1 h-8 px-3 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isPending}
                  className="rounded-xl border-[#F2EAE5] text-stone-600 text-xs font-medium gap-1 h-8 px-2.5"
                >
                  <X className="w-3.5 h-3.5" /> Hủy
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {notification && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Grid 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {configs.map((cfg, index) => {
          const isSelected = selectedLevel === cfg.level;
          const editItem = editValues[index];

          if (isEditing && editItem) {
            return (
              <PriceLevelCardEditor
                key={cfg.level}
                index={index}
                config={editItem}
                onChange={handleFieldChange}
              />
            );
          }

          return (
            <div
              key={cfg.level}
              onClick={() => onSelectLevel && onSelectLevel(cfg.level)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                onSelectLevel ? "cursor-pointer" : ""
              } ${
                isSelected
                  ? "border-[#7C4DFF] bg-[#FFF2EB] shadow-xs"
                  : "border-[#F2EAE5] bg-stone-50/50 hover:bg-stone-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-black text-xs text-[#201A1D]">
                  Mức {cfg.level}: {cfg.label}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#F2EAE5] text-[#7C4DFF]">
                  {cfg.rangeText}
                </span>
              </div>
              <div className="text-[10px] font-semibold text-stone-500 mb-1">{cfg.badge}</div>
              <p className="text-[11px] text-[#786D73] leading-relaxed line-clamp-3">
                {cfg.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
