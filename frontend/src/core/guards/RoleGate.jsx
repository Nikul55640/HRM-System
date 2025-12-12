/**
 * Role Gate Component
 * Conditionally renders children based on user roles
 */

import { useMemo } from 'react';
import useAuth from '../hooks/useAuth';

/**
 * RoleGate - Renders children only if user has required role(s)
 * 
 * @param {String|Array<String>} roles - Required role(s)
 * @param {ReactNode} children - Content to render if role check passes
 * @param {ReactNode} fallback - Content to render if role check fails
 */
const RoleGate = ({ roles, children, fallback = null }) => {
  const { user } = useAuth();

  const hasAccess = useMemo(() => {
    if (!user || !user.role) return false;

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }

    return user.role === roles;
  }, [user, roles]);

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
};

export default RoleGate;
