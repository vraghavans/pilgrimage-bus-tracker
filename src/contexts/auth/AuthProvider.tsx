
import React, { createContext, useContext } from 'react';
import { useAuthSession } from './useAuthSession';
import { useAuthStateChange } from './useAuthStateChange';
import { AuthContextType } from './types';
import { signIn, signOut, signUp } from './authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading, userRole, setUserRole, setSession } = useAuthSession();
  
  // Set up auth state change listener
  useAuthStateChange({ setSession, setUserRole });

  const value: AuthContextType = {
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
