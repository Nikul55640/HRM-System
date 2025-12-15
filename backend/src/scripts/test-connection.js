import { connectDB } from '../config/sequelize.js';
import logger from '../utils/logger.js';

const testConnection = async () => {
  try {
    logger.info('🔄 Testing MySQL connection...');
    
    const sequelize = await connectDB();
    
    logger.info('✅ Connection test successful!');
    
    await sequelize.close();
    logger.info('🛑 Connection closed');
    
  } catch (error) {
    logger.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
};

testConnection();