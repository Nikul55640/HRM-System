import api from '../core/api/api';
import { toast } from 'react-toastify';

const adminDashboardService = {
  /**
   * Get complete admin dashboard data
   * Aggregates data from multiple endpoints
   */
  getAdminDashboard: async () => {
    try {
      console.log('📊 [ADMIN DASHBOARD SERVICE] Fetching admin dashboard data...');

      // Fetch all data in parallel for better performance
      const [employeesRes, attendanceRes, leavesRes] = await Promise.allSettled([
        api.get('/employees', { params: { limit: 100 } }),  // Max limit is 100 per validation
        api.get('/admin/attendance'), // Just for stats
        api.get('/admin/leave/leave-requests'),  // Correct route: /admin/leave/leave-requests
      ]);

      // Debug: Log full responses
      console.log('🔍 [DEBUG] Employees Response:', {
        status: employeesRes.status,
        fullData: employeesRes.status === 'fulfilled' ? employeesRes.value.data : employeesRes.reason,
      });
      console.log('🔍 [DEBUG] Attendance Response:', {
        status: attendanceRes.status,
        fullData: attendanceRes.status === 'fulfilled' ? attendanceRes.value.data : attendanceRes.reason,
      });
      console.log('🔍 [DEBUG] Leaves Response:', {
        status: leavesRes.status,
        fullData: leavesRes.status === 'fulfilled' ? leavesRes.value.data : leavesRes.reason,
      });

      // Extract data safely - backend returns { success, data: { employees: [...] } }
      const employeesData = employeesRes.status === 'fulfilled' ? employeesRes.value.data?.data?.employees : null;
      const attendanceData = attendanceRes.status === 'fulfilled' ? attendanceRes.value.data?.data : null;
      const leavesData = leavesRes.status === 'fulfilled' ? leavesRes.value.data?.data : null;

      console.log('📊 [ADMIN DASHBOARD SERVICE] Extracted data:', {
        employeesData: employeesData,
        employeesLength: employeesData?.length || 0,
        attendanceData: attendanceData,
        leavesData: leavesData,
      });

      // Calculate stats from real data
      const stats = {
        totalEmployees: employeesData?.length || 0,
        activeEmployees: employeesData?.filter(emp => emp.status === 'active').length || 0,
        onLeaveToday: leavesData?.filter(leave => {
          const today = new Date().toISOString().split('T')[0];
          return leave.status === 'approved' && 
                 leave.startDate <= today && 
                 leave.endDate >= today;
        }).length || 0,
        pendingApprovals: leavesData?.filter(leave => leave.status === 'pending').length || 0,
        totalPayroll: 0, // TODO: Add payroll endpoint
        departmentCount: [...new Set(employeesData?.map(emp => emp.department).filter(Boolean))].length || 0,
        newHiresThisMonth: employeesData?.filter(emp => {
          if (!emp.hireDate) return false;
          const hireDate = new Date(emp.hireDate);
          const now = new Date();
          return hireDate.getMonth() === now.getMonth() && 
                 hireDate.getFullYear() === now.getFullYear();
        }).length || 0,
        pendingDocuments: 0, // TODO: Add documents endpoint
      };

      console.log('✅ [ADMIN DASHBOARD SERVICE] Stats calculated:', stats);

      // Get recent activities (mock for now - TODO: implement audit log endpoint)
      const recentActivities = [
        { id: 1, action: 'Dashboard data loaded', user: 'System', time: 'Just now' },
      ];

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
      toast.error(error.message || 'Failed to load admin dashboard');
      throw error;
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
