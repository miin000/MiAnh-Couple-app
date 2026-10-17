import { PageHeader } from "@/components/shared/page-header";
import { getDailyQuestion, getRandomQuestion } from "@/features/games/queries";
import { getCurrentCouple } from "@/features/couple/queries";
import { PlayTabsContainer } from "@/features/games/components/play-tabs-container";

export const metadata = {
  title: "Góc Chơi | Mianh",
};

export default async function PlayPage() {
  const [dailyData, couple, initialTruth] = await Promise.all([
    getDailyQuestion(),
    getCurrentCouple(),
    getRandomQuestion({ kind: "truth" }),
  ]);

  const isInCouple = !!couple && couple.member_count >= 1;

  return (
    <div className="space-y-4">
      <PageHeader
        category="GÓC CHƠI & GẮN KẾT"
        title="Trò chơi cho hai đứa mình"
        subtitle="Mỗi ngày một câu hỏi thấu hiểu, cùng những thử thách thú vị dành riêng cho hai bạn."
      />

      <PlayTabsContainer
        dailyData={dailyData}
        initialTruthOrDareQuestion={initialTruth}
        isInCouple={isInCouple}
      />
    </div>
  );
}

