import React, { useState, useId } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { signUpSchema, type SignUpInput } from '@/lib/auth/validation';

export const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<SignUpInput>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailId = useId();
  const passwordId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);

    // Client-side validation
    const result = signUpSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: Partial<SignUpInput> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as keyof SignUpInput] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call signup API endpoint
      const response = await fetch('/api/auth/signup', {
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
        setApiError(data.error || 'An error occurred during sign up');
        return;
      }

      // Success - redirect to check-email page
      window.location.href = '/check-email';
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {apiError && (
        <Alert className="mb-4 border-destructive/50 text-destructive">
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
          onChange={handleEmailChange}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p id={`${emailId}-error`} className="mt-1 text-sm text-destructive">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={passwordId} className="block text-sm font-medium mb-2">
          Password
        </label>
        <Input
          id={passwordId}
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={handlePasswordChange}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? `${passwordId}-error` : undefined}
          disabled={isSubmitting}
        />
        {errors.password && (
          <p id={`${passwordId}-error`} className="mt-1 text-sm text-destructive">
            {errors.password}
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          Must be at least 8 characters long
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  );
};
