"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  joinCoupleSchema,
  createCoupleSchema,
  updateProfileSchema,
  JoinCoupleInput,
  CreateCoupleInput,
  UpdateProfileInput,
} from "@/lib/validations/auth";
import { getErrorMessage } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export interface CoupleActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

export async function createCoupleAction(data: CreateCoupleInput): Promise<CoupleActionResult> {
  const parsed = createCoupleSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Ngày bắt đầu không hợp lệ.",
    };
  }

  const supabase = await createClient();

  // 1. Call create_couple RPC
  const { data: coupleId, error: createError } = await supabase.rpc("create_couple", {
    p_start_date: parsed.data.startDate,
  });

  if (createError) {
    return {
      success: false,
      error: getErrorMessage(createError, "Không thể tạo không gian đôi."),
    };
  }

  // 2. Automatically generate an invitation code for the partner
  const { data: invite, error: inviteError } = await supabase.rpc("create_invitation", {
    p_hours: 48,
  });

  if (inviteError) {
    return {
      success: true,
      data: {
        couple_id: coupleId,
        invite_code: "",
        expires_at: "",
      },
    };
  }

  revalidatePath("/pair");
  revalidatePath("/home");
  return {
    success: true,
    data: {
      couple_id: coupleId,
      invite_code: invite.code,
      expires_at: invite.expires_at,
    },
  };
}

export async function joinCoupleAction(data: JoinCoupleInput): Promise<CoupleActionResult> {
  const parsed = joinCoupleSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Mã ghép đôi không hợp lệ.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Vui lòng đăng nhập lại." };
  }

  // If user previously created an empty 1-person couple, cancel it to avoid ALREADY_IN_COUPLE
  try {
    const adminSupabase = createAdminClient();
    const { data: memberRows } = await adminSupabase
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", user.id)
      .is("left_at", null);

    if (memberRows && memberRows.length > 0) {
      const currentCoupleId = memberRows[0].couple_id;
      const { count } = await adminSupabase
        .from("couple_members")
        .select("*", { count: "exact", head: true })
        .eq("couple_id", currentCoupleId)
        .is("left_at", null);

      if (count === 1) {
        await adminSupabase.from("couples").delete().eq("id", currentCoupleId);
      } else if (count && count >= 2) {
        return {
          success: false,
          error: "Bạn đã ở trong một không gian có đủ 2 người rồi.",
        };
      }
    }
  } catch (cleanErr) {
    console.error("Cleanup solitary couple before join:", cleanErr);
  }

  const { data: coupleId, error } = await supabase.rpc("join_couple_by_code", {
    p_code: parsed.data.code,
  });

  if (error) {
    return {
      success: false,
      error: getErrorMessage(error, "Không thể tham gia bằng mã này."),
    };
  }

  revalidatePath("/pair");
  revalidatePath("/home");
  revalidatePath("/settings");
  return {
    success: true,
    data: { couple_id: coupleId },
  };
}
export async function cancelUnpairedCoupleAction(): Promise<CoupleActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Vui lòng đăng nhập lại." };
  }

  try {
    const adminSupabase = createAdminClient();
    const { data: memberRows } = await adminSupabase
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", user.id)
      .is("left_at", null);

    if (memberRows && memberRows.length > 0) {
      const currentCoupleId = memberRows[0].couple_id;
      const { count } = await adminSupabase
        .from("couple_members")
        .select("*", { count: "exact", head: true })
        .eq("couple_id", currentCoupleId)
        .is("left_at", null);

      if (count === 1) {
        await adminSupabase.from("couples").delete().eq("id", currentCoupleId);
      } else if (count && count >= 2) {
        return {
          success: false,
          error: "Bạn đã ghép đôi hoàn tất, không thể tự hủy cặp đôi.",
        };
      }
    }
  } catch (err) {
    return {
      success: false,
      error: "Không thể hủy không gian hiện tại: " + getErrorMessage(err),
    };
  }

  revalidatePath("/pair");
  revalidatePath("/home");
  revalidatePath("/settings");
  return { success: true };
}


export async function generateNewInviteAction(): Promise<CoupleActionResult> {
  const supabase = await createClient();
  const { data: invite, error } = await supabase.rpc("create_invitation", {
    p_hours: 48,
  });

  if (error) {
    return {
      success: false,
      error: getErrorMessage(error, "Không thể tạo mã mời mới."),
    };
  }

  revalidatePath("/pair");
  revalidatePath("/settings");
  return {
    success: true,
    data: {
      invite_code: invite.code,
      expires_at: invite.expires_at,
    },
  };
}

export async function revokeInviteAction(inviteId: string): Promise<CoupleActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("revoke_invitation", {
    p_invitation_id: inviteId,
  });

  if (error) {
    return {
      success: false,
      error: getErrorMessage(error, "Không thể thu hồi mã mời."),
    };
  }

  revalidatePath("/pair");
  revalidatePath("/settings");
  return {
    success: true,
  };
}

export async function updateCoupleSettingsAction(
  data: UpdateProfileInput
): Promise<CoupleActionResult> {
  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Vui lòng đăng nhập lại." };
  }

  // Update profile display name
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName })
    .eq("id", user.id);

  if (profileError) {
    return {
      success: false,
      error: `Không thể cập nhật tên hiển thị: ${getErrorMessage(profileError)}`,
    };
  }

  // Update couple start date if user is currently in a couple
  const { data: coupleId } = await supabase.rpc("current_couple_id");
  if (coupleId) {
    const { error: coupleError } = await supabase
      .from("couples")
      .update({ start_date: parsed.data.startDate })
      .eq("id", coupleId);

    if (coupleError) {
      return {
        success: false,
        error: `Không thể cập nhật ngày kỷ niệm: ${getErrorMessage(coupleError)}`,
      };
    }
  }

  revalidatePath("/settings");
  revalidatePath("/home");
  return {
    success: true,
  };
}
