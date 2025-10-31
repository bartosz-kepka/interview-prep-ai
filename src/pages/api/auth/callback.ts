import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies, request, redirect }) => {
  // Get the code from URL params
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // Handle errors from Supabase (e.g., expired link)
  if (error) {
    if (error === "access_denied" && errorDescription?.includes("expired")) {
      return redirect("/error/expired-link");
    }
    // Redirect to login with error message
    return redirect(`/login?error=${encodeURIComponent(errorDescription || "Authentication failed")}`);
  }

  // No code - redirect to login
  if (!code) {
    return redirect("/login");
  }

  // Exchange code for session
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return redirect("/error/expired-link");
  }

  // Successfully authenticated - redirect to home
  return redirect("/");
};
