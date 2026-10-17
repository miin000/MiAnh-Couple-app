import { createClient } from "@/lib/supabase/server";
import { DailyLessonViewData, LessonWordItem, PartnerProgress } from "@/types/learn";

export async function getTodaysLesson(): Promise<DailyLessonViewData | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 1. Get or create today's lesson via RPC
  let { data: lesson, error: lessonError } = await supabase.rpc(
    "get_or_create_todays_lesson"
  );

  // Fallback to get_todays_lesson if get_or_create_todays_lesson is not yet migrated
  if (lessonError || !lesson) {
    const fallback = await supabase.rpc("get_todays_lesson");
    if (fallback.data) {
      lesson = fallback.data;
      lessonError = null;
    }
  }

  if (lessonError || !lesson) {
    return null;
  }

  // 2. Fetch lesson words with full vocabulary details
  const { data: lessonWordsData, error: wordsError } = await supabase
    .from("lesson_words")
    .select(`
      position,
      word_id,
      vocabulary_words (
        id,
        external_key,
        word,
        ipa,
        part_of_speech,
        meaning_vi,
        example_en,
        example_vi,
        topic,
        level,
        is_active
      )
    `)
    .eq("lesson_id", lesson.id)
    .order("position", { ascending: true });

  if (wordsError || !lessonWordsData || lessonWordsData.length === 0) {
    return null;
  }

  const wordIds = lessonWordsData.map((lw) => lw.word_id);

  // 3. Fetch collocations for all words in this lesson
  const { data: collocationsData } = await supabase
    .from("vocabulary_collocations")
    .select("word_id, phrase, position")
    .in("word_id", wordIds)
    .order("position", { ascending: true });

  const collocationsByWord = new Map<string, string[]>();
  for (const c of collocationsData || []) {
    const arr = collocationsByWord.get(c.word_id) || [];
    arr.push(c.phrase);
    collocationsByWord.set(c.word_id, arr);
  }

  // 4. Fetch current user's progress for these words
  const { data: userProgressData } = await supabase
    .from("user_word_progress")
    .select("word_id, status, box, next_review_at, correct_count, wrong_count")
    .eq("user_id", user.id)
    .in("word_id", wordIds);

  const progressByWord = new Map<string, {
    status: "new" | "learning" | "review" | "mastered";
    box: number;
    next_review_at: string | null;
    correct_count: number;
    wrong_count: number;
  }>();

  for (const p of userProgressData || []) {
    progressByWord.set(p.word_id, {
      status: p.status,
      box: p.box,
      next_review_at: p.next_review_at,
      correct_count: p.correct_count,
      wrong_count: p.wrong_count,
    });
  }

  // 5. Build words list
  const words: LessonWordItem[] = lessonWordsData.map((lw) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = lw.vocabulary_words as any;
    return {
      id: w.id,
      external_key: w.external_key,
      word: w.word,
      ipa: w.ipa,
      part_of_speech: w.part_of_speech,
      meaning_vi: w.meaning_vi,
      example_en: w.example_en,
      example_vi: w.example_vi,
      topic: w.topic,
      level: w.level,
      position: lw.position,
      collocations: collocationsByWord.get(w.id) || [],
      user_progress: progressByWord.get(w.id) || null,
    };
  });

  // 6. Fetch partner progress summary via RPC
  const { data: progressSummaries } = await supabase.rpc(
    "partner_progress_summary",
    { p_lesson_id: lesson.id }
  );

  // 7. Get couple members profiles
  const { data: memberRows } = await supabase
    .from("couple_members")
    .select("user_id, couple_id")
    .eq("user_id", user.id)
    .is("left_at", null)
    .single();

  let partnerId: string | null = null;
  if (memberRows?.couple_id) {
    const { data: coupleMembers } = await supabase
      .from("couple_members")
      .select("user_id")
      .eq("couple_id", memberRows.couple_id)
      .is("left_at", null);

    partnerId = (coupleMembers || []).find((m) => m.user_id !== user.id)?.user_id || null;
  }

  const memberIds = [user.id];
  if (partnerId) memberIds.push(partnerId);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", memberIds);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mySummary = (progressSummaries || []).find((s: any) => s.user_id === user.id);
  const partnerSummary = partnerId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (progressSummaries || []).find((s: any) => s.user_id === partnerId)
    : null;

  const myProgress: PartnerProgress = {
    user_id: user.id,
    display_name: profileMap.get(user.id)?.display_name || "Tôi",
    avatar_url: profileMap.get(user.id)?.avatar_url || null,
    learned_count: mySummary?.learned_count ?? words.filter((w) => w.user_progress !== null).length,
    mastered_count: mySummary?.mastered_count ?? 0,
    total_words: words.length,
  };

  const partnerProgress: PartnerProgress | null = partnerId
    ? {
        user_id: partnerId,
        display_name: profileMap.get(partnerId)?.display_name || "Người ấy",
        avatar_url: profileMap.get(partnerId)?.avatar_url || null,
        learned_count: partnerSummary?.learned_count ?? 0,
        mastered_count: partnerSummary?.mastered_count ?? 0,
        total_words: words.length,
      }
    : null;

  return {
    lesson,
    words,
    myProgress,
    partnerProgress,
    currentUserId: user.id,
  };
}

