/**
 * User Roles Constants
 * Centralized definition of all user roles in the system
 *
 * Usage:
 * import { ROLES } from '@/constants/roles';
 * if (user.role === ROLES.SUPER_ADMIN) { ... }
 */

export const ROLES = {
  SUPER_ADMIN: "SuperAdmin",
  HR_MANAGER: "HR Manager",
  HR_ADMINISTRATOR: "HR Administrator",
  PAYROLL_OFFICER: "Payroll Officer",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
};

/**
 * Role Groups for easier permission checks
 */
export const ROLE_GROUPS = {
  // All admin roles (can access admin features)
  ADMINS: [ROLES.SUPER_ADMIN, ROLES.HR_ADMINISTRATOR, ROLES.HR_MANAGER],

  // All HR roles (can manage HR functionalities)
  HR_STAFF: [ROLES.SUPER_ADMIN, ROLES.HR_ADMINISTRATOR, ROLES.HR_MANAGER],

  // Roles with team management capabilities
  TEAM_MANAGERS: [ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.MANAGER],

  // Roles with payroll access
  PAYROLL_ACCESS: [
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMINISTRATOR,
    ROLES.PAYROLL_OFFICER,
  ],

  // All roles (useful for authenticated-only checks)
  ALL: Object.values(ROLES),
};

/**
 * Helper function to check if a role is in a group
 * @param {string} role - User role to check
 * @param {string[]} group - Role group to check against
 * @returns {boolean}
 *
 * @example
 * isRoleInGroup(user.role, ROLE_GROUPS.ADMINS)
 */
export const isRoleIn = (role, group) => {
  return group.includes(role);
};

/**
 * Helper function to check if user has admin privileges
 * @param {string} role - User role
 * @returns {boolean}
 */
export const isAdmin = (role) => {
  return isRoleIn(role, ROLE_GROUPS.ADMINS);
};

/**
 * Helper function to check if user is HR staff
 * @param {string} role - User role
 * @returns {boolean}
 */
export const isHRStaff = (role) => {
  return isRoleIn(role, ROLE_GROUPS.HR_STAFF);
};

/**
 * Helper function to check if user can manage team
 * @param {string} role - User role
 * @returns {boolean}
 */
export const canManageTeam = (role) => {
  return isRoleIn(role, ROLE_GROUPS.TEAM_MANAGERS);
};

/**
 * Helper function to check if user has payroll access
 * @param {string} role - User role
 * @returns {boolean}
 */
export const hasPayrollAccess = (role) => {
  return isRoleIn(role, ROLE_GROUPS.PAYROLL_ACCESS);
};

/**
 * Get human-readable role display name
 * @param {string} role - Role constant
 * @returns {string}
 */
export const getRoleDisplayName = (role) => {
  const displayNames = {
    [ROLES.SUPER_ADMIN]: "Super Administrator",
    [ROLES.HR_MANAGER]: "HR Manager",
    [ROLES.HR_ADMINISTRATOR]: "HR Administrator",
    [ROLES.PAYROLL_OFFICER]: "Payroll Officer",
    [ROLES.MANAGER]: "Manager",
    [ROLES.EMPLOYEE]: "Employee",
  };

  return displayNames[role] || role;
};

/**
 * Get role badge color (for UI)
 * @param {string} role - Role constant
 * @returns {string} Tailwind color class
 */
export const getRoleBadgeColor = (role) => {
  const colors = {
    [ROLES.SUPER_ADMIN]: "bg-purple-100 text-purple-800",
    [ROLES.HR_ADMINISTRATOR]: "bg-blue-100 text-blue-800",
    [ROLES.HR_MANAGER]: "bg-indigo-100 text-indigo-800",
    [ROLES.PAYROLL_OFFICER]: "bg-green-100 text-green-800",
    [ROLES.MANAGER]: "bg-yellow-100 text-yellow-800",
    [ROLES.EMPLOYEE]: "bg-gray-100 text-gray-800",
  };

  return colors[role] || "bg-gray-100 text-gray-800";
};

export default ROLES;
