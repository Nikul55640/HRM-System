/**
 * Check Database Schema
 */

import sequelize from './src/config/sequelize.js';
import logger from './src/utils/logger.js';

async function checkSchema() {
  try {
    logger.info('🔍 Checking database schema...');
    
    // Connect to database
    await sequelize.authenticate();
    logger.info('✅ Database connected');
    
    // Check if employees table exists and its structure
    const [results] = await sequelize.query("DESCRIBE employees");
    
    logger.info('📋 Employees table structure:');
    console.table(results);
    
    // Check migrations table
    try {
      const [migrations] = await sequelize.query("SELECT * FROM migrations ORDER BY executed_at");
      logger.info('📋 Executed migrations:');
      console.table(migrations);
    } catch (error) {
      logger.info('ℹ️ No migrations table found');
    }
    
  } catch (error) {
    logger.error('❌ Error checking schema:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkSchema();