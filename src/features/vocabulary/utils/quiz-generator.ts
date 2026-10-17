import { QuizOption, QuizQuestion, QuizQuestionType, PartOfSpeech } from "@/types/learn";

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface WordLike {
  id: string;
  word: string;
  meaning_vi: string;
  ipa?: string | null;
  part_of_speech?: string | null;
  example_en?: string | null;
  example_vi?: string | null;
}

export function generateQuizQuestions(
  targetWords: WordLike[],
  allAvailableWords?: WordLike[]
): QuizQuestion[] {
  if (!targetWords || targetWords.length === 0) return [];

  const pool = allAvailableWords && allAvailableWords.length >= 4 ? allAvailableWords : targetWords;

  const typesSequence: QuizQuestionType[] = [
    "choose_meaning",
    "choose_word",
    "fill_blank",
    "choose_meaning",
    "choose_word",
    "fill_blank",
    "choose_meaning",
    "choose_word",
    "fill_blank",
    "choose_meaning",
  ];

  return targetWords.map((wordItem, index) => {
    let qType = typesSequence[index % typesSequence.length];

    const hasExample =
      Boolean(wordItem.example_en) &&
      (wordItem.example_en || "").toLowerCase().includes(wordItem.word.toLowerCase());

    if (qType === "fill_blank" && !hasExample) {
      qType = index % 2 === 0 ? "choose_meaning" : "choose_word";
    }

    const otherWords = pool.filter((w) => w.id !== wordItem.id);
    const shuffledOthers = shuffleArray(otherWords);
    const distractorWords = shuffledOthers.slice(0, 3);
    const pos = (wordItem.part_of_speech || "other") as PartOfSpeech;

    if (qType === "choose_meaning") {
      const correctOption: QuizOption = {
        id: `opt-${wordItem.id}-correct`,
        text: wordItem.meaning_vi,
        isCorrect: true,
      };

      const distractorOptions: QuizOption[] = distractorWords.map((dw) => ({
        id: `opt-${dw.id}-wrong`,
        text: dw.meaning_vi,
        isCorrect: false,
      }));

      const options = shuffleArray([correctOption, ...distractorOptions]);

      return {
        id: `q-${wordItem.id}-${index}`,
        wordId: wordItem.id,
        word: wordItem.word,
        ipa: wordItem.ipa,
        partOfSpeech: pos,
        type: "choose_meaning",
        prompt: `Nghĩa tiếng Việt của từ "${wordItem.word}" là gì?`,
        contextSentence: wordItem.ipa ? `Phát âm: ${wordItem.ipa}` : undefined,
        options,
        correctAnswerText: wordItem.meaning_vi,
        explanation: `"${wordItem.word}" nghĩa là: ${wordItem.meaning_vi}`,
      };
    } else if (qType === "choose_word") {
      const correctOption: QuizOption = {
        id: `opt-${wordItem.id}-correct`,
        text: wordItem.word,
        isCorrect: true,
      };

      const distractorOptions: QuizOption[] = distractorWords.map((dw) => ({
        id: `opt-${dw.id}-wrong`,
        text: dw.word,
        isCorrect: false,
      }));

      const options = shuffleArray([correctOption, ...distractorOptions]);

      return {
        id: `q-${wordItem.id}-${index}`,
        wordId: wordItem.id,
        word: wordItem.word,
        ipa: wordItem.ipa,
        partOfSpeech: pos,
        type: "choose_word",
        prompt: `Từ tiếng Anh nào mang nghĩa "${wordItem.meaning_vi}"?`,
        options,
        correctAnswerText: wordItem.word,
        explanation: `"${wordItem.word}" có nghĩa là: ${wordItem.meaning_vi}`,
      };
    } else {
      const rawExample = wordItem.example_en || "";
      const regex = new RegExp(`\\b${wordItem.word}(?:ed|ing|s|es)?\\b`, "gi");
      const blankSentence = rawExample.replace(regex, "______");

      const correctOption: QuizOption = {
        id: `opt-${wordItem.id}-correct`,
        text: wordItem.word,
        isCorrect: true,
      };

      const distractorOptions: QuizOption[] = distractorWords.map((dw) => ({
        id: `opt-${dw.id}-wrong`,
        text: dw.word,
        isCorrect: false,
      }));

      const options = shuffleArray([correctOption, ...distractorOptions]);

      return {
        id: `q-${wordItem.id}-${index}`,
        wordId: wordItem.id,
        word: wordItem.word,
        ipa: wordItem.ipa,
        partOfSpeech: pos,
        type: "fill_blank",
        prompt: "Chọn từ thích hợp để điền vào chỗ trống:",
        contextSentence: blankSentence,
        options,
        correctAnswerText: wordItem.word,
        explanation: `Câu hoàn chỉnh: "${wordItem.example_en}" (${wordItem.example_vi || ""})`,
      };
    }
  });
}

