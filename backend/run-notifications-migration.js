import sequelize from './src/config/sequelize.js';
import { up, down } from './src/migrations/create-notifications.js';

const runMigration = async () => {
  try {
    console.log('🚀 Starting notifications migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Run the migration
    await up(sequelize.getQueryInterface());
    console.log('✅ Notifications table created successfully');
    
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Handle command line arguments
const command = process.argv[2];

if (command === 'down') {
  // Rollback migration
  const rollbackMigration = async () => {
    try {
      console.log('🔄 Rolling back notifications migration...');
      
      await sequelize.authenticate();
      console.log('✅ Database connection established');
      
      await down(sequelize.getQueryInterface());
      console.log('✅ Notifications table dropped successfully');
      
      console.log('🎉 Rollback completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      process.exit(1);
    }
  };
  
  rollbackMigration();
} else {
  runMigration();
}