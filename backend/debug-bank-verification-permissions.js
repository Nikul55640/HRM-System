/**
 * Debug script for bank verification permission issues
 */

import { User } from './src/models/index.js';
import { hasPermission, MODULES, ROLES, normalizeRole, ROLE_PERMISSIONS } from './src/config/rolePermissions.js';
import logger from './src/utils/logger.js';

async function debugBankVerificationPermissions() {
  try {
    console.log('🔍 Debugging Bank Verification Permissions...\n');
    
    // 1. Check required permissions
    console.log('1️⃣ Required Permissions:');
    console.log(`   - GET /pending-verifications: ${MODULES.EMPLOYEE.VIEW_ALL}`);
    console.log(`   - PUT /verify/:employeeId: ${MODULES.EMPLOYEE.UPDATE_ANY}`);
    console.log('');

    // 2. Check role definitions
    console.log('2️⃣ Role Definitions:');
    Object.entries(ROLES).forEach(([key, value]) => {
      console.log(`   ${key}: "${value}"`);
    });
    console.log('');

    // 3. Check users in database
    console.log('3️⃣ Users in Database:');
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'isActive'],
      order: [['role', 'ASC'], ['email', 'ASC']]
    });

    const roleGroups = {};
    users.forEach(user => {
      if (!roleGroups[user.role]) {
        roleGroups[user.role] = [];
      }
      roleGroups[user.role].push(user);
    });

    Object.entries(roleGroups).forEach(([role, roleUsers]) => {
      const activeCount = roleUsers.filter(u => u.isActive).length;
      console.log(`   ${role}: ${roleUsers.length} users (${activeCount} active)`);
      
      // Show first few users
      roleUsers.slice(0, 3).forEach(user => {
        const status = user.isActive ? '✅' : '❌';
        console.log(`     ${status} ${user.email} (ID: ${user.id})`);
      });
    });
    console.log('');

    // 4. Test role normalization
    console.log('4️⃣ Role Normalization Test:');
    Object.keys(roleGroups).forEach(role => {
      const normalized = normalizeRole(role);
      console.log(`   "${role}" → "${normalized}"`);
    });
    console.log('');

    // 5. Test permissions for each role
    console.log('5️⃣ Permission Testing:');
    const requiredPermissions = [
      MODULES.EMPLOYEE.VIEW_ALL,
      MODULES.EMPLOYEE.UPDATE_ANY
    ];

    Object.keys(roleGroups).forEach(role => {
      console.log(`\n   Role: ${role}`);
      console.log(`   Normalized: ${normalizeRole(role)}`);
      
      const rolePermissions = ROLE_PERMISSIONS[normalizeRole(role)] || [];
      console.log(`   Total permissions: ${rolePermissions.length}`);
      
      requiredPermissions.forEach(permission => {
        const hasAccess = hasPermission(role, permission);
        const status = hasAccess ? '✅' : '❌';
        console.log(`   ${status} ${permission}: ${hasAccess}`);
      });
    });

    // 6. Check specific admin users
    console.log('\n6️⃣ Admin User Permission Check:');
    const adminRoles = ['SuperAdmin', 'HR', 'HR_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'];
    const adminUsers = users.filter(user => 
      adminRoles.includes(user.role) && user.isActive
    );

    if (adminUsers.length === 0) {
      console.log('   ❌ No active admin users found!');
    } else {
      adminUsers.forEach(user => {
        console.log(`\n   User: ${user.email} (${user.role})`);
        
        requiredPermissions.forEach(permission => {
          const hasAccess = hasPermission(user.role, permission);
          const status = hasAccess ? '✅' : '❌';
          console.log(`     ${status} ${permission}`);
        });
      });
    }

    // 7. Check ROLE_PERMISSIONS mapping
    console.log('\n7️⃣ Role Permissions Mapping:');
    Object.entries(ROLE_PERMISSIONS).forEach(([role, permissions]) => {
      const employeePerms = permissions.filter(p => p.startsWith('employee.'));
      console.log(`   ${role}: ${employeePerms.length} employee permissions`);
      
      if (employeePerms.length > 0) {
        employeePerms.forEach(perm => {
          if (perm === MODULES.EMPLOYEE.VIEW_ALL || perm === MODULES.EMPLOYEE.UPDATE_ANY) {
            console.log(`     ✅ ${perm}`);
          }
        });
      }
    });

    // 8. Test with sample user
    console.log('\n8️⃣ Sample Permission Test:');
    if (adminUsers.length > 0) {
      const testUser = adminUsers[0];
      console.log(`   Testing with: ${testUser.email} (${testUser.role})`);
      
      // Simulate middleware check
      const mockReq = {
        user: {
          id: testUser.id,
          role: testUser.role,
          email: testUser.email
        }
      };

      console.log('   Simulating middleware checks:');
      
      requiredPermissions.forEach(permission => {
        const hasAccess = hasPermission(mockReq.user.role, permission);
        const status = hasAccess ? '✅ PASS' : '❌ FAIL (403)';
        console.log(`     ${permission}: ${status}`);
      });
    }

    console.log('\n🎉 Permission Debug Complete!');
    console.log('\n💡 Troubleshooting Tips:');
    console.log('1. Ensure user has SuperAdmin or HR role');
    console.log('2. Check role normalization is working correctly');
    console.log('3. Verify ROLE_PERMISSIONS mapping includes required permissions');
    console.log('4. Test with different admin users');

  } catch (error) {
    logger.error('Error debugging bank verification permissions:', error);
    console.error('❌ Debug failed:', error.message);
  } finally {
    process.exit(0);
  }
}

debugBankVerificationPermissions();