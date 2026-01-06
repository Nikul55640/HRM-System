import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import notificationsController from '../../controllers/employee/notifications.controller.js';

const router = express.Router();

// SSE stream endpoint - handle authentication manually for EventSource compatibility
router.get('/notifications/stream', notificationsController.streamNotifications);

// Get all notifications
router.get('/notifications', authenticate, notificationsController.getNotifications);

// Get unread count
router.get('/notifications/unread-count', authenticate, notificationsController.getUnreadCount);

// Mark notifications as read
router.put('/notifications/:id/read', authenticate, notificationsController.markAsRead);
router.put('/notifications/read-many', authenticate, notificationsController.markManyAsRead);
router.put('/notifications/read-all', authenticate, notificationsController.markAllAsRead);

// Delete notification
router.delete('/notifications/:id', authenticate, notificationsController.deleteNotification);

// Test notification (for debugging)
router.post('/notifications/test', authenticate, notificationsController.sendTestNotification);

export default router;
