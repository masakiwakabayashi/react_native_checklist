// Helper for scripts/back-end contexts that need elevated Supabase access.
// Do NOT import this file in client-facing code; it relies on the secret key.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error('Missing Supabase admin environment variables. Set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey);
