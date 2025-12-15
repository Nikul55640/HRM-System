import sequelize from '../config/sequelize.js';
import logger from '../utils/logger.js';

const fixConfigJson = async () => {
  try {
    logger.info('🔄 Fixing Config table JSON values...');
    
    // Test connection
    await sequelize.authenticate();
    logger.info('✅ Database connection established');
    
    // Check existing data
    const [results] = await sequelize.query(`SELECT id, \`key\`, value FROM configs`);
    logger.info(`Found ${results.length} config records`);
    
    // Fix invalid JSON values
    for (const record of results) {
      try {
        // Try to parse existing value as JSON
        JSON.parse(record.value);
        logger.info(`✅ Config ${record.key} has valid JSON`);
      } catch (error) {
        // Invalid JSON, fix it
        logger.info(`🔧 Fixing invalid JSON for config: ${record.key}`);
        const fixedValue = JSON.stringify(record.value);
        await sequelize.query(
          `UPDATE configs SET value = ? WHERE id = ?`,
          { replacements: [fixedValue, record.id] }
        );
        logger.info(`✅ Fixed config ${record.key}`);
      }
    }
    
    logger.info('✅ Config JSON values fixed');
    
  } catch (error) {
    logger.error('❌ Fix failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

fixConfigJson()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));