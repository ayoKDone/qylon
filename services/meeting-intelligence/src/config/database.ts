import { createClient } from '@supabase/supabase-js';

// Create a shared Supabase client instance
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Export the createClient function for services that need their own instances
export { createClient };
