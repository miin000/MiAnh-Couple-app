"use client";

import { useState } from "react";
import { AdminUser } from "../types";
import { updateUserDisplayNameAdminAction } from "../actions";
import { Button } from "@/components/ui/button";
import { X, User } from "lucide-react";

interface UserEditModalProps {
  user: AdminUser;
  onClose: () => void;
  onSuccess: (updatedUser: AdminUser) => void;
}

export function UserEditModal({ user, onClose, onSuccess }: UserEditModalProps) {
  const [displayName, setDisplayName] = useState(user.display_name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg("Tên hiển thị không được để trống.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const res = await updateUserDisplayNameAdminAction(user.id, displayName.trim());
    setIsSubmitting(false);

    if (res.success) {
      onSuccess({ ...user, display_name: displayName.trim() });
    } else {
      setErrorMsg(res.message || "Không thể cập nhật tên.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-[#F2EAE5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#FA5271]" />
            <h3 className="text-sm font-extrabold text-[#201A1D]">Sửa tên người dùng</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center">
            <X className="w-4 h-4 text-stone-600" />
          </button>
        </div>

        {errorMsg && <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[11px] text-stone-500 font-semibold block mb-1">Email tài khoản</label>
            <div className="p-2 bg-stone-50 rounded-xl text-stone-600 font-mono text-[11px] truncate">
              {user.email}
            </div>
          </div>

          <div>
            <label className="text-[11px] text-stone-700 font-bold block mb-1">Tên hiển thị</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="VD: Anh Minh, Bé Linh..."
              className="w-full p-2.5 bg-white border border-[#F2EAE5] rounded-xl focus:border-[#FA5271]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#F2EAE5]">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-xl h-9 text-xs">
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-[#FA5271] text-white font-bold h-9 px-4 text-xs">
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
