"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  joinCoupleSchema,
  createCoupleSchema,
  JoinCoupleInput,
  CreateCoupleInput,
} from "@/lib/validations/auth";
import {
  createCoupleAction,
  joinCoupleAction,
  generateNewInviteAction,
} from "@/features/couple/actions";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { CoupleAvatars } from "@/components/shared/couple-avatars";
import { Heart, Copy, Check, Sparkles, ArrowRight, RefreshCw, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export interface CoupleInfo {
  couple_id: string;
  start_date: string;
  member_count: number;
  active_invite?: {
    id: string;
    code: string;
    expires_at: string;
  } | null;
}

interface PairViewProps {
  initialCoupleInfo: CoupleInfo | null;
  userDisplayName: string;
  initialTab?: "create" | "join";
}

export function PairView({ initialCoupleInfo, userDisplayName, initialTab = "create" }: PairViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"create" | "join">(initialTab);
  const [isJoiningInstead, setIsJoiningInstead] = React.useState(initialTab === "join");
  const [copied, setCopied] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [coupleInfo, setCoupleInfo] = React.useState<CoupleInfo | null>(initialCoupleInfo);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register: registerJoin,
    handleSubmit: handleSubmitJoin,
    formState: { errors: joinErrors },
  } = useForm<JoinCoupleInput>({ resolver: zodResolver(joinCoupleSchema) });

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: createErrors },
  } = useForm<CreateCoupleInput>({
    resolver: zodResolver(createCoupleSchema),
    defaultValues: { startDate: new Date().toISOString().split("T")[0] },
  });

  const onJoinSubmit = async (data: JoinCoupleInput) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      const res = await joinCoupleAction(data);
      if (!res.success) {
        setServerError(res.error || "Không thể tham gia cặp đôi.");
      } else {
        router.push("/home");
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCreateSubmit = async (data: CreateCoupleInput) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      const res = await createCoupleAction(data);
      if (!res.success) {
        setServerError(res.error || "Không thể tạo cặp đôi.");
      } else {
        const payload = res.data as {
          couple_id: string;
          invite_code: string;
          expires_at: string;
        };
        setCoupleInfo({
          couple_id: payload.couple_id,
          start_date: data.startDate,
          member_count: 1,
          active_invite: {
            id: "",
            code: payload.invite_code,
            expires_at: payload.expires_at,
          },
        });
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
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
      setServerError(null);
      const res = await generateNewInviteAction();
      if (!res.success) {
        setServerError(res.error || "Không thể tạo mã mới.");
      } else {
        const payload = res.data as { invite_code: string; expires_at: string };
        if (coupleInfo) {
          setCoupleInfo({
            ...coupleInfo,
            active_invite: { id: "", code: payload.invite_code, expires_at: payload.expires_at },
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (coupleInfo && coupleInfo.member_count === 1 && !isJoiningInstead) {
    const inviteCode = coupleInfo.active_invite?.code;

    return (
      <div className="space-y-5">
        <PageHeader
          category="KẾT NỐI ĐÔI LỨA"
          title={`Chào ${userDisplayName}, hãy gửi mã cho người ấy!`}
          subtitle="Không gian chung đã sẵn sàng. Gửi mã này để người ấy cùng tham gia nhé."
        />

        <div className="flex justify-center my-3">
          <CoupleAvatars initials={["M", "?"]} size="lg" />
        </div>

        {inviteCode ? (
          <Card className="p-6 text-center space-y-4 border-[#7C4DFF]/30">
            <p className="text-xs font-bold text-[#8E8287] uppercase tracking-wider">
              Mã ghép đôi của hai bạn
            </p>

            <div className="inline-flex items-center justify-center tracking-widest text-3xl font-extrabold text-[#7C4DFF] font-mono bg-[#F0E9FF] px-6 py-3 rounded-2xl border border-[#7C4DFF]/30 select-all">
              {inviteCode}
            </div>

            <p className="text-xs text-[#786D73]">
              Mã có hiệu lực trong 48 giờ và dùng được 1 lần duy nhất.
            </p>

            <Button
              onClick={() => handleCopyCode(inviteCode)}
              className="w-full"
              variant={copied ? "secondary" : "primary"}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Đã sao chép mã!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Sao chép mã ghép đôi
                </>
              )}
            </Button>
          </Card>
        ) : (
          <Card className="p-5 text-center space-y-3">
            <p className="text-sm font-semibold text-[#201A1D]">
              Mã mời trước đó đã hết hạn hoặc đã thu hồi.
            </p>
            <Button onClick={handleGenerateNewCode} disabled={isSubmitting} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tạo mã mời mới
            </Button>
          </Card>
        )}

        {serverError && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
            {serverError}
          </div>
        )}

        <div className="p-4 rounded-2xl bg-white border border-[#F2EAE5] text-center space-y-2">
          <p className="text-xs text-[#786D73]">Người ấy đã tạo mã và gửi cho bạn?</p>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => {
              setIsJoiningInstead(true);
              setActiveTab("join");
              setServerError(null);
            }}
          >
            Nhập mã của người ấy thay vì chờ
          </Button>
        </div>

        <div className="space-y-2 pt-2">
          <Button onClick={() => router.push("/home")} variant="ghost" className="w-full text-[#786D73]">
            Vào xem ứng dụng trước
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full py-2.5 text-xs font-semibold text-[#8E8287] hover:text-[#7C4DFF] flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng xuất
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {coupleInfo && coupleInfo.member_count === 1 && isJoiningInstead && (
        <button
          type="button"
          onClick={() => {
            setIsJoiningInstead(false);
            setServerError(null);
          }}
          className="text-xs font-bold text-[#7C4DFF] hover:underline flex items-center gap-1"
        >
          ← Quay lại xem mã mời của bạn
        </button>
      )}

      <PageHeader
        category="GHÉP ĐÔI"
        title="Bắt đầu không gian của hai đứa"
        subtitle="Tạo mã mời để gửi cho người ấy, hoặc nhập mã nếu người ấy đã tạo trước."
      />

      <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#ECE2DC]">
        <button
          type="button"
          onClick={() => { setActiveTab("create"); setServerError(null); }}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "create" ? "bg-white text-[#7C4DFF] shadow-2xs" : "text-[#786D73]"
          }`}
        >
          Tạo mã mới
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("join"); setServerError(null); }}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "join" ? "bg-white text-[#7C4DFF] shadow-2xs" : "text-[#786D73]"
          }`}
        >
          Nhập mã có sẵn
        </button>
      </div>

      {serverError && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
          {serverError}
        </div>
      )}

      {activeTab === "create" ? (
        <Card className="p-5 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F0E9FF] text-[#7C4DFF] flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 fill-[#7C4DFF]" />
          </div>

          <div className="text-center">
            <h3 className="text-base font-bold text-[#201A1D]">Khởi tạo không gian cho hai bạn</h3>
            <p className="text-xs text-[#786D73] mt-1">Chọn ngày kỷ niệm bắt đầu tình yêu của hai bạn.</p>
          </div>

          <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4">
            <div>
              <label htmlFor="startDate" className="block text-xs font-bold text-[#52464D] mb-1.5">
                Ngày bên nhau từ
              </label>
              <Input id="startDate" type="date" {...registerCreate("startDate")} className="font-medium" />
              {createErrors.startDate && (
                <p className="text-xs text-red-500 mt-1">{createErrors.startDate.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              <Sparkles className="w-4 h-4 mr-2" />
              {isSubmitting ? "Đang tạo..." : "Tạo mã mời cho người ấy"}
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="p-5 space-y-4">
          <div className="text-center">
            <h3 className="text-base font-bold text-[#201A1D]">Nhập mã ghép đôi</h3>
            <p className="text-xs text-[#786D73] mt-1">Nhập mã 10 ký tự mà người ấy đã gửi cho bạn.</p>
          </div>

          <form onSubmit={handleSubmitJoin(onJoinSubmit)} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-xs font-bold text-[#52464D] mb-1.5">
                Mã ghép đôi (10 ký tự)
              </label>
              <Input
                id="code"
                placeholder="VD: J97XZZDGPZ"
                maxLength={10}
                className="text-center text-lg font-mono font-bold tracking-widest uppercase"
                {...registerJoin("code")}
              />
              {joinErrors.code && (
                <p className="text-xs text-red-500 mt-1">{joinErrors.code.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? "Đang tham gia..." : "Vào không gian chung"}
            </Button>
          </form>
        </Card>
      )}

      <form action={logoutAction} className="pt-4">
        <button
          type="submit"
          className="w-full py-2.5 text-xs font-semibold text-[#8E8287] hover:text-[#7C4DFF] flex items-center justify-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Đăng xuất tài khoản
        </button>
      </form>
    </div>
  );
}

