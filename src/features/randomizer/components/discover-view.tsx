"use client";

import { useState } from "react";
import { RandomItem, DatePlan, DiscoverKind } from "@/types/discover";
import { CATEGORY_ITEMS } from "./discover-helpers";
import { SlotMachine } from "./slot-machine";
import { SpinResultCard } from "./spin-result-card";
import { DatePlanManager } from "./date-plan-manager";
import { AddToPlanModal } from "./add-to-plan-modal";
import { PageHeader } from "@/components/shared/page-header";
import { CoupleAvatars } from "@/components/shared/couple-avatars";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  RefreshCw,
  LoaderCircle,
  Sparkles,
  Compass,
  Wallet,
} from "lucide-react";

interface DiscoverViewProps {
  initialItems: RandomItem[];
  plans: DatePlan[];
  isPaired: boolean;
  coupleInitials?: [string, string];
}

type TabType = "random" | "plans";
type DiscoverStep = "categories" | "spin" | "result";

export function DiscoverView({
  initialItems,
  plans,
  isPaired,
  coupleInitials = ["M", "A"],
}: DiscoverViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("random");
  const [step, setStep] = useState<DiscoverStep>("categories");
  const [selectedKind, setSelectedKind] = useState<DiscoverKind>("food");
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAddToPlanModal, setShowAddToPlanModal] = useState(false);

  const filteredItems = initialItems.filter((it) => it.kind === selectedKind);
  const selectedCategory =
    CATEGORY_ITEMS.find((c) => c.id === selectedKind) || CATEGORY_ITEMS[0];
  const currentItem =
    filteredItems[currentIndex % Math.max(filteredItems.length, 1)];

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleStartSpin = () => {
    if (filteredItems.length === 0) return;
    setIsSpinning(true);

    const spinSteps = 12 + Math.floor(Math.random() * 8);
    let stepCount = 0;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
      stepCount++;
      if (stepCount >= spinSteps) {
        clearInterval(interval);
        setIsSpinning(false);
        setStep("result");
      }
    }, 90);
  };

  const handleSelectCategory = (kind: DiscoverKind) => {
    setSelectedKind(kind);
    setCurrentIndex(0);
    setStep("spin");
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#201A1D] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-[#FA5271]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Mode Selector */}
      <div className="grid grid-cols-2 p-1 bg-[#ECE2DC] rounded-2xl">
        <button
          type="button"
          onClick={() => {
            setActiveTab("random");
            if (step === "result") setStep("categories");
          }}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "random"
              ? "bg-white text-[#FA5271] shadow-2xs"
              : "text-[#786D73] hover:text-[#201A1D]"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Quay ngẫu nhiên
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "plans"
              ? "bg-white text-[#FA5271] shadow-2xs"
              : "text-[#786D73] hover:text-[#201A1D]"
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          Kế hoạch & Chi phí
        </button>
      </div>

      {activeTab === "plans" ? (
        <DatePlanManager plans={plans} isPaired={isPaired} />
      ) : (
        <>
          {step === "categories" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <PageHeader
                category="ĐỂ VŨ TRỤ CHỌN GIÚP"
                title="Hai đứa đang phân vân điều gì?"
                subtitle="Chọn một chủ đề, tụi mình sẽ đưa ra một gợi ý thật vui."
              />

              <div className="grid grid-cols-2 gap-3.5">
                {CATEGORY_ITEMS.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`text-left rounded-3xl p-4.5 ${cat.bgColor} border border-black/[0.03] flex flex-col justify-between min-h-[148px] shadow-2xs cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all`}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-white/80 shadow-2xs flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${cat.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#201A1D]">
                          {cat.title}
                        </h3>
                        <p className="text-xs text-[#786D73] mt-0.5 line-clamp-1">
                          {cat.subtitle}
                        </p>
                        <div className="mt-2.5 flex justify-end">
                          <span className="w-6 h-6 rounded-full bg-white/70 flex items-center justify-center text-[#786D73]">
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-center text-xs text-[#9E9096] flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FA5271]" />
                <span>Một chút ngẫu nhiên, thêm nhiều niềm vui.</span>
              </div>
            </div>
          )}

          {step === "spin" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <PageHeader
                category="LỰA CHỌN NGẪU NHIÊN"
                title={selectedCategory.question}
                subtitle="Chạm nút và để bất ngờ quyết định buổi hẹn của hai đứa."
                onBack={() => setStep("categories")}
              />

              <div className="py-2">
                <SlotMachine
                  items={filteredItems}
                  currentIndex={currentIndex}
                  isSpinning={isSpinning}
                />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-center gap-2 text-xs text-[#786D73]">
                  <CoupleAvatars initials={coupleInitials} size="sm" />
                  <span>Cùng chờ xem vận may chọn gì nhé</span>
                </div>

                <Button
                  onClick={handleStartSpin}
                  disabled={isSpinning || filteredItems.length === 0}
                  className="w-full h-13 rounded-2xl bg-[#FA5271] hover:bg-[#FA5271]/90 text-white font-bold text-sm shadow-[0_6px_20px_rgba(250,82,113,0.3)] gap-2"
                >
                  {isSpinning ? (
                    <>
                      <LoaderCircle className="w-5 h-5 animate-spin" />
                      Đang quay...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Quay ngẫu nhiên
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === "result" && currentItem && (
            <div>
              <PageHeader
                category="KẾT QUẢ HÔM NAY"
                title="Bất ngờ của hai bạn"
                onBack={() => setStep("spin")}
              />

              <SpinResultCard
                item={currentItem}
                categoryLabel={selectedCategory.title}
                onSpinAgain={() => {
                  setStep("spin");
                  handleStartSpin();
                }}
                onSelect={() => setShowAddToPlanModal(true)}
              />
            </div>
          )}

          {showAddToPlanModal && currentItem && (
            <AddToPlanModal
              item={currentItem}
              plans={plans}
              isPaired={isPaired}
              onClose={() => setShowAddToPlanModal(false)}
              onSuccess={(_planId, itemTitle) => {
                setShowAddToPlanModal(false);
                showNotification(`Đã lưu "${itemTitle}" vào kế hoạch!`);
                setActiveTab("plans");
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
