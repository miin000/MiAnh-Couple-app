"use client";

import { useState, useTransition } from "react";
import { VocabularyWord } from "../types";
import { deleteVocabularyWordAdminAction, toggleVocabularyWordStatusAdminAction } from "../actions";
import { VocabModal } from "./vocab-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Plus, Search, Filter, Edit2, Trash2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

interface VocabularyManagerProps {
  initialWords: VocabularyWord[];
}

export function VocabularyManager({ initialWords }: VocabularyManagerProps) {
  const [words, setWords] = useState<VocabularyWord[]>(initialWords);
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotify = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredWords = words.filter((w) => {
    if (selectedLevel !== "all" && w.level !== selectedLevel) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        w.word.toLowerCase().includes(q) ||
        w.meaning_vi.toLowerCase().includes(q) ||
        w.topic.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = (id: string, word: string) => {
    if (!confirm(`Bạn có chắc muốn xóa từ vựng "${word}"?`)) return;
    startTransition(async () => {
      const res = await deleteVocabularyWordAdminAction(id);
      if (res.success) {
        setWords((prev) => prev.filter((w) => w.id !== id));
        showNotify("success", res.message || "Đã xóa!");
      } else {
        showNotify("error", res.message || "Lỗi xóa!");
      }
    });
  };

  const handleToggle = (w: VocabularyWord) => {
    startTransition(async () => {
      const res = await toggleVocabularyWordStatusAdminAction(w.id, w.is_active);
      if (res.success) {
        setWords((prev) =>
          prev.map((item) => (item.id === w.id ? { ...item, is_active: !item.is_active } : item))
        );
        showNotify("success", res.message || "Cập nhật thành công!");
      }
    });
  };

  return (
    <div className="space-y-5">
      {notification && (
        <div className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold ${
          notification.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
        }`}>
          {notification.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo từ, nghĩa tiếng Việt, chủ đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#F2EAE5] rounded-xl text-xs focus:border-[#1B9B68]"
          />
        </div>
        <Button
          onClick={() => { setEditingWord(null); setIsModalOpen(true); }}
          className="rounded-xl bg-[#1B9B68] hover:bg-[#147951] text-white text-xs font-bold gap-1.5 h-9 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm từ vựng mới</span>
        </Button>
      </div>

      {/* Level filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-stone-400 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Cấp độ:
        </span>
        {["all", "A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setSelectedLevel(lvl)}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
              selectedLevel === lvl
                ? "bg-[#1B9B68] text-white font-bold"
                : "bg-white text-stone-600 border border-[#F2EAE5] hover:bg-stone-50"
            }`}
          >
            {lvl === "all" ? "Tất cả" : lvl}
          </button>
        ))}
      </div>
      {/* Words list */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Kho từ vựng ({filteredWords.length} từ)
        </div>

        {filteredWords.length === 0 ? (
          <Card className="p-8 text-center bg-white border-[#F2EAE5] rounded-2xl">
            <p className="text-xs text-stone-500">Không tìm thấy từ vựng nào.</p>
          </Card>
        ) : (
          <div className="grid gap-2">
            {filteredWords.map((w) => (
              <Card
                key={w.id}
                className={`p-3 bg-white border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  w.is_active ? "border-[#F2EAE5]" : "border-stone-200 opacity-60 bg-stone-50"
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-[#201A1D]">{w.word}</span>
                    {w.ipa && <span className="text-xs text-stone-400 font-mono">{w.ipa}</span>}
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700">
                      {w.part_of_speech}
                    </span>
                    {w.level && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#EDF3FC] text-[#2F6BE6]">
                        {w.level}
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-stone-100 text-stone-600">
                      #{w.topic}
                    </span>
                    {!w.is_active && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-stone-200 text-stone-600">
                        Đã ẩn
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-stone-700">{w.meaning_vi}</p>
                  {w.collocations && w.collocations.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {w.collocations.map((col, cIdx) => (
                        <span
                          key={cIdx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF6F2] border border-[#EFE6E2] text-stone-600 font-medium"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  )}
                  {w.example_en && (
                    <p className="text-[11px] text-stone-500 italic line-clamp-1">
                      &quot;{w.example_en}&quot; {w.example_vi && `— ${w.example_vi}`}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                  <Button variant="ghost" size="sm" onClick={() => handleToggle(w)} className="h-8 w-8 p-0 rounded-xl">
                    {w.is_active ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-stone-400" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditingWord(w); setIsModalOpen(true); }} className="h-8 w-8 p-0 rounded-xl text-blue-600">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(w.id, w.word)} className="h-8 w-8 p-0 rounded-xl text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <VocabModal
          wordItem={editingWord}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(saved, isNew) => {
            setIsModalOpen(false);
            if (isNew) {
              setWords((prev) => [saved, ...prev]);
              showNotify("success", "Đã thêm từ vựng mới!");
            } else {
              setWords((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
              showNotify("success", "Đã cập nhật từ vựng!");
            }
          }}
        />
      )}
    </div>
  );
}
