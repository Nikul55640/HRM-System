import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import { LoadingSpinner } from '../../shared/components';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useAuthStore();

  console.log('🛡️ [PROTECTED ROUTE] Checking access:', {
    path: location.pathname,
    isAuthenticated,
    loading,
    user: user?.email,
    userRole: user?.role,
    allowedRoles,
    hasUser: !!user
  });

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('⏳ [PROTECTED ROUTE] Loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ [PROTECTED ROUTE] Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Simple role check without normalization - use exact role matching
  if (allowedRoles.length > 0) {
    const userRole = user?.role;
    
    if (!allowedRoles.includes(userRole)) {
      console.log('❌ [PROTECTED ROUTE] User role not allowed');
      console.log('   Required roles:', allowedRoles);
      console.log('   User role:', userRole);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('✅ [PROTECTED ROUTE] Access granted');
  return children;
};

export default ProtectedRoute;
