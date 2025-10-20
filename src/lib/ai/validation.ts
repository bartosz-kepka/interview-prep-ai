import { z } from 'zod';

/**
 * Zod schema for validating the GenerateQuestionsCommand.
 * Validates that source_text is a required string with a minimum length of 1 and maximum of 10000 characters.
 */
export const generateQuestionsCommandSchema = z.object({
  source_text: z.string().min(1, 'Source text must not be blank').max(10000, 'Source text must not exceed 10,000 characters'),
});
