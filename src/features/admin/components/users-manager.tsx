"use client";

import { useState, useTransition } from "react";
import { AdminUser } from "../types";
import { toggleUserAdminRoleAdminAction } from "../actions";
import { UserEditModal } from "./user-edit-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Search, ShieldCheck, ShieldAlert, Edit2, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";

interface UsersManagerProps {
  initialUsers: AdminUser[];
  currentUserId?: string;
}

export function UsersManager({ initialUsers, currentUserId }: UsersManagerProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotify = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.email.toLowerCase().includes(q) || u.display_name.toLowerCase().includes(q);
  });

  const handleToggleAdmin = (targetUser: AdminUser) => {
    if (targetUser.id === currentUserId && targetUser.is_admin) {
      alert("Bạn không thể tự thu hồi quyền quản trị viên của chính tài khoản mình.");
      return;
    }

    const actionText = targetUser.is_admin ? "thu hồi quyền Admin" : "cấp quyền Admin";
    if (!confirm(`Bạn có chắc muốn ${actionText} cho tài khoản "${targetUser.email}"?`)) {
      return;
    }

    startTransition(async () => {
      const res = await toggleUserAdminRoleAdminAction(targetUser.id, !targetUser.is_admin);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, is_admin: !u.is_admin } : u))
        );
        showNotify("success", res.message || "Cập nhật quyền thành công!");
      } else {
        showNotify("error", res.message || "Không thể cập nhật quyền.");
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

      {/* Info Banner for Admin Accounts */}
      <Card className="p-4 bg-[#FFF2EB] border-[#F2EAE5] rounded-3xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-white text-[#7C4DFF] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
          <KeyRound className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1 text-[#201A1D]">
          <div className="font-extrabold">Cấp quyền quản trị viên</div>
          <div className="text-stone-600 leading-relaxed">
            Tạo tài khoản trong Supabase Authentication rồi cập nhật quyền
            quản trị cho tài khoản đó trong cơ sở dữ liệu.
          </div>
          <div className="text-[11px] text-[#7C4DFF] font-medium pt-0.5">
            Không hiển thị hoặc lưu mật khẩu quản trị trong ứng dụng.
          </div>
        </div>
      </Card>

      <div className="flex gap-3 items-center justify-between">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo email hoặc tên hiển thị..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#F2EAE5] rounded-xl text-xs focus:border-[#7C4DFF]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> Tất cả người dùng ({filteredUsers.length})
        </div>

        <div className="grid gap-2">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="p-3 bg-white border border-[#F2EAE5] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 ${
                  user.is_admin ? "bg-[#F0E9FF] text-[#7C4DFF] border border-[#7C4DFF]/20" : "bg-stone-100 text-stone-600"
                }`}>
                  {user.display_name ? user.display_name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#201A1D] truncate">{user.display_name || "Chưa đặt tên"}</span>
                    {user.is_admin ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#F0E9FF] text-[#7C4DFF] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-stone-100 text-stone-600">Thành viên</span>
                    )}
                    {user.id === currentUserId && <span className="text-[10px] text-stone-400 font-semibold">(Bạn)</span>}
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono truncate">{user.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button variant="outline" size="sm" onClick={() => setEditingUser(user)} className="rounded-xl text-xs h-8 border-[#F2EAE5] gap-1">
                  <Edit2 className="w-3.5 h-3.5" /> Sửa tên
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={user.id === currentUserId && user.is_admin}
                  onClick={() => handleToggleAdmin(user)}
                  className={`rounded-xl text-xs h-8 gap-1 ${user.is_admin ? "text-stone-500 hover:text-red-600" : "text-[#7C4DFF] hover:bg-[#F0E9FF]"}`}
                >
                  {user.is_admin ? (
                    <><ShieldAlert className="w-3.5 h-3.5" /> Thu hồi Admin</>
                  ) : (
                    <><ShieldCheck className="w-3.5 h-3.5" /> Cấp Admin</>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={(upd) => {
            setEditingUser(null);
            setUsers((prev) => prev.map((u) => (u.id === upd.id ? upd : u)));
            showNotify("success", "Đã cập nhật tên người dùng!");
          }}
        />
      )}
    </div>
  );
}
