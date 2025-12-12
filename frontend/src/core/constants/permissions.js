// Permission constants
export const PERMISSIONS = {
  // User Management
  USER: {
    VIEW: 'user.view',
    CREATE: 'user.create',
    UPDATE: 'user.update',
    DELETE: 'user.delete',
    MANAGE_ROLES: 'user.manage_roles'
  },

  // Employee Management
  EMPLOYEE: {
    VIEW: 'employee.view',
    CREATE: 'employee.create',
    UPDATE: 'employee.update',
    DELETE: 'employee.delete',
    VIEW_ALL: 'employee.view_all',
    MANAGE_PROFILE: 'employee.manage_profile'
  },

  // Attendance Management
  ATTENDANCE: {
    VIEW: 'attendance.view',
    CREATE: 'attendance.create',
    UPDATE: 'attendance.update',
    DELETE: 'attendance.delete',
    VIEW_ALL: 'attendance.view_all',
    MANAGE_RECORDS: 'attendance.manage_records'
  },

  // Leave Management
  LEAVE: {
    VIEW: 'leave.view',
    CREATE: 'leave.create',
    UPDATE: 'leave.update',
    DELETE: 'leave.delete',
    APPROVE: 'leave.approve',
    VIEW_ALL: 'leave.view_all'
  },

  // Payroll Management
  PAYROLL: {
    VIEW: 'payroll.view',
    CREATE: 'payroll.create',
    UPDATE: 'payroll.update',
    DELETE: 'payroll.delete',
    PROCESS: 'payroll.process',
    VIEW_ALL: 'payroll.view_all'
  },

  // Department Management
  DEPARTMENT: {
    VIEW: 'department.view',
    CREATE: 'department.create',
    UPDATE: 'department.update',
    DELETE: 'department.delete'
  },

  // Document Management
  DOCUMENT: {
    VIEW: 'document.view',
    CREATE: 'document.create',
    UPDATE: 'document.update',
    DELETE: 'document.delete',
    DOWNLOAD: 'document.download'
  },

  // System Configuration
  SYSTEM: {
    VIEW_CONFIG: 'system.view_config',
    MANAGE_CONFIG: 'system.manage_config',
    VIEW_AUDIT_LOGS: 'system.view_audit_logs',
    BACKUP: 'system.backup'
  },

  // Reports
  REPORTS: {
    VIEW: 'reports.view',
    GENERATE: 'reports.generate',
    EXPORT: 'reports.export'
  }
};

export default PERMISSIONS;