export async function getDueReviewWords(): Promise<import("@/types/learn").DueReviewItem[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("user_word_progress")
    .select(`
      user_id,
      word_id,
      status,
      box,
      next_review_at,
      correct_count,
      wrong_count,
      vocabulary_words (
        id,
        external_key,
        word,
        ipa,
        part_of_speech,
        meaning_vi,
        example_en,
        example_vi,
        topic,
        level,
        is_active,
        created_at,
        updated_at
      )
    `)
    .eq("user_id", user.id)
    .lte("next_review_at", nowIso)
    .order("next_review_at", { ascending: true });

  if (error || !data) {
    console.error("Error fetching due review words:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((item: any) => ({
    user_id: item.user_id,
    word_id: item.word_id,
    status: item.status,
    box: item.box,
    next_review_at: item.next_review_at,
    correct_count: item.correct_count,
    wrong_count: item.wrong_count,
    word: item.vocabulary_words,
  }));
}

export async function getCoupleChallenge(): Promise<import("@/types/learn").CoupleChallengeViewData | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: challenge, error: challengeErr } = await supabase.rpc(
    "get_or_create_daily_challenge"
  );

  if (challengeErr || !challenge) {
    return null;
  }

  const { data: memberRows } = await supabase
    .from("couple_members")
    .select("user_id, couple_id")
    .eq("user_id", user.id)
    .is("left_at", null)
    .single();

  let partnerInfo: { userId: string; displayName: string; avatarUrl: string | null } | null = null;
  if (memberRows?.couple_id) {
    const { data: coupleMembers } = await supabase
      .from("couple_members")
      .select("user_id, profiles(id, display_name, avatar_url)")
      .eq("couple_id", memberRows.couple_id)
      .is("left_at", null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pMember = (coupleMembers || []).find((m: any) => m.user_id !== user.id);
    if (pMember && pMember.profiles) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prof = pMember.profiles as any;
      partnerInfo = {
        userId: prof.id,
        displayName: prof.display_name || "Người ấy",
        avatarUrl: prof.avatar_url,
      };
    }
  }

  const { data: submissionsData } = await supabase
    .from("learning_challenge_submissions")
    .select(`
      id,
      challenge_id,
      couple_id,
      user_id,
      content,
      created_at,
      profiles (
        display_name,
        avatar_url
      )
    `)
    .eq("challenge_id", challenge.id);

  interface SubRow {
    id: string;
    challenge_id: string;
    couple_id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles?: {
      display_name: string | null;
      avatar_url: string | null;
    } | null;
  }

  const typedSubs = (submissionsData || []) as unknown as SubRow[];
  const mySubRow = typedSubs.find((s) => s.user_id === user.id);
  const partnerSubRow = partnerInfo
    ? typedSubs.find((s) => s.user_id === partnerInfo?.userId)
    : null;

  let partnerHasSubmitted = !!partnerSubRow;
  if (!partnerHasSubmitted && partnerInfo) {
    const { data: statusRows } = await supabase.rpc("get_challenge_status", {
      p_challenge_id: challenge.id,
    });
    if (statusRows && Array.isArray(statusRows)) {
      interface StatusRow {
        user_id: string;
        has_submitted: boolean;
      }
      const typedStatus = statusRows as unknown as StatusRow[];
      const pStatus = typedStatus.find((r) => r.user_id === partnerInfo?.userId);
      if (pStatus?.has_submitted) {
        partnerHasSubmitted = true;
      }
    }
  }

  const mySubmission = mySubRow
    ? {
        id: mySubRow.id,
        challenge_id: mySubRow.challenge_id,
        couple_id: mySubRow.couple_id,
        user_id: mySubRow.user_id,
        content: mySubRow.content,
        created_at: mySubRow.created_at,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        display_name: (mySubRow.profiles as any)?.display_name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        avatar_url: (mySubRow.profiles as any)?.avatar_url,
      }
    : null;

  const partnerSubmission = partnerSubRow
    ? {
        id: partnerSubRow.id,
        challenge_id: partnerSubRow.challenge_id,
        couple_id: partnerSubRow.couple_id,
        user_id: partnerSubRow.user_id,
        content: partnerSubRow.content,
        created_at: partnerSubRow.created_at,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        display_name: (partnerSubRow.profiles as any)?.display_name || partnerInfo?.displayName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        avatar_url: (partnerSubRow.profiles as any)?.avatar_url || partnerInfo?.avatarUrl,
      }
    : null;

  const isUnlocked = !!mySubmission && (!!partnerSubmission || partnerHasSubmitted);

  return {
    challenge: {
      id: challenge.id,
      couple_id: challenge.couple_id,
      lesson_id: challenge.lesson_id,
      challenge_date: challenge.challenge_date,
      challenge_type: challenge.challenge_type,
      prompt: challenge.prompt,
      created_at: challenge.created_at,
    },
    mySubmission,
    partnerSubmission,
    partnerInfo,
    isUnlocked,
    partnerHasSubmitted,
  };
}

