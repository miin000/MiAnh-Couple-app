import { getRandomItems, getDatePlans, getPriceLevelConfigs } from "@/features/randomizer/queries";
import { getCurrentCouple } from "@/features/couple/queries";
import { DiscoverView } from "@/features/randomizer/components/discover-view";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const [items, plans, coupleInfo, priceConfigs] = await Promise.all([
    getRandomItems(),
    getDatePlans(),
    getCurrentCouple(),
    getPriceLevelConfigs(),
  ]);

  const isPaired = Boolean(coupleInfo && coupleInfo.member_count >= 2);
  const initials: [string, string] = [
    coupleInfo?.members[0]?.display_name?.[0]?.toUpperCase() || "M",
    coupleInfo?.members[1]?.display_name?.[0]?.toUpperCase() || "A",
  ];

  return (
    <DiscoverView
      initialItems={items}
      plans={plans}
      priceConfigs={priceConfigs}
      isPaired={isPaired}
      coupleInitials={initials}
    />
  );
}

