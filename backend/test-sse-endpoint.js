import express from 'express';
import cors from 'cors';
import { authenticate } from './src/middleware/authenticate.js';
import notificationsController from './src/controllers/employee/notifications.controller.js';
import sequelize from './src/config/sequelize.js';

const app = express();
const PORT = 5001; // Different port to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Test route for SSE
app.get('/test-sse', notificationsController.streamNotifications);

// Test route to send a notification
app.post('/test-send', async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    
    // Import notification service
    const notificationService = (await import('./src/services/notificationService.js')).default;
    
    const notification = await notificationService.sendToUser(userId, {
      title: title || 'Test Notification',
      message: message || 'This is a test notification from the SSE test server',
      type: 'info',
      category: 'system',
      metadata: { test: true }
    });
    
    res.json({ success: true, notification });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const startTestServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    app.listen(PORT, () => {
      console.log(`🧪 SSE Test Server running on http://localhost:${PORT}`);
      console.log('');
      console.log('📋 Test Instructions:');
      console.log('1. Open browser to: http://localhost:5001/test-sse?token=YOUR_JWT_TOKEN');
      console.log('2. Send POST to: http://localhost:5001/test-send');
      console.log('   Body: { "userId": 3, "title": "Test", "message": "Hello!" }');
      console.log('');
      console.log('💡 To get a JWT token, login to the main app and check localStorage');
    });
  } catch (error) {
    console.error('❌ Failed to start test server:', error);
    process.exit(1);
  }
};

startTestServer();