import { PageHeader } from "@/components/shared/page-header";
import {
  getTodaysLesson,
  getDueReviewWords,
  getCoupleChallenge,
  getLearnStats,
} from "@/features/vocabulary/queries";
import { getCurrentCouple } from "@/features/couple/queries";
import { LearnScreen } from "@/features/vocabulary/components/learn-screen";
import { BookOpen, Sparkles, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Học cùng nhau | Mianh",
};

export default async function LearnPage() {
  const [lessonData, couple, dueWords, challengeData, stats] = await Promise.all([
    getTodaysLesson(),
    getCurrentCouple(),
    getDueReviewWords(),
    getCoupleChallenge(),
    getLearnStats(),
  ]);

  const isPaired = !!couple && couple.member_count === 2;

  return (
    <div className="space-y-4">
      <PageHeader
        category="HỌC TIẾNG ANH ĐÔI"
        title="Học cùng nhau"
        subtitle="10 từ vựng mỗi ngày, quiz tương tác, ôn cách quãng và thử thách đôi."
        showDefaultMenu
      />

      {!isPaired ? (
        <div className="rounded-3xl bg-white border border-[#EFE5E0] p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFEBF0] text-[#FA5271] flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#201A1D]">
              Ghép đôi để cùng học mỗi ngày
            </h3>
            <p className="text-xs text-[#786D73] max-w-xs mx-auto leading-relaxed">
              Khi hai bạn đã kết nối, cả hai sẽ cùng học chung bộ 10 từ mỗi ngày, cùng làm thử thách đôi và theo dõi tiến độ của nhau.
            </p>
          </div>
          <Button asChild className="rounded-xl text-xs font-bold gap-1.5 bg-[#FA5271] text-white">
            <Link href="/settings">
              <UserPlus className="w-4 h-4" />
              Kết nối ngay
            </Link>
          </Button>
        </div>
      ) : !lessonData || lessonData.words.length === 0 ? (
        <div className="rounded-3xl bg-white border border-[#EFE5E0] p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F6EFF0] text-[#786D73] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#201A1D]">Chưa có bài học hôm nay</h3>
          <p className="text-xs text-[#786D73]">
            Bài học hôm nay đang được chuẩn bị. Bạn vui lòng quay lại sau nhé!
          </p>
        </div>
      ) : (
        <LearnScreen
          initialData={lessonData}
          dueWords={dueWords}
          challengeData={challengeData}
          stats={stats}
        />
      )}
    </div>
  );
}


