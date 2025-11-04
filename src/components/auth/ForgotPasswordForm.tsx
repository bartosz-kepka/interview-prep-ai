import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/auth/validation";
import { useAuth } from "@/components/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ForgotPasswordForm: React.FC = () => {
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const { forgotPassword, isSubmitting } = useAuth();
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  const [apiError, setApiError] = React.useState<string | null>(null);

  const onSubmit = async (values: ForgotPasswordInput) => {
    const result = await forgotPassword(values);
    if (result.error) {
      setApiError(result.error.error);
    }
    if (result.data) {
      setSuccessMessage("If an account with that email exists, a password reset link has been sent.");
    }
    if (result.error?.fields) {
      Object.entries(result.error.fields).forEach(([field, message]) => {
        form.setError(field as keyof ForgotPasswordInput, {
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
        {successMessage && (
          <Alert className="mb-4 border-green-500 bg-green-50 text-green-800">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your.email@example.com" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="mt-2 text-sm text-muted-foreground">We&apos;`ll send you a link to reset your password</p>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </Form>
  );
};
