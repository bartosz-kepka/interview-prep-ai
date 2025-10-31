import { useState, useCallback } from "react";
import type {
  QuestionProposal,
  GenerateQuestionsResponseDto,
  SaveGeneratedQuestionsCommand,
} from "../../types";
import { useApi } from "./useApi";

type Status = "idle" | "generating" | "success" | "error" | "saving";

export const useAIGenerator = () => {
  const { post, isSubmitting } = useApi();
  const [questionProposals, setQuestionProposals] = useState<QuestionProposal[]>([]);
  const [generationLogId, setGenerationLogId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (sourceText: string) => {
    setStatus("generating");
    setError(null);

    const { data, error } = await post<GenerateQuestionsResponseDto, { source_text: string }>(
      "/api/ai/generate-questions",
      { source_text: sourceText }
    );

    if (error) {
      setError(error.error);
      setStatus("error");
      return;
    }

    if (data) {
      setQuestionProposals(data.question_proposals);
      setGenerationLogId(data.generation_log_id);
      setStatus("success");
    }
  }, [post]);

  const handleSave = useCallback(
    async (questions: SaveGeneratedQuestionsCommand["questions"]) => {
      if (!generationLogId) {
        setError("No generation log ID available. Please generate questions first.");
        return;
      }

      setStatus("saving");
      setError(null);

      const command: SaveGeneratedQuestionsCommand = {
        generation_log_id: generationLogId,
        questions,
      };

      const { error } = await post<never, SaveGeneratedQuestionsCommand>(
        "/api/ai/save-questions",
        command
      );

      if (error) {
        setError(error.error);
        setStatus("error");
        return;
      }

      window.location.href = "/";
    },
    [generationLogId, post]
  );

  return {
    questionProposals,
    generationLogId,
    status,
    error,
    isSubmitting,
    handleGenerate,
    handleSave,
  };
};
