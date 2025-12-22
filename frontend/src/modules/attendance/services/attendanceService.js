import api from '../../../core/api/api';
import { toast } from 'react-toastify';

/**
 * Service for handling all attendance-related API calls
 */
const attendanceService = {
  // ==================== Employee Endpoints ====================

  /**
   * Get logged-in user's attendance records
   * @param {Object} params - Query parameters (month, year, status, etc.)
   * @returns {Promise<Object>} - Attendance data and pagination info
   */
  getMyAttendance: async (params = {}) => {
    try {
      console.log(' [ATTENDANCE] Fetching attendance records:', params);
      const response = await api.get('/employee/attendance', { params });
      console.log(' [ATTENDANCE] Records fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error(' [ATTENDANCE] Failed to fetch records:', error);
      const errorMsg = error.response?.data?.message || 'Failed to load attendance records';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  /**
   * Clock in with location data
   * @param {Object} data - { location: { lat, lng, address }, notes, deviceInfo }
   * @returns {Promise<Object>} - Clock-in confirmation
   */
  clockIn: async (data) => {
    try {
      console.log(' [ATTENDANCE] Clocking in:', data);
      const response = await api.post('/employee/attendance/check-in', data);
      console.log(' [ATTENDANCE] Clock-in successful:', response.data);
      toast.success('Clocked in successfully!');
      return response.data;
    } catch (error) {
      console.error(' [ATTENDANCE] Clock-in failed:', error);
      const errorMsg = error.response?.data?.message || 'Failed to clock in';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  /**
   * Clock out with optional data
   * @param {Object} data - { location: { lat, lng, address }, notes, overtime }
   * @returns {Promise<Object>} - Clock-out confirmation
   */
  clockOut: async (data = {}) => {
    try {
      console.log(' [ATTENDANCE] Clocking out:', data);
      const response = await api.post('/employee/attendance/check-out', data);
      console.log(' [ATTENDANCE] Clock-out successful:', response.data);
      toast.success('Clocked out successfully!');
      return response.data;
    } catch (error) {
      console.error(' [ATTENDANCE] Clock-out failed:', error);
      const errorMsg = error.response?.data?.message || 'Failed to clock out';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  /**
   * Get attendance summary for the logged-in user
   * @param {number} year - Year to get summary for
   * @param {number} month - Month to get summary for (1-12)
   * @returns {Promise<Object>} - Summary data including stats and calendar
   */
  getMyAttendanceSummary: async (year, month) => {
    try {
      console.log(' [ATTENDANCE] Fetching attendance summary:', { year, month });
      const response = await api.get('/employee/attendance/summary', {
        params: { year, month },
      });
      console.log(' [ATTENDANCE] Summary fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error(' [ATTENDANCE] Failed to fetch summary:', error);
      const errorMsg = error.response?.data?.message || 'Failed to load attendance summary';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  /**
   * Get today's attendance status for the logged-in user
   * @returns {Promise<Object>} - Today's attendance status and last punch
   */
  getTodayStatus: async () => {
    try {
      const response = await api.get('/employee/attendance/today');
      return response.data;
    } catch (error) {
      console.error(' [ATTENDANCE] Failed to get today\'s status:', error);
      return { status: null, lastPunch: null };
    }
  },

  // ==================== Admin/HR Endpoints ====================

  /**
   * Get all attendance records (admin only)
   * @param {Object} params - Filter and pagination parameters
   * @returns {Promise<Object>} - Paginated attendance records
   */
  getAllAttendance: async (params = {}) => {
    try {
      const response = await api.get('/admin/attendance/all', { params });
      return response.data;
    } catch (error) {
      console.error(' [ATTENDANCE] Failed to fetch all records:', error);
      const errorMsg = error.response?.data?.message || 'Failed to load attendance records';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  /**
   * Test endpoint for debugging attendance issues
   * @returns {Promise<Object>} - Test attendance records
   */
  testAttendance: async () => {
    try {
      const response = await api.get('/admin/attendance/test');
      return response.data;
    } catch (error) {
      console.error(' [ATTENDANCE] Test endpoint failed:', error);
      const errorMsg = error.response?.data?.message || 'Test endpoint failed';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  /**
   * Force get all attendance records (bypass all filters)
   * @returns {Promise<Object>} - All attendance records
   */
  forceAllAttendance: async () => {
    try {
      const response = await api.get('/admin/attendance/force-all');
      return response.data;
    } catch (error) {
      console.error(' [ATTENDANCE] Force all endpoint failed:', error);
      const errorMsg = error.response?.data?.message || 'Force all endpoint failed';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  /**
   * Get attendance for a specific employee (admin only)
   * @param {string} employeeId - ID of the employee
   * @param {Object} params - Filter and pagination parameters
   * @returns {Promise<Object>} - Employee's attendance records
   */
  getEmployeeAttendance: async (employeeId, params = {}) => {
    try {
      const response = await api.get(`/admin/attendance/employee/${employeeId}`, { params });
      return response.data;
    } catch (error) {
      console.error(` [ATTENDANCE] Failed to fetch attendance for employee ${employeeId}:`, error);
      const errorMsg = error.response?.data?.message || 'Failed to load employee attendance';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  /**
   * Create a manual attendance entry (admin only)
   * @param {Object} data - Attendance data
   * @returns {Promise<Object>} - Created attendance record
   */
  createManualEntry: async (data) => {
    try {
      const response = await api.post('/admin/attendance/manual', data);
      toast.success('Attendance record created successfully');
      return response.data;
    } catch (error) {
      console.error(' [ATTENDANCE] Failed to create manual entry:', error);
      const errorMsg = error.response?.data?.message || 'Failed to create attendance record';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  /**
   * Update an attendance record (admin only)
   * @param {string} id - Attendance record ID
   * @param {Object} data - Updated attendance data
   * @returns {Promise<Object>} - Updated attendance record
   */
  updateAttendance: async (id, data) => {
    try {
      const response = await api.put(`/admin/attendance/${id}`, data);
      toast.success('Attendance record updated successfully');
      return response.data;
    } catch (error) {
      console.error(` [ATTENDANCE] Failed to update record ${id}:`, error);
      const errorMsg = error.response?.data?.message || 'Failed to update attendance record';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  /**
   * Delete an attendance record (admin only)
   * @param {string} id - Attendance record ID to delete
   * @returns {Promise<Object>} - Deletion confirmation
   */
  deleteAttendance: async (id) => {
    try {
      const response = await api.delete(`/admin/attendance/${id}`);
      toast.success('Attendance record deleted successfully');
      return response.data;
    } catch (error) {
      console.error(` [ATTENDANCE] Failed to delete record ${id}:`, error);
      const errorMsg = error.response?.data?.message || 'Failed to delete attendance record';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  /**
   * Approve/reject an attendance correction request (admin only)
   * @param {string} id - Correction request ID
   * @param {Object} data - { status: 'approved'|'rejected', adminNotes }
   * @returns {Promise<Object>} - Updated correction request
   */
  processCorrectionRequest: async (id, data) => {
    try {
      const response = await api.put(`/admin/attendance/corrections/${id}`, data);
      toast.success(`Correction request ${data.status} successfully`);
      return response.data;
    } catch (error) {
      console.error(` [ATTENDANCE] Failed to process correction ${id}:`, error);
      const errorMsg = error.response?.data?.message || 'Failed to process correction request';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  // ==================== Reports & Analytics ====================

  /**
   * Get attendance statistics and analytics
   * @param {Object} params - Filter parameters
   * @returns {Promise<Object>} - Statistics and analytics data
   */
  getStatistics: async (params = {}) => {
    try {
      const response = await api.get('/attendance/statistics', { params });
      return response.data;
    } catch (error) {
      
      const errorMsg = error.response?.data?.message || 'Failed to load attendance statistics';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  /**
   * Export attendance data as a file (CSV/PDF)
   * @param {Object} params - Export parameters
   * @returns {Promise<Blob>} - File data as a Blob
   */
  exportReport: async (params = {}) => {
    try {
      const response = await api.get('/admin/attendance/export', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      
      const errorMsg = error.response?.data?.message || 'Failed to export attendance data';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  },
};

export default attendanceService;
