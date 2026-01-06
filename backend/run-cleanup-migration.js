/**
 * Run User-Employee Relationship Cleanup Migration
 */

import sequelize from './src/config/sequelize.js';
import { up, down } from './src/migrations/cleanup-user-employee-relationship.js';

async function runCleanup() {
  try {
    console.log('🧹 Starting User-Employee Relationship Cleanup...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('✅ Cleanup Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await sequelize.close();
    console.log('🔒 Database connection closed');
  }
}

runCleanup();