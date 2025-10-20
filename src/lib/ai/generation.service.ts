import type { SupabaseClient } from '@/db/supabase.client.ts';
import type { TablesInsert } from '@/db/database.types.ts';
import { BadGatewayError, InternalServerError } from '../errors';

/**
 * Generates interview questions from the provided source text using an AI service.
 * This function handles logging the generation process and mocking the AI response for development.
 */
export const generateQuestions = async (
  source_text: string,
  userId: string,
  supabase: SupabaseClient
): Promise<GenerateQuestionsResponseDto> => {
  // Step 1: Create Log
  // Insert a new record into ai_generation_logs with the user ID and the prompt (source_text).
  const logInsert: TablesInsert<'ai_generation_logs'> = {
    user_id: userId,
    prompt: source_text,
  };

  const { data: logData, error: logError } = await supabase
    .from('ai_generation_logs')
    .insert(logInsert)
    .select('id')
    .single();

  if (logError) {
    console.log(logError);
    throw new InternalServerError(`Failed to create generation log: ${logError.message}`);
  }

  const generation_log_id = logData.id;

  try {
    // Step 2: Call AI - Mocked for development purposes
    // In production, this would make an actual API call to OpenRouter.
    // For now, simulate a successful AI response with sample questions.
    const mockAiResponse = {
      questions: [
        { question: 'Can you describe your experience with React and Node.js?' },
        { question: 'Tell us about a project where you used PostgreSQL.' },
        { question: 'How do you handle state management in large-scale applications?' },
      ],
    };

    // Step 3: Handle Response - Success
    // Update the log record with success status, finished_at timestamp, and the raw response.
    const logUpdate = {
      status: 'success' as const,
      finished_at: new Date().toISOString(),
      response: JSON.stringify(mockAiResponse),
    };

    const { error: updateError } = await supabase
      .from('ai_generation_logs')
      .update(logUpdate)
      .eq('id', generation_log_id);

    if (updateError) {
      throw new InternalServerError(`Failed to update generation log: ${updateError.message}`);
    }

    // Return the parsed question proposals and the log ID.
    return {
      generation_log_id,
      question_proposals: mockAiResponse.questions,
    };
  } catch (aiError) {
    // Step 3: Handle Response - Failure
    // Update the log record with error status, finished_at timestamp, and error details.
    const logUpdate = {
      status: 'error' as const,
      finished_at: new Date().toISOString(),
      error_details: aiError instanceof Error ? aiError.message : 'Unknown AI error',
    };

    await supabase
      .from('ai_generation_logs')
      .update(logUpdate)
      .eq('id', generation_log_id);

    // Re-throw a custom error to be handled by the API route.
    throw new BadGatewayError('AI service failed to generate questions');
  }
}
