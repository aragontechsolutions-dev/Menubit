import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FullPageSpinner } from '@/components/ui/spinner';

/**
 * Guarda de rutas:
 *  - sin sesión        -> /login
 *  - sesión sin tenant -> /onboarding
 *  - sesión + tenant    -> renderiza la ruta protegida
 */
export function ProtectedRoute() {
  const { session, tenant, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageSpinner />;

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!tenant) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
