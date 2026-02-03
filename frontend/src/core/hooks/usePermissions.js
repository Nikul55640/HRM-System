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
} from '../utils/rolePermissions';
import { ROLES, getSystemRole, isAdminRole, isHRRole, isEmployeeRole } from '../utils/roles';

const usePermissions = () => {
  const { user } = useAuth();

  // Get user's system role (standardized format)
  const userSystemRole = useMemo(() => {
    if (!user || !user.role) return null;
    return user.systemRole || getSystemRole(user.role);
  }, [user]);

  const permissions = useMemo(() => {
    if (!userSystemRole) return [];
    return getRolePermissions(userSystemRole);
  }, [userSystemRole]);

  const can = useMemo(
    () => ({
      // Single permission check
      do: (permission) => {
        if (!userSystemRole) return false;
        return hasPermission(userSystemRole, permission);
      },

      // Any permission check
      doAny: (permissionList) => {
        if (!userSystemRole) return false;
        return hasAnyPermission(userSystemRole, permissionList);
      },

      // All permissions check
      doAll: (permissionList) => {
        if (!userSystemRole) return false;
        return hasAllPermissions(userSystemRole, permissionList);
      },

      // Department access check
      accessDepartment: (departmentId) => {
        if (!user) return false;
        return canAccessDepartment(user, departmentId);
      },

      // Employee access check
      accessEmployee: (employeeId) => {
        if (!user || !userSystemRole) return false;
        
        // SuperAdmin, HR can access all
        if (isAdminRole(userSystemRole)) {
          return true;
        }

        // Employee can only access own record
        if (isEmployeeRole(userSystemRole)) {
          return user.employeeId && user.employeeId.toString() === employeeId.toString();
        }

        return false;
      },
    }),
    [user, userSystemRole]
  );

  const is = useMemo(
    () => ({
      superAdmin: () => userSystemRole === ROLES.SUPER_ADMIN,
      hrAdmin: () => userSystemRole === ROLES.HR_ADMIN,
      hrManager: () => userSystemRole === ROLES.HR_MANAGER,
      employee: () => userSystemRole === ROLES.EMPLOYEE,
      adminRole: () => isAdminRole(userSystemRole),
      hrRole: () => isHRRole(userSystemRole),
      employeeRole: () => isEmployeeRole(userSystemRole),
    }),
    [userSystemRole]
  );

  return {
    permissions,
    can,
    is,
    user,
    userSystemRole,
    MODULES,
    ROLES,
  };
};

export default usePermissions;
