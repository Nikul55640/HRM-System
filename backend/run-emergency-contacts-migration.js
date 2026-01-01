import sequelize from './src/config/sequelize.js';
import { up as createEmergencyContacts } from './src/migrations/create-emergency-contacts.js';

async function runEmergencyContactsMigration() {
  try {
    console.log('🔄 Running Emergency Contacts migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Check if table already exists
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'emergency_contacts'
    `);
    
    if (results[0].count > 0) {
      console.log('✅ Emergency contacts table already exists.');
      return;
    }

    // Run the migration
    await createEmergencyContacts(sequelize.getQueryInterface());
    
    console.log('✅ Emergency contacts migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

runEmergencyContactsMigration()
  .then(() => {
    console.log('Migration process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });