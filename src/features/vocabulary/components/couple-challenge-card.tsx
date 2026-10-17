"use client";

import { useState, useTransition } from "react";
import { CoupleChallengeViewData, LessonWordItem } from "@/types/learn";
import { submitChallengeAction } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Send,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface CoupleChallengeCardProps {
  challengeData: CoupleChallengeViewData;
  words?: LessonWordItem[];
}

export function CoupleChallengeCard({
  challengeData,
  words = [],
}: CoupleChallengeCardProps) {
  const {
    challenge,
    mySubmission: initialMySub,
    partnerSubmission,
    partnerInfo,
    partnerHasSubmitted,
  } = challengeData;

  const [mySubmission, setMySubmission] = useState(initialMySub);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasMySub = !!mySubmission;
  const isUnlocked = hasMySub && (!!partnerSubmission || partnerHasSubmitted);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPending) return;

    setErrorMsg(null);
    startTransition(async () => {
      const res = await submitChallengeAction(challenge.id, content.trim());
      if (res.success) {
        setMySubmission({
          id: "temp-sub",
          challenge_id: challenge.id,
          couple_id: challenge.couple_id,
          user_id: "me",
          content: content.trim(),
          created_at: new Date().toISOString(),
          display_name: "Bạn",
        });
        setContent("");
      } else {
        setErrorMsg(res.error || "Không thể nộp bài, vui lòng thử lại");
      }
    });
  };

  const partnerName = partnerInfo?.displayName || "Người ấy";

  return (
    <div className="rounded-3xl bg-white border border-[#EFE5E0] p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFF0F3] text-[#FA5271] flex items-center justify-center">
            <Heart className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E9096] block">
              THỬ THÁCH ĐÔI HÔM NAY
            </span>
            <h4 className="text-sm font-bold text-[#201A1D]">
              Viết cho nhau cùng từ mới
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isUnlocked ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Unlock className="w-3 h-3" /> Đã mở khoá
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8E8287] bg-[#F6EFF0] px-2 py-0.5 rounded-full">
              <Lock className="w-3 h-3" /> Mở khi cả 2 nộp
            </span>
          )}
        </div>
      </div>

      {/* Đề bài thử thách */}
      <div className="p-3.5 rounded-2xl bg-[#FFF8FA] border border-[#FFEBF0] space-y-2">
        <p className="text-xs font-semibold text-[#201A1D] leading-relaxed">
          {challenge.prompt}
        </p>

        {words.length > 0 && (
          <div className="pt-1 border-t border-[#FFEBF0]">
            <span className="text-[10px] font-bold text-[#9E9096] block mb-1">
              Gợi ý từ mới bài hôm nay:
            </span>
            <div className="flex flex-wrap gap-1">
              {words.slice(0, 6).map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => !hasMySub && setContent((prev) => `${prev} ${w.word} `)}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white text-[#FA5271] border border-[#FFEBF0] hover:bg-[#FFEBF0] transition-colors"
                >
                  +{w.word}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Khi user chưa nộp: Form nhập câu trả lời */}
      {!hasMySub ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập câu trả lời hoặc đoạn văn của bạn ở đây (tối đa 2000 ký tự)..."
              rows={4}
              maxLength={2000}
              className="w-full rounded-2xl border border-[#EFE5E0] p-3.5 text-xs text-[#201A1D] placeholder:text-[#9E9096] focus:outline-none focus:ring-2 focus:ring-[#FA5271]/20 focus:border-[#FA5271] resize-none"
            />
            <div className="flex items-center justify-between text-[10px] text-[#9E9096] px-1">
              <span>Chia sẻ suy nghĩ chân thật cùng người ấy</span>
              <span>{content.length}/2000</span>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-500 font-medium px-1">{errorMsg}</p>
          )}

          <Button
            type="submit"
            disabled={!content.trim() || isPending}
            className="w-full h-11 rounded-2xl font-bold text-xs bg-[#FA5271] text-white hover:bg-[#e04563] shadow-sm gap-1.5 transition-all"
          >
            <Send className="w-4 h-4" />
            {isPending ? "Đang gửi bài..." : "Gửi câu trả lời của tôi"}
          </Button>
        </form>
      ) : (
        /* Khi user đã nộp: Hiển thị bài viết của cả 2 */
        <div className="space-y-3">
          {/* Bài của tôi */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#EFE5E0] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#201A1D] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Bài của bạn
              </span>
              <span className="text-[10px] text-[#9E9096]">Đã nộp</span>
            </div>
            <p className="text-xs text-[#362B30] leading-relaxed whitespace-pre-wrap">
              {mySubmission.content}
            </p>
          </div>

          {/* Bài của partner */}
          {partnerSubmission ? (
            <div className="p-3.5 rounded-2xl bg-[#FFF8FA] border border-[#FFEBF0] space-y-1.5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#FA5271] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Bài của {partnerName}
                </span>
                <span className="text-[10px] text-[#9E9096]">Hoàn thành</span>
              </div>
              <p className="text-xs text-[#201A1D] leading-relaxed whitespace-pre-wrap font-medium">
                {partnerSubmission.content}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-dashed border-[#EFE5E0] bg-[#FBF7F5] text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-white text-[#9E9096] flex items-center justify-center mx-auto shadow-2xs">
                <Lock className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-[#201A1D]">
                Đang chờ {partnerName} nộp bài
              </p>
              <p className="text-[11px] text-[#786D73] max-w-xs mx-auto leading-relaxed">
                Ngay khi {partnerName} gửi câu trả lời, cả hai bạn sẽ đọc được bài viết của nhau tại đây!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

