/**
 * Migration Runner for HRM System
 * Handles running and rolling back database migrations
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';
import { pathToFileURL } from 'url';
import sequelize from './src/config/sequelize.js';
import logger from './src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = join(__dirname, 'src', 'migrations');

// Get command line arguments
const command = process.argv[2]; // 'up' or 'down'
const migrationName = process.argv[3]; // optional specific migration

/**
 * Get all migration files sorted by name
 */
async function getMigrationFiles() {
  try {
    const files = await readdir(MIGRATIONS_DIR);
    return files
      .filter(file => file.endsWith('.js'))
      .sort(); // Sort alphabetically for consistent order
  } catch (error) {
    logger.error('Error reading migrations directory:', error.message);
    throw error;
  }
}

/**
 * Create migrations table if it doesn't exist
 */
async function createMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(191) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  await sequelize.query(query);
  logger.info('✅ Migrations table ready');
}

/**
 * Get executed migrations from database
 */
async function getExecutedMigrations() {
  try {
    const [results] = await sequelize.query(
      'SELECT name FROM migrations ORDER BY executed_at ASC'
    );
    return results.map(row => row.name);
  } catch (error) {
    logger.error('Error fetching executed migrations:', error.message);
    return [];
  }
}

/**
 * Mark migration as executed
 */
async function markMigrationExecuted(migrationName) {
  await sequelize.query(
    'INSERT INTO migrations (name) VALUES (?)',
    { replacements: [migrationName] }
  );
}

/**
 * Remove migration from executed list
 */
async function markMigrationReverted(migrationName) {
  await sequelize.query(
    'DELETE FROM migrations WHERE name = ?',
    { replacements: [migrationName] }
  );
}

/**
 * Run a single migration
 */
async function runMigration(migrationFile, direction = 'up') {
  const migrationPath = join(MIGRATIONS_DIR, migrationFile);
  
  try {
    logger.info(`${direction === 'up' ? '⬆️' : '⬇️'} Running ${migrationFile} (${direction})`);
    
    // Convert path to file URL for ES modules
    const migrationUrl = pathToFileURL(migrationPath).href;
    const migration = await import(migrationUrl);
    
    if (typeof migration[direction] !== 'function') {
      throw new Error(`Migration ${migrationFile} does not export a ${direction} function`);
    }
    
    // Run the migration
    await migration[direction](sequelize.getQueryInterface(), sequelize.constructor);
    
    // Update migrations table
    if (direction === 'up') {
      await markMigrationExecuted(migrationFile);
    } else {
      await markMigrationReverted(migrationFile);
    }
    
    logger.info(`✅ ${migrationFile} ${direction} completed`);
    
  } catch (error) {
    logger.error(`❌ Error running ${migrationFile} (${direction}):`, error.message);
    throw error;
  }
}

/**
 * Run migrations up
 */
async function runMigrationsUp() {
  try {
    const allMigrations = await getMigrationFiles();
    const executedMigrations = await getExecutedMigrations();
    
    // Filter out already executed migrations
    const pendingMigrations = allMigrations.filter(
      migration => !executedMigrations.includes(migration)
    );
    
    if (pendingMigrations.length === 0) {
      logger.info('✅ No pending migrations to run');
      return;
    }
    
    logger.info(`📋 Found ${pendingMigrations.length} pending migrations`);
    
    // Run each pending migration
    for (const migration of pendingMigrations) {
      await runMigration(migration, 'up');
    }
    
    logger.info('🎉 All migrations completed successfully');
    
  } catch (error) {
    logger.error('❌ Migration failed:', error.message);
    throw error;
  }
}

/**
 * Run migrations down (rollback)
 */
async function runMigrationsDown() {
  try {
    const executedMigrations = await getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      logger.info('✅ No migrations to rollback');
      return;
    }
    
    // Get the last executed migration
    const lastMigration = executedMigrations[executedMigrations.length - 1];
    
    logger.info(`📋 Rolling back: ${lastMigration}`);
    
    await runMigration(lastMigration, 'down');
    
    logger.info('🎉 Rollback completed successfully');
    
  } catch (error) {
    logger.error('❌ Rollback failed:', error.message);
    throw error;
  }
}

/**
 * Run specific migration
 */
async function runSpecificMigration(migrationName, direction) {
  try {
    const allMigrations = await getMigrationFiles();
    const targetMigration = allMigrations.find(m => m === migrationName || m.includes(migrationName));
    
    if (!targetMigration) {
      throw new Error(`Migration not found: ${migrationName}`);
    }
    
    await runMigration(targetMigration, direction);
    
    logger.info(`🎉 Migration ${targetMigration} (${direction}) completed`);
    
  } catch (error) {
    logger.error(`❌ Migration ${migrationName} (${direction}) failed:`, error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    logger.info('🚀 Starting migration runner...');
    
    // Connect to database
    await sequelize.authenticate();
    logger.info('✅ Database connected');
    
    // Create migrations table
    await createMigrationsTable();
    
    // Run migrations based on command
    switch (command) {
      case 'up':
        if (migrationName) {
          await runSpecificMigration(migrationName, 'up');
        } else {
          await runMigrationsUp();
        }
        break;
        
      case 'down':
        if (migrationName) {
          await runSpecificMigration(migrationName, 'down');
        } else {
          await runMigrationsDown();
        }
        break;
        
      default:
        logger.error('❌ Invalid command. Use "up" or "down"');
        logger.info('Usage: node run-migration.js [up|down] [migration-name]');
        process.exit(1);
    }
    
  } catch (error) {
    logger.error('❌ Migration runner failed:', error.message);
    logger.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    await sequelize.close();
    logger.info('🛑 Database connection closed');
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the migration runner
main();