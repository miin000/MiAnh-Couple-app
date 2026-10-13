import { PageHeader } from "@/components/shared/page-header";
import { CoupleAvatars } from "@/components/shared/couple-avatars";
import { Plus, History, Image as ImageIcon, ListChecks } from "lucide-react";

export default function OurSpacePage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Không gian của hai đứa"
        showDefaultMenu
      />

      {/* Tabs */}
      <div className="grid grid-cols-3 p-1 rounded-2xl bg-[#ECE2DC]">
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white text-xs font-bold text-[#FA5271] shadow-2xs"
        >
          <History className="w-3.5 h-3.5" />
          Dòng thời gian
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-[#786D73]"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Album
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-[#786D73]"
        >
          <ListChecks className="w-3.5 h-3.5" />
          Bucket list
        </button>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#FA5271]">
            1.286 NGÀY BÊN NHAU
          </p>
          <h2 className="text-lg font-extrabold text-[#201A1D]">
            Chuyện của hai đứa
          </h2>
        </div>
        <CoupleAvatars initials={["M", "A"]} size="sm" />
      </div>

      {/* Timeline item */}
      <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8DCD6]">
        <div className="relative">
          <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#FA5271] ring-4 ring-[#FAF6F2]" />
          <p className="text-[11px] font-bold text-[#8E8287] mb-1.5">
            18.06.2025
          </p>
          <div className="rounded-2xl bg-white border border-[#EFE5E0] p-3 shadow-2xs">
            <h4 className="text-sm font-bold text-[#201A1D]">
              Chuyến đi biển đầu hè
            </h4>
            <p className="text-xs text-[#786D73] mt-1">
              Cùng thức dậy thật sớm để đón bình minh.
            </p>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-[#FA5271]">
              <span>♥ Minh & An</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#E0D3CD] ring-4 ring-[#FAF6F2]" />
          <p className="text-[11px] font-bold text-[#8E8287] mb-1.5">
            10.12.2024
          </p>
          <div className="rounded-2xl bg-white border border-[#EFE5E0] p-3 shadow-2xs">
            <h4 className="text-sm font-bold text-[#201A1D]">
              Kỷ niệm ba năm
            </h4>
            <p className="text-xs text-[#786D73] mt-1">
              Một bữa tối nhỏ và rất nhiều điều muốn nói.
            </p>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-[#FA5271]">
              <span>♥ Minh & An</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Add Memory Button */}
      <div className="fixed bottom-20 right-5 z-30">
        <button
          type="button"
          className="w-14 h-14 rounded-full bg-[#FA5271] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(250,82,113,0.4)] hover:bg-[#e44362] active:scale-95 transition-all"
          aria-label="Thêm kỷ niệm"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