export async function getLearnStats(): Promise<import("@/types/learn").CoupleLearnStatsViewData | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Thử gọi RPC get_couple_learning_stats nếu có
  const { data: rpcStats, error: rpcErr } = await supabase.rpc(
    "get_couple_learning_stats"
  );

  if (!rpcErr && rpcStats) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = rpcStats as any;
    return {
      myStats: {
        totalLearned: raw.my_stats?.total_learned || 0,
        masteredCount: raw.my_stats?.mastered_count || 0,
        dueReviewsCount: raw.my_stats?.due_reviews_count || 0,
        boxes: {
          b1: raw.my_stats?.boxes?.box_1 || 0,
          b2: raw.my_stats?.boxes?.box_2 || 0,
          b3: raw.my_stats?.boxes?.box_3 || 0,
          b4: raw.my_stats?.boxes?.box_4 || 0,
          b5: raw.my_stats?.boxes?.box_5 || 0,
        },
        latestQuiz: raw.my_stats?.latest_quiz
          ? {
              total: raw.my_stats.latest_quiz.total,
              correct: raw.my_stats.latest_quiz.correct,
              kind: raw.my_stats.latest_quiz.kind || "lesson",
              createdAt: raw.my_stats.latest_quiz.created_at,
            }
          : null,
      },
      partnerStats: raw.partner_stats
        ? {
            userId: raw.partner_stats.user_id,
            displayName: raw.partner_stats.display_name || "Người ấy",
            avatarUrl: raw.partner_stats.avatar_url || null,
            totalLearned: raw.partner_stats.total_learned || 0,
            masteredCount: raw.partner_stats.mastered_count || 0,
            latestQuiz: raw.partner_stats.latest_quiz
              ? {
                  total: raw.partner_stats.latest_quiz.total,
                  correct: raw.partner_stats.latest_quiz.correct,
                  kind: raw.partner_stats.latest_quiz.kind || "lesson",
                  createdAt: raw.partner_stats.latest_quiz.created_at,
                }
              : null,
          }
        : null,
    };
  }

  // 2. Fallback an toàn
  const nowIso = new Date().toISOString();
  const { data: myProgress } = await supabase
    .from("user_word_progress")
    .select("status, box, next_review_at")
    .eq("user_id", user.id);

  const boxes = { b1: 0, b2: 0, b3: 0, b4: 0, b5: 0 };
  let masteredCount = 0;
  let dueReviewsCount = 0;

  for (const item of myProgress || []) {
    if (item.box === 1) boxes.b1++;
    else if (item.box === 2) boxes.b2++;
    else if (item.box === 3) boxes.b3++;
    else if (item.box === 4) boxes.b4++;
    else if (item.box === 5) boxes.b5++;

    if (item.status === "mastered" || item.box === 5) masteredCount++;
    if (item.next_review_at && item.next_review_at <= nowIso) dueReviewsCount++;
  }

  const { data: latestQuizData } = await supabase
    .from("vocabulary_quiz_attempts")
    .select("total, correct, kind, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: memberRows } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .is("left_at", null)
    .single();

  let partnerStats: import("@/types/learn").PartnerLearnStats | null = null;
  if (memberRows?.couple_id) {
    const { data: members } = await supabase
      .from("couple_members")
      .select("user_id, profiles(id, display_name, avatar_url)")
      .eq("couple_id", memberRows.couple_id)
      .is("left_at", null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pMember = (members || []).find((m: any) => m.user_id !== user.id);
    if (pMember && pMember.profiles) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prof = pMember.profiles as any;
      partnerStats = {
        userId: prof.id,
        displayName: prof.display_name || "Người ấy",
        avatarUrl: prof.avatar_url || null,
        totalLearned: 0,
        masteredCount: 0,
        latestQuiz: null,
      };
    }
  }

  return {
    myStats: {
      totalLearned: myProgress?.length || 0,
      masteredCount,
      dueReviewsCount,
      boxes,
      latestQuiz: latestQuizData
        ? {
            total: latestQuizData.total,
            correct: latestQuizData.correct,
            kind: latestQuizData.kind,
            createdAt: latestQuizData.created_at,
          }
        : null,
    },
    partnerStats,
  };
}


