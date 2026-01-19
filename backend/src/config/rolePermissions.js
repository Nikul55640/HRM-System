/**
 * Role-Based Access Control (RBAC) Configuration
 * Based on production-level HRM system requirements
 */

/**
 * Role-Based Access Control (RBAC) Configuration
 * Based on production-level HRM system requirements
 */

// ===================================================
// ROLE DEFINITIONS (Standardized)
// ===================================================
export const ROLES = {
  // Primary role definitions (database values)
  SUPER_ADMIN: "SuperAdmin",
  HR_ADMIN: "HR", 
  HR_MANAGER: "HR_Manager",
  EMPLOYEE: "Employee",
  
  // Aliases for backward compatibility
  SuperAdmin: "SuperAdmin",
  HR: "HR",           
  Employee: "Employee"
};

// ✅ Role normalization function - now maps to database values
export const normalizeRole = (role) => {
  const roleMapping = {
    'SuperAdmin': 'SuperAdmin',
    'HR': 'HR', 
    'HR_Manager': 'HR_Manager',
    'Employee': 'Employee',
    // Handle any new format inputs
    'SUPER_ADMIN': 'SuperAdmin',
    'HR_ADMIN': 'HR',
    'HR_MANAGER': 'HR_Manager', 
    'EMPLOYEE': 'Employee'
  };
  
  return roleMapping[role] || role;
};

