import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import configService  from '../../services/configService';
import LoadingSpinner from '../common/LoadingSpinner';
import UserModal from '../ui/UserModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, departmentsData] = await Promise.all([
        userService.getUsers(),
        configService.getDepartments(),
      ]);
      
      // Ensure users is always an array
      // Backend returns: { success: true, data: { users: [...], pagination: {...} } }
      const usersArray = Array.isArray(usersData) 
        ? usersData 
        : Array.isArray(usersData?.data?.users)
          ? usersData.data.users
          : Array.isArray(usersData?.data) 
            ? usersData.data 
            : Array.isArray(usersData?.users)
              ? usersData.users
              : [];
      
      console.log('👥 [USER MANAGEMENT] Users loaded:', usersArray.length, 'users');
      
      // Ensure departments is always an array
      const departmentsArray = Array.isArray(departmentsData)
        ? departmentsData
        : Array.isArray(departmentsData?.data)
          ? departmentsData.data
          : [];
      
      setUsers(usersArray);
      setDepartments(departmentsArray);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(error.message || 'Failed to load data');
      // Ensure state is set to empty arrays on error
      setUsers([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleToggleActive = async (user) => {
    try {
      if (user.isActive) {
        await userService.deactivateUser(user._id);
        toast.success(`User ${user.email} has been deactivated`);
      } else {
        await userService.activateUser(user._id);
        toast.success(`User ${user.email} has been activated`);
      }
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  const handleModalSubmit = async (userData) => {
    setIsSubmitting(true);
    try {
      if (selectedUser) {
        // Update existing user
        await userService.updateUser(selectedUser._id, userData);
        toast.success('User updated successfully');
      } else {
        // Create new user
        await userService.createUser(userData);
        toast.success('User created successfully');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save user');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      SuperAdmin: 'bg-purple-100 text-purple-800',
      'HR Manager': 'bg-blue-100 text-blue-800',
      'HR Administrator': 'bg-green-100 text-green-800',
      Employee: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and their roles</p>
        </div>
        <button
          onClick={handleCreateUser}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Departments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No users found. Create your first user to get started.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'HR Manager' && user.assignedDepartments?.length > 0 ? (
                      <div className="text-sm text-gray-900">
                        {user.assignedDepartments.map((dept) => (
                          <span key={dept._id || dept} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-1 mb-1">
                            {dept.name || dept}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        user.isActive ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          user.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {showModal && (
        <UserModal
          user={selectedUser}
          departments={departments}
          onSubmit={handleModalSubmit}
          onClose={handleModalClose}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default UserManagement;
