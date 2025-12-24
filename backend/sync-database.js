/**
 * Database Sync Script for Restructured HRM System
 * Date: 2024-12-24
 * 
 * This script syncs the database with the new model structure and runs the seed data
 */

import { sequelize } from './src/models/sequelize/index.js';
import quickSeed from './seeds/quick-seed.js';

const syncDatabase = async () => {
    try {
        console.log('🔄 Starting database synchronization...');

        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // Sync all models
        console.log('🔄 Synchronizing models with database...');
        await sequelize.sync({
            force: false, // Set to true only if you want to drop and recreate all tables
            alter: true   // This will alter existing tables to match models
        });
        console.log('✅ Database synchronized successfully.');

        // Run seed data
        console.log('🌱 Running seed data...');
        await quickSeed();
        console.log('✅ Seed data completed successfully.');

        console.log('\n🎉 Database setup completed successfully!');
        console.log('\n📋 What was created:');
        console.log('• Updated all model structures');
        console.log('• Created AuditLog and SystemPolicy tables');
        console.log('• Added default system policies');
        console.log('• Created sample users (SuperAdmin, HR, Employee)');
        console.log('• Set up departments and shifts');
        console.log('• Assigned leave balances');
        console.log('• Added sample holidays');

        console.log('\n🔐 Default Login Credentials:');
        console.log('SuperAdmin: admin@hrm.com / admin123');
        console.log('HR Manager: hr@hrm.com / hr123');
        console.log('Employee: john@hrm.com / john123');

        console.log('\n⚠️  Security Notes:');
        console.log('• Change default passwords immediately');
        console.log('• Review and adjust system policies as needed');
        console.log('• Configure proper environment variables');
        console.log('• Set up proper backup procedures');

    } catch (error) {
        console.error('❌ Database sync failed:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
};

// Handle command line arguments
const args = process.argv.slice(2);
const forceSync = args.includes('--force');
const skipSeed = args.includes('--skip-seed');

if (forceSync) {
    console.log('⚠️  WARNING: Force sync will drop and recreate all tables!');
    console.log('This will delete all existing data. Continue? (y/N)');

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', async (key) => {
        if (key.toString().toLowerCase() === 'y') {
            console.log('Proceeding with force sync...');
            try {
                await sequelize.sync({ force: true });
                if (!skipSeed) {
                    await quickSeed();
                }
                console.log('✅ Force sync completed');
            } catch (error) {
                console.error('❌ Force sync failed:', error);
            }
            process.exit(0);
        } else {
            console.log('Cancelled.');
            process.exit(0);
        }
    });
} else {
    // Run normal sync
    syncDatabase()
        .then(() => {
            console.log('Database sync completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Database sync failed:', error);
            process.exit(1);
        });
}

export default syncDatabase;