"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Copy, Check, HeartHandshake, RefreshCw } from "lucide-react";
import { joinCoupleAction, generateNewInviteAction } from "@/features/couple/actions";

interface HomePairCardProps {
  inviteCode?: string | null;
}

export function HomePairCard({ inviteCode: initialCode }: HomePairCardProps) {
  const [inviteCode, setInviteCode] = React.useState<string | null>(initialCode || null);
  const [partnerCode, setPartnerCode] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showJoinInput, setShowJoinInput] = React.useState(false);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const handleGenerateCode = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await generateNewInviteAction();
      if (res.success) {
        const payload = res.data as { invite_code: string };
        setInviteCode(payload.invite_code);
      } else {
        setError(res.error || "Không thể tạo mã mời mới.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerCode.trim()) return;
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await joinCoupleAction({ code: partnerCode.trim() });
      if (res.success) {
        window.location.reload();
      } else {
        setError(res.error || "Không thể ghép đôi bằng mã này.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-3xl bg-gradient-to-br from-[#FA5271] via-[#F45B69] to-[#FF758F] text-white p-5 shadow-[0_8px_20px_rgba(250,82,113,0.25)] text-center space-y-2">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/20 mx-auto">
          <HeartHandshake className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold">Đang chờ người ấy kết nối</h3>
        <p className="text-xs text-white/90 max-w-xs mx-auto">
          Chia sẻ mã ghép đôi của bạn hoặc nhập mã của người ấy để bắt đầu tính ngày yêu nhau nhé!
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
          {error}
        </div>
      )}

      <Card className="p-4 bg-white border-[#F2EAE5] space-y-3">
        {inviteCode ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#786D73]">Mã ghép đôi của bạn</span>
              <span className="text-[11px] text-[#A66E38]">48 giờ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 py-2 px-3 bg-[#FFEBF0] rounded-xl text-center font-mono font-extrabold text-[#FA5271] text-base tracking-widest border border-[#FA5271]/20 select-all">
                {inviteCode}
              </div>
              <Button
                type="button"
                onClick={() => handleCopyCode(inviteCode)}
                variant={copied ? "secondary" : "primary"}
                className="shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-green-600 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "Đã chép" : "Sao chép"}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            onClick={handleGenerateCode}
            disabled={isSubmitting}
            variant="secondary"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Tạo mã ghép đôi mới
          </Button>
        )}

        <div className="pt-2 border-t border-[#F2EAE5]">
          {!showJoinInput ? (
            <button
              type="button"
              onClick={() => setShowJoinInput(true)}
              className="w-full py-1 text-xs font-bold text-[#FA5271] hover:underline text-center"
            >
              Bạn có mã từ người ấy? Bấm vào đây để nhập mã →
            </button>
          ) : (
            <form onSubmit={handleJoin} className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-[#52464D]">
                Nhập mã ghép đôi của người ấy (10 ký tự)
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="VD: J97XZZDGPZ"
                  maxLength={10}
                  value={partnerCode}
                  onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                  className="font-mono font-bold uppercase tracking-wider text-center"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || partnerCode.trim().length !== 10}
                  className="shrink-0"
                >
                  {isSubmitting ? "..." : "Ghép đôi"}
                </Button>
              </div>
              <button
                type="button"
                onClick={() => setShowJoinInput(false)}
                className="text-[11px] text-[#786D73] hover:underline block"
              >
                Đóng lại
              </button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
