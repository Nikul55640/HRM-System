import { authenticate, optionalAuthenticate, authorize } from './authenticate.js';
import { checkPermission, checkAnyPermission } from './checkPermission.js';

/**
 * Combined Authentication & Authorization Middleware
 * This file provides a unified interface for auth-related middleware
 */

// Re-export existing middleware functions
export { authenticate, optionalAuthenticate, authorize } from './authenticate.js';
export { checkPermission, checkAnyPermission } from './checkPermission.js';

// Alias for common usage patterns
export const authenticateToken = authenticate;

// Role-based middleware factory using the authorize function from authenticate.js
export const requireRole = (roles) => {
    return authorize(roles);
};

// Combined auth + permission check
export const authAndPermission = (permission) => {
    return [authenticate, checkPermission(permission)];
};

// Combined auth + any permission check
export const authAndAnyPermission = (permissions) => {
    return [authenticate, checkAnyPermission(permissions)];
};

// Combined auth + role check
export const authAndRole = (roles) => {
    return [authenticate, authorize(roles)];
};

export default {
    authenticate,
    authenticateToken: authenticate,
    authorize,
    checkPermission,
    checkAnyPermission,
    requireRole,
    authAndPermission,
    authAndAnyPermission,
    authAndRole,
};