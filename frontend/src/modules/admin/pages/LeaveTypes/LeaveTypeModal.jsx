import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { leaveTypeService } from '../../services/leaveTypeService';

const LeaveTypeModal = ({ leaveType, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    maxDaysPerYear: 0,
    maxConsecutiveDays: '',
    carryForward: false,
    carryForwardLimit: '',
    isPaid: true,
    requiresApproval: true,
    advanceNoticeRequired: 1,
    applicableGender: 'all',
    minServiceMonths: 0,
    isActive: true,
    color: '#3B82F6'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (leaveType) {
      setFormData({
        name: leaveType.name || '',
        code: leaveType.code || '',
        description: leaveType.description || '',
        maxDaysPerYear: leaveType.maxDaysPerYear || 0,
        maxConsecutiveDays: leaveType.maxConsecutiveDays || '',
        carryForward: leaveType.carryForward || false,
        carryForwardLimit: leaveType.carryForwardLimit || '',
        isPaid: leaveType.isPaid !== undefined ? leaveType.isPaid : true,
        requiresApproval: leaveType.requiresApproval !== undefined ? leaveType.requiresApproval : true,
        advanceNoticeRequired: leaveType.advanceNoticeRequired || 1,
        applicableGender: leaveType.applicableGender || 'all',
        minServiceMonths: leaveType.minServiceMonths || 0,
        isActive: leaveType.isActive !== undefined ? leaveType.isActive : true,
        color: leaveType.color || '#3B82F6'
      });
    }
  }, [leaveType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Leave type name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Leave type code is required';
    } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      newErrors.code = 'Code must contain only uppercase letters, numbers, and underscores';
    }

    if (formData.maxDaysPerYear < 0) {
      newErrors.maxDaysPerYear = 'Maximum days per year cannot be negative';
    }

    if (formData.carryForward && !formData.carryForwardLimit) {
      newErrors.carryForwardLimit = 'Carry forward limit is required when carry forward is enabled';
    }

    if (formData.advanceNoticeRequired < 0) {
      newErrors.advanceNoticeRequired = 'Advance notice required cannot be negative';
    }

    if (formData.minServiceMonths < 0) {
      newErrors.minServiceMonths = 'Minimum service months cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        code: formData.code.toUpperCase(),
        maxDaysPerYear: parseInt(formData.maxDaysPerYear),
        maxConsecutiveDays: formData.maxConsecutiveDays ? parseInt(formData.maxConsecutiveDays) : null,
        carryForwardLimit: formData.carryForwardLimit ? parseInt(formData.carryForwardLimit) : null,
        advanceNoticeRequired: parseInt(formData.advanceNoticeRequired),
        minServiceMonths: parseInt(formData.minServiceMonths)
      };

      if (leaveType) {
        await leaveTypeService.updateLeaveType(leaveType.id, submitData);
        toast.success('Leave type updated successfully');
      } else {
        await leaveTypeService.createLeaveType(submitData);
        toast.success('Leave type created successfully');
      }
      
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save leave type';
      toast.error(errorMessage);
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.field] = err.message;
        });
        setErrors(backendErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {leaveType ? 'Edit Leave Type' : 'Add New Leave Type'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Annual Leave"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., AL"
                style={{ textTransform: 'uppercase' }}
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of this leave type"
            />
          </div>

          {/* Leave Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Days Per Year *
              </label>
              <input
                type="number"
                name="maxDaysPerYear"
                value={formData.maxDaysPerYear}
                onChange={handleChange}
                min="0"
                max="365"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.maxDaysPerYear ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.maxDaysPerYear && <p className="text-red-500 text-sm mt-1">{errors.maxDaysPerYear}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Consecutive Days
              </label>
              <input
                type="number"
                name="maxConsecutiveDays"
                value={formData.maxConsecutiveDays}
                onChange={handleChange}
                min="1"
                max="365"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Carry Forward */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="carryForward"
                checked={formData.carryForward}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Allow carry forward to next year
              </label>
            </div>

            {formData.carryForward && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carry Forward Limit *
                </label>
                <input
                  type="number"
                  name="carryForwardLimit"
                  value={formData.carryForwardLimit}
                  onChange={handleChange}
                  min="0"
                  max="365"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.carryForwardLimit ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.carryForwardLimit && <p className="text-red-500 text-sm mt-1">{errors.carryForwardLimit}</p>}
              </div>
            )}
          </div>

          {/* Leave Properties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPaid"
                  checked={formData.isPaid}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Paid leave
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requiresApproval"
                  checked={formData.requiresApproval}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Requires approval
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advance Notice Required (days)
                </label>
                <input
                  type="number"
                  name="advanceNoticeRequired"
                  value={formData.advanceNoticeRequired}
                  onChange={handleChange}
                  min="0"
                  max="365"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.advanceNoticeRequired ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.advanceNoticeRequired && <p className="text-red-500 text-sm mt-1">{errors.advanceNoticeRequired}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Service Months
                </label>
                <input
                  type="number"
                  name="minServiceMonths"
                  value={formData.minServiceMonths}
                  onChange={handleChange}
                  min="0"
                  max="600"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.minServiceMonths ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.minServiceMonths && <p className="text-red-500 text-sm mt-1">{errors.minServiceMonths}</p>}
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Applicable Gender
              </label>
              <select
                name="applicableGender"
                value={formData.applicableGender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save size={16} />
              )}
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveTypeModal;