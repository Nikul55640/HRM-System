/**
 * Permission Gate Component
 * Conditionally renders children based on user permissions
 */

import { useMemo } from 'react';
import useAuthStore from '../../stores/useAuthStore';

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
  const { user, hasPermission } = useAuthStore();

  const hasAccess = useMemo(() => {
    if (!user || !user.role) return false;

    // Check single permission
    if (permission) {
      return hasPermission(permission);
    }

    // Check any permissions (user needs at least one)
    if (anyPermissions && anyPermissions.length > 0) {
      return anyPermissions.some(perm => hasPermission(perm));
    }

    // Check all permissions (user needs all of them)
    if (allPermissions && allPermissions.length > 0) {
      return allPermissions.every(perm => hasPermission(perm));
    }

    // No permission specified, deny by default
    return false;
  }, [user, permission, anyPermissions, allPermissions, hasPermission]);

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGate;