// ===================================================
// MODULE PERMISSIONS
// ===================================================
export const MODULES = {
  // Attendance Management
  ATTENDANCE: {
    VIEW_OWN: "attendance.view.own",
    VIEW_TEAM: "attendance.view.team",
    VIEW_ALL: "attendance.view.all",
    VIEW_COMPANY_STATUS: "attendance.view.company.status", // ✅ NEW: Employee-safe company status
    CLOCK_IN_OUT: "attendance.clock",
    REQUEST_CORRECTION: "attendance.correction.request",
    APPROVE_CORRECTION: "attendance.correction.approve",
    EDIT_ANY: "attendance.edit.any",
    MANAGE_SHIFTS: "attendance.shifts.manage",
    VIEW_ANALYTICS: "attendance.analytics.view",
    APPROVE_OVERTIME: "attendance.overtime.approve",
  },

  // Leave Management
  LEAVE: {
    VIEW_OWN: "leave.view.own",
    VIEW_TEAM: "leave.view.team",
    VIEW_ALL: "leave.view.all",
    APPLY: "leave.apply",
    CANCEL_OWN: "leave.cancel.own",
    APPROVE_TEAM: "leave.approve.team",
    APPROVE_ANY: "leave.approve.any",
    MANAGE_POLICIES: "leave.policies.manage",
    MANAGE_BALANCES: "leave.balances.manage",
    ASSIGN_BALANCES: "leave.balances.assign",
    VIEW_ALL_BALANCES: "leave.balances.view.all",
    VIEW_OWN_BALANCE: "leave.balances.view.own",
    VIEW_CALENDAR: "leave.calendar.view",
  },

  // Payroll Management
  PAYROLL: {
    VIEW_OWN: "payroll.view.own",
    VIEW_ALL: "payroll.view.all",
    PROCESS: "payroll.process",
    APPROVE: "payroll.approve",
    MANAGE_STRUCTURE: "payroll.structure.manage",
    MANAGE_DEDUCTIONS: "payroll.deductions.manage",
    GENERATE_REPORTS: "payroll.reports.generate",
    MANAGE_REIMBURSEMENT: "payroll.reimbursement.manage",
  },

  // Employee Management
  EMPLOYEE: {
    VIEW_OWN: "employee.view.own",
    VIEW_TEAM: "employee.view.team",
    VIEW_ALL: "employee.view.all",
    CREATE: "employee.create",
    UPDATE_OWN: "employee.update.own",
    UPDATE_ANY: "employee.update.any",
    DELETE: "employee.delete",
    MANAGE_DOCUMENTS: "employee.documents.manage",
    VIEW_DOCUMENTS: "employee.documents.view",
    ONBOARD: "employee.onboard",
    OFFBOARD: "employee.offboard",
  },

  // Performance Management
  PERFORMANCE: {
    VIEW_OWN: "performance.view.own",
    VIEW_TEAM: "performance.view.team",
    VIEW_ALL: "performance.view.all",
    SELF_EVALUATE: "performance.evaluate.self",
    EVALUATE_TEAM: "performance.evaluate.team",
    ASSIGN_GOALS: "performance.goals.assign",
    MANAGE_REVIEWS: "performance.reviews.manage",
    VIEW_360_FEEDBACK: "performance.feedback.view",
  },

  // Recruitment & ATS
  RECRUITMENT: {
    VIEW: "recruitment.view",
    MANAGE_POSTINGS: "recruitment.postings.manage",
    TRACK_CANDIDATES: "recruitment.candidates.track",
    SCHEDULE_INTERVIEWS: "recruitment.interviews.schedule",
    MANAGE_OFFERS: "recruitment.offers.manage",
  },

  // Lead Management
  LEAD: {
    VIEW_OWN: "lead.view.own",
    VIEW_TEAM: "lead.view.team",
    VIEW_ALL: "lead.view.all",
    CREATE: "lead.create",
    UPDATE_OWN: "lead.update.own",
    UPDATE_ANY: "lead.update.any",
    ASSIGN: "lead.assign",
    MANAGE: "lead.manage",
  },

  // Department Management
  DEPARTMENT: {
    VIEW: "department.view",
    CREATE: "department.create",
    UPDATE: "department.update",
    DELETE: "department.delete",
    ASSIGN_EMPLOYEES: "department.employees.assign",
  },

  // User Management
  USER: {
    VIEW: "user.view",
    CREATE: "user.create",
    UPDATE: "user.update",
    DELETE: "user.delete",
    CHANGE_ROLE: "user.role.change",
    MANAGE_PERMISSIONS: "user.permissions.manage",
  },

  // System Configuration
  SYSTEM: {
    VIEW_CONFIG: "system.config.view",
    MANAGE_CONFIG: "system.config.manage",
    MANAGE_POLICIES: "system.policies.manage",
    VIEW_AUDIT_LOGS: "system.audit.view",
    MANAGE_INTEGRATIONS: "system.integrations.manage",
    BACKUP_DATA: "system.backup",
  },

  // Reports & Analytics
  REPORTS: {
    VIEW_OWN: "reports.view.own",
    VIEW_TEAM: "reports.view.team",
    VIEW_ALL: "reports.view.all",
    EXPORT: "reports.export",
    CUSTOM_REPORTS: "reports.custom.create",
  },

  // Notifications
  NOTIFICATIONS: {
    VIEW_OWN: "notifications.view.own",
    SEND_TEAM: "notifications.send.team",
    SEND_ALL: "notifications.send.all",
    MANAGE_TEMPLATES: "notifications.templates.manage",
  },

  // Training & Development
  TRAINING: {
    VIEW_OWN: "training.view.own",
    VIEW_ALL: "training.view.all",
    MANAGE_PROGRAMS: "training.programs.manage",
    ASSIGN_TRAINING: "training.assign",
    TRACK_CERTIFICATIONS: "training.certifications.track",
  },

  // Expense & Reimbursement
  EXPENSE: {
    SUBMIT_OWN: "expense.submit.own",
    VIEW_OWN: "expense.view.own",
    VIEW_TEAM: "expense.view.team",
    APPROVE_TEAM: "expense.approve.team",
    PROCESS: "expense.process",
  },

  // Asset Management
  ASSET: {
    VIEW_OWN: "asset.view.own",
    VIEW_ALL: "asset.view.all",
    ASSIGN: "asset.assign",
    TRACK: "asset.track",
    MANAGE: "asset.manage",
  },

  // Calendar Management
  CALENDAR: {
    VIEW_OWN: "calendar.view.own",
    VIEW_ALL: "calendar.view.all",
    MANAGE_EVENTS: "calendar.events.manage",
    MANAGE_HOLIDAYS: "calendar.holidays.manage",
    MANAGE_WORKING_RULES: "calendar.working_rules.manage",
    VIEW_SMART_CALENDAR: "calendar.smart.view",
    MANAGE_SMART_CALENDAR: "calendar.smart.manage",
  },
};

