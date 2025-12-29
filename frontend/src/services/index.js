// Core API
export { default as api } from "../core/services/api";

// Core services (shared across modules)
export { default as configService } from "../core/services/configService";
export { default as departmentService } from "../core/services/departmentService";
export { default as leaveService } from "../core/services/leaveService";

// Module-specific services
export { default as authService } from "./authService";
export { default as attendanceService } from "./attendanceService";
export { default as employeeService } from "../modules/employees/services/employeeService";
export { default as dashboardService } from "./dashboardService";

// Standalone services
export { default as userService } from "./userService";
export { default as employeeSelfService } from "./employeeSelfService";
export { default as calendarService } from "./calendarService";

// Feature-specific services (8 Core Features)
export { default as shiftService } from "./shiftService"; // Feature 6: Shift Management
export { default as auditLogService } from "./auditLogService"; // Feature 8: Audit Logs
