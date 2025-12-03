import api from './api';
import { toast } from 'react-toastify';

const attendanceService = {
  // Employee: Get own attendance records
  getMyAttendance: async (params) => {
    try {
      console.log('📅 [ATTENDANCE] Fetching attendance records:', params);
      const response = await api.get('/employee/attendance', { params });
      console.log('✅ [ATTENDANCE] Records fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [ATTENDANCE] Failed to fetch records:', error);
      toast.error(error.message || 'Failed to load attendance records');
      throw error;
    }
  },

  // Employee: Check in
  checkIn: async (location) => {
    try {
      console.log('🟢 [ATTENDANCE] Checking in:', location);
      const response = await api.post('/employee/attendance/check-in', { location });
      console.log('✅ [ATTENDANCE] Check-in successful:', response.data);
      toast.success('Checked in successfully!');
      return response.data;
    } catch (error) {
      console.error('❌ [ATTENDANCE] Check-in failed:', error);
      toast.error(error.message || 'Failed to check in');
      throw error;
    }
  },

  // Employee: Check out
  checkOut: async (location) => {
    try {
      console.log('🔴 [ATTENDANCE] Checking out:', location);
      const response = await api.post('/employee/attendance/check-out', { location });
      console.log('✅ [ATTENDANCE] Check-out successful:', response.data);
      toast.success('Checked out successfully!');
      return response.data;
    } catch (error) {
      console.error('❌ [ATTENDANCE] Check-out failed:', error);
      toast.error(error.message || 'Failed to check out');
      throw error;
    }
  },

  // Employee: Get monthly summary
  getMonthlySummary: async (year, month) => {
    try {
      console.log('📊 [ATTENDANCE] Fetching monthly summary:', { year, month });
      const response = await api.get('/employee/attendance/summary', {
        params: { year, month },
      });
      console.log('✅ [ATTENDANCE] Summary fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [ATTENDANCE] Failed to fetch summary:', error);
      toast.error(error.message || 'Failed to load attendance summary');
      throw error;
    }
  },

  // Admin/HR: Get all attendance records
  getAllAttendance: async (params) => {
    const response = await api.get('/admin/attendance', { params });
    return response.data;
  },

  // Admin/HR: Get attendance by employee
  getEmployeeAttendance: async (employeeId, params) => {
    const response = await api.get(`/admin/attendance/${employeeId}`, { params });
    return response.data;
  },

  // Admin/HR: Manual attendance entry
  createManualEntry: async (data) => {
    const response = await api.post('/admin/attendance/manual', data);
    return response.data;
  },

  // Admin/HR: Update attendance record
  updateAttendance: async (id, data) => {
    const response = await api.put(`/admin/attendance/${id}`, data);
    return response.data;
  },

  // Admin/HR: Delete attendance record
  deleteAttendance: async (id) => {
    const response = await api.delete(`/admin/attendance/${id}`);
    return response.data;
  },

  // Admin/HR: Approve attendance correction
  approveCorrection: async (id, data) => {
    const response = await api.put(`/admin/attendance/${id}/approve`, data);
    return response.data;
  },

  // Admin/HR: Reject attendance correction
  rejectCorrection: async (id, data) => {
    const response = await api.put(`/admin/attendance/${id}/reject`, data);
    return response.data;
  },

  // Get attendance statistics
  getStatistics: async (params) => {
    const response = await api.get('/admin/attendance/statistics', { params });
    return response.data;
  },

  // Export attendance report
  exportReport: async (params) => {
    const response = await api.get('/admin/attendance/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default attendanceService;
