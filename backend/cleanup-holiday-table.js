/**
 * Cleanup Holiday Table - Remove old columns
 */

import sequelize from './src/config/sequelize.js';

async function cleanupHolidayTable() {
  try {
    console.log('🧹 Cleaning up Holiday Table...');

    await sequelize.authenticate();
    console.log('✅ Database connection established');

    const queryInterface = sequelize.getQueryInterface();

    // Check current columns
    const columns = await queryInterface.describeTable('holidays');
    console.log('Current columns:', Object.keys(columns));

    // Remove old columns that are no longer needed
    const columnsToRemove = ['isRecurring', 'recurrencePattern'];
    
    for (const column of columnsToRemove) {
      if (columns[column]) {
        console.log(`📋 Removing old column: ${column}`);
        await queryInterface.removeColumn('holidays', column);
      }
    }

    // Verify final structure
    const finalColumns = await queryInterface.describeTable('holidays');
    console.log('✅ Final columns:', Object.keys(finalColumns));

    console.log('🎉 Holiday table cleanup completed!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

cleanupHolidayTable();