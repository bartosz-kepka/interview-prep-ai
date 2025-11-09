import { useState, useEffect, useCallback, useRef } from "react";
import { useApi } from "@/components/hooks/useApi";
import type {
  PaginatedQuestionsResponseDto,
  QuestionListItemDto,
  PaginationDto,
  UpdateQuestionResponseDto,
  UpdateQuestionCommand,
  CreateQuestionCommand,
  CreateQuestionResponseDto,
} from "@/types";
import { useDebounce } from "./useDebounce";

export const useQuestions = () => {
  const [questions, setQuestions] = useState<QuestionListItemDto[]>([]);
  const [pagination, setPagination] = useState<PaginationDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { get, post, patch, del, isSubmitting } = useApi();
  const loading = useRef(false);

  const fetchQuestions = useCallback(async (page: number, search: string) => {
    if (loading.current) return;
    loading.current = true;

    if (page > 1) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    const params = new URLSearchParams();
    params.append("page", String(page));
    if (search) {
      params.append("search", search);
    }

    try {
      const response = await get<PaginatedQuestionsResponseDto>(`/api/questions?${params.toString()}`);
      if (response.data) {
        setQuestions((prev) => (page === 1 ? response.data.data : [...prev, ...response.data.data]));
        setPagination(response.data.pagination);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      // TODO: Set error state to display in the UI
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      loading.current = false;
    }
  }, []);

  const refreshQuestions = useCallback(() => {
    setSearchTerm("");
    void fetchQuestions(1, "");
  }, [fetchQuestions]);

  useEffect(() => {
    void fetchQuestions(1, debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchQuestions]);

  const loadMore = useCallback(() => {
    if (pagination && pagination.page < pagination.total_pages) {
      void fetchQuestions(pagination.page + 1, debouncedSearchTerm);
    }
  }, [pagination, debouncedSearchTerm, fetchQuestions]);

  const addQuestion = async (data: CreateQuestionCommand) => {
    const response = await post<CreateQuestionResponseDto, CreateQuestionCommand>("/api/questions", data);
    if (!response.error) {
      refreshQuestions();
    }
    return response;
  };

  const updateQuestion = async (id: string, data: UpdateQuestionCommand) => {
    const response = await patch<UpdateQuestionResponseDto, UpdateQuestionCommand>(`/api/questions/${id}`, data);
    if (!response.error) {
      refreshQuestions();
    }
    return response;
  };

  const deleteQuestion = async (id: string) => {
    const response = await del(`/api/questions/${id}`);
    if (!response.error) {
      refreshQuestions();
    }
    return response;
  };

  const hasMore = pagination ? pagination.page < pagination.total_pages : false;

  return {
    questions,
    isLoading,
    isSubmitting,
    isLoadingMore,
    hasMore,
    loadMore,
    searchTerm,
    setSearchTerm,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  };
};
