
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const AuthDebug: React.FC = () => {
  const { session, isLoading, userRole } = useAuth();

  return (
    <div className="mt-4 p-4 bg-slate-100 rounded text-xs">
      <h4 className="font-bold">Debug Info:</h4>
      <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
      <p>Session: {session ? 'Active' : 'None'}</p>
      <p>User ID: {session?.user?.id || 'Not logged in'}</p>
      <p>Role: {userRole || 'None'}</p>
    </div>
  );
};
