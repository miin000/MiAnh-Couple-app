import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CoupleAvatars } from "@/components/shared/couple-avatars";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card } from "@/components/ui/card";
import { Layers } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        category="CÀI ĐẶT"
        title="Bộ giao diện"
        showDefaultMenu
      />

      {/* Basic components preview (matching screenshot) */}
      <Card className="p-4 space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E9096] mb-2">
            NÚT BẤM
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" size="default">
              Primary
            </Button>
            <Button variant="secondary" size="default">
              Secondary
            </Button>
            <Button variant="ghost" size="default">
              Ghost
            </Button>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E9096] mb-2">
            CHIP & AVATAR ĐÔI
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="default">Hôm nay</Badge>
            <Badge variant="secondary">Đã lưu</Badge>
            <CoupleAvatars initials={["M", "A"]} size="sm" />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E9096] mb-2">
            Ô NHẬP
          </p>
          <Input placeholder="Tên gọi thân mật..." />
        </div>
      </Card>

      {/* Partner Progress Preview */}
      <Card className="p-4 space-y-3">
        <p className="text-sm font-bold text-[#201A1D]">
          Tiến độ của hai đứa
        </p>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#FFDDD7] text-[#D84557] flex items-center justify-center text-xs font-bold">
            M
          </div>
          <span className="text-xs text-[#52464D] w-14">Minh</span>
          <div className="flex-1 bg-[#F2EAE5] rounded-full h-2 overflow-hidden">
            <div className="bg-[#FA5271] h-full rounded-full w-[72%]" />
          </div>
          <span className="text-xs font-bold text-[#201A1D]">72%</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#E7E2FA] text-[#6E56B8] flex items-center justify-center text-xs font-bold">
            A
          </div>
          <span className="text-xs text-[#52464D] w-14">Người ấy</span>
          <div className="flex-1 bg-[#F2EAE5] rounded-full h-2 overflow-hidden">
            <div className="bg-[#6E56B8] h-full rounded-full w-[48%]" />
          </div>
          <span className="text-xs font-bold text-[#201A1D]">48%</span>
        </div>
      </Card>

      {/* System States Preview */}
      <div>
        <p className="text-sm font-bold text-[#201A1D] mb-2 px-1">
          Trạng thái hệ thống
        </p>
        <div className="grid grid-cols-3 gap-2">
          <EmptyState compact title="Trống" description="Chưa có dữ liệu" />
          <LoadingState compact title="Đang tải" description="Chờ một chút" />
          <ErrorState compact title="Có lỗi" description="Thử lại nhé" />
        </div>
      </div>

      <div>
        <Button variant="secondary" className="w-full">
          <Layers className="w-4 h-4 mr-2" />
          Mở bottom sheet
        </Button>
      </div>
    </div>
  );
}
