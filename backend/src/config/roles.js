/**
 * 🔑 ROLE STANDARDIZATION - Backend Constants (Single Source of Truth)
 * 
 * Backend speaks CONSTANTS. Frontend speaks HUMANS.
 * 
 * This file defines the SYSTEM/RBAC roles used in:
 * - JWT tokens
 * - Middleware
 * - Route guards  
 * - Database role column
 * 
 * ✔ Stable ✔ Case-safe ✔ Machine-friendly
 */

// ===================================================
// 🔒 BACKEND ROLE CONSTANTS (Single Source of Truth)
// ===================================================
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  HR_MANAGER: "HR_MANAGER", 
  HR_ADMIN: "HR_ADMIN",
  EMPLOYEE: "EMPLOYEE",
};

// ===================================================
// 🎨 ROLE DISPLAY LABELS (UI Mapping)
// ===================================================
export const ROLE_LABELS = {
  SUPER_ADMIN: "SuperAdmin",
  HR_MANAGER: "HR Manager", 
  HR_ADMIN: "HR",
  EMPLOYEE: "Employee",
};

// ===================================================
// 🔄 ROLE NORMALIZATION & MIGRATION HELPERS
// ===================================================

/**
 * Convert legacy/display roles to system constants
 * Used during migration and API input validation
 */
export const normalizeToSystemRole = (inputRole) => {
  const normalizationMap = {
    // Current database values → System constants
    'SuperAdmin': ROLES.SUPER_ADMIN,
    'HR': ROLES.HR_ADMIN,
    'HR_Manager': ROLES.HR_MANAGER,
    'Employee': ROLES.EMPLOYEE,
    
    // Legacy values → System constants
    'HR Administrator': ROLES.HR_ADMIN,
    'HR Manager': ROLES.HR_MANAGER,
    'Manager': ROLES.HR_MANAGER,
    
    // System constants → System constants (passthrough)
    'SUPER_ADMIN': ROLES.SUPER_ADMIN,
    'HR_ADMIN': ROLES.HR_ADMIN,
    'HR_MANAGER': ROLES.HR_MANAGER,
    'EMPLOYEE': ROLES.EMPLOYEE,
  };
  
  return normalizationMap[inputRole] || ROLES.EMPLOYEE;
};

/**
 * Convert system constants to database-compatible values
 * Used for database storage during transition period
 */
export const systemRoleToDatabase = (systemRole) => {
  const dbMap = {
    [ROLES.SUPER_ADMIN]: 'SuperAdmin',
    [ROLES.HR_ADMIN]: 'HR',
    [ROLES.HR_MANAGER]: 'HR_Manager', 
    [ROLES.EMPLOYEE]: 'Employee',
  };
  
  return dbMap[systemRole] || 'Employee';
};

/**
 * Convert database values to system constants
 * Used when reading from database
 */
export const databaseToSystemRole = (dbRole) => {
  const systemMap = {
    'SuperAdmin': ROLES.SUPER_ADMIN,
    'HR': ROLES.HR_ADMIN,
    'HR_Manager': ROLES.HR_MANAGER,
    'Employee': ROLES.EMPLOYEE,
  };
  
  return systemMap[dbRole] || ROLES.EMPLOYEE;
};

/**
 * Get display label for system role
 * Used in UI components
 */
export const getDisplayLabel = (systemRole) => {
  return ROLE_LABELS[systemRole] || systemRole;
};

// ===================================================
// 🔍 ROLE VALIDATION
// ===================================================

/**
 * Check if a role is valid system role
 */
export const isValidSystemRole = (role) => {
  return Object.values(ROLES).includes(role);
};

/**
 * Get all valid system roles
 */
export const getAllSystemRoles = () => {
  return Object.values(ROLES);
};

/**
 * Get all display labels
 */
export const getAllDisplayLabels = () => {
  return Object.values(ROLE_LABELS);
};

// ===================================================
// 🏗️ ROLE HIERARCHY (For Permission Inheritance)
// ===================================================
export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 4,
  [ROLES.HR_ADMIN]: 3,
  [ROLES.HR_MANAGER]: 2,
  [ROLES.EMPLOYEE]: 1,
};

/**
 * Check if role1 has higher or equal authority than role2
 */
export const hasHigherOrEqualAuthority = (role1, role2) => {
  return ROLE_HIERARCHY[role1] >= ROLE_HIERARCHY[role2];
};

/**
 * Get roles with lower authority than given role
 */
export const getLowerAuthorityRoles = (role) => {
  const currentLevel = ROLE_HIERARCHY[role];
  return Object.keys(ROLE_HIERARCHY).filter(
    r => ROLE_HIERARCHY[r] < currentLevel
  );
};

export default {
  ROLES,
  ROLE_LABELS,
  normalizeToSystemRole,
  systemRoleToDatabase,
  databaseToSystemRole,
  getDisplayLabel,
  isValidSystemRole,
  getAllSystemRoles,
  getAllDisplayLabels,
  ROLE_HIERARCHY,
  hasHigherOrEqualAuthority,
  getLowerAuthorityRoles,
};