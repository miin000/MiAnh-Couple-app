"use client";

import { useState } from "react";
import { AdminStats, AdminUser, VocabularyWord, QuestionItem, AdminTab, AdminDailyLesson } from "../types";
import { RandomItem } from "@/types/discover";
import { AdminOverview } from "./admin-overview";
import { QuestionsManager } from "./questions-manager";
import { VocabularyManager } from "./vocabulary-manager";
import { DiscoverManager } from "./discover-manager";
import { UsersManager } from "./users-manager";
import { DailyLessonsManager } from "./daily-lessons-manager";
import { LayoutDashboard, Compass, Users, BookOpen, MessageCircleQuestion } from "lucide-react";

interface AdminDashboardViewProps {
  stats: AdminStats;
  initialItems: RandomItem[];
  initialUsers: AdminUser[];
  initialWords: VocabularyWord[];
  initialQuestions: QuestionItem[];
  initialLessons: AdminDailyLesson[];
  currentUserId?: string;
}

export function AdminDashboardView({
  stats,
  initialItems,
  initialUsers,
  initialWords,
  initialQuestions,
  initialLessons,
  currentUserId,
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "overview",
      label: "Tổng quan",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "questions",
      label: "Câu hỏi & Trò chơi",
      icon: <MessageCircleQuestion className="w-4 h-4" />,
      badge: initialQuestions.length,
    },
    {
      id: "vocabulary",
      label: "Kho từ vựng",
      icon: <BookOpen className="w-4 h-4" />,
      badge: initialWords.length,
    },
    {
      id: "lessons",
      label: "Bài học theo ngày",
      icon: <BookOpen className="w-4 h-4" />,
      badge: initialLessons.length,
    },
    {
      id: "discover",
      label: "Khám phá & Chi tiêu",
      icon: <Compass className="w-4 h-4" />,
      badge: initialItems.length,
    },
    {
      id: "users",
      label: "Người dùng",
      icon: <Users className="w-4 h-4" />,
      badge: initialUsers.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#F2EAE5]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-[#201A1D] text-white shadow-xs"
                  : "bg-white text-stone-600 hover:text-[#7C4DFF] hover:bg-[#F0E9FF]/50 border border-[#F2EAE5]"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.badge === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab contents */}
      <div>
        {activeTab === "overview" && (
          <AdminOverview stats={stats} onNavigateTab={(t) => setActiveTab(t)} />
        )}
        {activeTab === "questions" && (
          <QuestionsManager initialQuestions={initialQuestions} />
        )}
        {activeTab === "vocabulary" && (
          <VocabularyManager initialWords={initialWords} />
        )}
        {activeTab === "lessons" && (
          <DailyLessonsManager initialLessons={initialLessons} words={initialWords} />
        )}
        {activeTab === "discover" && (
          <DiscoverManager
            initialItems={initialItems}
            initialPriceConfigs={stats.priceConfigs}
          />
        )}
        {activeTab === "users" && (
          <UsersManager initialUsers={initialUsers} currentUserId={currentUserId} />
        )}
      </div>
    </div>
  );
}
