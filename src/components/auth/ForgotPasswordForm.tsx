import React, { useState, useId } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/auth/validation';

interface ForgotPasswordFormProps {
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Partial<ForgotPasswordInput>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const emailId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);
    setSuccessMessage(null);

    const result = forgotPasswordSchema.safeParse({ email });

    if (!result.success) {
      const fieldErrors: Partial<ForgotPasswordInput> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as keyof ForgotPasswordInput] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call reset password API endpoint
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result.data),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors (422)
        if (response.status === 422 && data.fields) {
          setErrors(data.fields);
          return;
        }

        // Display API error message
        setApiError(data.error || 'An error occurred');
        return;
      }

      // Success
      setSuccessMessage(data.message);
      setEmail(''); // Clear the form
    } catch (error) {
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {apiError && (
        <Alert className="mb-4">
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert className="mb-4 border-green-500 bg-green-50 text-green-800">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div>
        <label htmlFor={emailId} className="block text-sm font-medium mb-2">
          Email
        </label>
        <Input
          id={emailId}
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={handleEmailChange}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
        />
        {errors.email && (
          <p id={`${emailId}-error`} className="mt-1 text-sm text-destructive">
            {errors.email}
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          We'll send you a link to reset your password
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </form>
  );
};
