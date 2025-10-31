import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { loginSchema } from "@/lib/auth/validation";
import { mapAuthError } from "@/lib/auth/errors";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, url }) => {
  // Parse and validate request body
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate input with Zod
  const validationResult = loginSchema.safeParse(body);
  if (!validationResult.success) {
    const fieldErrors: Record<string, string> = {};
    validationResult.error.errors.forEach((error) => {
      if (error.path[0]) {
        fieldErrors[error.path[0] as string] = error.message;
      }
    });
    return new Response(JSON.stringify({ error: "Validation failed", fields: fieldErrors }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { email, password } = validationResult.data;

  // Create Supabase instance with cookie support
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Attempt to sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Handle authentication errors with detailed messages
  if (error) {
    const authError = mapAuthError(error);
    return new Response(JSON.stringify(authError), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  // Check if email is verified (additional check)
  if (!data.user?.email_confirmed_at) {
    // Sign out the user since they shouldn't be logged in
    await supabase.auth.signOut();

    return new Response(
      JSON.stringify({
        error: "Please verify your email address before logging in",
        code: "EMAIL_NOT_CONFIRMED",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Success - cookies are automatically set by Supabase SSR
  return new Response(
    JSON.stringify({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
