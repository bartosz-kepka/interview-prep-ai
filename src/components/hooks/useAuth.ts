import { useState } from "react";
import {
  type LoginInput,
  type SignUpInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/auth/validation";
import { useApi, type ApiError } from "./useApi";

export const useAuth = () => {
  const { post, isSubmitting } = useApi();
  const [error, setError] = useState<ApiError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuthRequest = async <T, U>(endpoint: string, data: T, onSuccess?: (data: U) => void) => {
    setError(null);
    setSuccessMessage(null);
    const { data: responseData, error: responseError } = await post<U, T>(endpoint, data);

    if (responseError) {
      if (responseError.code === "EMAIL_NOT_CONFIRMED") {
        window.location.href = "/check-email";
        return;
      }
      setError(responseError);
      return { error: responseError };
    }

    if (onSuccess && responseData) {
      onSuccess(responseData);
    }
    return { data: responseData };
  };

  const login = async (data: LoginInput) => {
    return handleAuthRequest("/api/auth/login", data, () => {
      const urlParams = new URLSearchParams(window.location.search);
      window.location.href = urlParams.get("redirect") || "/";
    });
  };

  const signup = async (data: SignUpInput) => {
    return handleAuthRequest("/api/auth/signup", data, () => {
      window.location.href = "/check-email";
    });
  };

  const forgotPassword = async (data: ForgotPasswordInput) => {
    return handleAuthRequest("/api/auth/reset-password", data);
  };

  const resetPassword = async (data: ResetPasswordInput) => {
    return handleAuthRequest("/api/auth/update-password", data, () => {
      window.location.href = "/";
    });
  };

  return {
    login,
    signup,
    forgotPassword,
    resetPassword,
    isSubmitting,
    error,
    successMessage,
  };
};
