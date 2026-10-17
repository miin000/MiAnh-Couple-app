"use client";

import { useState, useTransition } from "react";
import { RandomItem, PriceLevelConfig } from "@/types/discover";
import { deleteRandomItemAdminAction, toggleRandomItemStatusAdminAction } from "../actions";
import { DiscoverItemModal } from "./discover-item-modal";
import { PriceLevelGuide } from "./price-level-guide";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Search, Filter, Edit2, Trash2, Eye, EyeOff, Coins, CheckCircle2, AlertCircle, MapPin, ImageIcon } from "lucide-react";
import {
  DEFAULT_PRICE_LEVEL_CONFIGS,
  buildPriceFilterOptions,
  formatGoogleMapsUrl,
} from "@/features/randomizer/components/discover-helpers";

interface DiscoverManagerProps {
  initialItems: RandomItem[];
  initialPriceConfigs?: PriceLevelConfig[];
}

export function DiscoverManager({ initialItems, initialPriceConfigs }: DiscoverManagerProps) {
  const [items, setItems] = useState<RandomItem[]>(initialItems);
  const [priceConfigs, setPriceConfigs] = useState<PriceLevelConfig[]>(
    initialPriceConfigs && initialPriceConfigs.length === 4
      ? initialPriceConfigs
      : DEFAULT_PRICE_LEVEL_CONFIGS
  );
  const [search, setSearch] = useState("");
  const [selectedKind, setSelectedKind] = useState<string>("all");
  const [selectedPrice, setSelectedPrice] = useState<string>("all");
  const [editingItem, setEditingItem] = useState<RandomItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const priceFilterOptions = buildPriceFilterOptions(priceConfigs);


  const showNotify = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredItems = items.filter((it) => {
    if (selectedKind !== "all" && it.kind !== selectedKind) return false;
    if (selectedPrice !== "all" && it.price_level !== Number(selectedPrice)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return it.title.toLowerCase().includes(q) || it.description?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa "${title}"?`)) return;
    startTransition(async () => {
      const res = await deleteRandomItemAdminAction(id);
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        showNotify("success", res.message || "Đã xóa!");
      } else {
        showNotify("error", res.message || "Lỗi xóa!");
      }
    });
  };

  const handleToggle = (item: RandomItem) => {
    startTransition(async () => {
      const res = await toggleRandomItemStatusAdminAction(item.id, item.is_active);
      if (res.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i))
        );
        showNotify("success", res.message || "Cập nhật thành công!");
      }
    });
  };

  return (
    <div className="space-y-5">
      {notification && (
        <div className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold ${
          notification.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
        }`}>
          {notification.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{notification.message}</span>
        </div>
      )}

      <PriceLevelGuide
        initialConfigs={priceConfigs}
        onConfigsChange={(newConfigs) => setPriceConfigs(newConfigs)}
        selectedLevel={selectedPrice !== "all" ? Number(selectedPrice) : null}
        onSelectLevel={(lvl) => setSelectedPrice(lvl === null ? "all" : String(lvl))}
      />

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên món, địa điểm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#F2EAE5] rounded-xl text-xs focus:border-[#7C4DFF]"
          />
        </div>
        <Button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="rounded-xl bg-[#7C4DFF] hover:bg-[#6937D5] text-white text-xs font-bold gap-1.5 h-9 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm gợi ý mới</span>
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-stone-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Loại:
          </span>
          {[
            { id: "all", label: "Tất cả" },
            { id: "food", label: "🍜 Đồ ăn" },
            { id: "drink", label: "🍹 Đồ uống" },
            { id: "place", label: "📍 Địa điểm" },
            { id: "activity", label: "✨ Trải nghiệm" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedKind(cat.id)}
              className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
                selectedKind === cat.id ? "bg-[#201A1D] text-white font-bold" : "bg-white text-stone-600 border border-[#F2EAE5]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-stone-400 mr-1 flex items-center gap-1">
            <Coins className="w-3 h-3" /> Chi tiêu:
          </span>
          <button
            onClick={() => setSelectedPrice("all")}
            className={`px-2.5 py-1 rounded-full font-medium shrink-0 ${
              selectedPrice === "all" ? "bg-[#7C4DFF] text-white font-bold" : "bg-white text-stone-600 border border-[#F2EAE5]"
            }`}
          >
            Tất cả mức giá
          </button>
          {priceConfigs.map((cfg) => {
            const level = cfg.level;
            return (
              <button
                key={level}
                onClick={() => setSelectedPrice(String(level))}
                className={`px-2.5 py-1 rounded-full font-medium shrink-0 ${
                  selectedPrice === String(level) ? "bg-[#7C4DFF] text-white font-bold" : "bg-white text-stone-600 border border-[#F2EAE5]"
                }`}
              >
                Mức {level}: {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
          Danh sách ({filteredItems.length} gợi ý)
        </div>

        {filteredItems.length === 0 ? (
          <Card className="p-8 text-center bg-white border-[#F2EAE5] rounded-2xl">
            <p className="text-xs text-stone-500">Không tìm thấy gợi ý nào phù hợp.</p>
          </Card>
        ) : (
          <div className="grid gap-2">
            {filteredItems.map((item) => {
              const priceOpt = priceFilterOptions.find((p) => p.value === item.price_level);
              return (
                <Card
                  key={item.id}
                  className={`p-3 bg-white border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.is_active ? "border-[#F2EAE5]" : "border-stone-200 opacity-60 bg-stone-50"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Thumbnail ảnh nếu có */}
                    {item.image_url ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-[#F2EAE5]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 text-stone-400">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#201A1D]">{item.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-stone-100 text-stone-600">
                          {item.kind === "food" ? "Đồ ăn" : item.kind === "drink" ? "Đồ uống" : item.kind === "place" ? "Địa điểm" : "Trải nghiệm"}
                        </span>
                        {priceOpt && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#FFF2EB] text-[#7C4DFF]">
                            Mức {item.price_level}: {priceOpt.label} ({priceOpt.rangeText})
                          </span>
                        )}
                        {item.map_url && (
                          <a
                            href={formatGoogleMapsUrl(item.map_url) || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#E8F8F2] text-[#1B9B68] hover:underline"
                            title="Mở Google Maps"
                          >
                            <MapPin className="w-2.5 h-2.5" /> Có vị trí GG Map
                          </a>
                        )}
                        {!item.is_active && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-stone-200 text-stone-600">
                            Đã ẩn
                          </span>
                        )}
                      </div>
                      {item.description && <p className="text-xs text-stone-600 line-clamp-1">{item.description}</p>}
                      {item.tip && <p className="text-[11px] text-[#7C4DFF] italic line-clamp-1">💡 {item.tip}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <Button variant="ghost" size="sm" onClick={() => handleToggle(item)} className="h-8 w-8 p-0 rounded-xl">
                      {item.is_active ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-stone-400" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="h-8 w-8 p-0 rounded-xl text-blue-600">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id, item.title)} className="h-8 w-8 p-0 rounded-xl text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <DiscoverItemModal
          item={editingItem}
          priceConfigs={priceConfigs}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(savedItem, isNew) => {
            setIsModalOpen(false);
            if (isNew) {
              setItems((prev) => [savedItem, ...prev]);
              showNotify("success", "Đã thêm gợi ý mới!");
            } else {
              setItems((prev) => prev.map((i) => (i.id === savedItem.id ? savedItem : i)));
              showNotify("success", "Đã cập nhật!");
            }
          }}
        />
      )}
    </div>
  );
}
