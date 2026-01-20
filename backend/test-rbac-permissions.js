/**
 * Test RBAC Permissions Configuration
 * Run this to verify if EMPLOYEE role has VIEW_COMPANY_STATUS permission
 */

import { ROLES, MODULES, ROLE_PERMISSIONS, hasPermission } from './src/config/rolePermissions.js';

console.log('🔧 [RBAC TEST] Testing Role Permissions Configuration...\n');

// Test 1: Check if EMPLOYEE role exists
console.log('1️⃣ ROLE DEFINITIONS:');
console.log('   ROLES.EMPLOYEE:', ROLES.EMPLOYEE);
console.log('   Available roles:', Object.keys(ROLES));

// Test 2: Check if VIEW_COMPANY_STATUS permission exists
console.log('\n2️⃣ PERMISSION DEFINITIONS:');
console.log('   MODULES.ATTENDANCE.VIEW_COMPANY_STATUS:', MODULES.ATTENDANCE.VIEW_COMPANY_STATUS);

// Test 3: Check EMPLOYEE permissions
console.log('\n3️⃣ EMPLOYEE ROLE PERMISSIONS:');
const employeePermissions = ROLE_PERMISSIONS[ROLES.EMPLOYEE];
console.log('   Total permissions:', employeePermissions?.length || 0);
console.log('   Has VIEW_COMPANY_STATUS:', employeePermissions?.includes(MODULES.ATTENDANCE.VIEW_COMPANY_STATUS));

// Test 4: Use hasPermission function
console.log('\n4️⃣ PERMISSION CHECK FUNCTION:');
console.log('   hasPermission("Employee", VIEW_COMPANY_STATUS):', hasPermission("Employee", MODULES.ATTENDANCE.VIEW_COMPANY_STATUS));
console.log('   hasPermission("EMPLOYEE", VIEW_COMPANY_STATUS):', hasPermission("EMPLOYEE", MODULES.ATTENDANCE.VIEW_COMPANY_STATUS));

// Test 5: Show all attendance permissions for EMPLOYEE
console.log('\n5️⃣ EMPLOYEE ATTENDANCE PERMISSIONS:');
const attendancePermissions = employeePermissions?.filter(p => p.startsWith('attendance.')) || [];
attendancePermissions.forEach(perm => {
  console.log('   ✅', perm);
});

// Test 6: Check if permission is in the list
console.log('\n6️⃣ DETAILED PERMISSION CHECK:');
const targetPermission = MODULES.ATTENDANCE.VIEW_COMPANY_STATUS;
console.log('   Looking for permission:', targetPermission);
console.log('   Permission found in EMPLOYEE role:', employeePermissions?.includes(targetPermission) ? '✅ YES' : '❌ NO');

if (!employeePermissions?.includes(targetPermission)) {
  console.log('\n🔴 PROBLEM FOUND: EMPLOYEE role does NOT have VIEW_COMPANY_STATUS permission!');
  console.log('   This is why you get 403 errors.');
  console.log('   The permission is defined but not assigned to EMPLOYEE role.');
} else {
  console.log('\n✅ RBAC CONFIGURATION IS CORRECT');
  console.log('   The 403 error must be coming from somewhere else.');
}

console.log('\n🔧 [RBAC TEST] Test completed.');