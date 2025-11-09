import React from "react";
import type { QuestionListItemDto } from "@/types";
import { QuestionItem } from "./QuestionItem";
import { QuestionsListSkeleton } from "./QuestionsListSkeleton";
import { EmptyState } from "./EmptyState";

interface QuestionsListProps {
  questions: QuestionListItemDto[];
  isLoading: boolean;
  onEdit: (question: QuestionListItemDto) => void;
  onView: (question: QuestionListItemDto) => void;
  onDelete: (question: QuestionListItemDto) => void;
  onAddQuestion: () => void;
}

export const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  isLoading,
  onEdit,
  onView,
  onDelete,
  onAddQuestion,
}) => {
  if (isLoading) {
    return <QuestionsListSkeleton />;
  }

  if (questions.length === 0) {
    return <EmptyState onAddQuestion={onAddQuestion} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {questions.map((question) => (
        <QuestionItem key={question.id} question={question} onEdit={onEdit} onView={onView} onDelete={onDelete} />
      ))}
    </div>
  );
};
