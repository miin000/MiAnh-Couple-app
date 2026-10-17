import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#FAF8FF] px-6 flex items-center justify-center text-center">
      <div className="max-w-sm space-y-4">
        <div className="mx-auto w-16 h-16 rounded-3xl bg-[#F0E9FF] text-[#7C4DFF] flex items-center justify-center">
          <WifiOff className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold">Không có kết nối</h1>
        <p className="text-sm text-[#73696E] leading-relaxed">
          MiAnh cần mạng để tải dữ liệu riêng của hai bạn. Hãy kiểm tra kết nối rồi thử lại nhé.
        </p>
        <Link href="/" className="block">
          <Button className="w-full">Thử lại</Button>
        </Link>
      </div>
    </main>
  );
}
