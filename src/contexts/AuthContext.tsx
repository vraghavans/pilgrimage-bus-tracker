import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

type UserRole = 'admin' | 'driver' | null;

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, role: UserRole) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  userRole: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session?.user) {
          // Fetch user role from the user_roles table
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          if (data && !error) {
            setUserRole(data.role as UserRole);
          } else {
            console.error('Error fetching user role:', error);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);

      // Handle auth events - only using valid Supabase auth event types
      if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        // Redirect to auth page for these events
        navigate('/auth');
      } else if (event === 'SIGNED_IN' && session) {
        try {
          // Fetch user role when signed in
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          if (data && !error) {
            setUserRole(data.role as UserRole);
            
            // Redirect based on role
            if (data.role === 'admin') {
              navigate('/');
            } else if (data.role === 'driver') {
              navigate('/driver');
            }
          } else {
            console.error('Error fetching user role:', error);
            toast.error('Failed to retrieve user role');
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
  }, [navigate, location]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    }

    return { error };
  };

  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      console.log('Signing up user with role:', role);
      
      // Create the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error || !data.user) {
        toast.error(error?.message || 'Failed to sign up');
        return { error };
      }

      console.log('User created successfully, user ID:', data.user.id);

      // Check if role is null or undefined before proceeding
      if (!role) {
        console.error('Role is null or undefined');
        toast.error('Role selection is required');
        await supabase.auth.signOut();
        return { error: new Error('Role selection is required') };
      }

      // Ensure we're using the correct parameter names as expected by the RPC function
      const { error: roleError, data: roleData } = await supabase.rpc('create_user_role', {
        user_id: data.user.id,
        user_role: role
      });

      console.log('RPC response:', roleData);

      if (roleError) {
        console.error('Error setting user role:', roleError);
        toast.error('Failed to set user role: ' + roleError.message);
        // Sign out if we couldn't set the role
        await supabase.auth.signOut();
        return { error: roleError };
      }

      console.log('User role set successfully');
      toast.success('Account created successfully! Please sign in.');
      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error('An unexpected error occurred during sign up');
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
  };

  const value = {
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
