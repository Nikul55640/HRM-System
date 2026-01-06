/**
 * Run Backward Compatible Roles Migration
 */

import sequelize from './src/config/sequelize.js';
import { up, down } from './src/migrations/add-backward-compatible-roles.js';

async function runMigration() {
  try {
    console.log('🔄 Starting Backward Compatible Roles Migration...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
    console.log('🔒 Database connection closed');
  }
}

runMigration();