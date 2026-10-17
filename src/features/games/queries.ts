import { createClient } from "@/lib/supabase/server";
import { DailyQuestionData, Game, Question, QuestionKind } from "@/types/play";

export async function getDailyQuestion(): Promise<DailyQuestionData | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 1. Get or create daily session via RPC
  const { data: session, error: sessionError } = await supabase.rpc(
    "get_or_create_daily_session"
  );

  if (sessionError || !session) {
    return null;
  }

  // 2. Fetch the question details
  const { data: question, error: questionError } = await supabase
    .from("questions")
    .select("*")
    .eq("id", session.question_id)
    .single();

  if (questionError || !question) {
    return null;
  }

  // 3. Fetch couple members to distinguish user vs partner
  const { data: members } = await supabase
    .from("couple_members")
    .select("user_id")
    .eq("couple_id", session.couple_id)
    .is("left_at", null);

  const memberIds = (members || []).map((m) => m.user_id);
  const partnerId = memberIds.find((id) => id !== user.id) || null;

  // Fetch profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", memberIds);

  const profilesMap = new Map((profiles || []).map((p) => [p.id, p]));
  const myProfile = profilesMap.get(user.id) || {
    id: user.id,
    display_name: "Bạn",
    avatar_url: null,
  };
  const partnerProfile = partnerId ? profilesMap.get(partnerId) || null : null;

  // 4. Fetch answers for this session (RLS safely filters visibility)
  const { data: answers } = await supabase
    .from("game_answers")
    .select("*")
    .eq("session_id", session.id);

  const answersList = answers || [];
  const myAnswer = answersList.find((a) => a.user_id === user.id) || null;
  const partnerAnswer = partnerId
    ? answersList.find((a) => a.user_id === partnerId) || null
    : null;

  let status: DailyQuestionData["status"] = "not_answered";
  if (myAnswer) {
    if (partnerAnswer || answersList.length >= 2 || session.status === "completed") {
      status = "completed";
    } else {
      status = "waiting_partner";
    }
  }

  return {
    session,
    question,
    myAnswer,
    partnerAnswer,
    status,
    partnerProfile,
    myProfile,
  };
}

export async function getRandomQuestion(options: {
  kind: QuestionKind;
  intimacyLevel?: number;
  excludeIds?: string[];
}): Promise<Question | null> {
  const supabase = await createClient();

  let query = supabase
    .from("questions")
    .select("*")
    .eq("kind", options.kind)
    .eq("is_active", true);

  if (options.intimacyLevel && options.intimacyLevel >= 1 && options.intimacyLevel <= 4) {
    query = query.eq("intimacy_level", options.intimacyLevel);
  }

  if (options.excludeIds && options.excludeIds.length > 0) {
    // Only exclude if list is reasonable in size
    const slice = options.excludeIds.slice(-20);
    query = query.not("id", "in", `(${slice.join(",")})`);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    // Fallback: query without exclusion
    const { data: fallback } = await supabase
      .from("questions")
      .select("*")
      .eq("kind", options.kind)
      .eq("is_active", true);

    if (!fallback || fallback.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * fallback.length);
    return fallback[randomIndex] as Question;
  }

  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex] as Question;
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as Game;
}
