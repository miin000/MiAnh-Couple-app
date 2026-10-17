"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#FAF6F2] px-6 flex items-center justify-center text-center">
      <div className="max-w-sm space-y-4">
        <h1 className="text-2xl font-extrabold">Có lỗi xảy ra</h1>
        <p className="text-sm text-[#73696E]">MiAnh chưa thể tải phần này. Bạn thử lại nhé.</p>
        <Button onClick={reset} className="w-full">Thử lại</Button>
      </div>
    </main>
  );
}
