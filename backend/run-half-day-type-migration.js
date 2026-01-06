/**
 * Run Half Day Type Migration
 * Adds halfDayType column to attendance_records table for automatic half-day detection
 */

import sequelize from './src/config/sequelize.js';
import { up, down } from './src/migrations/add-half-day-type-to-attendance.js';

async function runMigration() {
  try {
    console.log('🚀 Starting Half Day Type Migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Run the migration
    await up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('✅ Half Day Type Migration completed successfully!');
    console.log('📋 Summary:');
    console.log('   - Added halfDayType column to attendance_records table');
    console.log('   - Enum values: first_half, second_half, full_day');
    console.log('   - Enables automatic detection of half-day types');
    
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
  console.log('🔄 Rolling back Half Day Type Migration...');
  runRollback();
} else {
  runMigration();
}

async function runRollback() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    await down(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('✅ Half Day Type Migration rollback completed!');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}