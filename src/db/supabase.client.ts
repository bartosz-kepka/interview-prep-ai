import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "../db/database.types.ts";

import { SUPABASE_URL as supabaseUrl, SUPABASE_KEY as supabaseKey, PROD as prod } from "astro:env/server";

// Legacy client for client-side usage (if needed)
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
export type SupabaseClient = typeof supabaseClient;

// SSR cookie options
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: prod,
  httpOnly: true,
  sameSite: "lax",
};

// Parse cookie header for SSR
const parseCookieHeader = (cookieHeader: string): { name: string; value: string }[] => {
  if (!cookieHeader) return [];
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
};

// Create Supabase server instance for SSR
export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};
