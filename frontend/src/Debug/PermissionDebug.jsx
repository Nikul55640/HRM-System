import React from 'react';
import useAuth from '../core/hooks/useAuth';
import { usePermissions } from '../core/hooks';
import { MODULES, ROLES } from '../core/utils/rolePermissions';

const PermissionDebug = () => {
  const { user } = useAuth();
  const { can, is, permissions } = usePermissions();

  console.log('=== PERMISSION DEBUG ===');
  console.log('User:', user);
  console.log('User role:', user?.role);
  console.log('ROLES.SUPER_ADMIN:', ROLES.SUPER_ADMIN);
  console.log('Role match:', user?.role === ROLES.SUPER_ADMIN);
  console.log('Is SuperAdmin:', is.superAdmin());
  console.log('All permissions:', permissions);
  console.log('Can view users:', can.do(MODULES.USER.VIEW));
  console.log('Can view system config:', can.do(MODULES.SYSTEM.VIEW_CONFIG));
  console.log('Can view audit logs:', can.do(MODULES.SYSTEM.VIEW_AUDIT_LOGS));
  console.log('Can do any admin permissions:', can.doAny([
    MODULES.USER.VIEW,
    MODULES.SYSTEM.VIEW_CONFIG,
    MODULES.SYSTEM.VIEW_AUDIT_LOGS,
  ]));

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-md">
      <h3 className="font-bold text-sm mb-2">Permission Debug</h3>
      <div className="text-xs space-y-1">
        <div><strong>User Role:</strong> {user?.role}</div>
        <div><strong>Expected Role:</strong> {ROLES.SUPER_ADMIN}</div>
        <div><strong>Role Match:</strong> {user?.role === ROLES.SUPER_ADMIN ? 'Yes' : 'No'}</div>
        <div><strong>Is SuperAdmin:</strong> {is.superAdmin() ? 'Yes' : 'No'}</div>
        <div><strong>Can View Users:</strong> {can.do(MODULES.USER.VIEW) ? 'Yes' : 'No'}</div>
        <div><strong>Can View System:</strong> {can.do(MODULES.SYSTEM.VIEW_CONFIG) ? 'Yes' : 'No'}</div>
        <div><strong>Can View Audit:</strong> {can.do(MODULES.SYSTEM.VIEW_AUDIT_LOGS) ? 'Yes' : 'No'}</div>
        <div><strong>Permissions Count:</strong> {permissions.length}</div>
      </div>
    </div>
  );
};

export default PermissionDebug;