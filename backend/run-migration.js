/**
 * Simple Migration Runner
 * Runs database migrations
 */

import sequelize from './src/config/sequelize.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, 'src', 'migrations');

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Get all migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();
    
    console.log(`📁 Found ${migrationFiles.length} migration files`);
    
    // Run each migration
    for (const file of migrationFiles) {
      try {
        console.log(`🔄 Running migration: ${file}`);
        
        const migrationPath = `file://${path.join(migrationsDir, file).replace(/\\/g, '/')}`;
        const migration = await import(migrationPath);
        
        if (migration.up) {
          await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
          console.log(`✅ Migration completed: ${file}`);
        } else {
          console.log(`⚠️ No 'up' function found in: ${file}`);
        }
      } catch (error) {
        console.error(`❌ Migration failed: ${file}`, error.message);
        // Continue with other migrations
      }
    }
    
    console.log('🎉 All migrations completed');
    
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migrations
runMigrations();