import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/auth/validation";
import { useAuth } from "@/components/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ResetPasswordFormProps {
  code: string;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ code }) => {
  const { resetPassword, isSubmitting } = useAuth();
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      code,
    },
  });
  const [apiError, setApiError] = React.useState<string | null>(null);

  const onSubmit = async (values: ResetPasswordInput) => {
    const result = await resetPassword(values);
    if (result.error) {
      setApiError(result.error.error);
    }
    if (result.error?.fields) {
      Object.entries(result.error.fields).forEach(([field, message]) => {
        form.setError(field as keyof ResetPasswordInput, {
          type: "manual",
          message: message as string,
        });
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {apiError && (
          <Alert className="mb-4 border-destructive/50 text-destructive">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="At least 8 characters" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Re-enter your password" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Resetting password..." : "Reset Password"}
        </Button>
      </form>
    </Form>
  );
};
