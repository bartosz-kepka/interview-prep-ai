import { useState } from "react";

export interface ApiError<T = Record<string, string>> {
  error: string;
  fields?: T;
  code?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export const useApi = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const request = async <T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> => {
    setIsSubmitting(true);
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        return { data: null, error: result };
      }

      return { data: result, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      return {
        data: null,
        error: {
          message: "Network error. Please check your connection and try again.",
          code: "NETWORK_ERROR",
        },
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const get = <T>(endpoint: string) => {
    return request<T>(endpoint, { method: "GET" });
  };

  const post = <T, U>(endpoint: string, data: U) => {
    return request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  const patch = <T, U>(endpoint: string, data: U) => {
    return request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  };

  const del = <T>(endpoint: string) => {
    return request<T>(endpoint, { method: "DELETE" });
  };

  return {
    isSubmitting,
    get,
    post,
    patch,
    del,
  };
};
