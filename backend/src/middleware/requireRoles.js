/**
 * Role-based access control middleware
 * Alternative implementation for role checking
 */

/**
 * Middleware to require specific roles
 * @param {String[]|String} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
export const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    // Handle both array and single role
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource.',
          details: {
            requiredRoles: roles,
            userRole: req.user.role,
          },
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  };
};

/**
 * Middleware to require any of the specified roles
 * @param {String[]} allowedRoles - Array of roles, user needs at least one
 * @returns {Function} Express middleware function
 */
export const requireAnyRole = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Check if user has any of the required roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource.',
          details: {
            requiredRoles: allowedRoles,
            userRole: req.user.role,
          },
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  };
};

/**
 * Middleware to require all of the specified roles (user must have all roles)
 * @param {String[]} requiredRoles - Array of roles, user needs all of them
 * @returns {Function} Express middleware function
 */
export const requireAllRoles = (requiredRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // For single role systems, check if user has the primary role
    // This is a simplified implementation - in multi-role systems,
    // you would check if user has all required roles
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have all required permissions to access this resource.',
          details: {
            requiredRoles: requiredRoles,
            userRole: req.user.role,
          },
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  };
};

export default {
  requireRoles,
  requireAnyRole,
  requireAllRoles,
};