// ===================================================
// ROLE PERMISSIONS MAPPING
// ===================================================
// ===================================================
// ROLE PERMISSIONS MAPPING (BASE)
// ===================================================
export const ROLE_PERMISSIONS = {
  [ROLES.EMPLOYEE]: [
    MODULES.ATTENDANCE.VIEW_OWN,
    MODULES.ATTENDANCE.CLOCK_IN_OUT,
    MODULES.ATTENDANCE.REQUEST_CORRECTION,
    MODULES.ATTENDANCE.VIEW_COMPANY_STATUS, // ✅ NEW: Can see company-wide leave/WFH status

    MODULES.LEAVE.VIEW_OWN,
    MODULES.LEAVE.APPLY,
    MODULES.LEAVE.CANCEL_OWN,
    MODULES.LEAVE.VIEW_CALENDAR,

    MODULES.PAYROLL.VIEW_OWN,

    MODULES.EMPLOYEE.VIEW_OWN,
    MODULES.EMPLOYEE.UPDATE_OWN,
    MODULES.EMPLOYEE.VIEW_DOCUMENTS,

    MODULES.PERFORMANCE.VIEW_OWN,
    MODULES.PERFORMANCE.SELF_EVALUATE,

    MODULES.LEAD.VIEW_OWN,
    MODULES.LEAD.UPDATE_OWN,

    MODULES.REPORTS.VIEW_OWN,

    MODULES.NOTIFICATIONS.VIEW_OWN,
    MODULES.TRAINING.VIEW_OWN,

    MODULES.EXPENSE.SUBMIT_OWN,
    MODULES.EXPENSE.VIEW_OWN,

    MODULES.ASSET.VIEW_OWN,

    MODULES.CALENDAR.VIEW_OWN,
  ],

  [ROLES.HR_MANAGER]: [
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.EDIT_ANY,
    MODULES.ATTENDANCE.MANAGE_SHIFTS,
    MODULES.ATTENDANCE.VIEW_ANALYTICS,
    MODULES.ATTENDANCE.APPROVE_CORRECTION,
    MODULES.ATTENDANCE.APPROVE_OVERTIME,

    MODULES.LEAVE.VIEW_ALL,
    MODULES.LEAVE.APPROVE_ANY,
    MODULES.LEAVE.MANAGE_BALANCES,
    MODULES.LEAVE.VIEW_CALENDAR,

    MODULES.EMPLOYEE.VIEW_ALL,
    MODULES.EMPLOYEE.CREATE,
    MODULES.EMPLOYEE.UPDATE_ANY,
    MODULES.EMPLOYEE.MANAGE_DOCUMENTS,
    MODULES.EMPLOYEE.ONBOARD,
    MODULES.EMPLOYEE.OFFBOARD,

    MODULES.RECRUITMENT.VIEW,
    MODULES.RECRUITMENT.MANAGE_POSTINGS,
    MODULES.RECRUITMENT.TRACK_CANDIDATES,
    MODULES.RECRUITMENT.SCHEDULE_INTERVIEWS,

    MODULES.PERFORMANCE.VIEW_ALL,
    MODULES.PERFORMANCE.MANAGE_REVIEWS,

    MODULES.LEAD.VIEW_ALL,
    MODULES.LEAD.ASSIGN,
    MODULES.LEAD.MANAGE,

    MODULES.DEPARTMENT.VIEW,

    MODULES.REPORTS.VIEW_ALL,
    MODULES.REPORTS.EXPORT,

    MODULES.NOTIFICATIONS.SEND_ALL,

    MODULES.TRAINING.VIEW_ALL,
    MODULES.TRAINING.ASSIGN_TRAINING,

    MODULES.EXPENSE.VIEW_TEAM,
    MODULES.EXPENSE.APPROVE_TEAM,

    MODULES.ASSET.VIEW_ALL,
    MODULES.ASSET.ASSIGN,

    MODULES.CALENDAR.VIEW_ALL,
    MODULES.CALENDAR.MANAGE_EVENTS,
    MODULES.CALENDAR.VIEW_SMART_CALENDAR,
    MODULES.CALENDAR.MANAGE_HOLIDAYS,

    // System configuration for attendance settings
    MODULES.SYSTEM.VIEW_CONFIG,
    MODULES.SYSTEM.MANAGE_CONFIG,
  ],

  [ROLES.HR_ADMIN]: [
    MODULES.LEAVE.MANAGE_POLICIES,
    MODULES.EMPLOYEE.DELETE,

    MODULES.RECRUITMENT.MANAGE_OFFERS,

    MODULES.DEPARTMENT.CREATE,
    MODULES.DEPARTMENT.UPDATE,
    MODULES.DEPARTMENT.ASSIGN_EMPLOYEES,

    MODULES.USER.VIEW,
    MODULES.USER.CREATE,
    MODULES.USER.UPDATE,

    MODULES.SYSTEM.VIEW_CONFIG,
    MODULES.SYSTEM.VIEW_AUDIT_LOGS,

    MODULES.REPORTS.CUSTOM_REPORTS,

    MODULES.NOTIFICATIONS.MANAGE_TEMPLATES,

    MODULES.TRAINING.MANAGE_PROGRAMS,
    MODULES.TRAINING.TRACK_CERTIFICATIONS,

    MODULES.ASSET.MANAGE,
    MODULES.ASSET.TRACK,

    MODULES.CALENDAR.MANAGE_HOLIDAYS,
    MODULES.CALENDAR.MANAGE_WORKING_RULES,
    MODULES.CALENDAR.MANAGE_SMART_CALENDAR,
  ],
};

