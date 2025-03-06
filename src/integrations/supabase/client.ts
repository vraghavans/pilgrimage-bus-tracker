
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yzxgsfvchitaariayuas.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6eGdzZnZjaGl0YWFyaWF5dWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyOTA3MDEsImV4cCI6MjA1NTg2NjcwMX0.BvhHxyeqH2CCmghavjgS6bSXqHnSII6i__09154-pFg';

// Log connection status but avoid exposing full keys
console.log('Supabase client initializing with URL:', supabaseUrl ? 'URL provided' : 'URL missing');
console.log('Supabase client initializing with Anon Key:', supabaseAnonKey ? 'Key provided' : 'Key missing');

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    // Debug flag to help with troubleshooting
    debug: true
  }
});

console.log('Supabase client initialized');
