import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerInstance } from '../db/supabase.client.ts';

// Paths accessible to everyone (both authenticated and unauthenticated users)
const PUBLIC_PATHS = [
  '/api/auth/callback',
  '/error/expired-link'
];

// Paths only accessible to unauthenticated users (will redirect to / if authenticated)
const UNAUTHORIZED_ONLY_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/check-email',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/reset-password',
  '/api/auth/update-password',
];

/**
 * Checks if a path is accessible to everyone
 */
const isPublicPath = (pathname: string): boolean => {
  return PUBLIC_PATHS.includes(pathname);
};

/**
 * Checks if a path is only for unauthorized users
 */
const isUnauthorizedOnlyPath = (pathname: string): boolean => {
  return UNAUTHORIZED_ONLY_PATHS.includes(pathname);
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

  const { pathname } = url;
  const isAuthenticated = !!user;

  // 1. Public paths - accessible to everyone
  if (isPublicPath(pathname)) {
    return next();
  }

  // 2. Unauthorized-only paths - only for logged-out users
  if (isUnauthorizedOnlyPath(pathname)) {
    if (isAuthenticated) {
      // Redirect authenticated users to home
      return redirect('/');
    }
    return next();
  }

  // 3. All other paths require authentication (secure by default)
  if (!isAuthenticated) {
    // Redirect unauthenticated users to login with redirect parameter
    const redirectUrl = new URL('/login', url.origin);
    redirectUrl.searchParams.set('redirect', pathname + url.search);
    return redirect(redirectUrl.toString());
  }

  return next();
});