// ===================================================
// INHERITANCE FIXED HERE
// ===================================================
// HR_ADMIN inherits all HR_MANAGER permissions plus additional ones
ROLE_PERMISSIONS[ROLES.HR_ADMIN] = [
  ...ROLE_PERMISSIONS[ROLES.HR_MANAGER],
  ...ROLE_PERMISSIONS[ROLES.HR_ADMIN]
];

// SUPER_ADMIN gets all permissions
ROLE_PERMISSIONS[ROLES.SUPER_ADMIN] = [
  ...Object.values(MODULES).flatMap((module) => Object.values(module)),
  // Additional super admin only permissions
  MODULES.USER.DELETE,
  MODULES.USER.CHANGE_ROLE,
  MODULES.USER.MANAGE_PERMISSIONS,
  MODULES.DEPARTMENT.DELETE,
  MODULES.SYSTEM.MANAGE_CONFIG,
  MODULES.SYSTEM.MANAGE_INTEGRATIONS,
  MODULES.SYSTEM.BACKUP_DATA,
];

// ===================================================
// PERMISSION CHECKER FUNCTIONS
// ===================================================

/**
 * Check if a role has a specific permission (with role normalization)
 */
export const hasPermission = (role, permission) => {
  const normalizedRole = normalizeRole(role);
  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
  return permissions.includes(permission);
};

/**
 * Check if a role has any of the specified permissions (with role normalization)
 */
export const hasAnyPermission = (role, permissions) => {
  const normalizedRole = normalizeRole(role);
  return permissions.some((permission) => hasPermission(normalizedRole, permission));
};

/**
 * Check if a role has all of the specified permissions (with role normalization)
 */
export const hasAllPermissions = (role, permissions) => {
  const normalizedRole = normalizeRole(role);
  return permissions.every((permission) => hasPermission(normalizedRole, permission));
};

/**
 * Get all permissions for a role (with role normalization)
 */
export const getRolePermissions = (role) => {
  const normalizedRole = normalizeRole(role);
  return ROLE_PERMISSIONS[normalizedRole] || [];
};

/**
 * Check if user can access department (for HR Managers)
 */
export const canAccessDepartment = (user, departmentId) => {
  // SuperAdmin and HR Admin can access all departments
  if ([ROLES.SUPER_ADMIN, ROLES.HR_ADMIN].includes(user.role)) {
    return true;
  }

  // HR Manager can only access assigned departments
  if (user.role === ROLES.HR_MANAGER) {
    if (!user.assignedDepartments || user.assignedDepartments.length === 0) {
      return false;
    }
    return user.assignedDepartments.some(
      (dept) => dept.toString() === departmentId.toString()
    );
  }

  return false;
};

/**
 * Check if user can access employee record
 */
export const canAccessEmployee = (user, employeeId, employeeDepartment) => {
  // SuperAdmin and HR Admin can access all employees
  if (
    [ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.PAYROLL_OFFICER].includes(
      user.role
    )
  ) {
    return true;
  }

  // HR Manager can access employees in assigned departments
  if (user.role === ROLES.HR_MANAGER) {
    return canAccessDepartment(user, employeeDepartment);
  }

  // Manager can access team members
  if (user.role === ROLES.MANAGER) {
    // This would need additional logic to check if employee is in manager's team
    return false; // Implement team membership check
  }

  // Employee can only access own record
  if (user.role === ROLES.EMPLOYEE) {
    return (
      user.employee?.id && user.employee?.id.toString() === employeeId.toString()
    );
  }

  return false;
};

export default {
  ROLES,
  MODULES,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  canAccessDepartment,
  canAccessEmployee,
};
