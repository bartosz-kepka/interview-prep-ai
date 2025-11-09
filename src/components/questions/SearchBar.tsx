import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddQuestion: () => void;
  isSearchDisabled: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onAddQuestion,
  isSearchDisabled,
}) => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Input
        placeholder="Search questions..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        disabled={isSearchDisabled}
        className="flex-grow"
      />
      <Button onClick={onAddQuestion}>Add Question</Button>
    </div>
  );
};
