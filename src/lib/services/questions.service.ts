import type { SupabaseClient } from "../../db/supabase.client";
import type {
  CreateQuestionCommand,
  CreateQuestionResponseDto,
  ListQuestionsQuery,
  PaginatedQuestionsResponseDto,
  QuestionDto,
  SaveGeneratedQuestionsCommand,
  UpdateQuestionCommand,
  UpdateQuestionResponseDto,
} from "../../types";
import type { TablesInsert } from "../../db/database.types";
import { NotFoundError, UnprocessableEntityError } from "../errors";

/**
 * Saves AI-generated questions to the database.
 * Verifies the generation_log_id belongs to the user, then inserts the questions.
 */
export const saveGeneratedQuestions = async (
  supabase: SupabaseClient,
  userId: string,
  command: SaveGeneratedQuestionsCommand
): Promise<string[]> => {
  // Check if generation_log_id exists and belongs to the user
  const { data: log, error: logError } = await supabase
    .from("ai_generation_logs")
    .select("id")
    .eq("id", command.generation_log_id)
    .eq("user_id", userId)
    .single();

  if (logError || !log) {
    throw new NotFoundError("Generation log not found or does not belong to the user.");
  }

  // Map questions to insert objects
  const questionsToInsert: TablesInsert<"questions">[] = command.questions.map((q) => ({
    user_id: userId,
    generation_log_id: command.generation_log_id,
    question: q.question,
    answer: q.answer || null,
    source: q.edited ? "ai-edited" : "ai",
  }));

  // Bulk insert questions
  const { data: insertedQuestions, error: insertError } = await supabase
    .from("questions")
    .insert(questionsToInsert)
    .select("id");

  if (insertError) {
    throw new UnprocessableEntityError("Failed to save questions to the database.");
  }

  // Return the IDs of the saved questions
  return insertedQuestions.map((q) => q.id);
};

/**
 * Creates a new question for a user.
 */
export const createQuestion = async (
  supabase: SupabaseClient,
  userId: string,
  command: CreateQuestionCommand
): Promise<CreateQuestionResponseDto> => {
  const { data, error } = await supabase
    .from("questions")
    .insert([
      {
        user_id: userId,
        question: command.question,
        answer: command.answer ?? null,
        source: "user",
      },
    ])
    .select("id, question, answer, source, created_at")
    .single();

  if (error) {
    throw new UnprocessableEntityError("Failed to create the question.");
  }

  return data;
};

/**
 * Retrieves a single question by its ID for a specific user.
 */
export const getQuestionById = async (
  supabase: SupabaseClient,
  userId: string,
  questionId: string
): Promise<QuestionDto> => {
  const { data, error } = await supabase
    .from("questions")
    .select("id, question, answer, source, created_at, updated_at")
    .eq("id", questionId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Question not found.");
  }

  return data;
};

/**
 * Updates a question for a specific user.
 */
export const updateQuestion = async (
  supabase: SupabaseClient,
  userId: string,
  questionId: string,
  command: UpdateQuestionCommand
): Promise<UpdateQuestionResponseDto> => {
  const { data, error } = await supabase
    .from("questions")
    .update({
      ...command,
    })
    .eq("id", questionId)
    .eq("user_id", userId)
    .select("id, question, answer, source, created_at")
    .single();

  if (error) {
    throw new UnprocessableEntityError("Failed to update the question.");
  }

  return data;
};

/**
 * Deletes a question for a specific user.
 */
export const deleteQuestion = async (supabase: SupabaseClient, userId: string, questionId: string): Promise<void> => {
  const { error } = await supabase.from("questions").delete().eq("id", questionId).eq("user_id", userId);

  if (error) {
    throw new UnprocessableEntityError("Failed to delete the question.");
  }
};

/**
 * Lists questions for a user with pagination, sorting, and search.
 */
export const listQuestions = async (
  supabase: SupabaseClient,
  userId: string,
  query: ListQuestionsQuery
): Promise<PaginatedQuestionsResponseDto> => {
  const { page, page_size, sort_by, sort_order, search } = query;
  const rangeFrom = (page - 1) * page_size;
  const rangeTo = rangeFrom + page_size - 1;

  let rpcQuery = supabase.from("questions").select("*", { count: "exact" }).eq("user_id", userId);

  if (search) {
    rpcQuery = rpcQuery.ilike("question", `%${search}%`);
  }

  rpcQuery = rpcQuery.order(sort_by, { ascending: sort_order === "asc" }).range(rangeFrom, rangeTo);

  const { data, error, count } = await rpcQuery;

  if (error) {
    throw new UnprocessableEntityError("Failed to retrieve questions.");
  }

  const totalItems = count ?? 0;
  const totalPages = Math.ceil(totalItems / page_size);

  return {
    data: data ?? [],
    pagination: {
      page,
      page_size,
      total_items: totalItems,
      total_pages: totalPages,
    },
  };
};
