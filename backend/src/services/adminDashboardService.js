import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Attendance from "../models/AttendanceRecord.js";

const adminDashboardService = {
  getDashboardStats: async () => {
    // 1. Total employees
    const totalEmployees = await Employee.countDocuments();

    // 2. Active employees
    const activeEmployees = await Employee.countDocuments({
      status: "Active",
    });

    // 3. Total departments
    const totalDepartments = await Department.countDocuments();

    // 4. Recent employees (clean formatted)
    const recent = await Employee.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("personalInfo jobInfo employeeId createdAt status")
      .populate("jobInfo.department", "name code");

    const recentEmployees = recent.map((emp) => ({
      fullName: `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
      jobTitle: emp.jobInfo.jobTitle,
      departmentName: emp.jobInfo.department?.name || "N/A",
      departmentCode: emp.jobInfo.department?.code || "",
      employeeId: emp.employeeId,
      status: emp.status,
      createdAt: emp.createdAt,
      _id: emp._id,
    }));

    // 5. Pending leave requests
    const pendingLeaves = await LeaveRequest.countDocuments({
      status: "Pending",
    });

    // 6. Recent attendance logs
    const recentAttendance = await Attendance.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select("employeeId type createdAt");

    return {
      totalEmployees,
      activeEmployees,
      totalDepartments,
      pendingLeaves,
      recentEmployees,
      recentAttendance,
    };
  },
};

export default adminDashboardService;
