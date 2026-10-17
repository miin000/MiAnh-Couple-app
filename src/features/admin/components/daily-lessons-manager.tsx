"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveDailyLessonAdminAction, toggleDailyLessonStatusAdminAction } from "../actions";
import type { AdminDailyLesson, VocabularyWord } from "../types";

export function DailyLessonsManager({
  initialLessons,
  words,
}: {
  initialLessons: AdminDailyLesson[];
  words: VocabularyWord[];
}) {
  const [lessons, setLessons] = useState(initialLessons);
  const [date, setDate] = useState("");
  const [topic, setTopic] = useState("general");
  const [level, setLevel] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [, startTransition] = useTransition();

  const toggleWord = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((wordId) => wordId !== id)
        : current.length < 10
          ? [...current, id]
          : current,
    );
  };

  const submit = () => {
    if (selected.length !== 10) {
      setMessage("Bài học phải có đúng 10 từ.");
      return;
    }
    startTransition(async () => {
      const result = await saveDailyLessonAdminAction({ date, topic, level, wordIds: selected });
      setMessage(result.message ?? "");
      if (result.success && result.data) {
        setLessons((current) => [
          result.data as AdminDailyLesson,
          ...current.filter((lesson) => lesson.lesson_date !== date),
        ]);
      }
    });
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div>
          <h2 className="font-extrabold">Xếp bài học theo ngày</h2>
          <p className="mt-1 text-xs text-stone-500">Chọn đúng 10 từ; lưu lại sẽ thay thế bài của ngày đó.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-xl border border-[#F2EAE5] px-3 py-2 text-sm" />
          <input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Chủ đề" className="rounded-xl border border-[#F2EAE5] px-3 py-2 text-sm" />
          <select value={level} onChange={(event) => setLevel(event.target.value)} className="rounded-xl border border-[#F2EAE5] px-3 py-2 text-sm">
            <option value="">Không đặt cấp độ</option>
            {["A1", "A2", "B1", "B2", "C1", "C2"].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
          {words.filter((word) => word.is_active).map((word) => (
            <button key={word.id} type="button" onClick={() => toggleWord(word.id)} className={`rounded-xl border px-3 py-2 text-left text-xs ${selected.includes(word.id) ? "border-[#7C4DFF] bg-[#F5F0FF]" : "border-[#F2EAE5] bg-white"}`}>
              <span className="font-bold">{selected.includes(word.id) ? `${selected.indexOf(word.id) + 1}. ` : ""}{word.word}</span>
              <span className="ml-1 text-stone-500">— {word.meaning_vi}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-stone-500">{selected.length}/10 từ</span>
          <Button type="button" size="sm" onClick={submit}>Lưu bài học</Button>
        </div>
        {message && <p role="status" className="text-xs font-semibold text-[#6840B8]">{message}</p>}
      </Card>
      <div className="space-y-2">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="flex items-center justify-between p-3">
            <div><p className="text-sm font-bold">{lesson.lesson_date} · {lesson.topic}</p><p className="text-xs text-stone-500">{lesson.word_count}/10 từ · {lesson.is_published ? "Đang xuất bản" : "Đã ẩn"}</p></div>
            <Button size="sm" variant="secondary" onClick={() => startTransition(async () => { const result = await toggleDailyLessonStatusAdminAction(lesson.id, lesson.is_published); setMessage(result.message ?? ""); if (result.success) setLessons((current) => current.map((item) => item.id === lesson.id ? { ...item, is_published: !item.is_published } : item)); })}>{lesson.is_published ? "Ẩn" : "Xuất bản"}</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
