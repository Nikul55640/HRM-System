import sequelize from './src/config/sequelize.js';
import { up as addEmployeePersonalFields } from './src/migrations/add-employee-personal-fields.js';

async function runEmployeeFieldsMigration() {
  try {
    console.log('🔄 Running Employee Personal Fields migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Run the migration
    await addEmployeePersonalFields(sequelize.getQueryInterface());
    
    console.log('✅ Employee personal fields migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

runEmployeeFieldsMigration()
  .then(() => {
    console.log('Migration process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });