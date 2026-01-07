/**
 * Test script to verify leave notifications are working
 * This script will test the notification system for leave requests
 */

import notificationService from './src/services/notificationService.js';
import { User } from './src/models/index.js';
import logger from './src/utils/logger.js';

async function testLeaveNotifications() {
  try {
    console.log('🧪 Testing Leave Notification System...\n');
    
    // 1. Check if we have users with admin roles
    console.log('1️⃣ Checking for admin users...');
    const adminRoles = ['HR', 'SuperAdmin', 'HR_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'];
    
    const adminUsers = await User.findAll({
      where: {
        role: adminRoles,
        isActive: true
      },
      attributes: ['id', 'email', 'role']
    });

    if (adminUsers.length === 0) {
      console.log('❌ No active admin users found. Cannot test role-based notifications.');
      console.log('   Available roles to test with:', adminRoles.join(', '));
      return;
    }

    console.log(`✅ Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    // 2. Check if we have regular employees
    console.log('\n2️⃣ Checking for employee users...');
    const employees = await User.findAll({
      where: {
        role: ['Employee', 'EMPLOYEE'],
        isActive: true
      },
      attributes: ['id', 'email', 'role'],
      limit: 3
    });

    if (employees.length === 0) {
      console.log('❌ No active employee users found. Cannot test employee notifications.');
      return;
    }

    console.log(`✅ Found ${employees.length} employee users (showing first 3):`);
    employees.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    // 3. Test sending notification to a specific employee
    console.log('\n3️⃣ Testing employee notification...');
    const testEmployee = employees[0];
    
    try {
      await notificationService.sendToUser(testEmployee.id, {
        title: 'Test: Leave Request Submitted ✅',
        message: 'This is a test notification for leave request submission.',
        type: 'info',
        category: 'leave',
        metadata: {
          test: true,
          leaveType: 'Casual',
          totalDays: 2
        }
      });
      console.log(`✅ Employee notification sent to ${testEmployee.email}`);
    } catch (error) {
      console.log(`❌ Failed to send employee notification: ${error.message}`);
    }

    // 4. Test sending notification to admin roles
    console.log('\n4️⃣ Testing admin role notifications...');
    
    try {
      const notifications = await notificationService.sendToRoles(adminRoles, {
        title: 'Test: New Leave Request 📋',
        message: 'This is a test notification for admin users about a new leave request.',
        type: 'info',
        category: 'leave',
        metadata: {
          test: true,
          employeeName: 'Test Employee',
          leaveType: 'Casual',
          totalDays: 2
        }
      });
      console.log(`✅ Admin notifications sent to ${notifications.length} users`);
    } catch (error) {
      console.log(`❌ Failed to send admin notifications: ${error.message}`);
    }

    // 5. Test individual role targeting
    console.log('\n5️⃣ Testing individual role targeting...');
    
    for (const role of adminRoles) {
      const roleUsers = await User.findAll({
        where: { role, isActive: true },
        attributes: ['id', 'email']
      });

      if (roleUsers.length > 0) {
        try {
          const notifications = await notificationService.sendToRole(role, {
            title: `Test: ${role} Notification`,
            message: `This is a test notification specifically for ${role} users.`,
            type: 'info',
            category: 'system',
            metadata: { test: true, targetRole: role }
          });
          console.log(`✅ ${role}: sent to ${notifications.length} users`);
        } catch (error) {
          console.log(`❌ ${role}: failed - ${error.message}`);
        }
      } else {
        console.log(`⚠️  ${role}: no active users found`);
      }
    }

    // 6. Check recent notifications in database
    console.log('\n6️⃣ Checking recent test notifications...');
    
    const recentNotifications = await notificationService.getUserNotifications(testEmployee.id, {
      limit: 5,
      category: 'leave'
    });

    console.log(`📊 Recent leave notifications for ${testEmployee.email}:`);
    if (recentNotifications.notifications.length === 0) {
      console.log('   No leave notifications found');
    } else {
      recentNotifications.notifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.title} (${notif.createdAt})`);
      });
    }

    console.log('\n🎉 Leave notification test completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Check the frontend notification bell for new notifications');
    console.log('   2. Submit a real leave request to test the full flow');
    console.log('   3. Check SSE connections in browser dev tools');

  } catch (error) {
    logger.error('Error testing leave notifications:', error);
    console.error('❌ Test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testLeaveNotifications();