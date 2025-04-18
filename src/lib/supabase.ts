
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with your project's URL and public API key
export const supabase = createClient(
  'https://zhqnwkygdbiovmrnnkff.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpocW53a3lnZGJpb3Ztcm5ua2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NDUzMjAsImV4cCI6MjA2MDUyMTMyMH0.NLQquu3zWmWouf0rFNvU-2-yTY5zfQ3_7Ia_Na-t7Kk'
);
