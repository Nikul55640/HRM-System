#!/usr/bin/env node

/**
 * One-time fix for critical attendance bug
 * 
 * Problem: Records with clock-in + clock-out were marked as 'absent'
 * Solution: Change them to 'half_day' (correct HR standard)
 * 
 * Run once: node scripts/fix-absent-with-clockin-bug.js
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

import sequelize from '../src/config/sequelize.js';
import AttendanceRecord from '../src/models/sequelize/AttendanceRecord.js';

async function fixAbsentWithClockInBug() {
  try {
    console.log('🔧 Starting fix for absent-with-clock-in bug...');
    
    // Find all records that are incorrectly marked as absent but have clock-in data
    const buggyRecords = await AttendanceRecord.findAll({
      where: {
        clockIn: { [sequelize.Sequelize.Op.not]: null },
        clockOut: { [sequelize.Sequelize.Op.not]: null },
        status: 'absent'
      },
      raw: true
    });

    console.log(`📊 Found ${buggyRecords.length} records with the bug`);

    if (buggyRecords.length === 0) {
      console.log('✅ No buggy records found. System is clean!');
      return;
    }

    // Show sample of what will be fixed
    console.log('\n📋 Sample records to be fixed:');
    buggyRecords.slice(0, 5).forEach(record => {
      console.log(`   ID ${record.id}: ${record.date} - ${record.statusReason}`);
    });

    // Fix the records
    const [updatedCount] = await AttendanceRecord.update(
      {
        status: 'half_day',
        statusReason: sequelize.Sequelize.fn(
          'CONCAT', 
          'Auto-fixed: ', 
          sequelize.Sequelize.col('statusReason')
        )
      },
      {
        where: {
          clockIn: { [sequelize.Sequelize.Op.not]: null },
          clockOut: { [sequelize.Sequelize.Op.not]: null },
          status: 'absent'
        }
      }
    );

    console.log(`\n✅ Successfully fixed ${updatedCount} records`);
    console.log('🎯 All records with clock-in data are now correctly marked as half_day');
    
    // Verify the fix
    const remainingBuggyRecords = await AttendanceRecord.count({
      where: {
        clockIn: { [sequelize.Sequelize.Op.not]: null },
        status: 'absent'
      }
    });

    if (remainingBuggyRecords === 0) {
      console.log('🔐 Verification passed: No more absent records with clock-in data');
    } else {
      console.log(`⚠️  Warning: ${remainingBuggyRecords} records still have the issue`);
    }

  } catch (error) {
    console.error('❌ Error fixing attendance bug:', error);
    throw error;
  }
}

async function main() {
  try {
    await sequelize.authenticate();
    console.log('📡 Database connected successfully');
    
    await fixAbsentWithClockInBug();
    
    console.log('\n🎉 Fix completed successfully!');
    console.log('📝 Summary: Absent records with clock-in data are now half_day');
    
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('📡 Database connection closed');
  }
}

// Run the script
main();