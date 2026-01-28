/**
 * Break Transaction Test
 * Test the exact transaction flow from the startBreak method
 */

import { config } from 'dotenv';
import { AttendanceRecord, AuditLog } from './src/models/sequelize/index.js';
import { getLocalDateString } from './src/utils/dateUtils.js';
import AttendanceCalculationService from './src/services/core/attendanceCalculation.service.js';
import logger from './src/utils/logger.js';

// Load environment variables
config();

class BreakTransactionTester {
  async testTransactionFlow() {
    try {
      console.log('🔍 === BREAK TRANSACTION TEST ===');
      
      const today = getLocalDateString();
      const employeeId = 3;
      const user = { id: 3, employee: { id: 3 } };
      const metadata = { ipAddress: '127.0.0.1', userAgent: 'test' };

      // Step 1: Start transaction
      console.log('\n📋 Step 1: Starting transaction...');
      const transaction = await AttendanceRecord.sequelize.transaction();
      
      try {
        // Step 2: Find record
        console.log('\n📋 Step 2: Finding attendance record...');
        const attendanceRecord = await AttendanceRecord.findOne({
          where: {
            employeeId: employeeId,
            date: today
          },
          transaction
        });

        if (!attendanceRecord) {
          console.log('❌ No attendance record found');
          await transaction.rollback();
          return;
        }

        console.log('✅ Found attendance record:');
        console.log(`   ID: ${attendanceRecord.id}`);
        console.log(`   Break Sessions (before): ${JSON.stringify(attendanceRecord.breakSessions)}`);

        // Step 3: Check canStartBreak
        console.log('\n📋 Step 3: Checking canStartBreak...');
        const canStart = attendanceRecord.canStartBreak();
        console.log(`   Can start: ${canStart.allowed}`);
        console.log(`   Reason: ${canStart.reason || 'None'}`);

        if (!canStart.allowed) {
          console.log('❌ Cannot start break');
          await transaction.rollback();
          return;
        }

        // Step 4: Add break session
        console.log('\n📋 Step 4: Adding break session...');
        const breakInTime = new Date();
        let breakSessions = AttendanceCalculationService.normalizeBreakSessions(attendanceRecord.breakSessions);

        console.log(`   Normalized break sessions: ${JSON.stringify(breakSessions)}`);

        const newBreakSession = {
          breakIn: breakInTime,
          breakOut: null,
          duration: 0
        };
        
        breakSessions.push(newBreakSession);
        console.log(`   Updated break sessions: ${JSON.stringify(breakSessions)}`);

        // Step 5: Save the record
        console.log('\n📋 Step 5: Saving attendance record...');
        attendanceRecord.breakSessions = breakSessions;
        attendanceRecord.updatedBy = user.id;
        
        console.log(`   Is changed: ${attendanceRecord.changed('breakSessions')}`);
        
        await attendanceRecord.save({ transaction });
        console.log('✅ Attendance record saved');

        // Step 6: Test AuditLog (this might be the issue)
        console.log('\n📋 Step 6: Testing AuditLog...');
        try {
          await AuditLog.logAction({
            userId: user.id,
            action: 'attendance_break_in',
            module: 'attendance',
            targetType: 'AttendanceRecord',
            targetId: attendanceRecord.id,
            description: `Started break at ${breakInTime.toLocaleTimeString()}`,
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
            severity: 'low'
          });
          console.log('✅ AuditLog created successfully');
        } catch (auditError) {
          console.log('❌ AuditLog failed:', auditError.message);
          console.log('   This might be causing the transaction rollback!');
          throw auditError;
        }

        // Step 7: Commit transaction
        console.log('\n📋 Step 7: Committing transaction...');
        await transaction.commit();
        console.log('✅ Transaction committed');

        // Step 8: Verify the data persisted
        console.log('\n📋 Step 8: Verifying data persistence...');
        const verifyRecord = await AttendanceRecord.findOne({
          where: {
            employeeId: employeeId,
            date: today
          }
        });

        console.log('📊 Verification result:');
        console.log(`   Break Sessions: ${JSON.stringify(verifyRecord.breakSessions)}`);
        console.log(`   Break Sessions Length: ${verifyRecord.breakSessions?.length}`);

        if (verifyRecord.breakSessions?.length > 0) {
          console.log('✅ Break session persisted successfully!');
        } else {
          console.log('❌ Break session was not persisted!');
        }

      } catch (error) {
        console.log('\n💥 Error in transaction:', error.message);
        console.log('   Rolling back transaction...');
        await transaction.rollback();
        throw error;
      }

    } catch (error) {
      console.error('💥 Test failed:', error);
    }
  }

  async run() {
    await this.testTransactionFlow();
    process.exit(0);
  }
}

const tester = new BreakTransactionTester();
tester.run();