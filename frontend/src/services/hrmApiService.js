import api from '../core/api/api.js';

/**
 * HRM API Service - 8 Core Features
 * Centralized API service for all HRM system endpoints
 */

// ===================================================
// 1. PROFILE & BANK DETAILS MANAGEMENT
// ===================================================

export const profileApi = {
    // Employee Profile Management
    getMyProfile: () => api.get('/employee/profile'),
    updateMyProfile: (data) => api.put('/employee/profile', data),
    uploadProfilePhoto: (formData) => api.post('/employee/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Bank Details Management
    getMyBankDetails: () => api.get('/employee/bank-details'),
    updateMyBankDetails: (data) => api.put('/employee/bank-details', data),

    // Admin - Employee Management
    getAllEmployees: (params) => api.get('/employees', { params }),
    getEmployeeById: (id) => api.get(`/employees/${id}`),
    createEmployee: (data) => api.post('/employees', data),
    updateEmployee: (id, data) => api.put(`/employees/${id}`, data),
    deleteEmployee: (id) => api.delete(`/employees/${id}`),
    activateEmployee: (id) => api.put(`/employees/${id}/activate`),
    deactivateEmployee: (id) => api.put(`/employees/${id}/deactivate`),
};

// ===================================================
// 2. ATTENDANCE MANAGEMENT (Clock In/Out with Break & Late Tracking)
// ===================================================

export const attendanceApi = {
    // Employee Attendance Actions
    clockIn: (data) => api.post('/employee/attendance/clock-in', data),
    clockOut: (data) => api.post('/employee/attendance/clock-out', data),
    breakIn: (data) => api.post('/employee/attendance/break-in', data),
    breakOut: (data) => api.post('/employee/attendance/break-out', data),

    // Employee Attendance Data
    getMyAttendance: (params) => api.get('/employee/attendance', { params }),
    requestAttendanceCorrection: (data) => api.post('/employee/attendance/correction', data),

    // Admin Attendance Management
    getAllAttendance: (params) => api.get('/admin/attendance', { params }),
    getAttendanceById: (id) => api.get(`/admin/attendance/${id}`),
    editAttendanceRecord: (id, data) => api.put(`/admin/attendance/${id}`, data),

    // Admin Attendance Corrections
    getAttendanceCorrections: (params) => api.get('/admin/attendance-corrections', { params }),
    approveAttendanceCorrection: (id, data) => api.put(`/admin/attendance-corrections/${id}/approve`, data),
    rejectAttendanceCorrection: (id, data) => api.put(`/admin/attendance-corrections/${id}/reject`, data),
};

// ===================================================
// 3. LEAVE MANAGEMENT (Apply, Assign, Approve & Cancel)
// ===================================================

export const leaveApi = {
    // Employee Leave Management
    applyForLeave: (data) => api.post('/employee/leave', data),
    getMyLeaveRequests: (params) => api.get('/employee/leave', { params }),
    cancelLeaveRequest: (id, data) => api.put(`/employee/leave/${id}/cancel`, data),
    getMyLeaveBalance: () => api.get('/employee/leave/balance'),

    // Admin Leave Request Management
    getAllLeaveRequests: (params) => api.get('/admin/leave', { params }),
    approveLeaveRequest: (id, data) => api.put(`/admin/leave/${id}/approve`, data),
    rejectLeaveRequest: (id, data) => api.put(`/admin/leave/${id}/reject`, data),

    // Admin Leave Balance Management
    getAllLeaveBalances: (params) => api.get('/admin/leave-balances', { params }),
    assignLeaveBalance: (data) => api.post('/admin/leave-balances', data),
    updateLeaveBalance: (id, data) => api.put(`/admin/leave-balances/${id}`, data),
};

// ===================================================
// 4. EMPLOYEE MANAGEMENT
// ===================================================

export const employeeManagementApi = {
    // Employee CRUD (covered in profileApi but repeated for clarity)
    getAllEmployees: (params) => api.get('/employees', { params }),
    createEmployee: (data) => api.post('/employees', data),
    updateEmployee: (id, data) => api.put(`/employees/${id}`, data),
    deleteEmployee: (id) => api.delete(`/employees/${id}`),

    // Department Management
    getAllDepartments: (params) => api.get('/admin/departments', { params }),
    createDepartment: (data) => api.post('/admin/departments', data),
    updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data),
    deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),

    // User Role Management
    getAllUsers: (params) => api.get('/users', { params }),
    updateUserRole: (id, data) => api.put(`/users/${id}/role`, data),
};

