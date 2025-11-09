import { z } from "zod";

export const QuestionIdSchema = z.string().uuid({
  message: "Invalid question ID.",
});

export const CreateQuestionCommandSchema = z.object({
  question: z.string().min(1, { message: "Question cannot be empty." }).max(10000),
  answer: z.string().max(10000).optional(),
});

export const UpdateQuestionCommandSchema = z
  .object({
    question: z.string().min(1, { message: "Question cannot be empty." }).max(10000).optional(),
    answer: z.string().max(10000).optional(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update.",
  });

export const ListQuestionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  page_size: z.coerce.number().int().positive().optional().default(10),
  sort_by: z.string().optional().default("created_at"),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
  search: z.string().optional(),
});
