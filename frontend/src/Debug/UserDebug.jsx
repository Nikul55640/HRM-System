import React from 'react';
import useAuthStore from '../stores/useAuthStore';
import PermissionDebug from './PermissionDebug';

const UserDebug = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  return (
    <>
      <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50">
        <h3 className="font-bold text-sm mb-2">Current User Debug</h3>
        <div className="text-xs space-y-1">
          <div><strong>Email:</strong> {user?.email}</div>
          <div><strong>Role:</strong> {user?.role}</div>
          <div><strong>Name:</strong> {user?.firstName} {user?.lastName}</div>
          <div><strong>ID:</strong> {user?.id}</div>
        </div>
      </div>
      <PermissionDebug />
    </>
  );
};

export default UserDebug;