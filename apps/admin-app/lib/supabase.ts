import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cqctaxbrwbaphomqtpuw.supabase.co';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY3RheGJyd2JhcGhvbXF0cHV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMTQ1MjMsImV4cCI6MjEwNjU5MDUyM30.AC7jm5qdSTs5Rk6Y3Dwzd_pb7-gjaadjiMp47CEfv8I';
const ACTUAL_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY3RheGJyd2JhcGhvbXF0cHV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTAxNDUyMywiZXhwIjoyMTA2NTkwNTIzfQ.1vlNP1f02jBajFQWCOVLwVFu-gyMXRnp0OIDdEeADgM';

// Ensure service role key is NEVER accidentally overridden by the anon key
const envServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SERVICE_KEY = (envServiceKey && envServiceKey !== ANON_KEY && envServiceKey.length > 50) ? envServiceKey : ACTUAL_SERVICE_KEY;

export const supabaseClient = createClient(SUPABASE_URL, ANON_KEY);
export const supabaseServer = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function getUser(token: string) {
  if (!token) return null;
  try {
    const { data, error } = await supabaseClient.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}
