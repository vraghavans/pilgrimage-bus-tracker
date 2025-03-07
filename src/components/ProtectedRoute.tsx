
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'driver' | null;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { session, isLoading, userRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // No session means not authenticated
  if (!session) {
    return <Navigate to="/auth" />;
  }

  // If a specific role is required
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to a different page based on the user's role
    if (userRole === 'admin') {
      return <Navigate to="/" />;
    } else if (userRole === 'driver') {
      return <Navigate to="/driver" />;
    } else {
      return <Navigate to="/auth" />;
    }
  }

  // User is authenticated and has the correct role
  return <>{children}</>;
};
