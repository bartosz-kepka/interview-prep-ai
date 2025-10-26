import type { AstroCookies } from 'astro';
import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

import type { Database } from '../db/database.types.ts';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_KEY;

// Legacy client for client-side usage (if needed)
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
export type SupabaseClient = typeof supabaseClient;

export const DEV_USER_ID = '34c1f4e0-ddab-4bc9-ab22-eb368cefbaaa';

// SSR cookie options
export const cookieOptions: CookieOptionsWithName = {
  path: '/',
  secure: import.meta.env.PROD,
  httpOnly: true,
  sameSite: 'lax',
};

// Parse cookie header for SSR
const parseCookieHeader = (cookieHeader: string): { name: string; value: string }[] => {
  if (!cookieHeader) return [];
  return cookieHeader.split(';').map((cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    return { name, value: rest.join('=') };
  });
};

// Create Supabase server instance for SSR
export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
}) => {
  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get('Cookie') ?? '');
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          context.cookies.set(name, value, options),
        );
      },
    },
  });

  return supabase;
};
