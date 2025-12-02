import app from './app.js';
import { connectDB } from './config/database.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  // Schedule cron jobs (if node-cron is available)
  try {
    import('./jobs/notificationCleanup.js').then((mod) => {
      if (mod && mod.scheduleNotificationCleanup) mod.scheduleNotificationCleanup();
    }).catch(() => {
      logger.warn('Cron jobs not initialized. Run "npm install" in backend directory to enable scheduled tasks.');
    });
  } catch (error) {
    logger.warn('Cron jobs not initialized. Run "npm install" in backend directory to enable scheduled tasks.');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

export default server;
