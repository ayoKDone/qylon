import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; // or context

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user, loading } = useAuth(); // this comes from Supabase or your AuthContext

  if (loading) return <div>Loading...</div>;

  if (!user) {
    // not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  return children; // logged in → show the protected page
}
