import { z } from "zod";

export const adminRandomItemSchema = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(["food", "drink", "place", "activity"], {
    message: "Danh mục phải là: Đồ ăn, Đồ uống, Địa điểm hoặc Trải nghiệm mới",
  }),
  title: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tiêu đề gợi ý")
    .max(120, "Tiêu đề không quá 120 ký tự"),
  description: z.string().trim().max(500, "Mô tả không quá 500 ký tự").optional().nullable(),
  tip: z.string().trim().max(300, "Mẹo không quá 300 ký tự").optional().nullable(),
  price_level: z.coerce
    .number()
    .int()
    .min(1, "Mức chi tiêu tối thiểu là 1")
    .max(4, "Mức chi tiêu tối đa là 4")
    .nullable()
    .optional(),
  price_per_person: z.coerce.number().int().nonnegative().nullable().optional(),
  image_url: z
    .string()
    .trim()
    .max(1000, "URL ảnh không quá 1000 ký tự")
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  map_url: z
    .string()
    .trim()
    .max(1000, "URL Google Maps không quá 1000 ký tự")
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  is_active: z.boolean().default(true),
});

export type AdminRandomItemInput = z.infer<typeof adminRandomItemSchema>;

export const adminVocabularyWordSchema = z.object({
  id: z.string().uuid().optional(),
  word: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập từ tiếng Anh")
    .max(80, "Từ không quá 80 ký tự"),
  ipa: z.string().trim().max(80, "Phiên âm không quá 80 ký tự").optional().nullable(),
  part_of_speech: z.enum(
    [
      "noun",
      "verb",
      "adjective",
      "adverb",
      "preposition",
      "conjunction",
      "pronoun",
      "interjection",
      "phrase",
      "other",
    ],
    { message: "Vui lòng chọn loại từ hợp lệ" }
  ),
  meaning_vi: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập nghĩa tiếng Việt")
    .max(250, "Nghĩa không quá 250 ký tự"),
  example_en: z.string().trim().max(300, "Ví dụ tiếng Anh không quá 300 ký tự").optional().nullable(),
  example_vi: z.string().trim().max(300, "Dịch ví dụ không quá 300 ký tự").optional().nullable(),
  topic: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập chủ đề")
    .max(50, "Chủ đề không quá 50 ký tự")
    .default("general"),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).nullable().optional(),
  collocations: z.string().trim().max(500, "Cụm từ không quá 500 ký tự").optional().nullable(),
  phrase: z.string().trim().max(300, "Cụm từ không quá 300 ký tự").optional().nullable(),
  sentence_en: z.string().trim().max(300, "Câu tiếng Anh không quá 300 ký tự").optional().nullable(),
  sentence_vi: z.string().trim().max(300, "Câu tiếng Việt không quá 300 ký tự").optional().nullable(),
  is_active: z.boolean().default(true),
});

export type AdminVocabularyWordInput = z.infer<typeof adminVocabularyWordSchema>;

export const adminQuestionSchema = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(["daily", "truth", "dare"], {
    message: "Loại câu hỏi: daily (Mỗi ngày), truth (Nói thật), dare (Thử thách)",
  }),
  category: z.enum(["fun", "discover", "emotion", "deep"], {
    message: "Nhóm câu hỏi: fun (Vui vẻ), discover (Tìm hiểu), emotion (Cảm xúc), deep (Sâu sắc)",
  }),
  intimacy_level: z.coerce
    .number()
    .int()
    .min(1, "Mức độ thân mật tối thiểu là 1")
    .max(4, "Mức độ thân mật tối đa là 4")
    .default(1),
  text: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập nội dung câu hỏi")
    .max(500, "Nội dung câu hỏi không quá 500 ký tự"),
  is_active: z.boolean().default(true),
});

export type AdminQuestionInput = z.infer<typeof adminQuestionSchema>;

export const adminUpdateUserSchema = z.object({
  userId: z.string().uuid("ID người dùng không hợp lệ"),
  displayName: z
    .string()
    .trim()
    .min(1, "Tên hiển thị không được để trống")
    .max(50, "Tên không quá 50 ký tự"),
});

export const adminPriceLevelConfigSchema = z.object({
  level: z.number().int().min(1).max(4),
  label: z.string().trim().min(1, "Vui lòng nhập tên nhãn mức giá").max(50),
  badge: z.string().trim().min(1, "Vui lòng nhập huy hiệu").max(50),
  rangeText: z.string().trim().min(1, "Vui lòng nhập khoảng giá hiển thị").max(100),
  minCost: z.number().nonnegative().nullable().optional(),
  maxCost: z.number().nonnegative().nullable().optional(),
  description: z.string().trim().min(1, "Vui lòng nhập mô tả hoặc gợi ý").max(500),
});

export const adminPriceLevelConfigsListSchema = z.array(adminPriceLevelConfigSchema).length(4, "Cần cấu hình đủ 4 mức giá");
