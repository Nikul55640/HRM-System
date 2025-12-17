import {
  Employee,
  Department,
  LeaveRequest,
  AttendanceRecord,
} from "../../models/sequelize/index.js";

const adminDashboardService = {
  getDashboardStats: async () => {
    try {
      // Run all dashboard queries in parallel (better performance)
      const [
        totalEmployees,
        activeEmployees,
        totalDepartments,
        pendingLeaves,
        recentEmployeesData,
        recentAttendance,
      ] = await Promise.all([
        Employee.count(),

        Employee.count({
          where: { status: "Active" },
        }),

        Department.count(),

        LeaveRequest.count({
          where: { status: "Pending" },
        }),

        Employee.findAll({
          order: [["createdAt", "DESC"]],
          limit: 5,
          attributes: [
            "id",
            "employeeId",
            "status",
            "createdAt",
            "firstName",
            "lastName",
            "jobTitle",
          ],
        }),

        AttendanceRecord.findAll({
          order: [["createdAt", "DESC"]],
          limit: 10,
          attributes: ["employeeId", "type", "createdAt"],
        }),
      ]);

      // Format recent employees for frontend
      const recentEmployees = recentEmployeesData.map((emp) => ({
        id: emp.id,
        employeeId: emp.employeeId,
        fullName: `${emp.firstName} ${emp.lastName}`,
        jobTitle: emp.jobTitle,
        departmentName: emp.Department?.name || "N/A",
        departmentCode: emp.Department?.code || "",
        status: emp.status,
        createdAt: emp.createdAt,
      }));

      return {
        totalEmployees,
        activeEmployees,
        totalDepartments,
        pendingLeaves,
        recentEmployees,
        recentAttendance,
      };
    } catch (error) {
      console.error("❌ Admin Dashboard Service Error:", error);
      throw error; // controller will handle response
    }
  },
};

export default adminDashboardService;
