/**
 * Fix migration state - mark existing migrations as completed
 */

import sequelize from './src/config/sequelize.js';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = join(__dirname, 'src', 'migrations');

async function fixMigrationState() {
  try {
    console.log('🔧 Fixing migration state...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Create migrations table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(191) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get all migration files
    const files = await readdir(MIGRATIONS_DIR);
    const migrationFiles = files
      .filter(file => file.endsWith('.js'))
      .sort();
    
    console.log(`📋 Found ${migrationFiles.length} migration files`);
    
    // Mark migrations as executed (except the ones we want to run)
    const skipMigrations = [
      'add-work-mode-to-attendance.js'
    ];
    
    for (const file of migrationFiles) {
      if (skipMigrations.includes(file)) {
        console.log(`⏭️ Skipping ${file} (will run later)`);
        continue;
      }
      
      try {
        await sequelize.query(
          'INSERT IGNORE INTO migrations (name) VALUES (?)',
          { replacements: [file] }
        );
        console.log(`✅ Marked ${file} as executed`);
      } catch (error) {
        console.log(`⚠️ ${file} already marked as executed`);
      }
    }
    
    console.log('🎉 Migration state fixed!');
    console.log('Now you can run: npm run migrate');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixMigrationState();