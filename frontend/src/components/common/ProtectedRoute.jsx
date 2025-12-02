import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

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

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.log('❌ [PROTECTED ROUTE] User role not allowed, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('✅ [PROTECTED ROUTE] Access granted');
  return children;
};

export default ProtectedRoute;
