import React, { useState, useId } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface GeneratorInputFormProps {
  onGenerate: (sourceText: string) => void;
  isGenerating: boolean;
}

export const GeneratorInputForm: React.FC<GeneratorInputFormProps> = ({
  onGenerate,
  isGenerating,
}) => {
  const [sourceText, setSourceText] = useState('');
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
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor={textareaId} className="block text-sm font-medium mb-2">
          Job Description or Text to Generate Questions From
        </label>
        <Textarea
          id={textareaId}
          placeholder="Paste your job description or any text here..."
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          rows={10}
          className="w-full min-h-64 max-h-64"
          aria-describedby={counterId}
        />
        <div id={counterId} className="mt-2 text-sm text-gray-600" aria-live="polite">
          {sourceText.length}/10000 characters
        </div>
      </div>
      <Button type="submit" disabled={isDisabled} className="w-full">
        {isGenerating ? 'Generating...' : 'Generate Questions'}
      </Button>
    </form>
  );
};
