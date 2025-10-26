import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '@/db/supabase.client';
import { resetPasswordSchema } from '@/lib/auth/validation';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
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
  const validationResult = resetPasswordSchema.safeParse(body);
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

  const { password, code } = validationResult.data;

  // Create Supabase instance with cookie support
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
        return redirect('/error/expired-link');
    }

  // Update password
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  // Handle errors
  if (error) {
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to update password',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Success - user is now logged in
  return new Response(
    JSON.stringify({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      }
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
