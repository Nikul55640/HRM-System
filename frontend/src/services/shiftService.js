import api from './api';
import { toast } from 'react-toastify';

/**
 * Shift Management Service
 * Handles all API calls for shift management (Feature 6)
 */

const shiftService = {
  // ===================================================
  // EMPLOYEE SHIFT SERVICES
  // ===================================================
  employee: {
    // Get my shift assignments
    getMyShifts: async (params = {}) => {
      try {
        const response = await api.get('/employee/shifts/my-shifts', { params });
        return response.data;
      } catch (error) {
        toast.error(error.message || 'Failed to fetch shifts');
        throw error;
      }
    },

    // Get current active shift
    getCurrentShift: async () => {
      try {
        const response = await api.get('/employee/shifts/current');
        return response.data;
      } catch (error) {
        toast.error(error.message || 'Failed to fetch current shift');
        throw error;
      }
    },

    // Get shift schedule
    getSchedule: async (params = {}) => {
      try {
        const response = await api.get('/employee/shifts/schedule', { params });
        return response.data;
      } catch (error) {
        toast.error(error.message || 'Failed to fetch schedule');
        throw error;
      }
    },

    // Request shift change
    requestShiftChange: async (requestData) => {
      try {
        const response = await api.post('/employee/shifts/change-request', requestData);
        toast.success('Shift change request submitted successfully');
        return response.data;
      } catch (error) {
        toast.error(error.message || 'Failed to submit shift change request');
        throw error;
      }
    },
  },

  // ===================================================
  // ADMIN SHIFT SERVICES (HR & SuperAdmin)
  // ===================================================
  admin: {
    // Get all shifts
    getAllShifts: async (params = {}) => {
      try {
        const response = await api.get('/admin/shifts', { params });
        return response.data;
      } catch (error) {
        toast.error(error.message || 'Failed to fetch shifts');
        throw error;
      }
    },

    // Create new shift
    createShift: async (shiftData) => {
      try {
        const response = await api.post('/admin/shifts', shiftData);
        toast.success('Shift created successfully');
        return response.data;
      } catch (error) {
        toast.error(error.message || 'Failed to create shift');
        throw error;
      }
    },

    // Update shift
    updateShift: async (shiftId, shiftData) => {
      try {
        const response = await api.put(`/admin/shifts/${shiftId}`, shiftData);
        toast.success('Shift updated successfully');
        return response.data;
      } catch (error) {
        toast.error(error.message || 'Failed to update shift');
        throw error;
      }
    },

    // Delete shift
    deleteShift: async (shiftId) => {
      try {
        const response = await api.delete(`/admin/shifts/${shiftId}`);
        toast.success('Shift deleted successfully');
        return response.data;
      } catch (error) {
        toast.error(error.message || 'Failed to delete shift');
        throw error;
      }
    },

    // Assign shift to employee
    assignShift: async (assignmentData) => {
      try {
        const response = await api.post('/admin/shifts/assign', assignmentData);
        toast.success('Shift assigned successfully');
        return response.data;
      } catch (error) {
        toast.error(error.message || 'Failed to assign shift');
        throw error;
      }
    },

    // Get shift change requests
    getChangeRequests: async (params = {}) => {
      try {
        const response = await api.get('/admin/shifts/change-requests', { params });
        return response.data;
      } catch (error) {
        toast.error(error.message || 'Failed to fetch change requests');
        throw error;
      }
    },

    // Approve shift change request
    approveChangeRequest: async (requestId) => {
      try {
        const response = await api.put(`/admin/shifts/change-requests/${requestId}/approve`);
        toast.success('Shift change request approved');
        return response.data;
      } catch (error) {
        toast.error(error.message || 'Failed to approve request');
        throw error;
      }
    },

    // Reject shift change request
    rejectChangeRequest: async (requestId, reason) => {
      try {
        const response = await api.put(`/admin/shifts/change-requests/${requestId}/reject`, { reason });
        toast.success('Shift change request rejected');
        return response.data;
      } catch (error) {
        toast.error(error.message || 'Failed to reject request');
        throw error;
      }
    },
  },
};

export default shiftService;