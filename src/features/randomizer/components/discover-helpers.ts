import { DiscoverKind, RandomItem, PriceLevelConfig } from "@/types/discover";
import { Utensils, Wine, MapPin, Sparkles } from "lucide-react";

export interface CategoryItem {
  id: DiscoverKind;
  title: string;
  subtitle: string;
  question: string;
  icon: typeof Utensils;
  bgColor: string;
  iconColor: string;
}

export const CATEGORY_ITEMS: CategoryItem[] = [
  {
    id: "food",
    title: "Đồ ăn",
    subtitle: "Món ngon cho hai đứa",
    question: "Hôm nay ăn gì?",
    icon: Utensils,
    bgColor: "bg-[#FFF2EB]",
    iconColor: "text-[#D96B27]",
  },
  {
    id: "drink",
    title: "Đồ uống",
    subtitle: "Một ly thật chill",
    question: "Hôm nay uống gì?",
    icon: Wine,
    bgColor: "bg-[#F5EDFC]",
    iconColor: "text-[#8A45B8]",
  },
  {
    id: "place",
    title: "Địa điểm",
    subtitle: "Cùng nhau đi trốn",
    question: "Hôm nay đi đâu?",
    icon: MapPin,
    bgColor: "bg-[#E8F8F2]",
    iconColor: "text-[#1B9B68]",
  },
  {
    id: "activity",
    title: "Trải nghiệm mới",
    subtitle: "Thử điều chưa từng",
    question: "Hôm nay thử gì?",
    icon: Sparkles,
    bgColor: "bg-[#FFF8E2]",
    iconColor: "text-[#B88812]",
  },
];

export function getItemEmoji(item: RandomItem): string {
  const t = item.title.toLowerCase();
  if (t.includes("phở") || t.includes("bún") || t.includes("mì") || t.includes("hủ tiếu") || t.includes("bánh canh")) return "🍜";
  if (t.includes("lẩu")) return "🍲";
  if (t.includes("pizza")) return "🍕";
  if (t.includes("sushi") || t.includes("sashimi")) return "🍣";
  if (t.includes("nướng") || t.includes("steak") || t.includes("bò")) return "🥩";
  if (t.includes("cơm") || t.includes("xôi")) return "🍱";
  if (t.includes("bánh mì") || t.includes("burger")) return "🍔";
  if (t.includes("gà rán") || t.includes("nem")) return "🍗";
  if (t.includes("ốc") || t.includes("hải sản")) return "🦐";
  if (t.includes("dimsum") || t.includes("bánh cuốn")) return "🥟";
  if (t.includes("cháo")) return "🥣";
  if (t.includes("cà phê") || t.includes("bạc xỉu")) return "☕";
  if (t.includes("trà sữa")) return "🧋";
  if (t.includes("trà")) return "🍵";
  if (t.includes("sinh tố") || t.includes("nước ép") || t.includes("nước mía")) return "🥤";
  if (t.includes("cocktail") || t.includes("rượu")) return "🍷";
  if (t.includes("cacao")) return "☕";
  if (t.includes("dừa")) return "🥥";
  if (t.includes("sữa chua")) return "🍨";
  if (t.includes("sách")) return "📚";
  if (t.includes("công viên") || t.includes("hồ") || t.includes("vườn")) return "🌳";
  if (t.includes("rạp") || t.includes("phim")) return "🎬";
  if (t.includes("bảo tàng") || t.includes("triển lãm")) return "🏛️";
  if (t.includes("gốm") || t.includes("tô tượng")) return "🏺";
  if (t.includes("chợ")) return "🏮";
  if (t.includes("thủy cung")) return "🐠";
  if (t.includes("bowling") || t.includes("board game") || t.includes("gắp thú")) return "🎳";
  if (t.includes("trượt băng")) return "⛸️";
  if (t.includes("tàu điện") || t.includes("xe buýt") || t.includes("xe đạp")) return "🚲";
  if (t.includes("cầu")) return "🌉";
  if (t.includes("nấu") || t.includes("bánh quy")) return "🍳";
  if (t.includes("ảnh") || t.includes("film")) return "📸";
  if (t.includes("thư")) return "💌";
  if (t.includes("lego") || t.includes("puzzle") || t.includes("sao giấy")) return "🧩";
  if (t.includes("sao")) return "✨";
  if (t.includes("nhảy") || t.includes("playlist") || t.includes("nhạc")) return "🎵";
  if (t.includes("spa") || t.includes("mặt nạ")) return "💆";
  if (t.includes("nến")) return "🕯️";

  const fallback: Record<DiscoverKind, string> = {
    food: "🍲",
    drink: "🧋",
    place: "🏞️",
    activity: "✨",
  };
  return fallback[item.kind] || "✨";
}

export interface PriceFilterOption {
  value: number | "all";
  label: string;
  badge: string;
  rangeText: string;
}

export const DEFAULT_PRICE_LEVEL_CONFIGS: PriceLevelConfig[] = [
  {
    level: 1,
    label: "Tiết kiệm",
    badge: "₫ (Dưới 100k)",
    rangeText: "Dưới 100.000₫",
    minCost: 0,
    maxCost: 100000,
    description: "Ăn vặt, trà đá, bánh mì vỉa hè, dạo công viên tự do.",
  },
  {
    level: 2,
    label: "Vừa phải",
    badge: "₫₫ (100k - 300k)",
    rangeText: "100.000₫ - 300.000₫",
    minCost: 100000,
    maxCost: 300000,
    description: "Cơm tấm, phở ngon, cà phê máy lạnh, trà sữa đôi.",
  },
  {
    level: 3,
    label: "Tương đối",
    badge: "₫₫₫ (300k - 600k)",
    rangeText: "300.000₫ - 600.000₫",
    minCost: 300000,
    maxCost: 600000,
    description: "Lẩu nướng, BBQ, cafe rooftop, bảo tàng nghệ thuật.",
  },
  {
    level: 4,
    label: "Sang xịn",
    badge: "₫₫₫₫ (Trên 600k)",
    rangeText: "Trên 600.000₫",
    minCost: 600000,
    maxCost: null,
    description: "Fine dining lãng mạn, resort, workshop nến/gốm cao cấp.",
  },
];

export function buildPriceFilterOptions(configs?: PriceLevelConfig[] | null): PriceFilterOption[] {
  const source = configs && configs.length === 4 ? configs : DEFAULT_PRICE_LEVEL_CONFIGS;
  return [
    { value: "all", label: "Tất cả mức giá", badge: "Tất cả", rangeText: "Mọi ngân sách" },
    ...source.map((c) => ({
      value: c.level,
      label: c.label,
      badge: c.badge,
      rangeText: c.rangeText,
    })),
  ];
}

export const PRICE_FILTER_OPTIONS: PriceFilterOption[] = buildPriceFilterOptions();

export function getPriceLevelText(level: number | null, configs?: PriceLevelConfig[] | null): string {
  if (!level) return "Bình dân";
  const source = configs && configs.length === 4 ? configs : DEFAULT_PRICE_LEVEL_CONFIGS;
  const found = source.find((c) => c.level === level);
  if (found) {
    return `${found.label} (${found.rangeText})`;
  }
  return "Bình dân";
}

/**
 * Định dạng URL Google Maps chuẩn từ URL nhập hoặc địa chỉ
 */
export function formatGoogleMapsUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}



