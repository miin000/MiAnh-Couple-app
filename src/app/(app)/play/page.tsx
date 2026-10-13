import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export default function PlayPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        category="CÂU HỎI SỐ 128"
        title="Điều nhỏ bé nào gần đây khiến bạn nghĩ đến người ấy?"
        subtitle="Cứ viết điều đầu tiên xuất hiện trong lòng bạn."
        showDefaultMenu
      />

      <div className="pt-2">
        <label
          htmlFor="answer"
          className="block text-xs font-bold text-[#52464D] mb-2"
        >
          Câu trả lời của mình
        </label>
        <div className="relative">
          <textarea
            id="answer"
            rows={5}
            maxLength={240}
            placeholder="Mình đang nghĩ đến..."
            className="w-full rounded-2xl border border-[#E9DFDA] bg-white p-4 text-sm text-[#201A1D] placeholder:text-[#A89DA3] shadow-2xs focus:outline-none focus:border-[#FA5271] focus:ring-2 focus:ring-[#FA5271]/20 resize-none"
          />
          <span className="absolute bottom-3 right-3 text-[11px] text-[#A89DA3]">
            0/240
          </span>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <Button className="w-full" size="lg">
          <Send className="w-4 h-4 mr-2" />
          Gửi câu trả lời
        </Button>
        <button
          type="button"
          className="w-full text-center py-2 text-xs font-semibold text-[#8E8287] hover:text-[#201A1D] min-h-[44px] flex items-center justify-center"
        >
          Bỏ qua câu này
        </button>
      </div>
    </div>
  );
}
