"use client";

import { useState } from "react";
import { VocabularyWord } from "../types";
import { saveVocabularyWordAdminAction } from "../actions";
import { Button } from "@/components/ui/button";
import { X, BookOpen } from "lucide-react";

interface VocabModalProps {
  wordItem: VocabularyWord | null;
  onClose: () => void;
  onSuccess: (saved: VocabularyWord, isNew: boolean) => void;
}

export function VocabModal({ wordItem, onClose, onSuccess }: VocabModalProps) {
  const [word, setWord] = useState(wordItem?.word || "");
  const [ipa, setIpa] = useState(wordItem?.ipa || "");
  const [partOfSpeech, setPartOfSpeech] = useState(wordItem?.part_of_speech || "noun");
  const [meaningVi, setMeaningVi] = useState(wordItem?.meaning_vi || "");
  const [exampleEn, setExampleEn] = useState(wordItem?.example_en || "");
  const [exampleVi, setExampleVi] = useState(wordItem?.example_vi || "");
  const [collocations, setCollocations] = useState<string>(
    wordItem?.collocations?.join(", ") || ""
  );
  const [phrase, setPhrase] = useState(wordItem?.phrase || "");
  const [sentenceEn, setSentenceEn] = useState(wordItem?.sentence_en || "");
  const [sentenceVi, setSentenceVi] = useState(wordItem?.sentence_vi || "");
  const [topic, setTopic] = useState(wordItem?.topic || "general");
  const [level, setLevel] = useState<string>(wordItem?.level || "A2");
  const [isActive, setIsActive] = useState<boolean>(wordItem ? wordItem.is_active : true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !meaningVi.trim()) {
      setErrorMsg("Vui lòng điền từ tiếng Anh và nghĩa tiếng Việt.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const fd = new FormData();
    if (wordItem?.id) fd.append("id", wordItem.id);
    fd.append("word", word.trim());
    if (ipa.trim()) fd.append("ipa", ipa.trim());
    fd.append("part_of_speech", partOfSpeech);
    fd.append("meaning_vi", meaningVi.trim());
    if (exampleEn.trim()) fd.append("example_en", exampleEn.trim());
    if (exampleVi.trim()) fd.append("example_vi", exampleVi.trim());
    fd.append("collocations", collocations.trim());
    fd.append("phrase", phrase.trim());
    fd.append("sentence_en", sentenceEn.trim());
    fd.append("sentence_vi", sentenceVi.trim());
    fd.append("topic", topic.trim());
    if (level) fd.append("level", level);
    fd.append("is_active", String(isActive));

    const res = await saveVocabularyWordAdminAction(fd);
    setIsSubmitting(false);

    if (res.success) {
      const parsedCollocs = collocations
        .split(/[,\n]/)
        .map((c) => c.trim())
        .filter(Boolean);
      const saved: VocabularyWord = {
        id: wordItem?.id || "temp-" + Date.now(),
        external_key: wordItem?.external_key || null,
        word: word.trim(),
        ipa: ipa.trim() || null,
        part_of_speech: partOfSpeech,
        meaning_vi: meaningVi.trim(),
        example_en: exampleEn.trim() || null,
        example_vi: exampleVi.trim() || null,
        collocations: parsedCollocs,
        phrase: phrase.trim() || null,
        sentence_en: sentenceEn.trim() || null,
        sentence_vi: sentenceVi.trim() || null,
        topic: topic.trim(),
        level: (level as VocabularyWord["level"]) || null,
        is_active: isActive,
        created_at: wordItem?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      onSuccess(saved, !wordItem);
    } else {
      setErrorMsg(res.message || "Lỗi lưu từ vựng.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-xl border border-[#F2EAE5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#1B9B68]" />
            <h3 className="text-base font-extrabold text-[#201A1D]">
              {wordItem ? "Chỉnh sửa từ vựng" : "Thêm từ mới"}
            </h3>
          </div>

          <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
            <X className="w-4 h-4 text-stone-600" />
          </button>
        </div>

        {errorMsg && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-[#201A1D] block mb-1">Từ vựng (English)</label>
              <input
                type="text"
                required
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="cherish, cuddle..."
                className="w-full p-2.5 bg-white border border-[#F2EAE5] rounded-xl focus:border-[#1B9B68]"
              />
            </div>
            <div>
              <label className="font-bold text-[#201A1D] block mb-1">Phiên âm IPA</label>
              <input
                type="text"
                value={ipa}
                onChange={(e) => setIpa(e.target.value)}
                placeholder="/ˈtʃer.ɪʃ/"
                className="w-full p-2.5 bg-white border border-[#F2EAE5] rounded-xl focus:border-[#1B9B68]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-[#201A1D] block mb-1">Loại từ</label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                className="w-full p-2 bg-white border border-[#F2EAE5] rounded-xl"
              >
                <option value="verb">Động từ (v)</option>
                <option value="noun">Danh từ (n)</option>
                <option value="adjective">Tính từ (adj)</option>
                <option value="adverb">Trạng từ (adv)</option>
                <option value="phrase">Cụm từ (phrase)</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-[#201A1D] block mb-1">Cấp độ</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full p-2 bg-white border border-[#F2EAE5] rounded-xl"
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-[#201A1D] block mb-1">Chủ đề (Topic)</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="love, travel..."
                className="w-full p-2 bg-white border border-[#F2EAE5] rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#201A1D] block mb-1">Nghĩa tiếng Việt</label>
            <input
              type="text"
              required
              value={meaningVi}
              onChange={(e) => setMeaningVi(e.target.value)}
              placeholder="yêu thương, trân trọng..."
              className="w-full p-2.5 bg-white border border-[#F2EAE5] rounded-xl focus:border-[#1B9B68]"
            />
          </div>

          <div className="grid gap-2">
            <input value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="Cụm từ / phrasal verb" className="w-full p-2.5 bg-white border border-[#F2EAE5] rounded-xl" />
            <input value={sentenceEn} onChange={(e) => setSentenceEn(e.target.value)} placeholder="Câu ví dụ tiếng Anh" className="w-full p-2.5 bg-white border border-[#F2EAE5] rounded-xl" />
            <input value={sentenceVi} onChange={(e) => setSentenceVi(e.target.value)} placeholder="Dịch câu ví dụ" className="w-full p-2.5 bg-white border border-[#F2EAE5] rounded-xl" />
          </div>

          <div>
            <label className="font-bold text-[#201A1D] block mb-1">
              Cụm từ thường gặp (Collocations, cách nhau bởi dấu phẩy)
            </label>
            <input
              type="text"
              value={collocations}
              onChange={(e) => setCollocations(e.target.value)}
              placeholder="cherish every moment, deeply cherish..."
              className="w-full p-2.5 bg-white border border-[#F2EAE5] rounded-xl focus:border-[#1B9B68]"
            />
          </div>

          <div>
            <label className="font-bold text-[#201A1D] block mb-1">Ví dụ tiếng Anh</label>
            <textarea
              rows={2}
              value={exampleEn}
              onChange={(e) => setExampleEn(e.target.value)}
              placeholder="I will always cherish every moment with you."
              className="w-full p-2.5 bg-white border border-[#F2EAE5] rounded-xl focus:border-[#1B9B68]"
            />
          </div>

          <div>
            <label className="font-bold text-[#201A1D] block mb-1">Dịch nghĩa ví dụ</label>
            <input
              type="text"
              value={exampleVi}
              onChange={(e) => setExampleVi(e.target.value)}
              placeholder="Anh sẽ luôn trân trọng từng khoảnh khắc bên em."
              className="w-full p-2.5 bg-white border border-[#F2EAE5] rounded-xl focus:border-[#1B9B68]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isVocabActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded accent-[#1B9B68] w-4 h-4 cursor-pointer"
            />
            <label htmlFor="isVocabActive" className="font-medium text-stone-700 cursor-pointer">
              Kích hoạt từ vựng này cho bài học
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#F2EAE5]">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-xl h-9">
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-[#1B9B68] hover:bg-[#147951] text-white font-bold h-9 px-5">
              {isSubmitting ? "Đang lưu..." : wordItem ? "Cập nhật" : "Tạo từ mới"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
