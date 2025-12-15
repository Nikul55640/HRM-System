import sequelize from '../config/sequelize.js';
import logger from '../utils/logger.js';

const addUserColumns = async () => {
  try {
    logger.info('🔄 Adding missing User table columns...');
    
    // Test connection
    await sequelize.authenticate();
    logger.info('✅ Database connection established');
    
    // Add refreshToken column
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN refreshToken TEXT
      `);
      logger.info('✅ Added refreshToken column');
    } catch (error) {
      if (error.original?.errno === 1060) {
        logger.info('ℹ️ refreshToken column already exists');
      } else {
        throw error;
      }
    }
    
    // Add assignedDepartments column
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN assignedDepartments JSON
      `);
      logger.info('✅ Added assignedDepartments column');
    } catch (error) {
      if (error.original?.errno === 1060) {
        logger.info('ℹ️ assignedDepartments column already exists');
      } else {
        throw error;
      }
    }
    
    logger.info('✅ User table columns updated successfully');
    
  } catch (error) {
    logger.error('❌ Failed to add columns:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

addUserColumns()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));