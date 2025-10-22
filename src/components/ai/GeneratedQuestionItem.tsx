import React, { useId } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import type { QuestionProposalViewModel } from '../../types';

interface GeneratedQuestionItemProps {
  question: QuestionProposalViewModel;
  onQuestionUpdate: (id: number, value: string) => void;
  onAnswerUpdate: (id: number, value: string) => void;
  onToggleSelect: (id: number) => void;
}

export const GeneratedQuestionItem: React.FC<GeneratedQuestionItemProps> = ({
  question,
  onQuestionUpdate,
  onAnswerUpdate,
  onToggleSelect,
}) => {
  const checkboxId = useId();
  const questionTextareaId = useId();
  const answerTextareaId = useId();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={checkboxId}
            checked={question.selected}
            onCheckedChange={() => onToggleSelect(question.id)}
          />
          <CardTitle asChild>
            <label htmlFor={checkboxId} className="text-lg cursor-pointer">
              Question {question.id + 1}
            </label>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor={questionTextareaId} className="block text-sm font-medium mb-2">
            Question
          </label>
          <Textarea
            id={questionTextareaId}
            value={question.question}
            onChange={(e) => onQuestionUpdate(question.id, e.target.value)}
            disabled={!question.selected}
            rows={3}
            placeholder="Edit the question..."
          />
        </div>
        <div>
          <label htmlFor={answerTextareaId} className="block text-sm font-medium mb-2">
            Answer
          </label>
          <Textarea
            id={answerTextareaId}
            value={question.answer}
            onChange={(e) => onAnswerUpdate(question.id, e.target.value)}
            disabled={!question.selected}
            rows={3}
            placeholder="Provide an answer..."
          />
        </div>
      </CardContent>
    </Card>
  );
};
