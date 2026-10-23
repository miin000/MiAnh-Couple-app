import { getCurrentCouple } from "@/features/couple/queries";
import { getRandomSuggestionForHome } from "@/features/randomizer/queries";
import { getDailyQuestion } from "@/features/games/queries";
import { getUpcomingAnniversary } from "@/features/memories/queries";
import { getTodaysLesson, getLearnStats } from "@/features/vocabulary/queries";
import { getItemEmoji, formatGoogleMapsUrl } from "@/features/randomizer/components/discover-helpers";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { HomePairCard } from "@/features/couple/components/home-pair-card";
import { Sparkles, MessageCircle, BookOpen, Compass, ArrowRight, MapPin, CheckCircle2, Clock, Trophy, Layers } from "lucide-react";
import Link from "next/link";
import { getDaysTogether } from "@/lib/utils";
import { getPartnerStatuses } from "@/features/couple/status-actions";
import { PartnerStatusCard } from "@/features/couple/components/partner-status-card";

interface Member {
  user_id: string;
  display_name: string;
  avatar_url?: string | null;
}

export default async function HomePage() {
  const [coupleInfo, randomSuggestion, dailyQuestionData, lessonData, learnStats, upcomingAnniversary, partnerStatuses] = await Promise.all([
    getCurrentCouple(),
    getRandomSuggestionForHome(),
    getDailyQuestion(),
    getTodaysLesson(),
    getLearnStats(),
    getUpcomingAnniversary(),
    getPartnerStatuses(),
  ]);
  const isPaired = Boolean(coupleInfo && coupleInfo.member_count >= 2);

  const startDateStr = coupleInfo?.start_date || new Date().toISOString().split("T")[0];
  const daysTogether = getDaysTogether(startDateStr, coupleInfo?.timezone || "Asia/Ho_Chi_Minh");

  const [y, m, d] = startDateStr.split("-");
  const formattedStartDate = `${d}.${m}.${y}`;

  const members = (coupleInfo?.members || []) as Member[];
  const coupleNames = isPaired
    ? members.map((mem) => mem.display_name).join(" & ")
    : members[0]?.display_name || "Bạn";

  const suggestionEmoji = randomSuggestion ? getItemEmoji(randomSuggestion) : "✨";

  return (
    <div className="space-y-4">
      <PageHeader
        category="HÔM NAY"
        title={`Chào ${coupleNames}`}
      />

      {/* Hero Days Together Card (Only when fully paired) */}
      {isPaired ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7C4DFF] via-[#F45B69] to-[#FF758F] text-white p-6 shadow-[0_10px_25px_rgba(250,82,113,0.35)]">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-lg pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-white/80" />
              Ngày bên nhau
            </p>
            <div className="text-5xl font-extrabold tracking-tight my-2 font-mono">
              {(daysTogether ?? 0).toLocaleString("vi-VN")}
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
      {isPaired && <PartnerStatusCard statusesForCouple={partnerStatuses} />}

      {isPaired && upcomingAnniversary && (
        <Card className="border-[#E5D8FF] bg-[#F5F0FF] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6840B8]">
            NGÀY ĐẶC BIỆT SẮP TỚI
          </p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#201A1D]">{upcomingAnniversary.title}</h3>
              <p className="mt-0.5 text-xs text-[#786D73]">
                {upcomingAnniversary.days_left === 0 ? "Hôm nay rồi!" : `Còn ${upcomingAnniversary.days_left} ngày`}
              </p>
            </div>
            <Link href="/our-space" className="text-xs font-bold text-[#7C4DFF]">Xem chi tiết →</Link>
          </div>
        </Card>
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
              className="text-[11px] font-semibold text-[#7C4DFF] flex items-center gap-0.5 hover:underline"
            >
              Quay thêm <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <Card className="p-4 hover:border-[#7C4DFF]/40 transition-colors bg-white">
            <div className="flex items-start gap-3">
              {randomSuggestion.image_url ? (
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-[#F2EAE5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={randomSuggestion.image_url}
                    alt={randomSuggestion.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] text-2xl flex items-center justify-center shrink-0">
                  {suggestionEmoji}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase text-[#D96B27] bg-[#FFF2EB] px-2 py-0.5 rounded-full">
                    {randomSuggestion.kind === "food"
                      ? "Đồ ăn"
                      : randomSuggestion.kind === "drink"
                      ? "Đồ uống"
                      : randomSuggestion.kind === "place"
                      ? "Địa điểm"
                      : "Trải nghiệm"}
                  </span>
                  {randomSuggestion.map_url && (
                    <a
                      href={formatGoogleMapsUrl(randomSuggestion.map_url) || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1A73E8] bg-[#E8F0FE] px-2 py-0.5 rounded-full hover:underline"
                    >
                      <MapPin className="w-2.5 h-2.5 text-[#EA4335]" /> GG Maps
                    </a>
                  )}
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
                  className="text-xs font-semibold text-[#7C4DFF] mt-2 inline-flex items-center gap-1"
                >
                  <Compass className="w-3.5 h-3.5" /> Khám phá & Lên lịch hẹn →
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Daily Question */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E9096]">
            CÂU HỎI HÔM NAY
          </p>
          {dailyQuestionData ? (
            dailyQuestionData.status === "completed" ? (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Đã xem kết quả
              </span>
            ) : dailyQuestionData.status === "waiting_partner" ? (
              <span className="text-[10px] font-semibold text-[#B88812] bg-[#FFF8E2] px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> Chờ đối phương
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-[#7C4DFF] bg-[#F0E9FF] px-2 py-0.5 rounded-full">
                Chưa trả lời
              </span>
            )
          ) : (
            <span className="text-[10px] font-semibold text-[#786D73] bg-[#F6EFF0] px-2 py-0.5 rounded-full">
              Chưa mở
            </span>
          )}
        </div>

        <Card className="p-4 bg-white border border-[#F2EAE5] shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F0E9FF] text-[#7C4DFF] flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              {dailyQuestionData ? (
                <>
                  <h4 className="text-sm font-bold text-[#201A1D] leading-snug line-clamp-2">
                    {dailyQuestionData.question.text}
                  </h4>
                  <p className="text-xs text-[#786D73] mt-1 line-clamp-2">
                    {dailyQuestionData.status === "completed"
                      ? "Cả hai đã hoàn thành câu hỏi hôm nay. Cùng xem điều người ấy viết nhé!"
                      : dailyQuestionData.status === "waiting_partner"
                      ? `Bạn đã gửi câu trả lời. Đang chờ ${
                          dailyQuestionData.partnerProfile?.display_name || "người ấy"
                        } hoàn thành.`
                      : "Trả lời câu hỏi bí mật để mở khóa câu trả lời của người ấy."}
                  </p>
                  <Link
                    href="/play"
                    className="text-xs font-semibold text-[#7C4DFF] mt-2 inline-flex items-center gap-1"
                  >
                    {dailyQuestionData.status === "completed"
                      ? "Xem đáp án của nhau →"
                      : dailyQuestionData.status === "waiting_partner"
                      ? "Xem trạng thái →"
                      : "Trả lời ngay →"}
                  </Link>
                </>
              ) : (
                <>
                  <h4 className="text-sm font-bold text-[#201A1D] leading-snug">
                    Câu hỏi kết nối mỗi ngày
                  </h4>
                  <p className="text-xs text-[#786D73] mt-1">
                    Hãy ghép đôi cùng người ấy để cùng nhau trả lời câu hỏi và mở khóa đáp án bí mật mỗi ngày.
                  </p>
                  <Link
                    href="/play"
                    className="text-xs font-semibold text-[#7C4DFF] mt-2 inline-flex items-center gap-1"
                  >
                    Đến trang Chơi →
                  </Link>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Daily English / Learn Preview */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E9096]">
            TIẾN ĐỘ HỌC HÔM NAY
          </p>
          {learnStats ? (
            <span className="text-[10px] font-bold text-[#7C4DFF] bg-[#F0E9FF] px-2 py-0.5 rounded-full">
              {learnStats.myStats.totalLearned} từ • {learnStats.myStats.masteredCount} nhớ tốt
            </span>
          ) : lessonData ? (
            <span className="text-[10px] font-bold text-[#7C4DFF] bg-[#F0E9FF] px-2 py-0.5 rounded-full">
              {lessonData.myProgress.learned_count}/10 từ đã học
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-[#786D73] bg-[#F6EFF0] px-2 py-0.5 rounded-full">
              Học đôi
            </span>
          )}
        </div>
        <Card className="p-4 bg-white border border-[#EFE5E0] shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F0FF] text-[#7C4DFF] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              {lessonData ? (
                <>
                  <h4 className="text-sm font-bold text-[#201A1D]">
                    10 từ vựng & Quiz hôm nay
                  </h4>
                  <div className="text-xs text-[#786D73] mt-1 space-y-1">
                    <p>
                      {lessonData.myProgress.learned_count >= 10
                        ? "Tuyệt vời! Bạn đã hoàn thành 10 từ hôm nay."
                        : `Bạn đã học ${lessonData.myProgress.learned_count}/10 từ bài hôm nay.`}
                    </p>

                    {/* Điểm quiz gần nhất */}
                    {learnStats?.myStats.latestQuiz && (
                      <p className="text-[11px] font-medium text-[#201A1D] flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span>
                          Quiz gần nhất: <strong>{learnStats.myStats.latestQuiz.correct}/{learnStats.myStats.latestQuiz.total}</strong>
                        </span>
                        {learnStats.partnerStats?.latestQuiz && (
                          <span className="text-[#786D73]">
                            • {learnStats.partnerStats.displayName}: <strong>{learnStats.partnerStats.latestQuiz.correct}/{learnStats.partnerStats.latestQuiz.total}</strong>
                          </span>
                        )}
                      </p>
                    )}

                    {/* Nhắc ôn tập nếu có từ đến hạn */}
                    {learnStats && learnStats.myStats.dueReviewsCount > 0 && (
                      <p className="text-[11px] font-bold text-[#7C4DFF] flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Có {learnStats.myStats.dueReviewsCount} từ cần ôn tập cách quãng hôm nay!</span>
                      </p>
                    )}
                  </div>
                  <Link
                    href="/learn"
                    className="text-xs font-semibold text-[#7C4DFF] mt-2.5 inline-flex items-center gap-1"
                  >
                    Vào học & làm quiz <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              ) : (
                <>
                  <h4 className="text-sm font-bold text-[#201A1D]">
                    Học 10 từ tiếng Anh mỗi ngày
                  </h4>
                  <p className="text-xs text-[#786D73] mt-1">
                    Cùng nhau học từ mới qua thẻ lật thông minh và theo dõi sự tiến bộ của nhau.
                  </p>
                  <Link
                    href="/learn"
                    className="text-xs font-semibold text-[#7C4DFF] mt-2 inline-flex items-center gap-1"
                  >
                    Khám phá góc học →
                  </Link>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
