import sequelize from '../config/sequelize.js';
import logger from '../utils/logger.js';

const fixDocumentColumn = async () => {
  try {
    logger.info('🔄 Fixing Document employeeId column...');
    
    // Test connection
    await sequelize.authenticate();
    logger.info('✅ Database connection established');
    
    // Fix the employeeId column to allow NULL
    await sequelize.query(`
      ALTER TABLE documents 
      MODIFY COLUMN employeeId INT NULL
    `);
    
    logger.info('✅ Document employeeId column fixed to allow NULL');
    
  } catch (error) {
    logger.error('❌ Fix failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

fixDocumentColumn()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));