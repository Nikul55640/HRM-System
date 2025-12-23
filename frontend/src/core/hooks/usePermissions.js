/**
 * usePermissions Hook
 * Provides permission checking utilities for components
 */

import { useMemo } from 'react';
import useAuth from './useAuth';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  canAccessDepartment,
  MODULES,
  ROLES,
} from '../utils/rolePermissions';

const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user || !user.role) return [];
    return getRolePermissions(user.role);
  }, [user]);

  const can = useMemo(
    () => ({
      // Single permission check
      do: (permission) => {
        if (!user || !user.role) return false;
        return hasPermission(user.role, permission);
      },

      // Any permission check
      doAny: (permissionList) => {
        if (!user || !user.role) return false;
        return hasAnyPermission(user.role, permissionList);
      },

      // All permissions check
      doAll: (permissionList) => {
        if (!user || !user.role) return false;
        return hasAllPermissions(user.role, permissionList);
      },

      // Department access check
      accessDepartment: (departmentId) => {
        if (!user) return false;
        return canAccessDepartment(user, departmentId);
      },

      // Employee access check
      accessEmployee: (employeeId) => {
        if (!user) return false;
        
        // SuperAdmin, HR Admin can access all
        if ([ROLES.SUPER_ADMIN, ROLES.HR_ADMIN].includes(user.role)) {
          return true;
        }

        // Employee can only access own record
        if (user.role === ROLES.EMPLOYEE) {
          return user.employeeId && user.employeeId.toString() === employeeId.toString();
        }

        // HR Manager needs department check (implement based on employee's department)
        if (user.role === ROLES.HR_MANAGER) {
          return true; // Simplified - should check employee's department
        }

        return false;
      },
    }),
    [user]
  );

  const is = useMemo(
    () => ({
      superAdmin: () => user?.role === ROLES.SUPER_ADMIN,
      hrAdmin: () => user?.role === ROLES.HR_ADMIN,
      hrManager: () => user?.role === ROLES.HR_MANAGER,
      manager: () => user?.role === ROLES.MANAGER,
      employee: () => user?.role === ROLES.EMPLOYEE,
      adminRole: () =>
        [ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER].includes(user?.role),
    }),
    [user]
  );

  return {
    permissions,
    can,
    is,
    user,
    MODULES,
    ROLES,
  };
};

export default usePermissions;
