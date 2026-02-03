/**
 * 🎨 FRONTEND ROLE UTILITIES - Human-Readable Labels
 * 
 * Frontend speaks HUMANS. Backend speaks CONSTANTS.
 * 
 * This file handles:
 * - UI display labels
 * - Role-based component rendering
 * - User-friendly role names
 * - Frontend role validation
 */

// ===================================================
// 🔒 SYSTEM ROLE CONSTANTS (Mirror Backend)
// ===================================================
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  HR_MANAGER: "HR_MANAGER",
  HR_ADMIN: "HR_ADMIN", 
  EMPLOYEE: "EMPLOYEE",
};

// ===================================================
// 🎨 DISPLAY LABELS (Human-Readable)
// ===================================================
export const ROLE_LABELS = {
  SUPER_ADMIN: "SuperAdmin",
  HR_MANAGER: "HR Manager",
  HR_ADMIN: "HR",
  EMPLOYEE: "Employee",
};

// ===================================================
// 📝 ROLE DESCRIPTIONS (For UI Tooltips/Help)
// ===================================================
export const ROLE_DESCRIPTIONS = {
  SUPER_ADMIN: "System owner with absolute authority. Can configure RBAC rules, manage integrations, and override all policies.",
  HR_MANAGER: "Senior HR with elevated powers. Can override policies, handle escalations, and manage advanced analytics.",
  HR_ADMIN: "HR executive with full employee management. Can manage departments, approve leaves, and configure HR policies.",
  EMPLOYEE: "Standard staff member with self-service access. Can manage own attendance, apply for leaves, and view personal data.",
};

// ===================================================
// 🎯 ROLE CAPABILITIES (For UI Feature Descriptions)
// ===================================================
export const ROLE_CAPABILITIES = {
  [ROLES.EMPLOYEE]: [
    "Self-service attendance tracking",
    "Leave application and management", 
    "Personal profile updates",
    "View own payroll information",
    "Submit expense reports",
    "Access training materials",
  ],
  [ROLES.HR_ADMIN]: [
    "All Employee capabilities",
    "Manage all employees",
    "Approve attendance & leave requests", 
    "Configure departments & shifts",
    "Generate HR reports",
    "Manage company policies",
    "Handle recruitment processes",
  ],
  [ROLES.HR_MANAGER]: [
    "All HR Admin capabilities",
    "Override leave & attendance policies",
    "Advanced analytics & insights",
    "Bulk operations & data management", 
    "Escalation handling",
    "Cross-department coordination",
  ],
  [ROLES.SUPER_ADMIN]: [
    "All HR Manager capabilities",
    "Create & manage user accounts",
    "Configure system-wide settings",
    "Manage RBAC rules & permissions",
    "System integrations & backups",
    "Audit logs & security monitoring",
  ],
};

// ===================================================
// 🔄 ROLE CONVERSION UTILITIES
// ===================================================

/**
 * Convert backend role to display label
 * Usage: getDisplayLabel(user.role) → "HR Manager"
 */
export const getDisplayLabel = (systemRole) => {
  return ROLE_LABELS[systemRole] || systemRole;
};

/**
 * Convert display label back to system role
 * Usage: getSystemRole("HR Manager") → "HR_MANAGER"
 */
export const getSystemRole = (displayLabel) => {
  const reverseMap = Object.entries(ROLE_LABELS).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {});
  
  return reverseMap[displayLabel] || displayLabel;
};

/**
 * Get role description for tooltips/help text
 */
export const getRoleDescription = (systemRole) => {
  return ROLE_DESCRIPTIONS[systemRole] || '';
};

/**
 * Get role capabilities list
 */
export const getRoleCapabilities = (systemRole) => {
  return ROLE_CAPABILITIES[systemRole] || [];
};

// ===================================================
// 🎨 UI STYLING HELPERS
// ===================================================

/**
 * Get role-specific color for badges/chips
 */
export const getRoleColor = (systemRole) => {
  const colorMap = {
    [ROLES.SUPER_ADMIN]: 'purple',
    [ROLES.HR_MANAGER]: 'blue', 
    [ROLES.HR_ADMIN]: 'green',
    [ROLES.EMPLOYEE]: 'gray',
  };
  
  return colorMap[systemRole] || 'gray';
};

/**
 * Get role-specific icon
 */
export const getRoleIcon = (systemRole) => {
  const iconMap = {
    [ROLES.SUPER_ADMIN]: '👑',
    [ROLES.HR_MANAGER]: '🔵', 
    [ROLES.HR_ADMIN]: '🟢',
    [ROLES.EMPLOYEE]: '👤',
  };
  
  return iconMap[systemRole] || '👤';
};

// ===================================================
// 🔍 ROLE VALIDATION & CHECKS
// ===================================================

/**
 * Check if role is valid system role
 */
export const isValidRole = (role) => {
  return Object.values(ROLES).includes(role);
};

/**
 * Check if role is admin-level (HR_ADMIN or above)
 */
export const isAdminRole = (systemRole) => {
  return [ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER].includes(systemRole);
};

/**
 * Check if role is HR-level (HR_ADMIN or HR_MANAGER)
 */
export const isHRRole = (systemRole) => {
  return [ROLES.HR_ADMIN, ROLES.HR_MANAGER].includes(systemRole);
};

/**
 * Check if role is employee-level
 */
export const isEmployeeRole = (systemRole) => {
  return systemRole === ROLES.EMPLOYEE;
};

// ===================================================
// 📋 ROLE LISTS FOR DROPDOWNS
// ===================================================

/**
 * Get all roles as options for dropdowns
 * Returns: [{ value: "SUPER_ADMIN", label: "SuperAdmin" }, ...]
 */
export const getRoleOptions = () => {
  return Object.entries(ROLES).map(([key, value]) => ({
    value: value,
    label: ROLE_LABELS[value],
    description: ROLE_DESCRIPTIONS[value],
    color: getRoleColor(value),
    icon: getRoleIcon(value),
  }));
};

/**
 * Get assignable roles for current user
 * SuperAdmin can assign any role, HR can assign Employee/HR roles, etc.
 */
export const getAssignableRoles = (currentUserRole) => {
  const allRoles = getRoleOptions();
  
  switch (currentUserRole) {
    case ROLES.SUPER_ADMIN:
      return allRoles; // Can assign any role
      
    case ROLES.HR_ADMIN:
      return allRoles.filter(role => 
        [ROLES.HR_MANAGER, ROLES.EMPLOYEE].includes(role.value)
      );
      
    case ROLES.HR_MANAGER:
      return allRoles.filter(role => 
        role.value === ROLES.EMPLOYEE
      );
      
    default:
      return []; // Employees can't assign roles
  }
};

// ===================================================
// 🔄 LEGACY COMPATIBILITY (Temporary)
// ===================================================

/**
 * Handle legacy role formats during transition
 * @deprecated Use getDisplayLabel instead
 */
export const getRoleDisplayName = (role) => {
  console.warn('getRoleDisplayName is deprecated. Use getDisplayLabel instead.');
  return getDisplayLabel(role);
};

export default {
  ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_CAPABILITIES,
  getDisplayLabel,
  getSystemRole,
  getRoleDescription,
  getRoleCapabilities,
  getRoleColor,
  getRoleIcon,
  isValidRole,
  isAdminRole,
  isHRRole,
  isEmployeeRole,
  getRoleOptions,
  getAssignableRoles,
  // Legacy
  getRoleDisplayName,
};