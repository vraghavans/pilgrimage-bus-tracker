
import { useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { UserRole } from './types';
import { fetchUserRole } from './authService';

interface AuthStateChangeProps {
  setSession: (session: Session | null) => void;
  setUserRole: (role: UserRole) => void;
}

export const useAuthStateChange = ({ setSession, setUserRole }: AuthStateChangeProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);

      // Handle auth events - only using valid Supabase auth event types
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, redirecting to auth page');
        setUserRole(null);
        navigate('/auth');
      } else if (event === 'USER_UPDATED') {
        console.log('User updated, redirecting to auth page');
        navigate('/auth');
      } else if (event === 'SIGNED_IN' && session) {
        try {
          console.log('User signed in, fetching role');
          // Fetch user role when signed in
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
          
          // Redirect based on role
          if (role === 'admin') {
            console.log('Admin user, redirecting to admin dashboard');
            navigate('/');
          } else if (role === 'driver') {
            console.log('Driver user, redirecting to driver app');
            navigate('/driver');
          }
        } catch (error) {
          console.error('Error during auth state change:', error);
          toast.error('Authentication error occurred');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location, setSession, setUserRole]);
};
