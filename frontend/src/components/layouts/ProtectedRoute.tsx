import { useAuth } from '@/hooks/useAuth'; // or context
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth(); // this comes from Supabase or your AuthContext

  if (loading) return <div>Loading...</div>;

  if (!user) {
    // not logged in → redirect to login
    return <Navigate to='/login' replace />;
  }

  return children; // logged in → show the protected page
}
