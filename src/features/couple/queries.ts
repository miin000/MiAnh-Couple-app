import { createClient } from "@/lib/supabase/server";

export interface CoupleMemberInfo {
  user_id: string;
  display_name: string;
  avatar_url?: string | null;
  joined_at: string;
  is_me: boolean;
}

export interface CurrentCoupleData {
  couple_id: string;
  start_date: string | null;
  timezone: string;
  member_count: number;
  members: CoupleMemberInfo[];
  active_invite?: {
    id: string;
    code: string;
    expires_at: string;
  } | null;
}

export async function getCurrentCouple(): Promise<CurrentCoupleData | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Check current couple id via RPC
  const { data: coupleId, error: rpcError } = await supabase.rpc(
    "current_couple_id"
  );

  if (rpcError || !coupleId) {
    return null;
  }

  // Fetch couple info
  const { data: couple, error: coupleError } = await supabase
    .from("couples")
    .select("id, start_date, timezone")
    .eq("id", coupleId)
    .single();

  if (coupleError || !couple) {
    return null;
  }

  // Fetch active members
  const { data: membersRows, error: membersError } = await supabase
    .from("couple_members")
    .select("user_id, joined_at")
    .eq("couple_id", coupleId)
    .is("left_at", null);

  if (membersError || !membersRows) {
    return null;
  }

  const memberIds = membersRows.map((m) => m.user_id);
  const { data: profilesRows } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", memberIds);

  const profilesMap = new Map(
    (profilesRows || []).map((p) => [p.id, p])
  );

  const members: CoupleMemberInfo[] = membersRows.map((m) => {
    const prof = profilesMap.get(m.user_id);
    return {
      user_id: m.user_id,
      display_name: prof?.display_name || "Thành viên",
      avatar_url: prof?.avatar_url || null,
      joined_at: m.joined_at,
      is_me: m.user_id === user.id,
    };
  });

  // Fetch latest active invitation if only 1 member
  let activeInvite: CurrentCoupleData["active_invite"] = null;
  if (members.length < 2) {
    const { data: inviteRows } = await supabase
      .from("invitations")
      .select("id, code, expires_at, used_count, max_uses, revoked_at")
      .eq("couple_id", coupleId)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (inviteRows && inviteRows.length > 0) {
      const inv = inviteRows[0];
      if (inv.used_count < inv.max_uses) {
        activeInvite = {
          id: inv.id,
          code: inv.code,
          expires_at: inv.expires_at,
        };
      }
    }
  }

  return {
    couple_id: couple.id,
    start_date: couple.start_date,
    timezone: couple.timezone || "Asia/Ho_Chi_Minh",
    member_count: members.length,
    members,
    active_invite: activeInvite,
  };
}