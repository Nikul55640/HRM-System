/**
 * Test Role Permissions System
 * 
 * This script tests the role standardization and permission system
 * to ensure SuperAdmin users can access protected endpoints.
 */

import { hasPermission, hasAnyPermission, MODULES, ROLE_PERMISSIONS } from './src/config/rolePermissions.js';
import { ROLES, databaseToSystemRole } from './src/config/roles.js';

console.log('🧪 [TEST] Testing Role Permissions System...\n');

// Test 1: Role Constants
console.log('📋 [TEST 1] Role Constants:');
console.log('ROLES.SUPER_ADMIN:', ROLES.SUPER_ADMIN);
console.log('ROLES.HR_ADMIN:', ROLES.HR_ADMIN);
console.log('ROLES.HR_MANAGER:', ROLES.HR_MANAGER);
console.log('ROLES.EMPLOYEE:', ROLES.EMPLOYEE);
console.log('');

// Test 2: Database Role Conversion
console.log('🔄 [TEST 2] Database Role Conversion:');
console.log('SuperAdmin (DB) →', databaseToSystemRole('SuperAdmin'));
console.log('HR (DB) →', databaseToSystemRole('HR'));
console.log('HR_Manager (DB) →', databaseToSystemRole('HR_Manager'));
console.log('Employee (DB) →', databaseToSystemRole('Employee'));
console.log('');

// Test 3: Permission Checking
console.log('🔐 [TEST 3] Permission Checking:');
const testPermission = MODULES.ATTENDANCE.VIEW_ALL;
console.log(`Testing permission: ${testPermission}`);

console.log('SUPER_ADMIN has permission:', hasPermission(ROLES.SUPER_ADMIN, testPermission));
console.log('HR_ADMIN has permission:', hasPermission(ROLES.HR_ADMIN, testPermission));
console.log('HR_MANAGER has permission:', hasPermission(ROLES.HR_MANAGER, testPermission));
console.log('EMPLOYEE has permission:', hasPermission(ROLES.EMPLOYEE, testPermission));
console.log('');

// Test 4: Multiple Permission Checking
console.log('🔐 [TEST 4] Multiple Permission Checking:');
const testPermissions = [MODULES.ATTENDANCE.VIEW_ALL, MODULES.ATTENDANCE.VIEW_TEAM];
console.log(`Testing permissions: ${testPermissions.join(', ')}`);

console.log('SUPER_ADMIN has any permission:', hasAnyPermission(ROLES.SUPER_ADMIN, testPermissions));
console.log('HR_ADMIN has any permission:', hasAnyPermission(ROLES.HR_ADMIN, testPermissions));
console.log('HR_MANAGER has any permission:', hasAnyPermission(ROLES.HR_MANAGER, testPermissions));
console.log('EMPLOYEE has any permission:', hasAnyPermission(ROLES.EMPLOYEE, testPermissions));
console.log('');

// Test 5: SuperAdmin Permission Count
console.log('📊 [TEST 5] Permission Counts:');
console.log('SUPER_ADMIN permissions:', ROLE_PERMISSIONS[ROLES.SUPER_ADMIN]?.length || 0);
console.log('HR_ADMIN permissions:', ROLE_PERMISSIONS[ROLES.HR_ADMIN]?.length || 0);
console.log('HR_MANAGER permissions:', ROLE_PERMISSIONS[ROLES.HR_MANAGER]?.length || 0);
console.log('EMPLOYEE permissions:', ROLE_PERMISSIONS[ROLES.EMPLOYEE]?.length || 0);
console.log('');

// Test 6: Specific Attendance Permissions
console.log('🎯 [TEST 6] Attendance Permissions for SUPER_ADMIN:');
const attendancePermissions = Object.values(MODULES.ATTENDANCE);
attendancePermissions.forEach(permission => {
  const hasIt = hasPermission(ROLES.SUPER_ADMIN, permission);
  console.log(`${permission}: ${hasIt ? '✅' : '❌'}`);
});

console.log('\n✅ [TEST] Role permissions system test completed!');
console.log('🔍 [RESULT] If all SuperAdmin permissions show ✅, the system is working correctly.');