/**
 * Debug User Permissions
 * Add this as a temporary route to see what's happening with user permissions
 */

import express from 'express';
import { authenticate } from './src/middleware/auth.middleware.js';
import { MODULES, hasPermission, getRolePermissions } from './src/config/rolePermissions.js';

const router = express.Router();

// Temporary debug endpoint
router.get('/debug/user-permissions', authenticate, (req, res) => {
  console.log('🔧 [DEBUG] User permissions check...');
  
  const user = req.user;
  const targetPermission = MODULES.ATTENDANCE.VIEW_COMPANY_STATUS;
  
  const debugInfo = {
    user: {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      roleType: typeof user?.role,
    },
    permission: {
      target: targetPermission,
      targetType: typeof targetPermission,
    },
    checks: {
      hasPermissionResult: hasPermission(user?.role, targetPermission),
      userRolePermissions: getRolePermissions(user?.role),
      permissionInList: getRolePermissions(user?.role)?.includes(targetPermission),
    },
    raw: {
      reqUser: user,
    }
  };
  
  console.log('🔧 [DEBUG] Debug info:', JSON.stringify(debugInfo, null, 2));
  
  res.json({
    success: true,
    message: 'Debug info for user permissions',
    data: debugInfo
  });
});

export default router;