#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

import sequelize from '../src/config/sequelize.js';
import AttendanceRecord from '../src/models/sequelize/AttendanceRecord.js';

async function verifyFix() {
  try {
    await sequelize.authenticate();
    
    // Check the specific record that was problematic
    const record = await AttendanceRecord.findByPk(29);
    
    if (record) {
      console.log('✅ Record 29 after fix:');
      console.log(`   ID: ${record.id}`);
      console.log(`   Date: ${record.date}`);
      console.log(`   Status: ${record.status}`);
      console.log(`   Status Reason: ${record.statusReason}`);
      console.log(`   Work Hours: ${record.workHours}`);
      console.log(`   Half Day Type: ${record.halfDayType}`);
    } else {
      console.log('❌ Record 29 not found');
    }
    
    // Check if any records still have the bug
    const buggyRecords = await AttendanceRecord.count({
      where: {
        clockIn: { [sequelize.Sequelize.Op.not]: null },
        status: 'absent'
      }
    });
    
    console.log(`\n🔍 Remaining buggy records: ${buggyRecords}`);
    
    if (buggyRecords === 0) {
      console.log('🎉 All good! No more absent records with clock-in data.');
    } else {
      console.log('⚠️  Still have issues that need attention.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

verifyFix();