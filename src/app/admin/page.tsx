import { createClient } from "@/lib/supabase/server";
import {
  getAdminStats,
  getAdminRandomItems,
  getAdminUsers,
  getAdminVocabularyWords,
  getAdminQuestions,
  getAdminDailyLessons,
} from "@/features/admin/queries";
import { AdminDashboardView } from "@/features/admin/components/admin-dashboard-view";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Bảng Quản Trị Hệ Thống | Mi & Anh",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // Layout handles redirect
  }

  // Check admin status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin === true;

  if (!isAdmin) notFound();

  // Fetch admin data in parallel
  const [stats, items, users, words, questions, lessons] = await Promise.all([
    getAdminStats(),
    getAdminRandomItems(),
    getAdminUsers(),
    getAdminVocabularyWords(),
    getAdminQuestions(),
    getAdminDailyLessons(),
  ]);

  return (
    <AdminDashboardView
      stats={stats}
      initialItems={items}
      initialUsers={users}
      initialWords={words}
      initialQuestions={questions}
      initialLessons={lessons}
      currentUserId={user.id}
    />
  );
}
