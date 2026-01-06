import fs from 'fs';
import path from 'path';
import sequelize from './src/config/sequelize.js';

async function runDesignationMigration() {
  try {
    console.log('🔄 Running designation migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Read the SQL migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '002_create_designations_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`[EXECUTING] Executing statement ${i + 1}/${statements.length}...`);
          await sequelize.query(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          if (error.message.includes('already exists') || 
              error.message.includes('Duplicate column') ||
              error.message.includes('Duplicate key')) {
            console.log(`[WARNING] Statement ${i + 1} skipped (already exists): ${error.message}`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }

    console.log('✅ Designation migration completed successfully!');
    
    // Verify the tables were created
    const [results] = await sequelize.query("SHOW TABLES LIKE 'designations'");
    if (results.length > 0) {
      console.log('✅ Designations table verified');
      
      // Check if we have any designations
      const [designations] = await sequelize.query("SELECT COUNT(*) as count FROM designations");
      console.log(`📊 Found ${designations[0].count} designations in the database`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
runDesignationMigration();