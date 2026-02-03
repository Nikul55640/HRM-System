/**
 * Role Standardization Migration Runner
 * 
 * This script runs the role standardization migration to update
 * existing user roles to the new standardized format.
 */

import sequelize from './src/config/sequelize.js';
import { up as migrateUp, down as migrateDown } from './src/migrations/standardize-user-roles.js';

const runMigration = async (direction = 'up') => {
  try {
    console.log('🔄 [MIGRATION RUNNER] Starting role standardization migration...');
    console.log(`📊 [MIGRATION RUNNER] Direction: ${direction}`);
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ [MIGRATION RUNNER] Database connection established');
    
    // Run migration
    if (direction === 'up') {
      console.log('🔄 [MIGRATION RUNNER] Running UP migration...');
      await migrateUp(sequelize.getQueryInterface());
      console.log('✅ [MIGRATION RUNNER] UP migration completed successfully!');
    } else if (direction === 'down') {
      console.log('🔄 [MIGRATION RUNNER] Running DOWN migration...');
      await migrateDown(sequelize.getQueryInterface());
      console.log('✅ [MIGRATION RUNNER] DOWN migration completed successfully!');
    } else {
      throw new Error(`Invalid direction: ${direction}. Use 'up' or 'down'.`);
    }
    
  } catch (error) {
    console.error('❌ [MIGRATION RUNNER] Migration failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    try {
      await sequelize.close();
      console.log('🔌 [MIGRATION RUNNER] Database connection closed');
    } catch (closeError) {
      console.warn('⚠️ [MIGRATION RUNNER] Error closing database connection:', closeError.message);
    }
  }
};

// Get direction from command line arguments
const direction = process.argv[2] || 'up';

// Run the migration
runMigration(direction);