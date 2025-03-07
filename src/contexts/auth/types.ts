
import { Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'driver' | null;

export interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, role: UserRole) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  userRole: UserRole;
}
