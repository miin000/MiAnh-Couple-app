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
import { User, Calendar, KeyRound, LogOut, Save, Copy, Check, RefreshCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PwaInstallGuide } from "@/components/pwa-install-guide";
import { LocationPrivacyCard } from "@/features/map/components/location-privacy-card";
import { createClient } from "@/lib/supabase/client";
import Cropper, { type Area, type Point } from "react-easy-crop";

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
  initialAvatarUrl?: string | null;
  memberCount: number;
  members: CoupleMember[];
  activeInviteCode?: string | null;
  isAdmin?: boolean;
}

async function createCroppedAvatar(imageSrc: string, crop: Area) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = reject;
    element.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 800;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Không thể xử lý ảnh.");
  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, 800, 800);
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Không thể tạo ảnh đã cắt."));
        return;
      }
      resolve(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.9);
  });
}

export function SettingsView({
  initialDisplayName,
  initialStartDate,
  initialAvatarUrl,
  memberCount,
  members,
  activeInviteCode,
  isAdmin,
}: SettingsViewProps) {
  const [copied, setCopied] = React.useState(false);
  const [inviteCode, setInviteCode] = React.useState<string | null>(activeInviteCode || null);
  const [serverMessage, setServerMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [partnerCode, setPartnerCode] = React.useState("");
  const [isJoining, setIsJoining] = React.useState(false);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState(initialAvatarUrl || "");
  const [cropSource, setCropSource] = React.useState<string | null>(null);
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedArea, setCroppedArea] = React.useState<Area | null>(null);


  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { displayName: initialDisplayName, startDate: initialStartDate, avatarUrl: initialAvatarUrl || "" },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      setIsSubmitting(true);
      setServerMessage(null);
      let avatarUrl = data.avatarUrl || "";
      if (avatarFile) {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) {
          setServerMessage({ type: "error", text: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." });
          return;
        }
        if (avatarFile.size > 10 * 1024 * 1024) {
          setServerMessage({ type: "error", text: "Ảnh đại diện tối đa 10 MB." });
          return;
        }
        const extension = avatarFile.type.split("/")[1] || "jpg";
        const path = `${authData.user.id}/avatar-${crypto.randomUUID()}.${extension}`;
        const upload = await supabase.storage.from("avatars").upload(path, avatarFile, { contentType: avatarFile.type, upsert: false });
        if (upload.error) {
          setServerMessage({ type: "error", text: `Không thể tải ảnh đại diện lên: ${upload.error.message || "Vui lòng thử lại."}` });
          return;
        }
        avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }
      const res = await updateCoupleSettingsAction({ ...data, avatarUrl });
      if (res.success) {
        setAvatarFile(null);
        setAvatarPreview(avatarUrl);
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
    } catch {
      setServerMessage({ type: "error", text: "Không thể sao chép mã. Bạn hãy nhấn giữ để sao chép thủ công." });
    }
  };

  const handleAvatarSelected = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setServerMessage({ type: "error", text: "Ảnh đại diện tối đa 10 MB." });
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setServerMessage({ type: "error", text: "Ảnh đại diện chỉ được là JPEG, PNG hoặc WebP." });
      return;
    }
    setCropSource(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleCropConfirm = async () => {
    if (!cropSource || !croppedArea) return;
    try {
      const file = await createCroppedAvatar(cropSource, croppedArea);
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      URL.revokeObjectURL(cropSource);
      setCropSource(null);
    } catch (error) {
      setServerMessage({ type: "error", text: error instanceof Error ? error.message : "Không thể cắt ảnh." });
    }
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
        <CoupleAvatars
          initials={initials}
          avatarUrls={[members[0]?.avatar_url, members[1]?.avatar_url]}
          size="lg"
        />
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
              <User className="w-3.5 h-3.5 text-[#7C4DFF]" />
              Tên hiển thị của bạn
            </label>
            <Input id="displayName" placeholder="VD: Minh" {...register("displayName")} />
            {errors.displayName && (
              <p className="text-xs text-red-500 mt-1">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="avatarUrl" className="block text-xs font-bold text-[#52464D] mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#7C4DFF]" />
              Ảnh đại diện
            </label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-[#F0E9FF] text-center text-xl font-extrabold leading-[4rem] text-[#6E56B8]">
                {avatarPreview ? <img src={avatarPreview} alt="Ảnh đại diện xem trước" className="h-full w-full object-cover" /> : initials[0]}
              </div>
              <label htmlFor="avatarFile" className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#D8C8F5] bg-[#F8F5FF] px-3 text-xs font-bold text-[#6E56B8]">
                Chọn ảnh từ thiết bị
                <input id="avatarFile" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleAvatarSelected(file);
                  event.currentTarget.value = "";
                }} />
              </label>
              {cropSource && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-md space-y-4 rounded-3xl bg-[#FAF8FF] p-5"><h2 className="text-base font-extrabold">Căn chỉnh ảnh đại diện</h2><div className="relative h-72 overflow-hidden rounded-2xl bg-[#201A1D]"><Cropper image={cropSource} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setCroppedArea(pixels)} /></div><label className="block text-xs font-semibold text-[#786D73]">Thu phóng<input className="mt-2 w-full accent-[#7C4DFF]" type="range" min={1} max={3} step={0.05} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label><div className="flex gap-2"><Button type="button" variant="secondary" className="flex-1" onClick={() => { URL.revokeObjectURL(cropSource); setCropSource(null); }}>Hủy</Button><Button type="button" className="flex-1" onClick={() => void handleCropConfirm()}>Dùng ảnh này</Button></div></div></div>}
            </div>
            <p className="text-[11px] text-[#8E8287] mt-1">Ảnh được tải trực tiếp lên kho lưu trữ riêng của ứng dụng.</p>
          </div>

          <div>
            <label
              htmlFor="startDate"
              className="block text-xs font-bold text-[#52464D] mb-1.5 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[#7C4DFF]" />
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
                <KeyRound className="w-3.5 h-3.5 text-[#7C4DFF]" />
                Mã ghép đôi của bạn
              </span>
              {inviteCode && (
                <span className="font-mono font-extrabold text-[#7C4DFF] text-sm">
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

      {isAdmin && (
        <Card className="p-4 bg-gradient-to-r from-[#F0E9FF] to-[#FFF2EB] border-[#7C4DFF]/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-[#7C4DFF] flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#201A1D]">Bảng Quản Trị Hệ Thống</div>
              <div className="text-[11px] text-[#786D73]">Quản lý gợi ý, chi tiêu, từ vựng & thành viên</div>
            </div>
          </div>
          <Link href="/admin">
            <Button size="sm" className="rounded-xl bg-[#7C4DFF] hover:bg-[#6937D5] text-white text-xs font-bold h-8">
              Mở Dashboard
            </Button>
          </Link>
        </Card>
      )}

      <PwaInstallGuide />
      <LocationPrivacyCard />

      <div className="pt-2">
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="secondary"
            className="w-full text-[#7C4DFF] hover:bg-[#F0E9FF] hover:text-[#7C4DFF] border-[#7C4DFF]/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất tài khoản
          </Button>
        </form>
      </div>
    </div>
  );
}
