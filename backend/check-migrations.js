/**
 * Check what migrations have been executed
 */

import sequelize from './src/config/sequelize.js';

async function checkMigrations() {
  try {
    console.log('🔍 Checking executed migrations...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Check if migrations table exists
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'migrations'");
    
    if (tables.length === 0) {
      console.log('❌ Migrations table does not exist');
      return;
    }
    
    // Get executed migrations
    const [results] = await sequelize.query(
      'SELECT name, executed_at FROM migrations ORDER BY executed_at ASC'
    );
    
    console.log(`📋 Found ${results.length} executed migrations:`);
    results.forEach((migration, index) => {
      console.log(`${index + 1}. ${migration.name} (${migration.executed_at})`);
    });
    
    // Check current table structure
    console.log('\n🔍 Checking employees table structure...');
    const [columns] = await sequelize.query("DESCRIBE employees");
    console.log('Employees table columns:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`);
    });
    
    console.log('\n🔍 Checking attendance_records table structure...');
    const [attColumns] = await sequelize.query("DESCRIBE attendance_records");
    console.log('Attendance_records table columns:');
    attColumns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkMigrations();