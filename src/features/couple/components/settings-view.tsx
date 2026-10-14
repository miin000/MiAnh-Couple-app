"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, UpdateProfileInput } from "@/lib/validations/auth";
import { updateCoupleSettingsAction, generateNewInviteAction, joinCoupleAction } from "@/features/couple/actions";
import { logoutAction } from "@/features/auth/actions";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CoupleAvatars } from "@/components/shared/couple-avatars";
import { User, Calendar, KeyRound, LogOut, Save, Copy, Check, RefreshCw } from "lucide-react";

export interface CoupleMember {
  user_id: string;
  display_name: string;
  avatar_url?: string | null;
  joined_at: string;
  is_me: boolean;
}

export interface SettingsViewProps {
  initialDisplayName: string;
  initialStartDate: string;
  memberCount: number;
  members: CoupleMember[];
  activeInviteCode?: string | null;
}

export function SettingsView({
  initialDisplayName,
  initialStartDate,
  memberCount,
  members,
  activeInviteCode,
}: SettingsViewProps) {
  const [copied, setCopied] = React.useState(false);
  const [inviteCode, setInviteCode] = React.useState<string | null>(activeInviteCode || null);
  const [serverMessage, setServerMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [partnerCode, setPartnerCode] = React.useState("");
  const [isJoining, setIsJoining] = React.useState(false);


  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { displayName: initialDisplayName, startDate: initialStartDate },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      setIsSubmitting(true);
      setServerMessage(null);
      const res = await updateCoupleSettingsAction(data);
      if (res.success) {
        setServerMessage({ type: "success", text: "Đã lưu thay đổi thành công!" });
      } else {
        setServerMessage({ type: "error", text: res.error || "Không thể lưu thay đổi." });
      }
    } catch (err) {
      setServerMessage({ type: "error", text: err instanceof Error ? err.message : "Đã có lỗi xảy ra." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const handleGenerateNewCode = async () => {
    try {
      setIsSubmitting(true);
      const res = await generateNewInviteAction();
      if (res.success) {
        const payload = res.data as { invite_code: string };
        setInviteCode(payload.invite_code);
        setServerMessage({ type: "success", text: "Đã tạo mã mời mới thành công!" });
      } else {
        setServerMessage({ type: "error", text: res.error || "Không thể tạo mã mới." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleJoinPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerCode.trim()) return;
    try {
      setIsJoining(true);
      setServerMessage(null);
      const res = await joinCoupleAction({ code: partnerCode.trim() });
      if (res.success) {
        setServerMessage({ type: "success", text: "Ghép đôi thành công!" });
        window.location.reload();
      } else {
        setServerMessage({ type: "error", text: res.error || "Không thể ghép đôi." });
      }
    } catch (err) {
      setServerMessage({ type: "error", text: err instanceof Error ? err.message : "Đã có lỗi xảy ra." });
    } finally {
      setIsJoining(false);
    }
  };


  const initials: [string, string] = [
    members[0]?.display_name?.[0]?.toUpperCase() || "M",
    members[1]?.display_name?.[0]?.toUpperCase() || "?",
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        category="CÀI ĐẶT"
        title="Không gian & Tài khoản"
        subtitle="Quản lý thông tin cá nhân và ngày kỷ niệm của hai bạn."
      />

      <Card className="p-5 flex items-center gap-4 bg-white">
        <CoupleAvatars initials={initials} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-extrabold text-[#201A1D] truncate">
            {members.map((m) => m.display_name).join(" & ") || initialDisplayName}
          </h3>
          <p className="text-xs text-[#786D73] mt-0.5">
            {memberCount === 2 ? "Đã ghép đôi trọn vẹn" : "Đang chờ người ấy tham gia"}
          </p>
        </div>
      </Card>

      {serverMessage && (
        <div
          className={`p-3 rounded-2xl border text-xs font-medium ${
            serverMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          {serverMessage.text}
        </div>
      )}

      <Card className="p-5 space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="block text-xs font-bold text-[#52464D] mb-1.5 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-[#FA5271]" />
              Tên hiển thị của bạn
            </label>
            <Input id="displayName" placeholder="VD: Minh" {...register("displayName")} />
            {errors.displayName && (
              <p className="text-xs text-red-500 mt-1">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="startDate"
              className="block text-xs font-bold text-[#52464D] mb-1.5 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[#FA5271]" />
              Ngày bắt đầu mối quan hệ
            </label>
            <Input id="startDate" type="date" {...register("startDate")} />
            {errors.startDate && (
              <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full" variant="primary">
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </form>
      </Card>

      {memberCount < 2 && (
        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#52464D] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#FA5271]" />
                Mã ghép đôi của bạn
              </span>
              {inviteCode && (
                <span className="font-mono font-extrabold text-[#FA5271] text-sm">
                  {inviteCode}
                </span>
              )}
            </div>

            <p className="text-xs text-[#786D73]">
              Gửi mã này cho người ấy để người ấy nhập và tham gia không gian của bạn.
            </p>

            {inviteCode ? (
              <Button
                onClick={() => handleCopyCode(inviteCode)}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1 text-green-600" />
                    Đã sao chép!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Sao chép mã ghép đôi
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleGenerateNewCode}
                disabled={isSubmitting}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Tạo mã mời mới
              </Button>
            )}
          </Card>

          <Card className="p-5 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-[#52464D]">Hoặc nhập mã của người ấy</h4>
              <p className="text-xs text-[#786D73] mt-0.5">
                Nếu người ấy đã gửi mã cho bạn, hãy nhập mã 10 ký tự vào đây để ghép đôi ngay.
              </p>
            </div>

            <form onSubmit={handleJoinPartner} className="space-y-3">
              <Input
                placeholder="VD: J97XZZDGPZ"
                maxLength={10}
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                className="text-center font-mono font-bold tracking-wider uppercase text-base"
              />
              <Button
                type="submit"
                disabled={isJoining || partnerCode.trim().length !== 10}
                className="w-full"
                variant="primary"
                size="sm"
              >
                {isJoining ? "Đang ghép đôi..." : "Ghép đôi bằng mã này"}
              </Button>
            </form>
          </Card>
        </div>
      )}

      <div className="pt-2">
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="secondary"
            className="w-full text-[#FA5271] hover:bg-[#FFEBF0] hover:text-[#FA5271] border-[#FA5271]/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất tài khoản
          </Button>
        </form>
      </div>
    </div>
  );
}

