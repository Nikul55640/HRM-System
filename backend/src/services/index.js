/**
 * Services Index
 * Centralized export for all services with clear categorization
 */

// Core Services (Foundation)
import DateCalculationService from './core/dateCalculation.service.js';

// Attendance Services (Policy & Tracking)
import AttendancePolicyService from './attendance/attendancePolicy.service.js';

// Admin Services (Management)
import HolidayService from './admin/holiday.service.js';
import LeaveBalanceService from './admin/leaveBalance.service.js';
import AttendanceService from './admin/attendance.service.js';

// Audit Services
import AuditService from './audit/audit.service.js';

// Notification Services
import NotificationService from './notificationService.js';

// Legacy Services (to be refactored)
import CalendarDayStatusService from './calendar/calendarDayStatus.service.js'; // Will be deprecated

export {
  // Core Services
  DateCalculationService,
  
  // Attendance Services
  AttendancePolicyService,
  
  // Admin Services
  HolidayService,
  LeaveBalanceService,
  AttendanceService,
  
  // Audit Services
  AuditService,
  
  // Notification Services
  NotificationService,
  
  // Legacy (Deprecated)
  CalendarDayStatusService // Use AttendancePolicyService instead
};

export default {
  // Core Services
  DateCalculationService,
  
  // Attendance Services
  AttendancePolicyService,
  
  // Admin Services
  HolidayService,
  LeaveBalanceService,
  AttendanceService,
  
  // Audit Services
  AuditService,
  
  // Notification Services
  NotificationService,
  
  // Legacy (Deprecated)
  CalendarDayStatusService
};