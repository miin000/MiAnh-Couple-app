import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { notFound } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();

  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col text-[#201A1D]">
      <AdminHeader userEmail={user.email} />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
