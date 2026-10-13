import { PageHeader } from "@/components/shared/page-header";
import { CoupleAvatars } from "@/components/shared/couple-avatars";
import { Card } from "@/components/ui/card";
import { Sparkles, MessageCircle } from "lucide-react";

export default function HomePage() {

  return (
    <div className="space-y-4">
      <PageHeader
        category="THỨ TƯ, 18 THÁNG 6"
        title="Chào buổi sáng, Minh & Anh"
        rightAction={<CoupleAvatars initials={["M", "A"]} size="md" />}
      />

      {/* Hero Days Together Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FA5271] via-[#F45B69] to-[#FF758F] text-white p-6 shadow-[0_10px_25px_rgba(250,82,113,0.35)]">
        {/* Background decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center py-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 fill-white/80" />
            Ngày bên nhau
          </p>
          <div className="text-5xl font-extrabold tracking-tight my-2 font-mono">
            1.286
          </div>
          <p className="text-xs text-white/90 font-medium">
            Kể từ ngày 10.12.2021
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold">
            <span>♥ Mỗi ngày đều đáng nhớ</span>
          </div>
        </div>
      </div>

      {/* Daily Question Preview */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E9096]">
            KẾT NỐI MỖI NGÀY
          </p>
          <span className="text-[11px] font-medium text-[#FA5271] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FA5271]" />
            Chưa trả lời
          </span>
        </div>
        <Card className="p-4 hover:border-[#FA5271]/40 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFEBF0] text-[#FA5271] flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#201A1D] leading-snug">
                Điều nhỏ bé nào gần đây khiến bạn nghĩ đến người ấy?
              </h4>
              <p className="text-xs font-semibold text-[#FA5271] mt-2 inline-flex items-center gap-1">
                Trả lời ngay →
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Daily English Preview */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E9096]">
            HỌC TIẾNG ANH HÔM NAY
          </p>
          <span className="text-[11px] font-semibold text-[#B88812] bg-[#FFF8E2] px-2 py-0.5 rounded-full">
            ⚡ 7 ngày
          </span>
        </div>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#FA5271]">
                BÀI 08
              </p>
              <h4 className="text-sm font-bold text-[#201A1D]">
                Love in little things
              </h4>
            </div>
            <span className="text-xs font-medium text-[#786D73] bg-[#F6EFF0] px-2 py-0.5 rounded-full">
              12&apos;
            </span>
          </div>

          {/* Partner progress bars */}
          <div className="space-y-2 mt-3 pt-3 border-t border-[#F2EAE5]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#FFDDD7] text-[#D84557] flex items-center justify-center text-[10px] font-bold">
                M
              </div>
              <span className="text-xs text-[#52464D] w-14 truncate">Minh</span>
              <div className="flex-1 bg-[#F2EAE5] rounded-full h-2 overflow-hidden">
                <div className="bg-[#FA5271] h-full rounded-full w-[72%]" />
              </div>
              <span className="text-xs font-bold text-[#201A1D]">72%</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#E7E2FA] text-[#6E56B8] flex items-center justify-center text-[10px] font-bold">
                A
              </div>
              <span className="text-xs text-[#52464D] w-14 truncate">Người ấy</span>
              <div className="flex-1 bg-[#F2EAE5] rounded-full h-2 overflow-hidden">
                <div className="bg-[#6E56B8] h-full rounded-full w-[48%]" />
              </div>
              <span className="text-xs font-bold text-[#201A1D]">48%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
