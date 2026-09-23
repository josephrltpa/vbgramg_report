import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials
const supabaseUrl = 'https://eflhvxlcwgkitfbsnqnk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmbGh2eGxjd2draXRmYnNucW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMzg1NTEsImV4cCI6MjEwNTcxNDU1MX0.ttcSeV9nui0OwtNs0LZC8yGhuB8Q_ZXmI66wGDFyIEs';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
