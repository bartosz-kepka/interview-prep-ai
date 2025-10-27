import React, { useState, useId } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/auth/validation';

interface ResetPasswordFormProps {
  code: string;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ code }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Partial<ResetPasswordInput & { confirmPassword?: string }>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordId = useId();
  const confirmPasswordId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);

    // Check if passwords match
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    const result = resetPasswordSchema.safeParse({ password, code });

    if (!result.success) {
      const fieldErrors: Partial<ResetPasswordInput> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as keyof ResetPasswordInput] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call update password API endpoint
      const response = await fetch('/api/auth/update-password', {
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

      // Success - redirect to home page
      window.location.href = '/';
    } catch (error) {
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {apiError && (
        <Alert className="mb-4">
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <div>
        <label htmlFor={passwordId} className="block text-sm font-medium mb-2">
          New Password
        </label>
        <Input
          id={passwordId}
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={handlePasswordChange}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? `${passwordId}-error` : undefined}
        />
        {errors.password && (
          <p id={`${passwordId}-error`} className="mt-1 text-sm text-destructive">
            {errors.password}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={confirmPasswordId} className="block text-sm font-medium mb-2">
          Confirm New Password
        </label>
        <Input
          id={confirmPasswordId}
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? `${confirmPasswordId}-error` : undefined}
        />
        {errors.confirmPassword && (
          <p id={`${confirmPasswordId}-error`} className="mt-1 text-sm text-destructive">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Resetting password...' : 'Reset Password'}
      </Button>
    </form>
  );
};
