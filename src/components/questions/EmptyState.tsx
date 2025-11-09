import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddQuestion: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAddQuestion }) => {
  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle>No Questions Found</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-muted-foreground">
          You haven&apos;t added any questions yet. Get started by adding your first one!
        </p>
        <Button onClick={onAddQuestion}>Add Question</Button>
      </CardContent>
    </Card>
  );
};
