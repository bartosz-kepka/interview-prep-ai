import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '@/db/supabase.client';
import { forgotPasswordSchema } from '@/lib/auth/validation';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  // Parse and validate request body
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request format' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validate input with Zod
  const validationResult = forgotPasswordSchema.safeParse(body);
  if (!validationResult.success) {
    const fieldErrors: Record<string, string> = {};
    validationResult.error.errors.forEach((error) => {
      if (error.path[0]) {
        fieldErrors[error.path[0] as string] = error.message;
      }
    });
    return new Response(
      JSON.stringify({ error: 'Validation failed', fields: fieldErrors }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { email } = validationResult.data;

  // Create Supabase instance
  const supabase = createSupabaseServerInstance({
    headers: request.headers,
      cookies,
  });

  // Attempt to send reset password email
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${new URL(request.url).origin}/reset-password`,
  });

  // Handle errors
  if (error) {
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to send reset password email',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Success
  return new Response(
    JSON.stringify({
      success: true,
      message: 'If an account with that email exists, we have sent you a password reset link',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
