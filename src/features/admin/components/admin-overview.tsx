import { AdminStats, AdminTab } from "../types";
import { Card } from "@/components/ui/card";
import {
  Compass,
  Utensils,
  Wine,
  MapPin,
  Sparkles,
  Users,
  BookOpen,
  MessageCircleQuestion,
  HelpCircle,
  Flame,
} from "lucide-react";

interface AdminOverviewProps {
  stats: AdminStats;
  onNavigateTab: (tab: AdminTab) => void;
}

export function AdminOverview({ stats, onNavigateTab }: AdminOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-[#FA5271] to-[#E03A58] p-6 text-white shadow-md space-y-2">
        <div className="flex items-center gap-2 text-white/80 text-xs font-semibold uppercase">
          <Sparkles className="w-4 h-4 text-[#FFF2EB]" />
          <span>Bảng điều khiển hệ thống</span>
        </div>
        <h2 className="text-2xl font-black">Quản trị nội dung & dữ liệu</h2>
        <p className="text-xs text-white/90 max-w-xl">
          Quản lý gợi ý hẹn hò, mức chi tiêu, người dùng và từ vựng học tập.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card
          onClick={() => onNavigateTab("questions")}
          className="p-4 bg-white border-[#F2EAE5] rounded-2xl cursor-pointer hover:border-[#FA5271]/50 space-y-1 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-[#FFEBF0] text-[#FA5271] flex items-center justify-center">
            <MessageCircleQuestion className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-[#201A1D]">{stats.totalQuestions}</div>
          <div className="text-xs text-[#786D73]">Câu hỏi & Trò chơi</div>
        </Card>

        <Card
          onClick={() => onNavigateTab("vocabulary")}
          className="p-4 bg-white border-[#F2EAE5] rounded-2xl cursor-pointer hover:border-[#FA5271]/50 space-y-1 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-[#E8F8F2] text-[#1B9B68] flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-[#201A1D]">{stats.totalWords}</div>
          <div className="text-xs text-[#786D73]">Từ vựng học tập</div>
        </Card>

        <Card
          onClick={() => onNavigateTab("discover")}
          className="p-4 bg-white border-[#F2EAE5] rounded-2xl cursor-pointer hover:border-[#FA5271]/50 space-y-1 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-[#FFF2EB] text-[#FA5271] flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-[#201A1D]">{stats.totalItems}</div>
          <div className="text-xs text-[#786D73]">Gợi ý Khám phá</div>
        </Card>

        <Card
          onClick={() => onNavigateTab("users")}
          className="p-4 bg-white border-[#F2EAE5] rounded-2xl cursor-pointer hover:border-[#FA5271]/50 space-y-1 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-[#EDF3FC] text-[#2F6BE6] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-[#201A1D]">{stats.totalUsers}</div>
          <div className="text-xs text-[#786D73]">Người dùng ({stats.adminCount} Admin)</div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Questions Breakdown */}
        <Card className="p-5 bg-white border-[#F2EAE5] rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#201A1D] flex items-center gap-2">
              <MessageCircleQuestion className="w-4 h-4 text-[#FA5271]" />
              Phân loại Câu hỏi & Thử thách
            </h3>
            <button
              onClick={() => onNavigateTab("questions")}
              className="text-xs text-[#FA5271] font-semibold cursor-pointer hover:underline"
            >
              Quản lý
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-3 bg-[#FFEBF0] rounded-2xl flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-[#FA5271] font-semibold">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Daily</span>
              </div>
              <div className="mt-2 text-lg font-black text-[#201A1D]">{stats.dailyCount} câu</div>
            </div>
            <div className="p-3 bg-[#EDF3FC] rounded-2xl flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-[#2F6BE6] font-semibold">
                <MessageCircleQuestion className="w-3.5 h-3.5" />
                <span>Nói thật</span>
              </div>
              <div className="mt-2 text-lg font-black text-[#201A1D]">{stats.truthCount} câu</div>
            </div>
            <div className="p-3 bg-[#FFF0EB] rounded-2xl flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-[#E05322] font-semibold">
                <Flame className="w-3.5 h-3.5" />
                <span>Thử thách</span>
              </div>
              <div className="mt-2 text-lg font-black text-[#201A1D]">{stats.dareCount} câu</div>
            </div>
          </div>
        </Card>

        {/* Discover Breakdown */}
        <Card className="p-5 bg-white border-[#F2EAE5] rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#201A1D] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#FA5271]" />
              Phân loại gợi ý Khám phá
            </h3>
            <button
              onClick={() => onNavigateTab("discover")}
              className="text-xs text-[#FA5271] font-semibold cursor-pointer hover:underline"
            >
              Quản lý
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-[#FFF2EB] rounded-2xl flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#D96B27]" />
              <div><span className="font-bold text-[#201A1D]">{stats.foodCount}</span> Đồ ăn</div>
            </div>
            <div className="p-3 bg-[#F5EDFC] rounded-2xl flex items-center gap-2">
              <Wine className="w-4 h-4 text-[#8A45B8]" />
              <div><span className="font-bold text-[#201A1D]">{stats.drinkCount}</span> Đồ uống</div>
            </div>
            <div className="p-3 bg-[#E8F8F2] rounded-2xl flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1B9B68]" />
              <div><span className="font-bold text-[#201A1D]">{stats.placeCount}</span> Địa điểm</div>
            </div>
            <div className="p-3 bg-[#FFF8E2] rounded-2xl flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B88812]" />
              <div><span className="font-bold text-[#201A1D]">{stats.activityCount}</span> Trải nghiệm</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
