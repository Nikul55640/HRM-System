import sequelize from './src/config/sequelize.js';
import migrationModule from './src/migrations/create-attendance-correction-requests.js';

async function runAttendanceCorrectionRequestsMigration() {
  try {
    console.log('🔄 Running attendance correction requests table migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    const queryInterface = sequelize.getQueryInterface();

    // Check if table already exists
    const tables = await queryInterface.showAllTables();
    const tableExists = tables.includes('attendance_correction_requests');

    if (tableExists) {
      console.log('⚠️  Table attendance_correction_requests already exists');
      console.log('Migration skipped');
      return;
    }

    // Run the migration
    console.log('Creating attendance_correction_requests table...');
    await migrationModule.up(queryInterface, sequelize.Sequelize);
    
    console.log('✅ Attendance correction requests table migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Get command line argument for direction (up/down)
const direction = process.argv[2] || 'up';

if (direction === 'up') {
  runAttendanceCorrectionRequestsMigration()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
} else if (direction === 'down') {
  // Run down migration
  sequelize.authenticate()
    .then(() => {
      console.log('🔄 Running attendance correction requests table migration DOWN...');
      return migrationModule.down(sequelize.getQueryInterface(), sequelize.Sequelize);
    })
    .then(() => {
      console.log('✅ Migration DOWN completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration DOWN failed:', error);
      process.exit(1);
    })
    .finally(() => {
      sequelize.close();
    });
} else {
  console.error('Invalid direction. Use "up" or "down"');
  process.exit(1);
}