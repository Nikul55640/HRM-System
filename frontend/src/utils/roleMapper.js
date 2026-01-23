/**
 * Role Mapper Utility
 * Handles conversion between simplified frontend roles and backend role formats
 */

// Frontend to Backend role mapping
export const mapFrontendToBackend = (frontendRole) => {
  const roleMap = {
    'Admin': 'SuperAdmin',
    'HR': 'HR',
    'Employee': 'Employee'
  };
  
  return roleMap[frontendRole] || frontendRole;
};

// Backend to Frontend role mapping
export const mapBackendToFrontend = (backendRole) => {
  const roleMap = {
    'SuperAdmin': 'Admin',
    'SUPER_ADMIN': 'Admin',
    'HR': 'HR',
    'HR_ADMIN': 'HR',
    'HR_Manager': 'HR',
    'HR_MANAGER': 'HR',
    'Employee': 'Employee',
    'EMPLOYEE': 'Employee'
  };
  
  return roleMap[backendRole] || backendRole;
};

// Get display name for role
export const getRoleDisplayName = (role) => {
  const displayNames = {
    'Admin': 'Administrator',
    'HR': 'Human Resources',
    'Employee': 'Employee'
  };
  
  return displayNames[role] || role;
};

// Check if role requires department assignment
export const requiresDepartmentAssignment = (role) => {
  return role === 'HR';
};

// Get role permissions level (higher number = more permissions)
export const getRoleLevel = (role) => {
  const levels = {
    'Admin': 3,
    'HR': 2,
    'Employee': 1
  };
  
  return levels[role] || 0;
};

export default {
  mapFrontendToBackend,
  mapBackendToFrontend,
  getRoleDisplayName,
  requiresDepartmentAssignment,
  getRoleLevel
};