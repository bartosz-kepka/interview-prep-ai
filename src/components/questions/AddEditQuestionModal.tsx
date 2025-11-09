import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { QuestionListItemDto, CreateQuestionCommand, UpdateQuestionCommand } from "@/types";
import { CreateQuestionCommandSchema } from "@/lib/questions/validation";

const formSchema = CreateQuestionCommandSchema;

interface AddEditQuestionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: CreateQuestionCommand | UpdateQuestionCommand) => void;
  initialData?: QuestionListItemDto;
  isSubmitting: boolean;
  mode: "add" | "edit" | "view";
}

export const AddEditQuestionModal: React.FC<AddEditQuestionModalProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting,
  mode: initialMode,
}) => {
  const [mode, setMode] = useState(initialMode);
  const [activeData, setActiveData] = useState(initialData);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setActiveData(initialData);
    }
  }, [initialMode, initialData, isOpen]);

  const isViewMode = mode === "view";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      answer: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (activeData) {
        form.reset({
          question: activeData.question,
          answer: activeData.answer || "",
        });
      } else {
        form.reset({
          question: "",
          answer: "",
        });
      }
    }
  }, [activeData, form, isOpen]);

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  const getTitle = () => {
    if (mode === "add") return "Add New Question";
    if (mode === "edit") return "Edit Question";
    return "Question Details";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[425px] md:max-w-[500px] lg:max-w-[600px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        {isViewMode && activeData ? (
          <>
            <div className="space-y-4 py-4 overflow-y-auto pr-6">
              <div>
                <h3 className="font-semibold mb-2">Question</h3>
                <p className="whitespace-pre-wrap text-muted-foreground">{activeData.question}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Answer</h3>
                <p className={`whitespace-pre-wrap text-muted-foreground ${!activeData.answer ? "italic" : ""}`}>
                  {activeData.answer || "No answer provided."}
                </p>
              </div>
            </div>
            <DialogFooter className="pt-4 flex-shrink-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={() => setMode("edit")}>Edit</Button>
            </DialogFooter>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col flex-grow overflow-hidden">
              <div className="space-y-8 overflow-y-auto pr-6 py-4">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter the question" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Answer (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter the answer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="pt-4 flex-shrink-0">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
