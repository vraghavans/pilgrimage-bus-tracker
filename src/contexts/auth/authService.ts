
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from './types';
import { toast } from 'sonner';

export const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    toast.error(error.message);
  }

  return { error };
};

export const signUp = async (email: string, password: string, role: UserRole) => {
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

export const signOut = async () => {
  await supabase.auth.signOut();
  toast.success('Signed out successfully');
};

export const fetchUserRole = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (data && !error) {
      console.log('User role found:', data.role);
      return data.role as UserRole;
    } else {
      console.error('Error fetching user role:', error);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};
