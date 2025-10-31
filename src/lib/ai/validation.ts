import { z } from "zod";

/**
 * Zod schema for validating the GenerateQuestionsCommand.
 * Validates that source_text is a required string with a minimum length of 1 and maximum of 10000 characters.
 */
export const generateQuestionsCommandSchema = z.object({
  source_text: z
    .string()
    .min(1, "Source text must not be blank")
    .max(10000, "Source text must not exceed 10,000 characters"),
});

/**
 * Zod schema for validating the SaveGeneratedQuestionsCommand.
 * Validates generation_log_id as a UUID, and questions as an array of at least one item with required question and edited fields, and optional answer.
 */
export const saveGeneratedQuestionsCommandSchema = z.object({
  generation_log_id: z.string().uuid(),
  questions: z
    .array(
      z.object({
        question: z.string().min(1).max(10000),
        edited: z.boolean(),
        answer: z.string().max(10000).optional(),
      })
    )
    .min(1),
});
