import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';

const useAuth = () => {
  const navigate = useNavigate();
  const { 
    user, 
    token, 
    isAuthenticated, 
    loading, 
    error, 
    login: loginAction, 
    logout: logoutAction 
  } = useAuthStore();

  const login = async (email, password) => {
    try {
      console.log('🔑 [USE AUTH] Login hook called with:', { email });
      const result = await loginAction({ email, password });
      console.log('🔑 [USE AUTH] Login action completed, result:', result);
      return result;
    } catch (error) {
      console.error('🔑 [USE AUTH] Login failed:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    await logoutAction();
    navigate('/login');
  };

  const hasRole = (roles) => {
    if (!user || !user.role) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const isSuperAdmin = () => hasRole('SuperAdmin');
  const isHRManager = () => hasRole('HR Manager');
  const isHRAdmin = () => hasRole('HR Administrator');
  const isEmployee = () => hasRole('Employee');

  const canAccessDepartment = (departmentId) => {
    if (isSuperAdmin() || isHRAdmin()) return true;
    if (isHRManager() && user.assignedDepartments) {
      return user.assignedDepartments.includes(departmentId);
    }
    return false;
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    hasRole,
    isSuperAdmin,
    isHRManager,
    isHRAdmin,
    isEmployee,
    canAccessDepartment,
  };
};

export default useAuth;
