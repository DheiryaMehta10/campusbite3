import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

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