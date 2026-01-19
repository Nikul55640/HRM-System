// Core API
export { default as api } from "./api";

// Core services (shared across modules)
export { default as configService } from "./configService";
export { default as departmentService } from "./departmentService";
export { default as leaveService } from "./leaveService";
export { default as adminLeaveService } from "./adminLeaveService";

// Module-specific services
export { default as authService } from "./authService";
export { default as attendanceService } from "./attendanceService";
export { default as employeeService } from "../modules/employees/services/employeeService";
export { default as dashboardService } from "./dashboardService";

// Standalone services
export { default as userService } from "./userService";
export { default as employeeSelfService } from "./employeeSelfService";
export { default as calendarService } from "./calendarService";
export { default as smartCalendarService } from "./smartCalendarService";
export { default as calendarificService } from "./calendarificService";
export { default as recentActivityService } from "./recentActivityService";
export { default as birthdayService } from "./birthdayService";

// Feature-specific services (8 Core Features)
export { default as shiftService } from "./shiftService"; // Feature 6: Shift Management
export { default as auditLogService } from "./auditLogService"; // Feature 8: Audit Logs
export { default as helpSupportService } from "./helpSupportService"; // Help & Support
