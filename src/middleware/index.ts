import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerInstance } from '../db/supabase.client.ts';

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/check-email',
  '/callback',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/reset-password',
  '/api/auth/update-password',
  '/api/auth/callback',
];

// Paths that start with these patterns are public
const PUBLIC_PATH_PATTERNS = ['/error/'];

const isPublicPath = (pathname: string): boolean => {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PATH_PATTERNS.some((pattern) => pathname.startsWith(pattern));
};

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Create Supabase instance with SSR support
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Store supabase instance in locals for use in API routes
  locals.supabase = supabase;

  // Get current user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Store user data in locals if authenticated
  if (user) {
    locals.user = {
      id: user.id,
      email: user.email,
    };
  }

  // Allow public paths
  if (isPublicPath(url.pathname)) {
    return next();
  }

  // Redirect to login if accessing protected route without authentication
  if (!user) {
    // Preserve the original URL as redirect parameter
    const redirectUrl = new URL('/login', url.origin);
    redirectUrl.searchParams.set('redirect', url.pathname + url.search);
    return redirect(redirectUrl.toString());
  }

  return next();
});
