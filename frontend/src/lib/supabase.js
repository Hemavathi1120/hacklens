import { createClient } from '@supabase/supabase-js';

// Default to the project's public endpoint so any cloned client can connect directly
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nglgwbmukbpmyqrazggm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_6SQuNyEM9zyCB7lcvsYhOw_RZ0kbEv9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
