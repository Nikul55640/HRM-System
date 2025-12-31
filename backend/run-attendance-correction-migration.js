import sequelize from './src/config/sequelize.js';

async function runAttendanceCorrectionMigration() {
  try {
    console.log('🔄 Running attendance correction migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    const queryInterface = sequelize.getQueryInterface();

    // Check if columns already exist before adding them
    const tableDescription = await queryInterface.describeTable('attendance_records');
    
    // Add flaggedReason if it doesn't exist
    if (!tableDescription.flaggedReason) {
      console.log('Adding flaggedReason column...');
      await queryInterface.addColumn('attendance_records', 'flaggedReason', {
        type: sequelize.Sequelize.TEXT,
        allowNull: true,
      });
    } else {
      console.log('flaggedReason column already exists');
    }

    // Add flaggedBy if it doesn't exist
    if (!tableDescription.flaggedBy) {
      console.log('Adding flaggedBy column...');
      await queryInterface.addColumn('attendance_records', 'flaggedBy', {
        type: sequelize.Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      });
    } else {
      console.log('flaggedBy column already exists');
    }

    // Add flaggedAt if it doesn't exist
    if (!tableDescription.flaggedAt) {
      console.log('Adding flaggedAt column...');
      await queryInterface.addColumn('attendance_records', 'flaggedAt', {
        type: sequelize.Sequelize.DATE,
        allowNull: true,
      });
    } else {
      console.log('flaggedAt column already exists');
    }

    // Update status enum to include pending_correction
    console.log('Updating status enum...');
    try {
      await queryInterface.changeColumn('attendance_records', 'status', {
        type: sequelize.Sequelize.ENUM('present', 'absent', 'leave', 'half_day', 'holiday', 'pending_correction'),
        defaultValue: 'present',
      });
      console.log('Status enum updated successfully');
    } catch (error) {
      if (error.message.includes('pending_correction')) {
        console.log('Status enum already includes pending_correction');
      } else {
        throw error;
      }
    }

    console.log('✅ Attendance correction migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

runAttendanceCorrectionMigration()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });