"use client";

import { useState } from "react";
import { QuestionItem } from "../types";
import { saveQuestionAdminAction } from "../actions";
import { Button } from "@/components/ui/button";
import { X, MessageCircleQuestion } from "lucide-react";

interface QuestionModalProps {
  questionItem: QuestionItem | null;
  onClose: () => void;
  onSuccess: (saved: QuestionItem, isNew: boolean) => void;
}

export function QuestionModal({ questionItem, onClose, onSuccess }: QuestionModalProps) {
  const [kind, setKind] = useState<QuestionItem["kind"]>(questionItem?.kind || "daily");
  const [category, setCategory] = useState<QuestionItem["category"]>(
    questionItem?.category || "fun"
  );
  const [intimacyLevel, setIntimacyLevel] = useState<number>(
    questionItem?.intimacy_level ?? 1
  );
  const [text, setText] = useState<string>(questionItem?.text || "");
  const [isActive, setIsActive] = useState<boolean>(
    questionItem ? questionItem.is_active : true
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setErrorMsg("Vui lòng nhập nội dung câu hỏi hoặc thử thách.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const fd = new FormData();
    if (questionItem?.id) fd.append("id", questionItem.id);
    fd.append("kind", kind);
    fd.append("category", category);
    fd.append("intimacy_level", String(intimacyLevel));
    fd.append("text", text.trim());
    fd.append("is_active", String(isActive));

    const res = await saveQuestionAdminAction(fd);
    setIsSubmitting(false);

    if (res.success) {
      const saved: QuestionItem = {
        id: questionItem?.id || res.data?.id || "temp-" + Date.now(),
        external_key: questionItem?.external_key || null,
        kind,
        category,
        intimacy_level: intimacyLevel,
        text: text.trim(),
        is_active: isActive,
        created_at: questionItem?.created_at || new Date().toISOString(),
      };
      onSuccess(saved, !questionItem);
    } else {
      setErrorMsg(res.message || "Lỗi lưu câu hỏi.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-xl border border-[#F2EAE5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircleQuestion className="w-4 h-4 text-[#7C4DFF]" />
            <h3 className="text-base font-extrabold text-[#201A1D]">
              {questionItem ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center cursor-pointer hover:bg-stone-200"
          >
            <X className="w-4 h-4 text-stone-600" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#201A1D] block mb-1">Loại trò chơi</label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as QuestionItem["kind"])}
                className="w-full p-2.5 bg-white border border-[#F2EAE5] rounded-xl focus:border-[#7C4DFF]"
              >
                <option value="daily">Câu hỏi mỗi ngày (Daily)</option>
                <option value="truth">Nói thật (Truth)</option>
                <option value="dare">Thách thức (Dare)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#201A1D] block mb-1">Chủ đề (Category)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as QuestionItem["category"])}
                className="w-full p-2.5 bg-white border border-[#F2EAE5] rounded-xl focus:border-[#7C4DFF]"
              >
                <option value="fun">Vui vẻ (fun)</option>
                <option value="discover">Tìm hiểu (discover)</option>
                <option value="emotion">Cảm xúc (emotion)</option>
                <option value="deep">Sâu sắc (deep)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-[#201A1D] block mb-1">
              Mức độ thân mật (Intimacy: 1 - 4)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setIntimacyLevel(lvl)}
                  className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                    intimacyLevel === lvl
                      ? "bg-[#7C4DFF] text-white border-[#7C4DFF]"
                      : "bg-white text-stone-700 border-[#F2EAE5] hover:bg-stone-50"
                  }`}
                >
                  Mức {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-[#201A1D] block mb-1">
              Nội dung câu hỏi / thử thách
            </label>
            <textarea
              required
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nhập câu hỏi hoặc hành động thử thách..."
              className="w-full p-3 bg-white border border-[#F2EAE5] rounded-xl focus:border-[#7C4DFF] text-xs resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active_question"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#7C4DFF]"
            />
            <label htmlFor="is_active_question" className="font-bold text-[#201A1D] cursor-pointer">
              Đang hoạt động (cho phép xuất hiện trong trò chơi)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F2EAE5]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border-[#F2EAE5] text-xs font-bold"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#7C4DFF] hover:bg-[#6937D5] text-white text-xs font-bold"
            >
              {isSubmitting ? "Đang lưu..." : questionItem ? "Lưu thay đổi" : "Tạo câu hỏi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}