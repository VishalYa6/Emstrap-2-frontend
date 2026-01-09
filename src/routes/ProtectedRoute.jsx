import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
// ❌ Removed 'shallow' import as it is no longer needed

export const ProtectedRoute = ({ role }) => {
  // ✅ FIXED: Select state individually to prevent infinite loops
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentRole = useAuthStore((state) => state.role);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && currentRole !== role) {
    return <Navigate to={`/${currentRole.toLowerCase()}/dashboard`} replace />;
  }

  return <Outlet />;
};
