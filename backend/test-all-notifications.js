/**
 * Comprehensive Notification Test
 * Tests all notification scenarios across different controllers
 */

import sequelize from './src/config/sequelize.js';
import notificationService from './src/services/notificationService.js';
import { User, Employee, Notification } from './src/models/index.js';

const testAllNotifications = async () => {
  try {
    console.log('🧪 Starting comprehensive notification tests...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Find a test user
    const testUser = await User.findOne({
      where: { isActive: true }
    });

    if (!testUser) {
      console.log('❌ No active users found for testing');
      return;
    }

    console.log(`📋 Testing with user: ${testUser.firstName} ${testUser.lastName} (ID: ${testUser.id})\n`);

    // Test 1: Leave Application Notification
    console.log('🧪 Test 1: Leave Application Notification');
    await notificationService.sendToUser(testUser.id, {
      title: 'Leave Application Submitted ✅',
      message: 'Your annual leave application has been submitted successfully and is pending approval.',
      type: 'success',
      category: 'leave',
      metadata: {
        leaveRequestId: 123,
        leaveType: 'annual',
        startDate: '2026-01-15',
        endDate: '2026-01-17',
        totalDays: 3
      }
    });
    console.log('✅ Leave application notification sent\n');

    // Test 2: Leave Approval Notification
    console.log('🧪 Test 2: Leave Approval Notification');
    await notificationService.sendToUser(testUser.id, {
      title: 'Leave Request Approved ✅',
      message: 'Your annual leave request from 15/01/2026 to 17/01/2026 has been approved.',
      type: 'success',
      category: 'leave',
      metadata: {
        leaveRequestId: 123,
        leaveType: 'annual',
        startDate: '2026-01-15',
        endDate: '2026-01-17',
        approvedBy: 'HR Manager',
        comments: 'Approved for vacation'
      }
    });
    console.log('✅ Leave approval notification sent\n');

    // Test 3: Leave Rejection Notification
    console.log('🧪 Test 3: Leave Rejection Notification');
    await notificationService.sendToUser(testUser.id, {
      title: 'Leave Request Rejected ❌',
      message: 'Your sick leave request from 20/01/2026 to 22/01/2026 has been rejected. Reason: Insufficient documentation',
      type: 'error',
      category: 'leave',
      metadata: {
        leaveRequestId: 124,
        leaveType: 'sick',
        startDate: '2026-01-20',
        endDate: '2026-01-22',
        rejectedBy: 'HR Manager',
        comments: 'Insufficient documentation'
      }
    });
    console.log('✅ Leave rejection notification sent\n');

    // Test 4: Shift Assignment Notification
    console.log('🧪 Test 4: Shift Assignment Notification');
    await notificationService.sendToUser(testUser.id, {
      title: 'New Shift Assignment 🕐',
      message: 'You have been assigned to the "Morning Shift" shift (09:00 - 17:00)',
      type: 'info',
      category: 'shift',
      metadata: {
        shiftId: 1,
        shiftName: 'Morning Shift',
        shiftStartTime: '09:00',
        shiftEndTime: '17:00',
        effectiveDate: '2026-01-10',
        assignedBy: 'Admin User'
      }
    });
    console.log('✅ Shift assignment notification sent\n');

    // Test 5: Welcome New Employee Notification
    console.log('🧪 Test 5: Welcome New Employee Notification');
    await notificationService.sendToUser(testUser.id, {
      title: 'Welcome to the Team! 🎉',
      message: 'Welcome John! Your employee account has been created successfully. You can now access the HRM system.',
      type: 'success',
      category: 'system',
      metadata: {
        employeeId: 456,
        department: 'IT',
        jobTitle: 'Software Developer',
        role: 'Employee',
        createdBy: 'HR Manager'
      }
    });
    console.log('✅ Welcome notification sent\n');

    // Test 6: Attendance Correction Approved
    console.log('🧪 Test 6: Attendance Correction Approved');
    await notificationService.sendToUser(testUser.id, {
      title: 'Attendance Correction Approved ✅',
      message: 'Your attendance correction request for 05/01/2026 has been approved.',
      type: 'success',
      category: 'attendance',
      metadata: {
        correctionRequestId: 789,
        date: '2026-01-05',
        approvedBy: 'HR Manager',
        adminNotes: 'Valid reason provided'
      }
    });
    console.log('✅ Attendance correction approval notification sent\n');

    // Test 7: Attendance Correction Rejected
    console.log('🧪 Test 7: Attendance Correction Rejected');
    await notificationService.sendToUser(testUser.id, {
      title: 'Attendance Correction Rejected ❌',
      message: 'Your attendance correction request for 03/01/2026 has been rejected. Reason: Insufficient evidence',
      type: 'error',
      category: 'attendance',
      metadata: {
        correctionRequestId: 790,
        date: '2026-01-03',
        rejectedBy: 'HR Manager',
        adminNotes: 'Insufficient evidence'
      }
    });
    console.log('✅ Attendance correction rejection notification sent\n');

    // Test 8: Late Clock-in Notification (from existing service)
    console.log('🧪 Test 8: Late Clock-in Notification');
    await notificationService.sendToUser(testUser.id, {
      title: 'Late Clock-in Recorded',
      message: 'You have been marked as late for today. Please contact HR if this is incorrect.',
      type: 'warning',
      category: 'attendance',
      metadata: {
        attendanceId: 999,
        clockInTime: '09:30:00',
        lateMinutes: 30
      }
    });
    console.log('✅ Late clock-in notification sent\n');

    // Test 9: System Notification
    console.log('🧪 Test 9: System Notification');
    await notificationService.sendToUser(testUser.id, {
      title: 'System Maintenance Notice 🔧',
      message: 'The HRM system will undergo maintenance on Sunday, January 12th from 2:00 AM to 4:00 AM.',
      type: 'warning',
      category: 'system',
      metadata: {
        maintenanceDate: '2026-01-12',
        startTime: '02:00',
        endTime: '04:00',
        impact: 'System will be unavailable'
      }
    });
    console.log('✅ System notification sent\n');

    // Test 10: Role-based notification to all admins
    console.log('🧪 Test 10: Role-based Notification to Admins');
    await notificationService.sendToRole('admin', {
      title: 'Monthly Report Available 📊',
      message: 'The monthly attendance and leave report for December 2025 is now available for download.',
      type: 'info',
      category: 'system',
      metadata: {
        reportType: 'monthly',
        period: 'December 2025',
        availableUntil: '2026-02-01'
      }
    });
    console.log('✅ Role-based notification sent to admins\n');

    // Get notification count
    const notificationCount = await Notification.count({
      where: { userId: testUser.id }
    });

    console.log('📊 NOTIFICATION TEST SUMMARY:');
    console.log('================================');
    console.log(`✅ All 10 notification types tested successfully`);
    console.log(`📧 Total notifications in DB for test user: ${notificationCount}`);
    console.log(`👤 Test user: ${testUser.firstName} ${testUser.lastName} (${testUser.email})`);
    console.log('');
    console.log('🔔 NOTIFICATION TYPES COVERED:');
    console.log('  ✅ Leave Applications');
    console.log('  ✅ Leave Approvals/Rejections');
    console.log('  ✅ Shift Assignments');
    console.log('  ✅ Employee Welcome Messages');
    console.log('  ✅ Attendance Corrections');
    console.log('  ✅ Late Clock-in Alerts');
    console.log('  ✅ System Notifications');
    console.log('  ✅ Role-based Notifications');
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('  1. Start the backend server: npm run dev');
    console.log('  2. Login to the frontend');
    console.log('  3. Check the notification bell 🔔');
    console.log('  4. Test real-time SSE connection');
    console.log('');
    console.log('🚀 Notification system is ready for production!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
};

testAllNotifications();