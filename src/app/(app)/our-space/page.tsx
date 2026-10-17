import { PageHeader } from "@/components/shared/page-header";
import { getOurSpaceData } from "@/features/memories/queries";
import { OurSpaceView } from "@/features/memories/components/our-space-view";

export default async function OurSpacePage() {
  const data = await getOurSpaceData();

  return (
    <div className="space-y-4">
      <PageHeader title="Không gian của hai đứa" showDefaultMenu />
      {data ? (
        <OurSpaceView {...data} />
      ) : (
        <div className="rounded-2xl border border-[#F6D0D6] bg-white p-5 text-sm text-[#C23958]">
          Không thể tải dữ liệu Không gian của hai đứa. Vui lòng thử lại.
        </div>
      )}
    </div>
  );
}
