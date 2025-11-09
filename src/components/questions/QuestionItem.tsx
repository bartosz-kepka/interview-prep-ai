import React from "react";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import type { QuestionListItemDto } from "@/types";

interface QuestionItemProps {
  question: QuestionListItemDto;
  onEdit: (question: QuestionListItemDto) => void;
  onDelete: (question: QuestionListItemDto) => void;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({ question, onEdit, onDelete }) => {
  return (
    <Card>
      <Collapsible>
        <div className="flex items-center justify-between p-6">
          <CardTitle className="text-lg font-semibold flex-1 pr-4">{question.question}</CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0 shrink-0">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <p className="whitespace-pre-wrap text-muted-foreground">{question.answer || "No answer provided."}</p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
      <CardFooter className="flex justify-end gap-2 bg-muted/50 p-4 border-t">
        <Button variant="outline" size="sm" onClick={() => onEdit(question)}>
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(question)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
