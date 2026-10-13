import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Volume2, RotateCcw, Check, BookOpen, CheckSquare } from "lucide-react";

export default function LearnPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Học cùng nhau"
        showDefaultMenu
      />

      {/* Segmented Control / Tabs */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#ECE2DC]">
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white text-xs font-bold text-[#FA5271] shadow-2xs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Thẻ từ
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-[#786D73]"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Quiz
        </button>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5 px-0.5">
          <span className="text-[#8E8287] font-medium">Tiến độ hôm nay</span>
          <span className="font-bold text-[#FA5271]">3/10</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#EFE5E0] overflow-hidden">
          <div className="h-full bg-[#FA5271] rounded-full w-[30%]" />
        </div>
      </div>

      {/* Vocabulary Flashcard */}
      <div className="rounded-3xl bg-white border border-[#EFE5E0] shadow-sm p-6 text-center flex flex-col items-center justify-center min-h-[260px]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#FA5271] bg-[#FFEBF0] px-3 py-1 rounded-full mb-4">
          TỪ MỚI HÔM NAY
        </span>

        <h2 className="text-3xl font-extrabold text-[#201A1D] tracking-tight">
          Improve
        </h2>
        <p className="text-sm font-medium text-[#786D73] mt-1 font-mono">
          /ɪmˈpruːv/
        </p>

        <button
          type="button"
          className="w-12 h-12 rounded-full bg-[#FA5271] text-white flex items-center justify-center my-5 shadow-[0_4px_12px_rgba(250,82,113,0.35)] active:scale-95 transition-all"
          aria-label="Phát âm"
        >
          <Volume2 className="w-5 h-5 fill-white" />
        </button>

        <p className="text-[11px] text-[#A89DA3] flex items-center gap-1">
          <RotateCcw className="w-3 h-3" />
          Chạm để xem nghĩa
        </p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" className="w-full">
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Chưa chắc
        </Button>
        <Button variant="primary" className="w-full">
          <Check className="w-4 h-4 mr-1.5" />
          Đã nhớ
        </Button>
      </div>
    </div>
  );
}
