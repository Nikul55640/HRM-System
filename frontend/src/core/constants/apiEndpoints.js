/**
 * API Endpoints Constants
 * Centralized definition of all API endpoints used in the application
 *
 * Usage:
 * import { API_ENDPOINTS } from '@/constants/apiEndpoints';
 * api.get(API_ENDPOINTS.EMPLOYEE.PROFILE);
 */

export const API_ENDPOINTS = {
  // ============================================================
  // AUTHENTICATION
  // ============================================================
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  // ============================================================
  // EMPLOYEE SELF-SERVICE (ESS)
  // ============================================================
  EMPLOYEE: {
    // Profile
    PROFILE: "/employee/profile",
    PROFILE_HISTORY: "/employee/profile/history",

    // Bank Details
    BANK_DETAILS: "/employee/bank-details",
    BANK_VERIFY: "/employee/bank-details/verify",

    // Documents
    DOCUMENTS: "/employee/profile/documents",
    DOCUMENT_BY_ID: (id) => `/employee/profile/documents/${id}`,
    DOCUMENT_DOWNLOAD: (id) => `/employee/profile/documents/${id}/download`,

    // Payslips
    PAYSLIPS: "/employee/payslips",
    PAYSLIP_BY_ID: (id) => `/employee/payslips/${id}`,
    PAYSLIP_DOWNLOAD: (id) => `/employee/payslips/${id}/download`,

    // Leave
    LEAVE_BALANCE: "/employee/leave-balance",
    LEAVE_HISTORY: "/employee/leave-history",
    LEAVE_REQUEST: "/employee/leave", // Fixed endpoint
    LEAVE_EXPORT: "/employee/leave-balance/export",

    // Attendance
    ATTENDANCE: "/employee/attendance",
    ATTENDANCE_SUMMARY: "/employee/attendance/summary",
    ATTENDANCE_EXPORT: "/employee/attendance/export",
    CHECK_IN: "/employee/attendance/check-in",
    CHECK_OUT: "/employee/attendance/check-out",

    // Requests
    REQUESTS: "/employee/requests",
    REQUEST_BY_ID: (id) => `/employee/requests/${id}`,
    REQUEST_CANCEL: (id) => `/employee/requests/${id}/cancel`,

    // Notifications
    NOTIFICATIONS: "/employee/notifications",
    NOTIFICATION_BY_ID: (id) => `/employee/notifications/${id}`,
    NOTIFICATION_READ: (id) => `/employee/notifications/${id}/read`,
    NOTIFICATIONS_READ_ALL: "/employee/notifications/read-all",
    NOTIFICATIONS_UNREAD_COUNT: "/employee/notifications/unread-count",
  },

  // ============================================================
  // EMPLOYEES MANAGEMENT (Admin/HR)
  // ============================================================
  EMPLOYEES: {
    LIST: "/employees",
    CREATE: "/employees",
    BY_ID: (id) => `/employees/${id}`,
    UPDATE: (id) => `/employees/${id}`,
    DELETE: (id) => `/employees/${id}`,
    SEARCH: "/employees/search",
    DIRECTORY: "/employees/directory",
    ME: "/employees/me",
    SELF_UPDATE: (id) => `/employees/${id}/self-update`,
    DOCUMENTS: (id) => `/employees/${id}/documents`,
  },

  // ============================================================
  // ADMIN - ATTENDANCE
  // ============================================================
  ADMIN_ATTENDANCE: {
    LIST: "/admin/attendance",
    STATISTICS: "/admin/attendance/statistics",
    BY_EMPLOYEE: (id) => `/admin/attendance/${id}`,
    CREATE_MANUAL: "/admin/attendance/manual",
    UPDATE: (id) => `/admin/attendance/${id}`,
    DELETE: (id) => `/admin/attendance/${id}`,
    LIVE: "/admin/attendance/live",
    LIVE_BY_EMPLOYEE: (id) => `/admin/attendance/live/${id}`,
  },

  // ============================================================
  // ADMIN - LEAVE MANAGEMENT
  // ============================================================
  ADMIN_LEAVE: {
    REQUESTS: "/admin/leave/leave-requests",
    REQUEST_BY_ID: (id) => `/admin/leave/leave-requests/${id}`,
    APPROVE: (id) => `/admin/leave/leave-requests/${id}/approve`,
    REJECT: (id) => `/admin/leave/leave-requests/${id}/reject`,
    STATISTICS: "/admin/leave/leave-requests/statistics",
    BALANCES: "/admin/leave/balances",
    ASSIGN_BALANCE: (employeeId) => `/admin/leave/assign/${employeeId}`,
  },

  // ============================================================
  // ADMIN - PAYROLL
  // ============================================================
  ADMIN_PAYROLL: {
    DASHBOARD: "/admin/payroll/dashboard",
    PAYSLIPS: "/admin/payroll/payslips",
    PAYSLIP_BY_ID: (id) => `/admin/payroll/payslips/${id}`,
    GENERATE: "/admin/payroll/generate",
    EMPLOYEES: "/admin/payroll/employees",
    STRUCTURES: "/admin/payroll/structures",
    CREATE_STRUCTURE: "/admin/payroll/structures",
    UPDATE_STRUCTURE: (id) => `/admin/payroll/structures/${id}`,
    DELETE_STRUCTURE: (id) => `/admin/payroll/structures/${id}`,
  },

  // ============================================================
  // ADMIN - DEPARTMENTS
  // ============================================================
  ADMIN_DEPARTMENTS: {
    LIST: "/admin/departments",
    CREATE: "/admin/departments",
    BY_ID: (id) => `/admin/departments/${id}`,
    UPDATE: (id) => `/admin/departments/${id}`,
    DELETE: (id) => `/admin/departments/${id}`,
    EMPLOYEES: (id) => `/admin/departments/${id}/employees`,
    ASSIGN_EMPLOYEES: (id) => `/admin/departments/${id}/assign`,
    REMOVE_EMPLOYEES: (id) => `/admin/departments/${id}/remove`,
    STATISTICS: (id) => `/admin/departments/${id}/statistics`,
  },

  // ============================================================
  // ADMIN - DASHBOARD
  // ============================================================
  ADMIN_DASHBOARD: {
    OVERVIEW: "/admin/dashboard",
    STATISTICS: "/admin/dashboard/statistics",
    RECENT_ACTIVITIES: "/admin/dashboard/activities",
  },

  // ============================================================
  // ADMIN - AUDIT LOGS
  // ============================================================
  ADMIN_AUDIT: {
    LOGS: "/admin/audit-logs",
    EXPORT: "/admin/audit-logs/export",
  },

  // ============================================================
  // MANAGER ROUTES
  // ============================================================
  MANAGER: {
    TEAM: "/manager/team",
    TEAM_MEMBER: (id) => `/manager/team/${id}`,
    STATISTICS: "/manager/team/statistics",
    APPROVALS: "/manager/approvals",
    APPROVAL_HISTORY: "/manager/approvals/history",
    APPROVE: (id) => `/manager/approvals/${id}/approve`,
    REJECT: (id) => `/manager/approvals/${id}/reject`,
    DASHBOARD: "/manager/dashboard",
    REPORTS: "/manager/reports",
    PERFORMANCE: "/manager/performance",
    ATTENDANCE_REPORT: "/manager/attendance-report",
    LEAVE_REPORT: "/manager/leave-report",
    EXPORT: "/manager/export",
  },

  // ============================================================
  // USERS MANAGEMENT
  // ============================================================
  USERS: {
    LIST: "/users",
    BY_ID: (id) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
  },

  // ============================================================
  // CONFIGURATION
  // ============================================================
  CONFIG: {
    DEPARTMENTS: "/config/departments",
    CUSTOM_FIELDS: "/config/custom-fields",
    DOCUMENT_CATEGORIES: "/config/document-categories",
    SYSTEM: "/config/system",
  },

  // ============================================================
  // CALENDAR
  // ============================================================
  CALENDAR: {
    EVENTS: "/calendar/events",
    EVENT_BY_ID: (id) => `/calendar/events/${id}`,
    HOLIDAYS: "/calendar/holidays",
    SYNC: "/calendar/sync",
  },

  // ============================================================
  // DOCUMENTS
  // ============================================================
  DOCUMENTS: {
    BY_ID: (id) => `/documents/${id}`,
    DOWNLOAD: (id) => `/documents/${id}/download`,
    METADATA: (id) => `/documents/${id}/metadata`,
    VERIFY: (id) => `/documents/${id}/verify`,
  },
};

export default API_ENDPOINTS;
