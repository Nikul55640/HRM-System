/**
 * Script to check current user roles in the database
 * This will help us understand what roles to target for notifications
 */

import { User } from './src/models/index.js';
import logger from './src/utils/logger.js';

async function checkUserRoles() {
  try {
    console.log('🔍 Checking user roles in database...\n');
    
    // Get all users with their roles
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'isActive'],
      order: [['role', 'ASC'], ['email', 'ASC']]
    });

    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    // Group users by role
    const roleGroups = {};
    users.forEach(user => {
      if (!roleGroups[user.role]) {
        roleGroups[user.role] = [];
      }
      roleGroups[user.role].push(user);
    });

    console.log('📊 Users by Role:');
    console.log('================');
    
    Object.keys(roleGroups).forEach(role => {
      const roleUsers = roleGroups[role];
      const activeCount = roleUsers.filter(u => u.isActive).length;
      const inactiveCount = roleUsers.filter(u => !u.isActive).length;
      
      console.log(`\n🏷️  ${role}:`);
      console.log(`   Total: ${roleUsers.length} (${activeCount} active, ${inactiveCount} inactive)`);
      
      roleUsers.forEach(user => {
        const status = user.isActive ? '✅' : '❌';
        console.log(`   ${status} ${user.email} (ID: ${user.id})`);
      });
    });

    console.log('\n📋 Summary:');
    console.log('===========');
    console.log(`Total users: ${users.length}`);
    console.log(`Active users: ${users.filter(u => u.isActive).length}`);
    console.log(`Roles found: ${Object.keys(roleGroups).join(', ')}`);

    // Check which roles should receive leave notifications
    console.log('\n🔔 Notification Targeting:');
    console.log('=========================');
    
    const adminRoles = Object.keys(roleGroups).filter(role => 
      role.includes('Admin') || role.includes('HR') || role === 'SuperAdmin'
    );
    
    if (adminRoles.length > 0) {
      console.log(`✅ Admin/HR roles found: ${adminRoles.join(', ')}`);
      console.log('   These roles should receive leave request notifications');
    } else {
      console.log('❌ No admin/HR roles found');
    }

    // Suggest correct role targeting
    console.log('\n💡 Recommended notification role targeting:');
    if (roleGroups['SuperAdmin'] || roleGroups['SUPER_ADMIN']) {
      console.log('   - SuperAdmin or SUPER_ADMIN');
    }
    if (roleGroups['HR'] || roleGroups['HR_ADMIN'] || roleGroups['HR_MANAGER']) {
      console.log('   - HR, HR_ADMIN, or HR_MANAGER');
    }

  } catch (error) {
    logger.error('Error checking user roles:', error);
    console.error('❌ Failed to check user roles:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUserRoles();