import { Sequelize } from 'sequelize';
import config from './index.js';
import logger from '../utils/logger.js';

// Create Sequelize instance
const sequelize = new Sequelize(
  config.database.database,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    pool: config.database.pool,
    logging: config.database.logging,
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
    },
    timezone: '+00:00', // UTC timezone
  }
);

// Test database connection
export const connectDB = async () => {
  try {
    logger.info('🔄 Connecting to MySQL database...');
    
    await sequelize.authenticate();
    
    logger.info('✅ MySQL Database Connected Successfully');
    logger.info(`🏦 Host: ${config.database.host}:${config.database.port}`);
    logger.info(`📁 Database: ${config.database.database}`);
    
    // Sync database in development (be careful in production)
    // Disabled automatic sync to avoid "too many keys" error
    // Database schema is already created via migration scripts
    // if (config.env === 'development') {
    //   await sequelize.sync({ alter: true });
    //   logger.info('🔄 Database synchronized');
    // }
    
    return sequelize;
  } catch (error) {
    logger.error('❌ MySQL Connection Failed');
    logger.error('Message:', error.message);
    logger.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Check connection status
export const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    return {
      state: 'connected',
      isConnected: true,
    };
  } catch (error) {
    return {
      state: 'disconnected',
      isConnected: false,
      error: error.message,
    };
  }
};

// Close database connection
export const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('🛑 MySQL connection closed');
  } catch (error) {
    logger.error('Error closing MySQL connection:', error.message);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('⚠️ SIGINT received. Closing MySQL connection...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('⚠️ SIGTERM received. Closing MySQL connection...');
  await closeConnection();
  process.exit(0);
});

export default sequelize;