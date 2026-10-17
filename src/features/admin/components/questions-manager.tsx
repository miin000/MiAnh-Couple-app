"use client";

import { useState, useTransition } from "react";
import { QuestionItem } from "../types";
import {
  deleteQuestionAdminAction,
  toggleQuestionStatusAdminAction,
} from "../actions";
import { QuestionModal } from "./question-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MessageCircleQuestion,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface QuestionsManagerProps {
  initialQuestions: QuestionItem[];
}

export function QuestionsManager({ initialQuestions }: QuestionsManagerProps) {
  const [questions, setQuestions] = useState<QuestionItem[]>(initialQuestions);
  const [search, setSearch] = useState("");
  const [selectedKind, setSelectedKind] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotify = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const filtered = questions.filter((q) => {
    if (selectedKind !== "all" && q.kind !== selectedKind) return false;
    if (selectedCategory !== "all" && q.category !== selectedCategory) return false;
    if (selectedLevel !== "all" && String(q.intimacy_level) !== selectedLevel)
      return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return (
        q.text.toLowerCase().includes(s) ||
        (q.external_key && q.external_key.toLowerCase().includes(s))
      );
    }
    return true;
  });

  const handleDelete = (id: string, text: string) => {
    const preview = text.length > 30 ? text.slice(0, 30) + "..." : text;
    if (!confirm(`Bạn có chắc muốn xóa câu hỏi:\n"${preview}"?`)) return;

    startTransition(async () => {
      const res = await deleteQuestionAdminAction(id);
      if (res.success) {
        setQuestions((prev) => prev.filter((item) => item.id !== id));
        showNotify("success", res.message || "Đã xóa thành công!");
      } else {
        showNotify("error", res.message || "Lỗi xóa!");
      }
    });
  };

  const handleToggle = (q: QuestionItem) => {
    startTransition(async () => {
      const res = await toggleQuestionStatusAdminAction(q.id, q.is_active);
      if (res.success) {
        setQuestions((prev) =>
          prev.map((item) =>
            item.id === q.id ? { ...item, is_active: !item.is_active } : item
          )
        );
        showNotify("success", res.message || "Đã cập nhật trạng thái!");
      } else {
        showNotify("error", res.message || "Lỗi hệ thống!");
      }
    });
  };

  const getKindLabel = (kind: QuestionItem["kind"]) => {
    switch (kind) {
      case "daily":
        return { label: "Hằng ngày", bg: "bg-[#F0E9FF] text-[#7C4DFF]" };
      case "truth":
        return { label: "Nói thật", bg: "bg-[#EDF3FC] text-[#2F6BE6]" };
      case "dare":
        return { label: "Thử thách", bg: "bg-[#FFF0EB] text-[#E05322]" };
      default:
        return { label: kind, bg: "bg-stone-100 text-stone-700" };
    }
  };

  const getCategoryLabel = (cat: QuestionItem["category"]) => {
    switch (cat) {
      case "fun": return "Vui vẻ";
      case "discover": return "Tìm hiểu";
      case "emotion": return "Cảm xúc";
      case "deep": return "Sâu sắc";
      default: return cat;
    }
  };

  return (
    <div className="space-y-5">
      {notification && (
        <div
          className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo nội dung câu hỏi, mã key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#F2EAE5] rounded-xl text-xs focus:border-[#7C4DFF]"
          />
        </div>
        <Button
          onClick={() => {
            setEditingQuestion(null);
            setIsModalOpen(true);
          }}
          className="rounded-xl bg-[#7C4DFF] hover:bg-[#6937D5] text-white text-xs font-bold gap-1.5 h-9 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm câu hỏi mới</span>
        </Button>
      </div>

      {/* Filter Row */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-stone-400 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Chế độ:
          </span>
          {[
            { id: "all", label: "Tất cả" },
            { id: "daily", label: "Hằng ngày" },
            { id: "truth", label: "Nói thật (Truth)" },
            { id: "dare", label: "Thử thách (Dare)" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedKind(f.id)}
              className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                selectedKind === f.id
                  ? "bg-[#201A1D] text-white font-bold"
                  : "bg-white text-stone-600 border border-[#F2EAE5] hover:bg-stone-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 text-xs">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] font-bold text-stone-400 mr-1">Chủ đề:</span>
            {[
              { id: "all", label: "Tất cả" },
              { id: "fun", label: "Vui vẻ" },
              { id: "discover", label: "Tìm hiểu" },
              { id: "emotion", label: "Cảm xúc" },
              { id: "deep", label: "Sâu sắc" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === c.id
                    ? "bg-[#7C4DFF] text-white font-bold"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] font-bold text-stone-400 mr-1">Mức độ:</span>
            {["all", "1", "2", "3", "4"].map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLevel(l)}
                className={`px-2 py-0.5 rounded-lg text-[11px] transition-colors shrink-0 cursor-pointer ${
                  selectedLevel === l
                    ? "bg-[#201A1D] text-white font-bold"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {l === "all" ? "Tất cả" : `Mức ${l}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
          <MessageCircleQuestion className="w-3.5 h-3.5 text-[#7C4DFF]" />
          Kho câu hỏi ({filtered.length} câu)
        </div>

        {filtered.length === 0 ? (
          <Card className="p-8 text-center bg-white border-[#F2EAE5] rounded-2xl">
            <p className="text-xs text-stone-500">Không tìm thấy câu hỏi phù hợp.</p>
          </Card>
        ) : (
          <div className="grid gap-2">
            {filtered.map((q) => {
              const kInfo = getKindLabel(q.kind);
              return (
                <Card
                  key={q.id}
                  className={`p-3.5 bg-white border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    q.is_active ? "border-[#F2EAE5]" : "border-stone-200 opacity-60 bg-stone-50"
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${kInfo.bg}`}
                      >
                        {kInfo.label}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-stone-100 text-stone-700">
                        {getCategoryLabel(q.category)}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#FFF8E2] text-[#B88812]">
                        Mức {q.intimacy_level}
                      </span>
                      {!q.is_active && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-stone-200 text-stone-600 font-semibold">
                          Đã ẩn
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-[#201A1D] leading-snug">
                      {q.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleToggle(q)}
                      className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors cursor-pointer"
                      title={q.is_active ? "Tạm ẩn câu hỏi" : "Kích hoạt câu hỏi"}
                    >
                      {q.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-stone-400" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingQuestion(q);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-[#7C4DFF] hover:bg-[#F0E9FF]/50 transition-colors cursor-pointer"
                      title="Chỉnh sửa câu hỏi"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id, q.text)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <QuestionModal
          questionItem={editingQuestion}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(saved, isNew) => {
            if (isNew) {
              setQuestions((prev) => [saved, ...prev]);
              showNotify("success", "Đã thêm câu hỏi mới thành công!");
            } else {
              setQuestions((prev) =>
                prev.map((item) => (item.id === saved.id ? saved : item))
              );
              showNotify("success", "Đã cập nhật câu hỏi thành công!");
            }
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}