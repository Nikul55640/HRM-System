/**
 * Direct Database Break Test
 * Tests break functionality directly at the database level
 */

import { config } from 'dotenv';
import { AttendanceRecord, Shift } from './src/models/sequelize/index.js';
import { getLocalDateString } from './src/utils/dateUtils.js';

// Load environment variables
config();

class BreakDatabaseTester {
  async testBreakSessions() {
    try {
      console.log('🔍 === DIRECT DATABASE BREAK TEST ===');
      
      const today = getLocalDateString();
      const employeeId = 3; // John's employee ID
      
      console.log(`📅 Testing for date: ${today}, Employee ID: ${employeeId}`);
      
      // Step 1: Find the attendance record
      console.log('\n📋 Step 1: Finding attendance record...');
      const record = await AttendanceRecord.findOne({
        where: {
          employeeId: employeeId,
          date: today
        },
        include: [
          {
            model: Shift,
            as: 'shift',
            attributes: ['shiftName', 'shiftStartTime', 'shiftEndTime', 'gracePeriodMinutes']
          }
        ]
      });

      if (!record) {
        console.log('❌ No attendance record found');
        return;
      }

      console.log('✅ Found attendance record:');
      console.log(`   ID: ${record.id}`);
      console.log(`   Clock In: ${record.clockIn}`);
      console.log(`   Clock Out: ${record.clockOut}`);
      console.log(`   Break Sessions (raw): ${JSON.stringify(record.breakSessions)}`);
      console.log(`   Break Sessions (type): ${typeof record.breakSessions}`);
      console.log(`   Break Sessions (length): ${record.breakSessions?.length}`);

      // Step 2: Test canStartBreak
      console.log('\n📋 Step 2: Testing canStartBreak...');
      const canStart = record.canStartBreak();
      console.log(`   Can start break: ${canStart.allowed}`);
      console.log(`   Reason: ${canStart.reason || 'None'}`);

      if (!canStart.allowed) {
        console.log('❌ Cannot start break, stopping test');
        return;
      }

      // Step 3: Add a break session manually
      console.log('\n📋 Step 3: Adding break session manually...');
      const breakInTime = new Date();
      let breakSessions = record.breakSessions || [];
      
      console.log(`   Current break sessions: ${JSON.stringify(breakSessions)}`);
      
      const newBreakSession = {
        breakIn: breakInTime,
        breakOut: null,
        duration: 0
      };
      
      breakSessions.push(newBreakSession);
      
      console.log(`   New break sessions: ${JSON.stringify(breakSessions)}`);
      
      // Step 4: Save the record
      console.log('\n📋 Step 4: Saving record...');
      record.breakSessions = breakSessions;
      await record.save();
      
      console.log('✅ Record saved');

      // Step 5: Reload and verify
      console.log('\n📋 Step 5: Reloading record to verify...');
      await record.reload();
      
      console.log('✅ Record reloaded:');
      console.log(`   Break Sessions (after reload): ${JSON.stringify(record.breakSessions)}`);
      console.log(`   Break Sessions (length): ${record.breakSessions?.length}`);

      // Step 6: Test canEndBreak
      console.log('\n📋 Step 6: Testing canEndBreak...');
      const canEnd = record.canEndBreak();
      console.log(`   Can end break: ${canEnd.allowed}`);
      console.log(`   Reason: ${canEnd.reason || 'None'}`);

      // Step 7: Find active break session
      console.log('\n📋 Step 7: Finding active break session...');
      const activeBreak = record.getCurrentBreakSession();
      console.log(`   Active break: ${JSON.stringify(activeBreak)}`);

      // Step 8: Test with fresh query
      console.log('\n📋 Step 8: Fresh query from database...');
      const freshRecord = await AttendanceRecord.findOne({
        where: {
          employeeId: employeeId,
          date: today
        }
      });

      console.log('✅ Fresh record from database:');
      console.log(`   Break Sessions: ${JSON.stringify(freshRecord.breakSessions)}`);
      console.log(`   Break Sessions (length): ${freshRecord.breakSessions?.length}`);

      // Step 9: Raw SQL query
      console.log('\n📋 Step 9: Raw SQL query...');
      const [results] = await AttendanceRecord.sequelize.query(
        'SELECT id, employeeId, date, breakSessions FROM AttendanceRecords WHERE employeeId = ? AND date = ?',
        {
          replacements: [employeeId, today]
        }
      );

      console.log('✅ Raw SQL results:');
      console.log(JSON.stringify(results, null, 2));

    } catch (error) {
      console.error('💥 Test failed:', error);
    }
  }

  async run() {
    await this.testBreakSessions();
    process.exit(0);
  }
}

const tester = new BreakDatabaseTester();
tester.run();