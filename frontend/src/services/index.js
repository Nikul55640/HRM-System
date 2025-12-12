export { default as api } from "../core/api/api";
export { default as authService } from "../modules/auth/services/authService";
export { default as employeeService } from "../modules/employees/services/employeeService";
export { default as documentService } from "../modules/documents/services/documentService";
export { default as userService } from "./userService";
export { default as configService } from "../core/services/configService";
export { default as dashboardService } from "../modules/employee/services/dashboardService";
export { default as employeeSelfService } from "./employeeSelfService";

// New services
export { default as calendarService } from "./calendarService";
export { default as attendanceService } from "../modules/attendance/services/attendanceService";
export { default as managerService } from "../modules/manager/services/managerService";
export { default as payrollService } from "../modules/payroll/services/payrollService";
export { default as departmentService } from "../core/services/departmentService";

// Leave service from new leave module
export { default as leaveService } from "../modules/leave/services/leaveService";
