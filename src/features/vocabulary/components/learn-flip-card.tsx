"use client";

import { useState } from "react";
import { LessonWordItem, PartOfSpeech } from "@/types/learn";
import { Volume2, RefreshCw, Sparkles } from "lucide-react";

interface LearnFlipCardProps {
  word: LessonWordItem;
  flipped: boolean;
  onToggleFlip: () => void;
  onPlayAudio?: () => void;
}

const POS_MAP: Record<PartOfSpeech, string> = {
  verb: "Động từ",
  noun: "Danh từ",
  adjective: "Tính từ",
  adverb: "Trạng từ",
  preposition: "Giới từ",
  conjunction: "Liên từ",
  pronoun: "Đại từ",
  interjection: "Thán từ",
  phrase: "Cụm từ",
  other: "Từ vựng",
};

export function LearnFlipCard({
  word,
  flipped,
  onToggleFlip,
  onPlayAudio,
}: LearnFlipCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayAudio) onPlayAudio();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word.word);
      u.lang = "en-US";
      u.rate = 0.85;
      setIsPlaying(true);
      u.onend = () => setIsPlaying(false);
      u.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div
      onClick={onToggleFlip}
      role="button"
      tabIndex={0}
      aria-label={flipped ? "Lật về mặt trước" : "Lật xem nghĩa"}
      className="w-full cursor-pointer select-none focus:outline-hidden [perspective:1000px]"
    >
      <div className="relative w-full min-h-[350px] [transform-style:preserve-3d]">
        {/* Front face (English word & audio) */}
        <div
          style={{
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          className={`absolute inset-0 w-full h-full rounded-3xl bg-white border border-[#EFE5E0] shadow-xs p-6 flex flex-col items-center justify-between text-center transition-all duration-500 ease-in-out ${
            flipped ? "pointer-events-none opacity-0 invisible" : "opacity-100 visible z-10"
          }`}
        >
          <div className="w-full flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#7C4DFF] bg-[#F0E9FF] px-3 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              Từ mới hôm nay
            </span>
            {word.level && (
              <span className="text-[11px] font-semibold text-[#8E8287] bg-[#F6EFF0] px-2.5 py-0.5 rounded-md">
                {word.level}
              </span>
            )}
          </div>

          <div className="my-auto flex flex-col items-center py-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#201A1D] tracking-tight">
              {word.word}
            </h2>
            {word.ipa && (
              <p className="text-sm sm:text-base font-medium text-[#786D73] mt-2 font-mono">
                {word.ipa}
              </p>
            )}
            <button
              type="button"
              onClick={handleSpeak}
              className={`w-12 h-12 rounded-full bg-[#7C4DFF] text-white flex items-center justify-center mt-6 shadow-[0_4px_14px_rgba(250,82,113,0.35)] transition-all ${
                isPlaying ? "scale-110 ring-4 ring-[#F0E9FF]" : "active:scale-95"
              }`}
              aria-label={`Phát âm ${word.word}`}
            >
              <Volume2 className="w-5 h-5 fill-white" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8E8287] pt-2">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Chạm thẻ để xem nghĩa & ví dụ</span>
          </div>
        </div>

        {/* Back face (Vietnamese meaning, collocations, example) */}
        <div
          style={{
            transform: flipped ? "rotateY(0deg)" : "rotateY(-180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          className={`absolute inset-0 w-full h-full rounded-3xl bg-white border border-[#7C4DFF]/25 shadow-xs p-5 sm:p-6 flex flex-col justify-between text-left overflow-y-auto no-scrollbar transition-all duration-500 ease-in-out ${
            flipped ? "opacity-100 visible z-10" : "pointer-events-none opacity-0 invisible"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#F6EFF0] pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C4DFF] bg-[#F0E9FF] px-2.5 py-0.5 rounded-full">
                {POS_MAP[word.part_of_speech] || word.part_of_speech}
              </span>
              <span className="text-base font-bold text-[#201A1D]">{word.word}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#8E8287] tracking-wider block mb-0.5">
                Nghĩa của từ
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-[#201A1D] leading-tight">
                {word.meaning_vi}
              </p>
            </div>

            {word.collocations.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8E8287] tracking-wider block mb-1">
                  Cụm từ thường gặp
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {word.collocations.map((p, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium bg-[#FAF8FF] border border-[#EFE6E2] text-[#362B30] px-2.5 py-0.5 rounded-lg"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {word.example_en && (
              <div className="rounded-xl bg-[#FFF9FA] border border-[#F0E9FF] p-3 text-xs sm:text-sm space-y-1">
                <p className="font-semibold text-[#201A1D] italic">&ldquo;{word.example_en}&rdquo;</p>
                {word.example_vi && <p className="text-[#786D73]">{word.example_vi}</p>}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#8E8287] pt-2 border-t border-[#F6EFF0] mt-2">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Chạm để quay lại mặt trước</span>
          </div>
        </div>
      </div>
    </div>
  );
}
