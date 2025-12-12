import { useState } from 'react';
import useAuthStore from '../../stores/useAuthStore';
import useUIStore from '../../stores/useUIStore';

const ZustandAuthExample = () => {
  const {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    hasRole,
    hasPermission,
    clearError
  } = useAuthStore();
  
  const { addNotification } = useUIStore();
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      await login(credentials);
      addNotification({
        type: 'success',
        message: 'Login successful!'
      });
    } catch (error) {
      // Error already handled in store
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      addNotification({
        type: 'info',
        message: 'You have been logged out'
      });
    } catch (error) {
      // Error already handled in store
    }
  };

  if (isAuthenticated) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold">Welcome, {user?.firstName || user?.email}!</h2>
              <p className="text-gray-600">Role: {user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>

          {/* Role-based content */}
          <div className="space-y-4">
            {hasRole(['SuperAdmin', 'HR Administrator']) && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Admin Panel</h3>
                <p className="text-blue-600">You have admin access!</p>
              </div>
            )}

            {hasRole('HR Manager') && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">HR Manager Panel</h3>
                <p className="text-green-600">You can manage your assigned departments.</p>
              </div>
            )}

            {hasPermission('EMPLOYEE_VIEW') && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">Employee Access</h3>
                <p className="text-purple-600">You can view employee information.</p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold">User Information</h3>
              <pre className="text-sm mt-2 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Login (Zustand)</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={clearError}
              className="float-right text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({
                ...prev,
                email: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({
                ...prev,
                password: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Demo Credentials:</p>
          <p>admin@example.com / password123</p>
        </div>
      </div>
    </div>
  );
};

export default ZustandAuthExample;