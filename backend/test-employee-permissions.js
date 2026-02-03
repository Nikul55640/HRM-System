/**
 * Test Employee Permissions
 * 
 * This script tests that Employee users can access their own endpoints
 */

import { hasPermission, hasAnyPermission, MODULES } from './src/config/rolePermissions.js';
import { ROLES, databaseToSystemRole } from './src/config/roles.js';

console.log('🧪 [TEST] Testing Employee Permissions...\n');

// Test Employee role conversion
const dbRole = 'Employee';
const systemRole = databaseToSystemRole(dbRole);
console.log(`Database Role: ${dbRole} → System Role: ${systemRole}`);
console.log('');

// Test Employee permissions for shift access
const shiftPermissions = [
  MODULES.ATTENDANCE.VIEW_OWN,
  MODULES.ATTENDANCE.CLOCK_IN_OUT,
];

console.log('🔐 Employee Shift-Related Permissions:');
shiftPermissions.forEach(permission => {
  const hasIt = hasPermission(systemRole, permission);
  console.log(`${permission}: ${hasIt ? '✅' : '❌'}`);
});

console.log('');

// Test if Employee can access any shift-related permissions
const hasAnyShiftPermission = hasAnyPermission(systemRole, shiftPermissions);
console.log(`Employee has any shift permission: ${hasAnyShiftPermission ? '✅' : '❌'}`);

console.log('');

// Show all Employee permissions
console.log('📋 All Employee Permissions:');
import { ROLE_PERMISSIONS } from './src/config/rolePermissions.js';
const employeePermissions = ROLE_PERMISSIONS[systemRole] || [];
employeePermissions.forEach((permission, index) => {
  console.log(`${index + 1}. ${permission}`);
});

console.log(`\nTotal Employee permissions: ${employeePermissions.length}`);
console.log('\n✅ Employee permissions test completed!');