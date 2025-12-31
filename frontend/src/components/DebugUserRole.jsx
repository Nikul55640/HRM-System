import React from 'react';
import useAuth from '../core/hooks/useAuth';
import { usePermissions } from '../core/hooks';
import { MODULES } from '../core/utils/rolePermissions';

const DebugUserRole = () => {
  const { user, isAuthenticated } = useAuth();
  const { can, permissions } = usePermissions();

  if (!isAuthenticated) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
        <strong>Debug:</strong> User not authenticated
      </div>
    );
  }

  const attendancePermissions = [
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.EDIT_ANY,
    MODULES.ATTENDANCE.APPROVE_CORRECTION
  ];

  return (
    <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded z-50 max-w-md text-xs">
      <div><strong>Debug Info:</strong></div>
      <div><strong>User Role:</strong> "{user?.role}" (type: {typeof user?.role})</div>
      <div><strong>User ID:</strong> {user?.id}</div>
      <div><strong>Employee ID:</strong> {user?.employeeId}</div>
      <div><strong>Permissions Count:</strong> {permissions.length}</div>
      
      <div className="mt-2"><strong>Attendance Permissions:</strong></div>
      {attendancePermissions.map(perm => (
        <div key={perm} className="ml-2">
          {perm}: {can.do(perm) ? '✅' : '❌'}
        </div>
      ))}
      
      <div className="mt-2"><strong>Required Roles for Admin Routes:</strong></div>
      <div className="ml-2">["SuperAdmin", "HR Administrator", "HR Manager"]</div>
      
      <div className="mt-2"><strong>Role Match Check:</strong></div>
      <div className="ml-2">
        SuperAdmin: {user?.role === 'SuperAdmin' ? '✅' : '❌'}<br/>
        HR Administrator: {user?.role === 'HR Administrator' ? '✅' : '❌'}<br/>
        HR Manager: {user?.role === 'HR Manager' ? '✅' : '❌'}
      </div>
    </div>
  );
};

export default DebugUserRole;