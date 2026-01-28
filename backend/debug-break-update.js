/**
 * Debug Break Update Issue
 * Test the database update directly
 */

import { config } from 'dotenv';
import { AttendanceRecord } from './src/models/index.js';
import { getLocalDateString } from './src/utils/dateUtils.js';

config();

async function debugBreakUpdate() {
  try {
    console.log('🔍 Debug Break Update Issue');
    console.log('============================');

    const today = getLocalDateString();
    const employeeId = 3; // john@hrm.com

    // Step 1: Find the record
    console.log('\n📊 Step 1: Find attendance record...');
    const record = await AttendanceRecord.findOne({
      where: {
        employeeId: employeeId,
        date: today
      }
    });

    if (!record) {
      console.log('❌ No attendance record found');
      return;
    }

    console.log('✅ Found record:', {
      id: record.id,
      breakSessions: record.breakSessions,
      updatedAt: record.updatedAt
    });

    // Step 2: Check if there's an active break
    const activeBreak = record.breakSessions?.find(s => s.breakIn && !s.breakOut);
    if (!activeBreak) {
      console.log('❌ No active break found');
      return;
    }

    console.log('✅ Found active break:', activeBreak);

    // Step 3: Try to update the break sessions
    console.log('\n🔧 Step 3: Attempting to update break sessions...');
    
    const breakSessions = [...record.breakSessions];
    const activeBreakIndex = breakSessions.findIndex(s => s.breakIn && !s.breakOut);
    
    if (activeBreakIndex !== -1) {
      breakSessions[activeBreakIndex].breakOut = new Date();
      breakSessions[activeBreakIndex].duration = 25; // Test duration
      
      console.log('Updated break sessions:', breakSessions);
      
      // Try different update approaches
      console.log('\n🔧 Approach 1: Using update() method...');
      const updateResult1 = await record.update({
        breakSessions: breakSessions,
        updatedBy: 3
      });
      
      console.log('Update result 1:', {
        success: !!updateResult1,
        updatedAt: updateResult1.updatedAt,
        breakSessions: updateResult1.breakSessions
      });
      
      // Reload and check
      await record.reload();
      console.log('After reload:', {
        breakSessions: record.breakSessions,
        updatedAt: record.updatedAt
      });
      
      // Try approach 2: Direct assignment + save
      console.log('\n🔧 Approach 2: Direct assignment + save...');
      record.breakSessions = breakSessions;
      record.updatedBy = 3;
      record.changed('breakSessions', true); // Force Sequelize to recognize the change
      
      const saveResult = await record.save();
      console.log('Save result:', {
        success: !!saveResult,
        updatedAt: saveResult.updatedAt,
        breakSessions: saveResult.breakSessions
      });
      
      // Final verification
      console.log('\n📊 Final verification...');
      const finalRecord = await AttendanceRecord.findByPk(record.id);
      console.log('Final record:', {
        breakSessions: finalRecord.breakSessions,
        updatedAt: finalRecord.updatedAt
      });
      
      const stillActiveBreak = finalRecord.breakSessions?.find(s => s.breakIn && !s.breakOut);
      if (stillActiveBreak) {
        console.log('❌ Break is still active after update');
      } else {
        console.log('✅ Break successfully ended');
      }
    }

  } catch (error) {
    console.error('💥 Debug failed:', error);
  } finally {
    process.exit(0);
  }
}

debugBreakUpdate();