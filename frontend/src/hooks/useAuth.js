import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login as loginThunk, logout as logoutThunk } from '../features/auth/thunks';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const login = async (email, password) => {
    const result = await dispatch(loginThunk(email, password));
    return result;
  };

  const logout = async () => {
    await dispatch(logoutThunk());
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
