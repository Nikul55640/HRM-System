// Core API
export { default as api } from "../core/api/api";

// Core services (shared across modules)
export { default as configService } from "../core/services/configService";
export { default as departmentService } from "../core/services/departmentService";
export { default as leaveService } from "../core/services/leaveService";
export { default as payrollService } from "../core/services/payrollService";

// Module-specific services
export { default as authService } from "../modules/auth/services/authService";
export { default as attendanceService } from "../modules/attendance/services/attendanceService";
export { default as documentService } from "../modules/documents/services/documentService";
export { default as employeeService } from "../modules/employees/services/employeeService";
export { default as dashboardService } from "../modules/employee/services/dashboardService";
export { default as managerService } from "../modules/manager/services/managerService";

// Standalone services
export { default as userService } from "./userService";
export { default as employeeSelfService } from "./employeeSelfService";
export { default as calendarService } from "./calendarService";
