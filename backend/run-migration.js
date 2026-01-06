/**
 * Migration Runner for HRM System
 * Date: 2024-12-24
 * 
 * This script runs the database migration for the restructured HRM system
 */

import { sequelize } from './src/models/sequelize/index.js';
import { up as migrationUp, down as migrationDown } from './src/migrations/2024-12-24-hrm-model-restructure.js';

const runMigration = async (direction = 'up') => {
    try {
        console.log(`🔄 Running migration ${direction}...`);

        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        if (direction === 'up') {
            await migrationUp(sequelize.getQueryInterface(), sequelize.Sequelize);
            console.log('✅ Migration UP completed successfully.');
        } else if (direction === 'down') {
            await migrationDown(sequelize.getQueryInterface(), sequelize.Sequelize);
            console.log('✅ Migration DOWN completed successfully.');
        } else {
            throw new Error('Invalid migration direction. Use "up" or "down".');
        }

        console.log('\n🎉 Migration completed successfully!');

        if (direction === 'up') {
            console.log('\n📋 Next Steps:');
            console.log('1. Run seed data: npm run seed');
            console.log('2. Or run full sync: npm run sync-db');
            console.log('3. Update your application code to use new model structure');
            console.log('4. Test all functionality thoroughly');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
};

// Handle command line arguments
const args = process.argv.slice(2);
const direction = args[0] || 'up';

if (!['up', 'down'].includes(direction)) {
    console.error('❌ Invalid direction. Use "up" or "down".');
    process.exit(1);
}

if (direction === 'down') {
    console.log('[WARNING] Migration DOWN will revert changes and may cause data loss!');
    console.log('Are you sure you want to continue? (y/N)');

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', async (key) => {
        if (key.toString().toLowerCase() === 'y') {
            console.log('Proceeding with migration down...');
            try {
                await runMigration('down');
            } catch (error) {
                console.error('❌ Migration down failed:', error);
            }
            process.exit(0);
        } else {
            console.log('Cancelled.');
            process.exit(0);
        }
    });
} else {
    // Run migration up
    runMigration('up')
        .then(() => {
            console.log('Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

export default runMigration;