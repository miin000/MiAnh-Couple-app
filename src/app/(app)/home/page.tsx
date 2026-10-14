import { getCurrentCouple } from "@/features/couple/queries";
import { getRandomSuggestionForHome } from "@/features/randomizer/queries";
import { getItemEmoji } from "@/features/randomizer/components/discover-helpers";
import { PageHeader } from "@/components/shared/page-header";
import { CoupleAvatars } from "@/components/shared/couple-avatars";
import { Card } from "@/components/ui/card";
import { HomePairCard } from "@/features/couple/components/home-pair-card";
import { Sparkles, MessageCircle, BookOpen, Compass, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Member {
  user_id: string;
  display_name: string;
  avatar_url?: string | null;
}

export default async function HomePage() {
  const [coupleInfo, randomSuggestion] = await Promise.all([
    getCurrentCouple(),
    getRandomSuggestionForHome(),
  ]);
  const isPaired = Boolean(coupleInfo && coupleInfo.member_count >= 2);

  const startDateStr = coupleInfo?.start_date || new Date().toISOString().split("T")[0];
  const startDate = new Date(startDateStr);
  const today = new Date();
  const diffTime = Math.max(0, today.getTime() - startDate.getTime());
  const daysTogether = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const [y, m, d] = startDateStr.split("-");
  const formattedStartDate = `${d}.${m}.${y}`;

  const members = (coupleInfo?.members || []) as Member[];
  const coupleNames = isPaired
    ? members.map((mem) => mem.display_name).join(" & ")
    : members[0]?.display_name || "Bạn";

  const initials: [string, string] = [
    members[0]?.display_name?.[0]?.toUpperCase() || "B",
    members[1]?.display_name?.[0]?.toUpperCase() || "?",
  ];

  const suggestionEmoji = randomSuggestion ? getItemEmoji(randomSuggestion) : "✨";

  return (
    <div className="space-y-4">
      <PageHeader
        category="HÔM NAY"
        title={`Chào ${coupleNames}`}
        rightAction={<CoupleAvatars initials={initials} size="md" />}
      />

      {/* Hero Days Together Card (Only when fully paired) */}
      {isPaired ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FA5271] via-[#F45B69] to-[#FF758F] text-white p-6 shadow-[0_10px_25px_rgba(250,82,113,0.35)]">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-lg pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-white/80" />
              Ngày bên nhau
            </p>
            <div className="text-5xl font-extrabold tracking-tight my-2 font-mono">
              {daysTogether.toLocaleString("vi-VN")}
            </div>
            <p className="text-xs text-white/90 font-medium">
              Kể từ ngày {formattedStartDate}
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold">
              <span>♥ Mỗi ngày đều đáng nhớ</span>
            </div>
          </div>
        </div>
      ) : (
        <HomePairCard inviteCode={coupleInfo?.active_invite?.code} />
      )}

      {/* Gợi ý hoạt động ngẫu nhiên hôm nay */}
      {randomSuggestion && (
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E9096]">
              GỢI Ý HẸN HÒ HÔM NAY
            </p>
            <Link
              href="/discover"
              className="text-[11px] font-semibold text-[#FA5271] flex items-center gap-0.5 hover:underline"
            >
              Quay thêm <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <Card className="p-4 hover:border-[#FA5271]/40 transition-colors bg-white">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] text-2xl flex items-center justify-center shrink-0">
                {suggestionEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-[#D96B27] bg-[#FFF2EB] px-2 py-0.5 rounded-full">
                    {randomSuggestion.kind === "food"
                      ? "Đồ ăn"
                      : randomSuggestion.kind === "drink"
                      ? "Đồ uống"
                      : randomSuggestion.kind === "place"
                      ? "Địa điểm"
                      : "Trải nghiệm"}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#201A1D] mt-1 leading-snug">
                  {randomSuggestion.title}
                </h4>
                {randomSuggestion.description && (
                  <p className="text-xs text-[#786D73] mt-0.5 line-clamp-2">
                    {randomSuggestion.description}
                  </p>
                )}
                <Link
                  href="/discover"
                  className="text-xs font-semibold text-[#FA5271] mt-2 inline-flex items-center gap-1"
                >
                  <Compass className="w-3.5 h-3.5" /> Khám phá & Lên lịch hẹn →
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Daily Question Preview - Placeholder "Sắp có" */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E9096]">
            CÂU HỎI HÔM NAY
          </p>
          <span className="text-[10px] font-semibold text-[#786D73] bg-[#F6EFF0] px-2 py-0.5 rounded-full">
            Sắp có
          </span>
        </div>
        <Card className="p-4 bg-white/70 border border-[#F2EAE5]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFEBF0] text-[#FA5271] flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#201A1D] leading-snug">
                Câu hỏi kết nối mỗi ngày
              </h4>
              <p className="text-xs text-[#786D73] mt-1">
                Trả lời câu hỏi bí mật và mở khóa đáp án của người ấy khi cả hai cùng hoàn thành.
              </p>
              <span className="text-xs font-semibold text-[#9E9096] mt-2 inline-flex items-center gap-1">
                Tính năng sẽ ra mắt ở Phase 3
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Daily English / Learn Preview - Placeholder "Sắp có" */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E9096]">
            TIẾN ĐỘ HỌC
          </p>
          <span className="text-[10px] font-semibold text-[#786D73] bg-[#F6EFF0] px-2 py-0.5 rounded-full">
            Sắp có
          </span>
        </div>
        <Card className="p-4 bg-white/70 border border-[#F2EAE5]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF8E2] text-[#B88812] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#201A1D]">
                Học 10 từ tiếng Anh mỗi ngày
              </h4>
              <p className="text-xs text-[#786D73] mt-1">
                Cùng nhau học từ mới, làm quiz cá nhân và thử thách ghép đôi thú vị.
              </p>
              <span className="text-xs font-semibold text-[#9E9096] mt-2 inline-flex items-center gap-1">
                Tính năng sẽ ra mắt ở Phase 4 & 5
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
