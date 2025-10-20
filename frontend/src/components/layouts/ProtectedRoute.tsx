import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseSession } from '../../hooks/useSupabaseSession';

type Props = { children: ReactNode };

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useSupabaseSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  if (loading) return <p>Loading...</p>;
  return <>{user && children}</>;
}
