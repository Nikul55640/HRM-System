/**
 * Run User Model Production Migration
 * Implements critical production improvements for User model
 */

import sequelize from './src/config/sequelize.js';
import { up, down } from './src/migrations/update-user-model-production.js';

async function runMigration() {
  try {
    console.log('🚀 Starting User Model Production Migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Run the migration
    await up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('✅ User Model Production Migration completed successfully!');
    console.log('📋 Production Improvements Applied:');
    console.log('   🔗 Added employeeId foreign key (CRITICAL for HRM)');
    console.log('   🏷️  Updated role enum to normalized naming');
    console.log('   ⚡ Added performance indexes');
    console.log('   📊 Ready for production HRM workflows');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔒 Database connection closed');
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--rollback')) {
  console.log('🔄 Rolling back User Model Production Migration...');
  runRollback();
} else {
  runMigration();
}

async function runRollback() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    await down(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('✅ User Model Production Migration rollback completed!');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}