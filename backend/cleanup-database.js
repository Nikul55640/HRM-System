/**
 * Database Cleanup Script
 * This script removes all old tables to allow fresh setup
 */

import { sequelize } from './src/models/sequelize/index.js';

const cleanupDatabase = async () => {
    try {
        console.log('🧹 Starting database cleanup...');

        // Disable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // List of all tables to drop (old and new)
        const tablesToDrop = [
            'employee_profiles',
            'leave_types',
            'lead_activities',
            'lead_notes',
            'notifications',
            'configs',
            'audit_logs',
            'system_policies',
            'employee_shifts',
            'leave_balances',
            'leave_requests',
            'attendance_records',
            'leads',
            'company_events',
            'holidays',
            'shifts',
            'users',
            'employees',
            'departments'
        ];

        // Drop each table
        for (const table of tablesToDrop) {
            try {
                await sequelize.query(`DROP TABLE IF EXISTS \`${table}\``);
                console.log(`✅ Dropped table: ${table}`);
            } catch (error) {
                console.log(`[WARNING] Table ${table} may not exist: ${error.message}`);
            }
        }

        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('🎉 Database cleanup completed successfully!');
        console.log('Now run: npm run db:sync');

    } catch (error) {
        console.error('❌ Database cleanup failed:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
};

cleanupDatabase()
    .then(() => {
        console.log('Cleanup completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Cleanup failed:', error);
        process.exit(1);
    });