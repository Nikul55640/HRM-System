/**
 * Permission-based authorization middleware
 * Provides granular access control based on specific permissions
 */

import { hasPermission, hasAnyPermission, hasAllPermissions } from '../config/rolePermissions.js';

/**
 * Check if user has a specific permission
 * @param {String} permission - Required permission
 */
export const checkPermission = (permission) => {
  return (req, res, next) => {
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

    // Use systemRole for permission checks (standardized constants)
    const userRole = req.user.systemRole || req.user.role;

    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
          details: {
            requiredPermission: permission,
            userRole: userRole,
          },
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  };
};

/**
 * Check if user has any of the specified permissions
 * @param {Array<String>} permissions - Array of permissions (user needs at least one)
 */
export const checkAnyPermission = (permissions) => {
  return (req, res, next) => {
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

    // Use systemRole for permission checks (standardized constants)
    const userRole = req.user.systemRole || req.user.role;

    if (!hasAnyPermission(userRole, permissions)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
          details: {
            requiredPermissions: permissions,
            userRole: userRole,
          },
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  };
};

/**
 * Check if user has all of the specified permissions
 * @param {Array<String>} permissions - Array of permissions (user needs all)
 */
export const checkAllPermissions = (permissions) => {
  return (req, res, next) => {
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

    // Use systemRole for permission checks (standardized constants)
    const userRole = req.user.systemRole || req.user.role;

    if (!hasAllPermissions(userRole, permissions)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
          details: {
            requiredPermissions: permissions,
            userRole: userRole,
          },
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  };
};

export default {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
};
