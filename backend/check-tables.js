#!/usr/bin/env node

/**
 * Script to check database tables
 */

import sequelize from './src/config/sequelize.js';

async function checkTables() {
    try {
        console.log('🔍 Checking database tables...');
        
        const [results] = await sequelize.query('SHOW TABLES');
        console.log('📋 Available tables:');
        results.forEach(row => {
            console.log(`   - ${Object.values(row)[0]}`);
        });
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error checking tables:', error);
        process.exit(1);
    }
}

// Run the script
checkTables();