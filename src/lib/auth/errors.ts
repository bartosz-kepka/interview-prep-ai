import type { AuthError } from '@supabase/supabase-js';

export type AuthErrorCode =
  | 'EMAIL_NOT_CONFIRMED'
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'GENERIC_ERROR';

export interface AuthErrorResponse {
  error: string;
  code?: AuthErrorCode;
}

/**
 * Maps Supabase auth errors to user-friendly messages
 */
export const mapAuthError = (error: AuthError): AuthErrorResponse => {
  const message = error.message.toLowerCase();

  // Invalid credentials
  if (message.includes('invalid login credentials') || message.includes('invalid password')) {
    return {
      error: 'Invalid email or password',
      code: 'INVALID_CREDENTIALS',
    };
  }

  // Email not confirmed
  if (message.includes('email not confirmed') || message.includes('email_not_confirmed')) {
    return {
      error: 'Please verify your email address before logging in',
      code: 'EMAIL_NOT_CONFIRMED',
    };
  }

  // User not found
  if (message.includes('user not found')) {
    return {
      error: 'No account found with this email address',
      code: 'USER_NOT_FOUND',
    };
  }

  // Generic fallback
  return {
    error: 'Authentication failed. Please try again.',
    code: 'GENERIC_ERROR',
  };
};

