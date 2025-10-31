import React, { useState, useEffect, useId } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { GeneratedQuestionItem } from "./GeneratedQuestionItem";
import type { QuestionProposal, QuestionProposalViewModel, QuestionToSave } from "../../types";

interface GeneratedQuestionsListProps {
  questionProposals: QuestionProposal[];
  onSave: (questions: QuestionToSave[]) => void;
  isSaving: boolean;
}

export const GeneratedQuestionsList: React.FC<GeneratedQuestionsListProps> = ({
  questionProposals,
  onSave,
  isSaving,
}) => {
  const [viewModels, setViewModels] = useState<QuestionProposalViewModel[]>([]);
  const selectAllId = useId();
  const selectAllDescId = useId();

  useEffect(() => {
    const newViewModels = questionProposals.map((proposal, index) => ({
      ...proposal,
      id: index,
      answer: "",
      selected: true,
      original_question: proposal.question,
    }));
    setViewModels(newViewModels);
  }, [questionProposals]);

  const handleSelectAll = () => {
    const allSelected = viewModels.every((vm) => vm.selected);
    setViewModels((prev) => prev.map((vm) => ({ ...vm, selected: !allSelected })));
  };

  const handleQuestionUpdate = (id: number, value: string) => {
    setViewModels((prev) => prev.map((vm) => (vm.id === id ? { ...vm, question: value } : vm)));
  };

  const handleAnswerUpdate = (id: number, value: string) => {
    setViewModels((prev) => prev.map((vm) => (vm.id === id ? { ...vm, answer: value } : vm)));
  };

  const handleToggleSelect = (id: number) => {
    setViewModels((prev) => prev.map((vm) => (vm.id === id ? { ...vm, selected: !vm.selected } : vm)));
  };

  const handleSave = () => {
    const selectedQuestions: QuestionToSave[] = viewModels
      .filter((vm) => vm.selected)
      .map((vm) => ({
        question: vm.question,
        edited: vm.question !== vm.original_question,
        answer: vm.answer || undefined,
      }));
    onSave(selectedQuestions);
  };

  const selectedCount = viewModels.filter((vm) => vm.selected).length;
  const allSelected = viewModels.length > 0 && viewModels.every((vm) => vm.selected);
  const someSelected = viewModels.some((vm) => vm.selected);

  return (
    <div className="space-y-6" data-test-id="generated-questions-list">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={selectAllId}
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            aria-describedby={selectAllDescId}
          />
          <label htmlFor={selectAllId} className="text-sm font-medium">
            Select All ({selectedCount} selected)
          </label>
          <div id={selectAllDescId} className="sr-only">
            Select or deselect all questions for saving
          </div>
        </div>
        <Button onClick={handleSave} disabled={selectedCount === 0 || isSaving}>
          {isSaving ? "Saving..." : "Save Selected"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {viewModels.map((vm) => (
          <GeneratedQuestionItem
            key={vm.id}
            question={vm}
            onQuestionUpdate={handleQuestionUpdate}
            onAnswerUpdate={handleAnswerUpdate}
            onToggleSelect={handleToggleSelect}
          />
        ))}
      </div>
    </div>
  );
};
