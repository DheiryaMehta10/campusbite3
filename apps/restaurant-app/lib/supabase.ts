import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cqctaxbrwbaphomqtpuw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY3RheGJyd2JhcGhvbXF0cHV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMTQ1MjMsImV4cCI6MjEwNjU5MDUyM30.AC7jm5qdSTs5Rk6Y3Dwzd_pb7-gjaadjiMp47CEfv8I';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY3RheGJyd2JhcGhvbXF0cHV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTAxNDUyMywiZXhwIjoyMTA2NTkwNTIzfQ.1vlNP1f02jBajFQWCOVLwVFu-gyMXRnp0OIDdEeADgM';

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

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
