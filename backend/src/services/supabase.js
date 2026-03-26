'use strict';

/**
 * Supabase client singleton.
 *
 * ⚠️  STUB: Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env before use.
 *      Sign up at https://supabase.com — it's free tier is sufficient for development.
 *
 * The service role key bypasses Row Level Security (RLS) — keep it server-side only.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn(`[${new Date().toISOString()}] [WARN]  [supabase] SUPABASE_URL or SUPABASE_SERVICE_KEY is not set. DB operations will fail until credentials are provided in .env`);
}

const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_SERVICE_KEY || 'placeholder_key',
  {
    auth: { persistSession: false },
  }
);

module.exports = supabase;
