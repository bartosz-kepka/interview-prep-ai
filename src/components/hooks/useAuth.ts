import {
  type LoginInput,
  type SignUpInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/auth/validation";
import { useApi } from "./useApi";

export const useAuth = () => {
  const { post, isSubmitting } = useApi();

  const handleAuthRequest = async <T, U>(endpoint: string, data: T, onSuccess?: (data: U) => void) => {
    const result = await post<U, T>(endpoint, data);

    if (onSuccess && result.data) {
      onSuccess(result.data);
    }

    return result;
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
  };
};
