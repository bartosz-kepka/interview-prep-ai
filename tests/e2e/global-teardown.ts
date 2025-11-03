import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

async function globalTeardown() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const e2eEmail = process.env.E2E_EMAIL;
  const e2ePassword = process.env.E2E_PASSWORD;
  const e2eUserId = process.env.E2E_USER_ID;

  if (!supabaseUrl || !supabaseKey || !e2eEmail || !e2ePassword || !e2eUserId) {
    console.warn("Supabase credentials not provided. Skipping database cleanup.");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: e2eEmail,
    password: e2ePassword,
  });

  if (signInError) {
    console.error("Error signing in during teardown:", signInError);
    return;
  }

  console.log("Cleaning up database for user:", e2eUserId);

  const { error: questionsError } = await supabase.from("questions").delete().eq("user_id", e2eUserId);
  if (questionsError) {
    console.error("Error cleaning questions table:", questionsError);
  } else {
    console.log("Successfully cleaned questions table.");
  }

  const { error: logsError } = await supabase.from("ai_generation_logs").delete().eq("user_id", e2eUserId);

  if (logsError) {
    console.error("Error cleaning ai_generation_logs table:", logsError);
  } else {
    console.log("Successfully cleaned ai_generation_logs table.");
  }

  console.log("Database cleanup finished.");
}

export default globalTeardown;
