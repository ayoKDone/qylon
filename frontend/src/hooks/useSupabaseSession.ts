import type { User } from '@supabase/auth-js';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabaseSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial session
    supabase.auth.getSession().then(({ data }) => {
      console.log('Initial session data:', data);
      setUser(data.session?.user ?? null);
      setLoading(false);
      if (data.session) {
        localStorage.setItem('access_token', data.session.access_token);
      } else {
        localStorage.removeItem('access_token');
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session) {
        localStorage.setItem('access_token', session.access_token);
      } else {
        localStorage.removeItem('access_token');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
