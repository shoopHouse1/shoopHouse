import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}


