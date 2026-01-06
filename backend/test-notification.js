import notificationService from './src/services/notificationService.js';
import sequelize from './src/config/sequelize.js';

const testNotification = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Send a test notification to user ID 1
    const userId = 1;
    const notification = await notificationService.sendToUser(userId, {
      title: 'Test SSE Notification',
      message: 'This is a test notification to verify SSE is working correctly.',
      type: 'info',
      category: 'system',
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Test notification sent:', notification.id);
    console.log('📤 Check your frontend for the notification!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    process.exit(1);
  }
};

testNotification();