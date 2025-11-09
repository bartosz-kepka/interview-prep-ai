import React from "react";
import { useAIGenerator } from "../hooks/useAIGenerator";
import { GeneratorInputForm } from "../ai/GeneratorInputForm";
import { GeneratedQuestionsList } from "../ai/GeneratedQuestionsList";
import { Alert, AlertDescription } from "../ui/alert";

const AIGeneratorView: React.FC = () => {
  const { questionProposals, status, error, handleGenerate, handleSave } = useAIGenerator();

  return (
    <div className="container mx-auto px-4 py-8" role="main" data-test-id="ai-generator-view">
      {error && (
        <Alert className="mb-4" data-test-id="generator-error-alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {status === "idle" || status === "error" || status === "generating" ? (
        <GeneratorInputForm onGenerate={handleGenerate} isGenerating={status === "generating"} />
      ) : (
        <GeneratedQuestionsList
          questionProposals={questionProposals}
          onSave={handleSave}
          isSaving={status === "saving"}
        />
      )}
    </div>
  );
};

export { AIGeneratorView };
