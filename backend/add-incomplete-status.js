#!/usr/bin/env node

/**
 * Script to add 'incomplete' status to AttendanceRecord enum
 */

import sequelize from './src/config/sequelize.js';

async function addIncompleteStatus() {
    try {
        console.log('🔄 Adding "incomplete" status to AttendanceRecord enum...');
        
        const dialect = sequelize.getDialect();
        console.log(`📊 Database dialect: ${dialect}`);
        
        if (dialect === 'mysql') {
            // For MySQL, modify the enum directly
            await sequelize.query(`
                ALTER TABLE attendance_records 
                MODIFY COLUMN status ENUM('present', 'absent', 'leave', 'half_day', 'holiday', 'incomplete', 'pending_correction') 
                DEFAULT 'present';
            `);
            console.log('✅ Successfully added "incomplete" status to MySQL enum');
        } else if (dialect === 'postgres') {
            // For PostgreSQL, add value to enum type
            await sequelize.query(`
                ALTER TYPE "enum_AttendanceRecords_status" 
                ADD VALUE IF NOT EXISTS 'incomplete';
            `);
            console.log('✅ Successfully added "incomplete" status to PostgreSQL enum');
        } else {
            console.log(`[WARNING] Unsupported database dialect: ${dialect}`);
        }
        
        console.log('🎉 Migration completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error adding incomplete status:', error);
        process.exit(1);
    }
}

// Run the script
addIncompleteStatus();