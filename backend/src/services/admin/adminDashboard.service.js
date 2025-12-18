import {
  Employee,
  Department,
  LeaveRequest,
  AttendanceRecord,
  User,
} from "../../models/sequelize/index.js";

const adminDashboardService = {
  getDashboardStats: async () => {
    try {
      console.log('📊 [ADMIN DASHBOARD SERVICE] Fetching dashboard stats...');

      // Run all dashboard queries in parallel (better performance)
      const [
        totalEmployees,
        activeEmployees,
        totalDepartments,
        pendingLeaves,
        recentEmployeesData,
        recentAttendance,
        totalUsers,
      ] = await Promise.all([
        Employee.count(),

        Employee.count({
          where: { status: "Active" },
        }),

        Department.count(),

        LeaveRequest.count({
          where: { status: "Pending" },
        }).catch(() => 0), // Handle if table doesn't exist

        Employee.findAll({
          order: [["createdAt", "DESC"]],
          limit: 5,
          attributes: [
            "id",
            "employeeId",
            "status",
            "createdAt",
            "personalInfo",
            "jobInfo",
          ],
        }),

        AttendanceRecord.findAll({
          order: [["createdAt", "DESC"]],
          limit: 10,
          attributes: ["employeeId", "type", "createdAt"],
        }).catch(() => []), // Handle if table doesn't exist

        User.count(),
      ]);

      console.log('📊 Raw counts:', {
        totalEmployees,
        activeEmployees,
        totalDepartments,
        pendingLeaves,
        totalUsers,
      });

      // Format recent employees for frontend
      const recentEmployees = recentEmployeesData.map((emp) => {
        const personalInfo = emp.personalInfo || {};
        const jobInfo = emp.jobInfo || {};
        
        return {
          id: emp.id,
          employeeId: emp.employeeId,
          fullName: `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim() || 'Unknown',
          jobTitle: jobInfo.jobTitle || jobInfo.designation || 'N/A',
          departmentName: jobInfo.department || 'N/A',
          status: emp.status,
          createdAt: emp.createdAt,
        };
      });

      console.log('📊 Formatted recent employees:', recentEmployees);

      const dashboardData = {
        totalEmployees,
        activeEmployees,
        totalDepartments,
        pendingLeaves,
        totalUsers,
        recentEmployees,
        recentAttendance,
      };

      console.log('✅ [ADMIN DASHBOARD SERVICE] Dashboard data prepared:', dashboardData);

      return dashboardData;
    } catch (error) {
      console.error("❌ Admin Dashboard Service Error:", error);
      throw error; // controller will handle response
    }
  },
};

export default adminDashboardService;
