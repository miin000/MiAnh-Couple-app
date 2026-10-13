import { PageHeader } from "@/components/shared/page-header";
import { Utensils, Wine, MapPin, Sparkles, ChevronRight } from "lucide-react";

const CATEGORIES = [
  {
    id: "food",
    title: "Đồ ăn",
    subtitle: "Món ngon cho hai đứa",
    icon: Utensils,
    bgColor: "bg-[#FFF2EB]",
    iconColor: "text-[#D96B27]",
  },
  {
    id: "drink",
    title: "Đồ uống",
    subtitle: "Một ly thật chill",
    icon: Wine,
    bgColor: "bg-[#F5EDFC]",
    iconColor: "text-[#8A45B8]",
  },
  {
    id: "place",
    title: "Địa điểm",
    subtitle: "Cùng nhau đi trốn",
    icon: MapPin,
    bgColor: "bg-[#E8F8F2]",
    iconColor: "text-[#1B9B68]",
  },
  {
    id: "activity",
    title: "Trải nghiệm mới",
    subtitle: "Thử điều chưa từng",
    icon: Sparkles,
    bgColor: "bg-[#FFF8E2]",
    iconColor: "text-[#B88812]",
  },
];

export default function DiscoverPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        category="ĐỂ VŨ TRỤ CHỌN GIÚP"
        title="Hai đứa đang phân vân điều gì?"
        subtitle="Chọn một chủ đề, tụi mình sẽ đưa ra một gợi ý thật vui."
        showDefaultMenu
      />

      {/* 2x2 Category Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              className={`rounded-3xl p-4.5 ${cat.bgColor} border border-black/[0.03] flex flex-col justify-between min-h-[148px] shadow-2xs cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all`}
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
            </div>
          );
        })}
      </div>

      <div className="pt-2 text-center text-xs text-[#9E9096] flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#FA5271]" />
        <span>Một chút ngẫu nhiên, thêm nhiều niềm vui.</span>
      </div>
    </div>
  );
}