// ===================================================
// 5. LEAD MANAGEMENT
// ===================================================

export const leadApi = {
    // Admin Lead Management
    getAllLeads: (params) => api.get('/admin/leads', { params }),
    createLead: (data) => api.post('/admin/leads', data),
    updateLead: (id, data) => api.put(`/admin/leads/${id}`, data),
    deleteLead: (id) => api.delete(`/admin/leads/${id}`),
    assignLead: (id, data) => api.put(`/admin/leads/${id}/assign`, data),

    // Employee Lead Management
    getMyAssignedLeads: () => api.get('/admin/leads?assignedTo=me'),
    updateLeadStatus: (id, data) => api.put(`/admin/leads/${id}`, data),
    addFollowUpNote: (id, data) => api.post(`/admin/leads/${id}/notes`, data),
};

// ===================================================
// 6. SHIFT MANAGEMENT (With Late Arrival & Break Rules)
// ===================================================

export const shiftApi = {
    // Admin Shift Management
    getAllShifts: (params) => api.get('/admin/shifts', { params }),
    createShift: (data) => api.post('/admin/shifts', data),
    updateShift: (id, data) => api.put(`/admin/shifts/${id}`, data),
    deleteShift: (id) => api.delete(`/admin/shifts/${id}`),
    assignShiftToEmployee: (data) => api.post('/admin/shifts/assign', data),

    // Employee Shift Management
    getMyShifts: () => api.get('/employee/shifts/my-shifts'),
    getCurrentShift: () => api.get('/employee/shifts/current'),
    getShiftSchedule: (params) => api.get('/employee/shifts/schedule', { params }),
    requestShiftChange: (data) => api.post('/employee/shifts/change-request', data),
};

// ===================================================
// 7. CALENDAR, EVENT & HOLIDAY MANAGEMENT
// ===================================================

export const calendarApi = {
    // Admin Holiday Management
    getAllHolidays: (params) => api.get('/admin/holidays', { params }),
    createHoliday: (data) => api.post('/admin/holidays', data),
    updateHoliday: (id, data) => api.put(`/admin/holidays/${id}`, data),
    deleteHoliday: (id) => api.delete(`/admin/holidays/${id}`),

    // Admin Event Management
    getAllEvents: (params) => api.get('/admin/events', { params }),
    createEvent: (data) => api.post('/admin/events', data),
    updateEvent: (id, data) => api.put(`/admin/events/${id}`, data),
    deleteEvent: (id) => api.delete(`/admin/events/${id}`),
    getUpcomingEvents: () => api.get('/admin/events/upcoming'),

    // Employee Calendar View
    getCalendarView: (params) => api.get('/employee/calendar', { params }),
    getHolidays: (params) => api.get('/employee/calendar/holidays', { params }),
    getEvents: (params) => api.get('/employee/calendar/events', { params }),
};

// ===================================================
// 8. AUDIT LOG MANAGEMENT
// ===================================================

export const auditApi = {
    // SuperAdmin Only
    getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
    filterAuditLogs: (params) => api.get('/admin/audit-logs/filter', { params }),
    exportAuditLogs: (params) => api.get('/admin/audit-logs/export', { params }),
};

// ===================================================
// SYSTEM CONFIGURATION
// ===================================================

export const systemApi = {
    // System Policy Management (SuperAdmin Only)
    getSystemPolicies: (params) => api.get('/admin/system-policies', { params }),
    updateSystemPolicy: (key, data) => api.put(`/admin/system-policies/${key}`, data),

    // Dashboard Data
    getAdminDashboard: () => api.get('/admin/dashboard'),
    getEmployeeDashboard: () => api.get('/employee/dashboard'),
};

// ===================================================
// AUTHENTICATION
// ===================================================

export const authApi = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// ===================================================
// NOTIFICATIONS
// ===================================================

export const notificationApi = {
    getMyNotifications: (params) => api.get('/employee/notifications', { params }),
    markAsRead: (id) => api.put(`/employee/notifications/${id}/read`),
    markAllAsRead: () => api.put('/employee/notifications/read-all'),
};

// ===================================================
// EXPORT ALL APIS
// ===================================================

export default {
    profile: profileApi,
    attendance: attendanceApi,
    leave: leaveApi,
    employeeManagement: employeeManagementApi,
    lead: leadApi,
    shift: shiftApi,
    calendar: calendarApi,
    audit: auditApi,
    system: systemApi,
    auth: authApi,
    notification: notificationApi,
};