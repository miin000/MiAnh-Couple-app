"use client";

import * as React from "react";
import { Download, Share } from "lucide-react";
import { Card } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallGuide() {
  const [installPrompt, setInstallPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = React.useState(false);
  const [isStandalone, setIsStandalone] = React.useState(false);

  React.useEffect(() => {
    const detectPlatform = window.setTimeout(() => {
      setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
      setIsStandalone(window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    }, 0);

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () => {
      window.clearTimeout(detectPlatform);
      window.removeEventListener("beforeinstallprompt", handlePrompt);
    };
  }, []);

  if (isStandalone) return null;

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Download className="w-4 h-4 text-[#7C4DFF]" />
        <h3 className="text-sm font-extrabold">Cài MiAnh lên màn hình chính</h3>
      </div>
      {installPrompt ? (
        <>
          <p className="text-xs text-[#786D73]">Mở nhanh như một ứng dụng, không cần tìm lại trong trình duyệt.</p>
          <button type="button" onClick={install} className="w-full min-h-11 rounded-xl bg-[#7C4DFF] text-white text-sm font-bold">
            Cài đặt ứng dụng
          </button>
        </>
      ) : isIos ? (
        <p className="text-xs text-[#786D73] leading-relaxed">
          Trong Safari, nhấn <Share className="inline w-3.5 h-3.5 mx-0.5 align-text-bottom" /> <strong>Chia sẻ</strong>, chọn
          <strong> Thêm vào Màn hình chính</strong>, rồi nhấn <strong>Thêm</strong>.
        </p>
      ) : (
        <p className="text-xs text-[#786D73] leading-relaxed">
          Mở menu của trình duyệt và chọn <strong>Cài đặt ứng dụng</strong> hoặc <strong>Thêm vào màn hình chính</strong>.
        </p>
      )}
    </Card>
  );
}
