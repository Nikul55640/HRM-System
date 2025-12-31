import React from 'react';
import useAuth from '../core/hooks/useAuth';
import { usePermissions } from '../core/hooks';
import { MODULES } from '../core/utils/rolePermissions';

const DebugAuth = () => {
  const { user, isAuthenticated, token } = useAuth();
  const { can, permissions, is } = usePermissions();

  const attendancePermissions = [
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.EDIT_ANY,
    MODULES.ATTENDANCE.APPROVE_CORRECTION
  ];

  const adminRouteRoles = ["SuperAdmin", "HR Administrator", "HR Manager"];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
            <div><strong>User ID:</strong> {user?.id || 'N/A'}</div>
            <div><strong>Name:</strong> {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'N/A'}</div>
            <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
            <div><strong>Role:</strong> "{user?.role}" (type: {typeof user?.role})</div>
            <div><strong>Employee ID:</strong> {user?.employeeId || 'N/A'}</div>
            <div><strong>Token Present:</strong> {token ? '✅ Yes' : '❌ No'}</div>
            <div><strong>Token Length:</strong> {token?.length || 0}</div>
          </div>
        </div>

        {/* Role Checks */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Role Checks</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Required Roles for Admin:</strong></div>
            <div className="ml-4 space-y-1">
              {adminRouteRoles.map(role => (
                <div key={role}>
                  {role}: {user?.role === role ? '✅ Match' : '❌ No Match'}
                </div>
              ))}
            </div>
            <div className="mt-4"><strong>Role Helper Functions:</strong></div>
            <div className="ml-4 space-y-1">
              <div>is.superAdmin(): {is.superAdmin() ? '✅' : '❌'}</div>
              <div>is.hrAdmin(): {is.hrAdmin() ? '✅' : '❌'}</div>
              <div>is.hrManager(): {is.hrManager() ? '✅' : '❌'}</div>
              <div>is.adminRole(): {is.adminRole() ? '✅' : '❌'}</div>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Permissions</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Total Permissions:</strong> {permissions.length}</div>
            <div><strong>Attendance Permissions:</strong></div>
            <div className="ml-4 space-y-1">
              {attendancePermissions.map(perm => (
                <div key={perm}>
                  {perm.split('.').pop()}: {can.do(perm) ? '✅' : '❌'}
                </div>
              ))}
            </div>
            <div className="mt-4"><strong>Permission Check:</strong></div>
            <div className="ml-4">
              can.doAny([VIEW_ALL, EDIT_ANY]): {can.doAny([MODULES.ATTENDANCE.VIEW_ALL, MODULES.ATTENDANCE.EDIT_ANY]) ? '✅' : '❌'}
            </div>
          </div>
        </div>

        {/* Raw Data */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Raw User Object</h2>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>

      {/* Test API Call */}
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-lg font-semibold mb-4">API Test</h2>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={async () => {
            try {
              const response = await fetch('/api/admin/attendance-corrections/pending', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              console.log('API Response Status:', response.status);
              const data = await response.json();
              console.log('API Response Data:', data);
              alert(`API Response: ${response.status} - Check console for details`);
            } catch (error) {
              console.error('API Error:', error);
              alert(`API Error: ${error.message}`);
            }
          }}
        >
          Test Attendance Corrections API
        </button>
      </div>
    </div>
  );
};

export default DebugAuth;