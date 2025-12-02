import PropTypes from 'prop-types';
import useAuth from '../../hooks/useAuth';

/**
 * RoleGuard component that conditionally renders children based on user role
 * @param {Array|String} allowedRoles - Single role or array of roles that can access the content
 * @param {ReactNode} children - Content to render if user has required role
 * @param {ReactNode} fallback - Optional content to render if user doesn't have required role
 */
const RoleGuard = ({ allowedRoles, children, fallback = null }) => {
  const { hasRole } = useAuth();

  // Convert single role to array for consistent handling
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // Check if user has any of the allowed roles
  const hasAccess = hasRole(roles);

  if (!hasAccess) {
    return fallback;
  }

  return children;
};

RoleGuard.propTypes = {
  allowedRoles: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
};

export default RoleGuard;
