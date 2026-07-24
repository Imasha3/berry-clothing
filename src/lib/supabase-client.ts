import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (envUrl.includes("supabase.com/dashboard/project/")) {
    const parts = envUrl.split("/project/");
    const projectId = parts[parts.length - 1]?.trim();
    if (projectId) {
      return `https://${projectId}.supabase.co`;
    }
  }
  return envUrl.trim() || "https://qjbsgfvrdojhybdqaphv.supabase.co";
}

const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_eN2eozsb7GPTijCSM1t5Aw_9AAU-pBB").trim();

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabaseClient;
