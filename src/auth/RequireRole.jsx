import { Navigate } from 'react-router-dom';
import { ROUTES } from '../app/routes.js';
import { useAuth } from './AuthProvider.jsx';
import { homePathFor } from './roles.js';

export default function RequireRole({ role, children }) {
  const { status, profile } = useAuth();

  if (status === 'loading') return null;
  if (status !== 'ready') return <Navigate to={ROUTES.login} replace />;
  if (profile.rol !== role) return <Navigate to={homePathFor(profile)} replace />;
  return children;
}
