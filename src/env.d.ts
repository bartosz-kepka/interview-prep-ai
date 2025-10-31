/// <reference types="astro/client" />

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db/database.types.ts";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user?: {
        id: string;
        email: string | undefined;
      };
      session?: {
        access_token: string;
        refresh_token: string;
      };
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly PROD: boolean;

  // E2E test user credentials
  readonly E2E_USER_ID: string;
  readonly E2E_EMAIL: string;
  readonly E2E_PASSWORD: string;

  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
