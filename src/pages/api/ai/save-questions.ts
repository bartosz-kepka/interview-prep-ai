import type { APIRoute } from "astro";
import { saveGeneratedQuestions } from "../../../lib/services/questions.service";
import type { SaveGeneratedQuestionsCommand, SaveGeneratedQuestionsResponseDto } from "../../../types";
import { NotFoundError, UnprocessableEntityError } from "../../../lib/errors";
import { saveGeneratedQuestionsCommandSchema } from "../../../lib/ai/validation";
import { z } from "zod";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const command: SaveGeneratedQuestionsCommand = saveGeneratedQuestionsCommandSchema.parse(body);

    // Call the service
    const savedQuestionIds = await saveGeneratedQuestions(locals.supabase, locals.user.id, command);

    // Return success response
    const response: SaveGeneratedQuestionsResponseDto = {
      saved_question_ids: savedQuestionIds,
    };
    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Invalid request body", details: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (error instanceof NotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (error instanceof UnprocessableEntityError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Unexpected error
    console.error("Unexpected error in save-questions endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
