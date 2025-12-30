import api from './api';
import { toast } from 'react-toastify';

const adminDashboardService = {
  /**
   * Get complete admin dashboard data
   * Uses the dedicated admin dashboard endpoint
   */
  getAdminDashboard: async () => {
    try {
      console.log('📊 [ADMIN DASHBOARD SERVICE] Fetching admin dashboard data...');

      // Call the dedicated admin dashboard endpoint
      const response = await api.get('/admin/dashboard');

      // Extract data from backend response
      const backendData = response.data?.data || {};
      
      console.log('📊 [ADMIN DASHBOARD SERVICE] Backend data:', backendData);

      // Transform backend data to match frontend expectations
      const stats = {
        totalEmployees: backendData.totalEmployees || 0,
        activeEmployees: backendData.activeEmployees || 0,
        onLeaveToday: 0, // TODO: Add to backend
        pendingApprovals: backendData.pendingLeaves || 0,
        totalPayroll: 0, // TODO: Add to backend
        departmentCount: backendData.totalDepartments || 0,
        newHiresThisMonth: 0, // TODO: Add to backend
        pendingDocuments: 0, // TODO: Add to backend
      };

      console.log('✅ [ADMIN DASHBOARD SERVICE] Stats calculated:', stats);

      // Transform recent employees to recent activities
      const recentActivities = (backendData.recentEmployees || []).map((emp, index) => ({
        id: index + 1,
        action: `New employee ${emp.fullName} joined as ${emp.jobTitle}`,
        user: 'HR System',
        time: new Date(emp.createdAt).toLocaleDateString(),
      }));

      // Add default activity if no recent employees
      if (recentActivities.length === 0) {
        recentActivities.push({
          id: 1,
          action: 'Dashboard data loaded successfully',
          user: 'System',
          time: 'Just now',
        });
      }

      // Get pending tasks
      const pendingTasks = [
        { 
          id: 1, 
          task: 'Review leave requests', 
          count: stats.pendingApprovals, 
          priority: stats.pendingApprovals > 5 ? 'high' : 'medium' 
        },
      ];

      return {
        stats,
        recentActivities,
        pendingTasks,
      };
    } catch (error) {
      console.error('❌ [ADMIN DASHBOARD SERVICE] Failed to fetch dashboard:', error);
      
      // Provide fallback data if API fails
      const fallbackData = {
        stats: {
          totalEmployees: 0,
          activeEmployees: 0,
          onLeaveToday: 0,
          pendingApprovals: 0,
          totalPayroll: 0,
          departmentCount: 0,
          newHiresThisMonth: 0,
          pendingDocuments: 0,
        },
        recentActivities: [
          { id: 1, action: 'Failed to load dashboard data', user: 'System', time: 'Just now' },
        ],
        pendingTasks: [
          { id: 1, task: 'Check API connection', count: 1, priority: 'high' },
        ],
      };
      
      toast.error(error.message || 'Failed to load admin dashboard');
      return fallbackData;
    }
  },

  /**
   * Get employee statistics
   */
  getEmployeeStats: async () => {
    try {
      const response = await api.get('/employees', { params: { limit: 100 } });  // Max limit is 100
      const employees = response.data?.data?.employees || [];

      return {
        total: employees.length,
        active: employees.filter(emp => emp.status === 'active').length,
        inactive: employees.filter(emp => emp.status === 'inactive').length,
        byDepartment: employees.reduce((acc, emp) => {
          const dept = emp.department || 'Unassigned';
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {}),
      };
    } catch (error) {
      console.error('❌ [ADMIN DASHBOARD SERVICE] Failed to fetch employee stats:', error);
      throw error;
    }
  },

  /**
   * Get attendance statistics
   */
  getAttendanceStats: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get('/admin/attendance', {
        params: {
          startDate: today,
          endDate: today,
        },
      });

      const records = response.data?.data?.records || response.data?.data || [];

      return {
        present: records.filter(r => r.status === 'present').length,
        absent: records.filter(r => r.status === 'absent').length,
        late: records.filter(r => r.status === 'late').length,
        onLeave: records.filter(r => r.status === 'on_leave').length,
      };
    } catch (error) {
      console.error('❌ [ADMIN DASHBOARD SERVICE] Failed to fetch attendance stats:', error);
      throw error;
    }
  },

  /**
   * Get leave statistics
   */
  getLeaveStats: async () => {
    try {
      const response = await api.get('/admin/leave/leave-requests');
      const leaves = response.data?.data?.leaveRequests || response.data?.data || [];

      return {
        pending: leaves.filter(l => l.status === 'pending').length,
        approved: leaves.filter(l => l.status === 'approved').length,
        rejected: leaves.filter(l => l.status === 'rejected').length,
        total: leaves.length,
      };
    } catch (error) {
      console.error('❌ [ADMIN DASHBOARD SERVICE] Failed to fetch leave stats:', error);
      throw error;
    }
  },
};

export default adminDashboardService;
