import React, { useState, useId } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/auth/validation';

interface ForgotPasswordFormProps {
  onSubmit?: (data: ForgotPasswordInput) => Promise<void>;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Partial<ForgotPasswordInput>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);

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

    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(result.data);
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {apiError && (
        <Alert className="mb-4">
          <AlertDescription>{apiError}</AlertDescription>
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
          onChange={(e) => setEmail(e.target.value)}
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

