import { useState, useCallback } from 'react';
import type {
  QuestionProposal,
  GenerateQuestionsResponseDto,
  SaveGeneratedQuestionsCommand,
  SaveGeneratedQuestionsResponseDto,
} from '../../types';

type Status = 'idle' | 'generating' | 'success' | 'error' | 'saving';

export const useAIGenerator = () => {
  const [questionProposals, setQuestionProposals] = useState<QuestionProposal[]>([]);
  const [generationLogId, setGenerationLogId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (sourceText: string) => {
    setStatus('generating');
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source_text: sourceText }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions. Please try again.');
      }

      const data: GenerateQuestionsResponseDto = await response.json();
      setQuestionProposals(data.question_proposals);
      setGenerationLogId(data.generation_log_id);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setStatus('error');
    }
  }, []);

  const handleSave = useCallback(async (questions: SaveGeneratedQuestionsCommand['questions']) => {
    if (!generationLogId) {
      setError('No generation log ID available. Please generate questions first.');
      return;
    }

    setStatus('saving');
    setError(null);

    try {
      const command: SaveGeneratedQuestionsCommand = {
        generation_log_id: generationLogId,
        questions,
      };

      const response = await fetch('/api/ai/save-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error('Failed to save questions. Please try again.');
      }

      const data: SaveGeneratedQuestionsResponseDto = await response.json();
      // On success, redirect to the main questions list page
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setStatus('error');
    }
  }, [generationLogId]);

  return {
    questionProposals,
    generationLogId,
    status,
    error,
    handleGenerate,
    handleSave,
  };
};
