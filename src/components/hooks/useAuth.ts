import { useState } from 'react';
import {
  type LoginInput,
  type SignUpInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from '@/lib/auth/validation';

type ApiError = {
  error: string;
  fields?: Record<string, string>;
  code?: string;
};

type AuthResponse = {
  message?: string;
};

export const useAuth = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleApiCall = async <T>(
    endpoint: string,
    data: T,
    setFormErrors: (errors: Record<string, string>) => void
  ): Promise<AuthResponse | void> => {
    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.fields) {
          setFormErrors(result.fields);
        } else if (result.code === 'EMAIL_NOT_CONFIRMED') {
          window.location.href = '/check-email';
        } else {
          setApiError(result.error || 'An error occurred.');
        }
        return;
      }
      return result;
    } catch (error) {
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const login = async (
    data: LoginInput,
    setFormErrors: (errors: Record<string, string>) => void
  ) => {
    const result = await handleApiCall('/api/auth/login', data, setFormErrors);
    if (result) {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect') || '/';
      window.location.href = redirectTo;
    }
  };

  const signup = async (
    data: SignUpInput,
    setFormErrors: (errors: Record<string, string>) => void
  ) => {
    const result = await handleApiCall('/api/auth/signup', data, setFormErrors);
    if (result) {
      window.location.href = '/check-email';
    }
  };

  const forgotPassword = async (
    data: ForgotPasswordInput,
    setFormErrors: (errors: Record<string, string>) => void
  ) => {
    const result = await handleApiCall('/api/auth/reset-password', data, setFormErrors);
    if (result) {
      setSuccessMessage(result.message || 'Password reset link sent.');
    }
  };

  const resetPassword = async (
    data: ResetPasswordInput,
    setFormErrors: (errors: Record<string, string>) => void
  ) => {
    const result = await handleApiCall('/api/auth/update-password', data, setFormErrors);
    if (result) {
      window.location.href = '/';
    }
  };

  return {
    login,
    signup,
    forgotPassword,
    resetPassword,
    isSubmitting,
    apiError,
    successMessage,
  };
};
