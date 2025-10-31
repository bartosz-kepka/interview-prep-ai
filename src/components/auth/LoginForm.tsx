import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/auth/validation";
import { useAuth } from "@/components/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const LoginForm: React.FC = () => {
  const { login, isSubmitting } = useAuth();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [apiError, setApiError] = React.useState<string | null>(null);

  const onSubmit = async (values: LoginInput) => {
    const result = await login(values);
    if (result.error) {
      setApiError(result.error.error);
    }
    if (result.error?.fields) {
      Object.entries(result.error.fields).forEach(([field, message]) => {
        form.setError(field as keyof LoginInput, {
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  {...field}
                  disabled={isSubmitting}
                  data-test-id="login-email-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                  disabled={isSubmitting}
                  data-test-id="login-password-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full" data-test-id="login-submit-button">
          {isSubmitting ? "Logging in..." : "Log In"}
        </Button>
      </form>
    </Form>
  );
};
