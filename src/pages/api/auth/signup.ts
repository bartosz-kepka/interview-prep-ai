import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '@/db/supabase.client';
import { signUpSchema } from '@/lib/auth/validation';

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
  const validationResult = signUpSchema.safeParse(body);
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

  const { email, password } = validationResult.data;

  // Create Supabase instance with cookie support
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Attempt to sign up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  // Handle authentication errors
  if (error) {
    // Check for existing user
    if (error.message.toLowerCase().includes('user already registered')) {
      return new Response(
        JSON.stringify({
          error: 'An account with this email already exists',
          code: 'USER_EXISTS'
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generic error
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to create account',
        code: 'SIGNUP_FAILED'
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Success - user needs to confirm email
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Please check your email to verify your account',
      user: {
        id: data.user?.id,
        email: data.user?.email,
      }
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

