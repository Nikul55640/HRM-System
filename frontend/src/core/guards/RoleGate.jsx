/**
 * Role Gate Component
 * Conditionally renders children based on user roles
 */

import { useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import { getSystemRole } from '../utils/roles';

/**
 * RoleGate - Renders children only if user has required role(s)
 * 
 * @param {String|Array<String>} roles - Required role(s) (supports both old and new formats)
 * @param {ReactNode} children - Content to render if role check passes
 * @param {ReactNode} fallback - Content to render if role check fails
 */
const RoleGate = ({ roles, children, fallback = null }) => {
  const { user } = useAuth();

  const hasAccess = useMemo(() => {
    if (!user || !user.role) return false;

    // Get user's system role (standardized format)
    const userSystemRole = user.systemRole || getSystemRole(user.role);
    
    // Normalize required roles to system format
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    const normalizedRequiredRoles = requiredRoles.map(role => 
      typeof role === 'string' ? getSystemRole(role) : role
    );

    return normalizedRequiredRoles.includes(userSystemRole);
  }, [user, roles]);

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
};

export default RoleGate;
