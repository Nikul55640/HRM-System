const cron = require('node-cron');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

/**
 * Scheduled job to clean up old read notifications
 * Runs daily at 2:00 AM
 */
const scheduleNotificationCleanup = () => {
  // Run every day at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Starting notification cleanup job...');

      // Delete notifications older than 30 days
      const result = await notificationService.cleanupOldNotifications(30);

      logger.info(`Notification cleanup completed. Deleted ${result.deletedCount} notifications.`);
    } catch (error) {
      logger.error('Error in notification cleanup job:', error);
    }
  });

  logger.info('Notification cleanup job scheduled (daily at 2:00 AM)');
};

module.exports = { scheduleNotificationCleanup };
