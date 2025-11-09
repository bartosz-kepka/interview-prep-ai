import React, { useState } from "react";
import { useQuestions } from "@/components/hooks/useQuestions";
import { SearchBar } from "./SearchBar";
import { QuestionsList } from "./QuestionsList";
import type { QuestionListItemDto, CreateQuestionCommand, UpdateQuestionCommand } from "@/types";
import { Button } from "@/components/ui/button";
import { AddEditQuestionModal } from "./AddEditQuestionModal";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { toast } from "sonner";

type ModalState =
  | { type: "none" }
  | { type: "add" }
  | { type: "edit"; question: QuestionListItemDto }
  | { type: "view"; question: QuestionListItemDto }
  | { type: "delete"; question: QuestionListItemDto };

export const QuestionsView: React.FC = () => {
  const {
    questions,
    isLoading,
    hasMore,
    loadMore,
    isLoadingMore,
    searchTerm,
    setSearchTerm,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    isSubmitting,
  } = useQuestions();
  const [modalState, setModalState] = useState<ModalState>({ type: "none" });

  const handleAddQuestion = () => {
    setModalState({ type: "add" });
  };

  const handleEditQuestion = (question: QuestionListItemDto) => {
    setModalState({ type: "edit", question });
  };

  const handleViewQuestion = (question: QuestionListItemDto) => {
    setModalState({ type: "view", question });
  };

  const handleDeleteQuestion = (question: QuestionListItemDto) => {
    setModalState({ type: "delete", question });
  };

  const handleSubmit = async (data: CreateQuestionCommand | UpdateQuestionCommand) => {
    let response;
    if (modalState.type === "add") {
      response = await addQuestion(data as CreateQuestionCommand);
    } else if (modalState.type === "edit" || modalState.type === "view") {
      response = await updateQuestion(modalState.question.id, data as UpdateQuestionCommand);
    }

    if (response && !response.error) {
      setModalState({ type: "none" });
      toast.success(modalState.type === "add" ? "Question added successfully!" : "Question updated successfully!");
    } else {
      toast.error("Failed to save question. Please try again.");
    }
  };

  const handleConfirmDelete = async () => {
    if (modalState.type !== "delete") return;

    const response = await deleteQuestion(modalState.question.id);
    if (response && !response.error) {
      setModalState({ type: "none" });
      toast.success("Question deleted successfully!");
    } else {
      toast.error("Failed to delete question. Please try again.");
    }
  };

  return (
    <div>
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddQuestion={handleAddQuestion}
        isSearchDisabled={isLoading}
      />
      <QuestionsList
        questions={questions}
        isLoading={isLoading}
        hasMore={hasMore}
        onEdit={handleEditQuestion}
        onView={handleViewQuestion}
        onDelete={handleDeleteQuestion}
        onAddQuestion={handleAddQuestion}
      />
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button onClick={loadMore} disabled={isLoadingMore}>
            {isLoadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      <AddEditQuestionModal
        isOpen={modalState.type === "add" || modalState.type === "edit" || modalState.type === "view"}
        onOpenChange={() => setModalState({ type: "none" })}
        onSubmit={handleSubmit}
        initialData={modalState.type === "edit" || modalState.type === "view" ? modalState.question : undefined}
        isSubmitting={isSubmitting}
        mode={modalState.type === "view" ? "view" : modalState.type === "edit" ? "edit" : "add"}
      />
      <DeleteConfirmationDialog
        isOpen={modalState.type === "delete"}
        onOpenChange={() => setModalState({ type: "none" })}
        onConfirm={handleConfirmDelete}
        question={modalState.type === "delete" ? modalState.question : null}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
