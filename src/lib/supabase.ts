import { createClient } from '@supabase/supabase-js';

// ============================================================================
// IMPORTANT: Replace these with YOUR Supabase credentials!
// ============================================================================
// 1. Go to your Supabase dashboard
// 2. Click Settings (gear icon) → API
// 3. Copy your "Project URL" and paste it below
// 4. Copy your "anon public" key and paste it below
// ============================================================================

const supabaseUrl = 'YOUR_SUPABASE_URL_HERE'; // Example: 'https://abcdefghijk.supabase.co'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY_HERE'; // Example: 'eyJhbGciOiJIUzI1NiIs...'

// ============================================================================
// Don't edit below this line!
// ============================================================================

if (supabaseUrl === 'YOUR_SUPABASE_URL_HERE' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
  console.warn('⚠️ Supabase credentials not configured! Please update src/lib/supabase.ts with your credentials.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
