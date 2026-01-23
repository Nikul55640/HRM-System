import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../components';
import { Eye, EyeOff } from 'lucide-react';
import { mapBackendToFrontend, mapFrontendToBackend, requiresDepartmentAssignment } from '../../utils/roleMapper';

const UserModal = ({ user, departments, onSubmit, onClose, isSubmitting }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Employee',
    assignedDepartments: [],
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        password: '', // Don't populate password for edit
        role: mapBackendToFrontend(user.role) || 'Employee',
        assignedDepartments: user.assignedDepartments?.map(d => d.id || d) || [],
      });
    }
  }, [user]);

  const roles = ['Admin', 'HR', 'Employee'];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!user && !formData.password) {
      newErrors.password = 'Password is required for new users';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (requiresDepartmentAssignment(formData.role) && formData.assignedDepartments.length === 0) {
      newErrors.assignedDepartments = 'HR users must have at least one assigned department';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = { ...formData };

      // Convert frontend role to backend role
      submitData.role = mapFrontendToBackend(submitData.role);

      // Remove password if empty (for updates)
      if (!submitData.password) {
        delete submitData.password;
      }

      // Remove assignedDepartments if not HR
      if (!requiresDepartmentAssignment(formData.role)) {
        submitData.assignedDepartments = [];
      }

      await onSubmit(submitData);
    } catch (error) {
      // Error is handled by parent component
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleDepartmentToggle = (deptId) => {
    setFormData(prev => {
      const isSelected = prev.assignedDepartments.includes(deptId);
      return {
        ...prev,
        assignedDepartments: isSelected
          ? prev.assignedDepartments.filter(id => id !== deptId)
          : [...prev.assignedDepartments, deptId],
      };
    });

    // Clear error
    if (errors.assignedDepartments) {
      setErrors(prev => ({
        ...prev,
        assignedDepartments: '',
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-2 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">
            {user ? 'Edit User' : 'Create New User'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3">
          <div className="space-y-3">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting || !!user}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                  } ${user ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="user@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password {!user && <span className="text-red-500">*</span>}
                {user && <span className="text-gray-500 text-xs ml-1">(leave blank to keep current)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Department Assignment (only for HR) */}
            {requiresDepartmentAssignment(formData.role) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Departments <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {departments.length === 0 ? (
                    <p className="text-sm text-gray-500">No departments available</p>
                  ) : (
                    <div className="space-y-2">
                      {departments.map(dept => (
                        <label key={dept.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={formData.assignedDepartments.includes(dept.id)}
                            onChange={() => handleDepartmentToggle(dept.id)}
                            disabled={isSubmitting}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({dept.code})</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {errors.assignedDepartments && (
                  <p className="mt-1 text-sm text-red-600">{errors.assignedDepartments}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Select departments this HR user can manage
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <LoadingSpinner size="small" />}
              {user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
