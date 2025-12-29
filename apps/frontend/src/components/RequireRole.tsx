import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@shoophouse/shared';

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RequireRole({ children, allowedRoles }: RequireRoleProps) {
  const { user, hasRole } = useAuthStore();

  if (!user || !allowedRoles.some((role) => hasRole(role))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}


