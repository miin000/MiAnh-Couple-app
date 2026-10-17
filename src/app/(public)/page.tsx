import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-between p-6 max-w-md mx-auto text-[#201A1D]">
      <div className="pt-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#F0E9FF] text-[#7C4DFF] shadow-sm mb-4">
          <Heart className="w-8 h-8 fill-[#7C4DFF]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">MiAnh</h1>
        <p className="text-sm text-[#7D7076] mt-2 max-w-xs mx-auto leading-relaxed">
          Không gian dành riêng cho hai người. Cùng chọn điều ngẫu nhiên, cùng trải nghiệm, cùng lưu giữ kỷ niệm.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-[#EFE5E0] p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#F0E9FF] text-[#7C4DFF] flex items-center justify-center text-sm font-bold">
            1
          </span>
          <p className="text-xs text-[#52464D] font-medium">
            Chọn ngẫu nhiên món ăn, chỗ hẹn hò, việc muốn làm.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#F0E9FF] text-[#7C4DFF] flex items-center justify-center text-sm font-bold">
            2
          </span>
          <p className="text-xs text-[#52464D] font-medium">
            Trả lời câu hỏi mỗi ngày, học 10 từ tiếng Anh cùng nhau.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#F0E9FF] text-[#7C4DFF] flex items-center justify-center text-sm font-bold">
            3
          </span>
          <p className="text-xs text-[#52464D] font-medium">
            Đếm ngày yêu, lưu giữ album kỷ niệm và danh sách ước mơ.
          </p>
        </div>
      </div>

      <div className="space-y-3 pb-6">
        <Link href="/home" className="block">
          <Button className="w-full" size="lg">
            <Sparkles className="w-4 h-4 mr-2" />
            Vào ứng dụng ngay
          </Button>
        </Link>
        <div className="flex justify-center gap-4 text-xs font-semibold text-[#8E8287]">
          <Link href="/login" className="hover:text-[#7C4DFF]">
            Đăng nhập
          </Link>
          <span>•</span>
          <Link href="/register" className="hover:text-[#7C4DFF]">
            Đăng ký tài khoản
          </Link>
        </div>
      </div>
    </div>
  );
}
