import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF6F2] flex justify-center p-4">
      <div className="w-full max-w-md flex flex-col justify-between py-6">
        <div>
          <PageHeader
            title="Đăng nhập"
            subtitle="Chào mừng bạn quay lại với không gian của hai đứa."
            backHref="/"
          />

          <div className="mt-6 space-y-4 rounded-3xl bg-white border border-[#EFE5E0] p-6 shadow-sm">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-[#52464D] mb-1.5"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tenban@example.com"
                disabled
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-[#52464D] mb-1.5"
              >
                Mật khẩu
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled
              />
            </div>

            <Button className="w-full mt-2" disabled>
              Đăng nhập (sẽ kích hoạt ở Phase Auth)
            </Button>
          </div>
        </div>

        <div className="text-center text-xs text-[#8E8287] pt-4">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-bold text-[#FA5271]">
            Đăng ký
          </Link>
          <div className="mt-3">
            <Link
              href="/home"
              className="text-xs font-semibold text-[#52464D] underline"
            >
              Vào xem trực tiếp giao diện →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
