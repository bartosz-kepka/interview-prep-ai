import type { APIRoute } from "astro";
import { generateQuestionsCommandSchema } from "@/lib/ai/validation.ts";
import { generateQuestions } from "@/lib/ai/generation.service.ts";
import { BadGatewayError } from "@/lib/errors.ts";

/**
 * POST handler for generating interview questions from a job offer text using AI.
 * This endpoint validates the input, processes the request through the AI generation service,
 * and returns the generated question proposals along with the generation log ID.
 *
 * @param params - The destructured API context with request and locals.
 * @returns A Response object with the generation result or an error message.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  // Handle errors and edge cases at the beginning.
  try {
    // Parse the request body as JSON.
    const body = await request.json();

    // Validate the request body using the Zod schema.
    const validation = generateQuestionsCommandSchema.safeParse(body);
    if (!validation.success) {
      // Return a 400 Bad Request response with validation errors.
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validation.error.errors.map((err) => err.message),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { source_text } = validation.data;

    // Retrieve the Supabase client from context.locals.
    const supabase = locals.supabase;
    const userId = locals.user.id;

    // Call the generateQuestions service function.
    const result = await generateQuestions(source_text, userId, supabase);

    // Return a 200 OK response with the GenerateQuestionsResponseDto.
    return new Response(JSON.stringify(result), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    // Handle different types of errors with appropriate HTTP status codes.
    console.error("Error in generate-questions endpoint:", error);
    if (error instanceof BadGatewayError) {
      return new Response(JSON.stringify({ error: "Bad Gateway" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
};

// Disable prerendering for this API route.
export const prerender = false;
