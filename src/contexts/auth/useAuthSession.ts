
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from './types';
import { fetchUserRole } from './authService';

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);

  // Initialize auth session
  useEffect(() => {
    console.log('AuthProvider initialized');
    
    // Check for existing session
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        console.log('Checking for existing session...');
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setIsLoading(false);
          return;
        }
        
        console.log('Session found:', session ? 'Yes' : 'No');
        setSession(session);

        if (session?.user) {
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return { session, isLoading, userRole, setUserRole, setSession };
};
