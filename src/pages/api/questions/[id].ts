import { type APIRoute } from "astro";
import { getQuestionById, updateQuestion, deleteQuestion } from "src/lib/services/questions.service";
import { QuestionIdSchema, UpdateQuestionCommandSchema } from "src/lib/questions/validation";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  if (!locals.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const idValidationResult = QuestionIdSchema.safeParse(params.id);

  if (!idValidationResult.success) {
    return new Response(JSON.stringify(idValidationResult.error.flatten()), { status: 400 });
  }

  try {
    const question = await getQuestionById(locals.supabase, locals.user.id, idValidationResult.data);
    return new Response(JSON.stringify(question), { status: 200 });
  } catch (error: any) {
    if (error.name === "NotFoundError") {
      return new Response(error.message, { status: 404 });
    }
    console.error(error);
    return new Response("An unexpected error occurred.", { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  if (!locals.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const idValidationResult = QuestionIdSchema.safeParse(params.id);

  if (!idValidationResult.success) {
    return new Response(JSON.stringify(idValidationResult.error.flatten()), { status: 400 });
  }

  try {
    const json = await request.json();
    const bodyValidationResult = UpdateQuestionCommandSchema.safeParse(json);

    if (!bodyValidationResult.success) {
      return new Response(JSON.stringify(bodyValidationResult.error.flatten()), { status: 400 });
    }

    const updatedQuestion = await updateQuestion(
      locals.supabase,
      locals.user.id,
      idValidationResult.data,
      bodyValidationResult.data
    );

    return new Response(JSON.stringify(updatedQuestion), { status: 200 });
  } catch (error: any) {
    if (error.name === "UnprocessableEntityError") {
      return new Response(error.message, { status: 422 });
    }
    console.error(error);
    return new Response("An unexpected error occurred.", { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const idValidationResult = QuestionIdSchema.safeParse(params.id);

  if (!idValidationResult.success) {
    return new Response(JSON.stringify(idValidationResult.error.flatten()), { status: 400 });
  }

  try {
    await deleteQuestion(locals.supabase, locals.user.id, idValidationResult.data);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    if (error.name === "UnprocessableEntityError") {
      return new Response(error.message, { status: 422 });
    }
    console.error(error);
    return new Response("An unexpected error occurred.", { status: 500 });
  }
};
