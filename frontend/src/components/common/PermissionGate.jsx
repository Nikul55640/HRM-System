/**
 * Permission Gate Component
 * Conditionally renders children based on user permissions
 */

import { useMemo } from 'react';
import useAuth from '../../hooks/useAuth';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../../utils/rolePermissions';

/**
 * PermissionGate - Renders children only if user has required permissions
 * 
 * @param {String} permission - Single permission required
 * @param {Array<String>} anyPermissions - User needs at least one of these permissions
 * @param {Array<String>} allPermissions - User needs all of these permissions
 * @param {ReactNode} children - Content to render if permission check passes
 * @param {ReactNode} fallback - Content to render if permission check fails
 */
const PermissionGate = ({
  permission,
  anyPermissions,
  allPermissions,
  children,
  fallback = null,
}) => {
  const { user } = useAuth();

  const hasAccess = useMemo(() => {
    if (!user || !user.role) return false;

    // Check single permission
    if (permission) {
      return hasPermission(user.role, permission);
    }

    // Check any permissions
    if (anyPermissions && anyPermissions.length > 0) {
      return hasAnyPermission(user.role, anyPermissions);
    }

    // Check all permissions
    if (allPermissions && allPermissions.length > 0) {
      return hasAllPermissions(user.role, allPermissions);
    }

    // No permission specified, deny by default
    return false;
  }, [user, permission, anyPermissions, allPermissions]);

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGate;
