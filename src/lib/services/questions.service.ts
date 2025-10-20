import type { SupabaseClient } from '../db/supabase.client';
import type { SaveGeneratedQuestionsCommand } from '../types';
import type { TablesInsert } from '../db/database.types';
import { NotFoundError, UnprocessableEntityError } from '../errors';

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
    .from('ai_generation_logs')
    .select('id')
    .eq('id', command.generation_log_id)
    .eq('user_id', userId)
    .single();

  if (logError || !log) {
    throw new NotFoundError('Generation log not found or does not belong to the user.');
  }

  // Map questions to insert objects
  const questionsToInsert: TablesInsert<'questions'>[] = command.questions.map((q) => ({
    user_id: userId,
    generation_log_id: command.generation_log_id,
    question: q.question,
    answer: q.answer || null,
    source: q.edited ? 'ai-edited' : 'ai',
  }));

  // Bulk insert questions
  const { data: insertedQuestions, error: insertError } = await supabase
    .from('questions')
    .insert(questionsToInsert)
    .select('id');

  if (insertError) {
    throw new UnprocessableEntityError('Failed to save questions to the database.');
  }

  // Return the IDs of the saved questions
  return insertedQuestions.map((q) => q.id);
};
