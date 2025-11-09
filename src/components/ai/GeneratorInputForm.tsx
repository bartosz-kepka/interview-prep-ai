import React, { useState, useId } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface GeneratorInputFormProps {
  onGenerate: (sourceText: string) => void;
  isGenerating: boolean;
}

export const GeneratorInputForm: React.FC<GeneratorInputFormProps> = ({ onGenerate, isGenerating }) => {
  const [sourceText, setSourceText] = useState("");
  const textareaId = useId();
  const counterId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceText.trim() && sourceText.length <= 10000) {
      onGenerate(sourceText);
    }
  };

  const isDisabled = !sourceText.trim() || sourceText.length > 10000 || isGenerating;

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 p-6" noValidate>
      <div className="space-y-4">
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">
          Job Description or Text to Generate Questions From
        </label>
        <Textarea
          id={textareaId}
          placeholder="Paste your job description or any text here..."
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          rows={10}
          className="w-full min-h-64 max-h-64 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          aria-describedby={counterId}
          data-test-id="generator-input-textarea"
        />
        <div id={counterId} className="text-sm text-gray-500 text-right" aria-live="polite">
          {sourceText.length}/10000 characters
        </div>
        <div className="flex justify-center pt-2">
          <Button type="submit" disabled={isDisabled} className="px-8 py-2" data-test-id="generator-submit-button">
            {isGenerating ? "Generating..." : "Generate Questions"}
          </Button>
        </div>
      </div>
    </form>
  );
};
