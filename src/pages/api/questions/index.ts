import { type APIRoute } from "astro";
import { createQuestion, listQuestions } from "src/lib/services/questions.service";
import { CreateQuestionCommandSchema, ListQuestionsQuerySchema } from "src/lib/questions/validation";

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validationResult = ListQuestionsQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return new Response(JSON.stringify(validationResult.error.flatten()), { status: 400 });
    }

    const paginatedResponse = await listQuestions(locals.supabase, locals.user.id, validationResult.data);
    return new Response(JSON.stringify(paginatedResponse), { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return new Response("An unexpected error occurred.", { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const json = await request.json();
    const validationResult = CreateQuestionCommandSchema.safeParse(json);

    if (!validationResult.success) {
      return new Response(JSON.stringify(validationResult.error.flatten()), { status: 400 });
    }

    const newQuestion = await createQuestion(locals.supabase, locals.user.id, validationResult.data);

    return new Response(JSON.stringify(newQuestion), { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return new Response("An unexpected error occurred.", { status: 500 });
  }
};
