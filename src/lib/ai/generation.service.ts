import type { SupabaseClient } from "@/db/supabase.client.ts";
import type { TablesInsert } from "@/db/database.types.ts";
import { BadGatewayError, InternalServerError } from "../errors";
import { OpenRouterService } from "./openrouter.service";
import { z } from "zod";
import { OPENROUTER_API_KEY as openRouterApiKey } from "astro:env/server";
import type { GenerateQuestionsResponseDto } from "@/types";

/**
 * Zod schema for the AI-generated questions response.
 */
const QuestionsSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe("The generated interview question."),
    })
  ),
});

/**
 * Generates interview questions from the provided source text using an AI service.
 * This function handles logging the generation process and calling the OpenRouter AI service.
 */
export const generateQuestions = async (
  source_text: string,
  userId: string,
  supabase: SupabaseClient
): Promise<GenerateQuestionsResponseDto> => {
  // Step 1: Create Log
  // Insert a new record into ai_generation_logs with the user ID and the prompt (source_text).
  const logInsert: TablesInsert<"ai_generation_logs"> = {
    user_id: userId,
    prompt: source_text,
  };

  const { data: logData, error: logError } = await supabase
    .from("ai_generation_logs")
    .insert(logInsert)
    .select("id")
    .single();

  if (logError) {
    throw new InternalServerError(`Failed to create generation log: ${logError.message}`);
  }

  const generation_log_id = logData.id;

  try {
    // Step 2: Call AI using OpenRouterService
    if (!openRouterApiKey) {
      throw new InternalServerError("OpenRouter API key is not configured");
    }

    const openRouterService = new OpenRouterService(openRouterApiKey);

    const aiResponse = await openRouterService.generateStructuredResponse({
      systemMessage: `Act as an expert interviewer and hiring manager for a top-tier company. Your goal is to formulate a list of thought-provoking interview questions based on the context provided by the user.

The questions must be:
- **Targeted:** Directly related to the technologies, skills, and concepts in the user's text.
- **In-depth:** Go beyond surface-level knowledge. Ask about trade-offs, architecture, and problem-solving approaches.
- **Open-ended:** Encourage detailed, conceptual answers. Avoid yes/no or simple factual questions.
- **Practical:** Relate to real-world scenarios and challenges.

Generate a list of 5 to 10 high-quality questions. Ensure they are phrased clearly and professionally.`,
      userMessage: source_text,
      schema: QuestionsSchema,
    });

    // Step 3: Handle Response - Success
    // Update the log record with success status, finished_at timestamp, and the raw response.
    const logUpdate = {
      status: "success" as const,
      finished_at: new Date().toISOString(),
      response: JSON.stringify(aiResponse),
    };

    const { error: updateError } = await supabase
      .from("ai_generation_logs")
      .update(logUpdate)
      .eq("id", generation_log_id);

    if (updateError) {
      throw new InternalServerError(`Failed to update generation log: ${updateError.message}`);
    }

    // Return the parsed question proposals and the log ID.
    return {
      generation_log_id,
      question_proposals: aiResponse.questions,
    };
  } catch (aiError) {
    // Step 3: Handle Response - Failure
    // Update the log record with error status, finished_at timestamp, and error details.
    const logUpdate = {
      status: "error" as const,
      finished_at: new Date().toISOString(),
      error_details: aiError instanceof Error ? aiError.message : "Unknown AI error",
    };

    await supabase.from("ai_generation_logs").update(logUpdate).eq("id", generation_log_id);

    // Re-throw a custom error to be handled by the API route.
    throw new BadGatewayError("AI service failed to generate questions");
  }
};
