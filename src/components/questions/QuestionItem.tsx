import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { QuestionListItemDto } from "@/types";
import { FilePenLine, Trash2 } from "lucide-react";

interface QuestionItemProps {
  question: QuestionListItemDto;
  onEdit: (question: QuestionListItemDto) => void;
  onView: (question: QuestionListItemDto) => void;
  onDelete: (question: QuestionListItemDto) => void;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({ question, onEdit, onView, onDelete }) => {
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    onView(question);
  };

  return (
    <Card
      className="flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <CardTitle className="text-lg font-semibold line-clamp-2">{question.question}</CardTitle>
        <div className="flex shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onEdit(question)}>
            <FilePenLine className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(question)}>
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-0">
        <p className={`whitespace-pre-wrap text-muted-foreground line-clamp-4 ${!question.answer ? "italic" : ""}`}>
          {question.answer || "No answer provided."}
        </p>
      </CardContent>
    </Card>
  );
};
