import sequelize from '../src/config/sequelize.js';
import Holiday from '../src/models/sequelize/Holiday.js';

/**
 * Script to delete all holidays from the database
 * Usage: node scripts/deleteAllHolidays.js
 */

async function deleteAllHolidays() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    console.log('🗑️  Deleting all holidays...');
    const deletedCount = await Holiday.destroy({
      where: {},
      truncate: true // This will reset auto-increment
    });

    console.log(`✅ Successfully deleted ${deletedCount} holiday(s)`);
    console.log('🎉 All holiday data has been cleared from the database');

  } catch (error) {
    console.error('❌ Error deleting holidays:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
}

// Run the script
deleteAllHolidays();
