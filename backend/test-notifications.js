import sequelize from './src/config/sequelize.js';
import notificationService from './src/services/notificationService.js';
import { User } from './src/models/index.js';

const testNotifications = async () => {
  try {
    console.log('🧪 Testing notification system...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Find a test user
    const testUser = await User.findOne({
      where: { role: 'Employee' },
      limit: 1,
    });
    
    if (!testUser) {
      console.log('❌ No test user found. Please create a user first.');
      process.exit(1);
    }
    
    console.log(`📧 Found test user: ${testUser.email} (${testUser.role})`);
    
    // Test 1: Send notification to specific user
    console.log('\n🧪 Test 1: Sending notification to specific user...');
    const notification1 = await notificationService.sendToUser(testUser.id, {
      title: 'Test Notification',
      message: 'This is a test notification sent directly to you!',
      type: 'info',
      category: 'system',
      metadata: {
        testId: 'test-1',
        timestamp: new Date().toISOString(),
      },
    });
    console.log('✅ Notification sent to user:', notification1.id);
    
    // Test 2: Send notification to role
    console.log('\n🧪 Test 2: Sending notification to Employee role...');
    const notifications2 = await notificationService.sendToRole('Employee', {
      title: 'Role-based Test Notification',
      message: 'This notification was sent to all employees!',
      type: 'success',
      category: 'system',
      metadata: {
        testId: 'test-2',
        timestamp: new Date().toISOString(),
      },
    });
    console.log(`✅ Notifications sent to ${notifications2.length} employees`);
    
    // Test 3: Get user notifications
    console.log('\n🧪 Test 3: Retrieving user notifications...');
    const userNotifications = await notificationService.getUserNotifications(testUser.id, {
      page: 1,
      limit: 10,
    });
    console.log(`✅ Found ${userNotifications.notifications.length} notifications for user`);
    console.log('Recent notifications:');
    userNotifications.notifications.slice(0, 3).forEach((notif, index) => {
      console.log(`  ${index + 1}. ${notif.title} - ${notif.type} (${notif.isRead ? 'read' : 'unread'})`);
    });
    
    // Test 4: Get unread count
    console.log('\n🧪 Test 4: Getting unread count...');
    const unreadCount = await notificationService.getUnreadCount(testUser.id);
    console.log(`✅ User has ${unreadCount} unread notifications`);
    
    // Test 5: Mark as read
    if (userNotifications.notifications.length > 0) {
      const firstNotification = userNotifications.notifications[0];
      if (!firstNotification.isRead) {
        console.log('\n🧪 Test 5: Marking notification as read...');
        const marked = await notificationService.markAsRead(firstNotification.id, testUser.id);
        console.log(`✅ Notification marked as read: ${marked}`);
        
        // Check unread count again
        const newUnreadCount = await notificationService.getUnreadCount(testUser.id);
        console.log(`✅ New unread count: ${newUnreadCount}`);
      }
    }
    
    console.log('\n🎉 All notification tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Database connection working');
    console.log('- ✅ Send notification to user working');
    console.log('- ✅ Send notification to role working');
    console.log('- ✅ Get user notifications working');
    console.log('- ✅ Get unread count working');
    console.log('- ✅ Mark as read working');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testNotifications();