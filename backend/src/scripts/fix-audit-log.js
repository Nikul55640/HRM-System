import sequelize from '../config/sequelize.js';
import logger from '../utils/logger.js';

const fixAuditLogColumn = async () => {
  try {
    logger.info('🔄 Fixing AuditLog userId column...');
    
    // Test connection
    await sequelize.authenticate();
    logger.info('✅ Database connection established');
    
    // Fix the userId column to allow NULL
    await sequelize.query(`
      ALTER TABLE audit_logs 
      MODIFY COLUMN userId INT NULL
    `);
    
    logger.info('✅ AuditLog userId column fixed to allow NULL');
    
  } catch (error) {
    logger.error('❌ Fix failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

fixAuditLogColumn()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));