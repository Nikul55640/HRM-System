import cron from 'node-cron';
import notificationService from '../services/notificationService.js';
import logger from '../utils/logger.js';

/**
 * Scheduled job to clean up old read notifications
 * Runs daily at 2:00 AM
 */
const scheduleNotificationCleanup = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Starting notification cleanup job...');

      // Delete notifications older than 30 days
      const result = await notificationService.cleanupOldNotifications(30);

      logger.info(
        `Notification cleanup completed. Deleted ${result?.deletedCount || 0} notifications.`
      );
    } catch (error) {
      logger.error('Error in notification cleanup job:', error);
    }
  });

  logger.info('Notification cleanup job scheduled (daily at 2:00 AM)');
};

export { scheduleNotificationCleanup };
