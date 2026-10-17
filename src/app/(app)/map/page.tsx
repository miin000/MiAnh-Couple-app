import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentCouple } from "@/features/couple/queries";
import { MapView } from "@/features/map/components/map-view";

export default async function MapPage() {
  const couple = await getCurrentCouple();
  if (!couple) redirect("/pair");
  const me = couple.members.find((member) => member.is_me) || couple.members[0];
  return (
    <div className="space-y-3">
      <PageHeader category="KẾT NỐI RIÊNG TƯ" title="Bản đồ của hai đứa" subtitle="Chỉ chia sẻ vị trí khi bạn chủ động bật." />
      <MapView coupleId={couple.couple_id} ownName={me?.display_name || "Bạn"} ownAvatarUrl={me?.avatar_url} />
    </div>
  );
}
