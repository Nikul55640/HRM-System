// db.js (ESM Version)
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// MongoDB connection options for HRM system
const options = {
  maxPoolSize: 20, // HRM eeds higher concurrency
  minPoolSize: 5,
  socketTimeoutMS: 60000,
  serverSelectionTimeoutMS: 10000,
  family: 4,
};

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('❌ MONGODB_URI missing in environment variables');
    }

    logger.info('🔄 Connecting to MongoDB...');

    const conn = await mongoose.connect(uri, options);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`🏦 Host: ${conn.connection.host}`);
    logger.info(`📁 Database: ${conn.connection.name}`);

    // Events
    mongoose.connection.on('connected', () => {
      logger.info('🟢 Mongoose reconnected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('🟡 MongoDB disconnected, retrying...');
    });

    return conn;
  } catch (error) {
    logger.error('❌ MongoDB Connection Failed');
    logger.error('Message:', error.message);
    logger.error('Stack:', error.stack);

    process.exit(1);
  }
};

// Check connection status
export const checkConnection = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    state: states[state],
    isConnected: state === 1,
  };
};

// Close DB connection
export const closeConnection = async () => {
  try {
    await mongoose.connection.close();
    logger.info('🛑 MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB:', error.message);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('⚠️ SIGINT received. Closing MongoDB...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('⚠️ SIGTERM received. Closing MongoDB...');
  await closeConnection();
  process.exit(0);
});
