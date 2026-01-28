/**
 * Sequelize Save Test
 * Test the specific save operation that's failing
 */

import { config } from 'dotenv';
import { AttendanceRecord } from './src/models/sequelize/index.js';
import { getLocalDateString } from './src/utils/dateUtils.js';

// Load environment variables
config();

class SequelizeSaveTester {
  async testSaveOperation() {
    try {
      console.log('🔍 === SEQUELIZE SAVE TEST ===');
      
      const today = getLocalDateString();
      const employeeId = 3;
      
      // Step 1: Find the record
      console.log('\n📋 Step 1: Finding record...');
      const record = await AttendanceRecord.findOne({
        where: {
          employeeId: employeeId,
          date: today
        }
      });

      if (!record) {
        console.log('❌ No record found');
        return;
      }

      console.log('✅ Found record:');
      console.log(`   ID: ${record.id}`);
      console.log(`   Break Sessions (before): ${JSON.stringify(record.breakSessions)}`);

      // Step 2: Modify the breakSessions
      console.log('\n📋 Step 2: Modifying breakSessions...');
      const newBreakSession = {
        breakIn: new Date().toISOString(),
        breakOut: null,
        duration: 0
      };

      // Test different ways to set the value
      console.log('🔧 Testing direct assignment...');
      record.breakSessions = [newBreakSession];
      console.log(`   After assignment: ${JSON.stringify(record.breakSessions)}`);

      // Check if the field is marked as changed
      console.log(`   Is changed: ${record.changed('breakSessions')}`);
      console.log(`   Changed fields: ${JSON.stringify(record.changed())}`);

      // Step 3: Save with logging
      console.log('\n📋 Step 3: Saving with SQL logging...');
      
      // Enable SQL logging temporarily
      const originalLogging = AttendanceRecord.sequelize.options.logging;
      AttendanceRecord.sequelize.options.logging = console.log;

      try {
        const saveResult = await record.save();
        console.log('✅ Save completed');
        console.log(`   Updated at: ${saveResult.updatedAt}`);
      } catch (saveError) {
        console.log('❌ Save failed:', saveError.message);
      }

      // Restore original logging
      AttendanceRecord.sequelize.options.logging = originalLogging;

      // Step 4: Check the value after save
      console.log('\n📋 Step 4: Checking value after save...');
      console.log(`   Break Sessions (after save): ${JSON.stringify(record.breakSessions)}`);

      // Step 5: Reload and check
      console.log('\n📋 Step 5: Reloading record...');
      await record.reload();
      console.log(`   Break Sessions (after reload): ${JSON.stringify(record.breakSessions)}`);

      // Step 6: Test with setDataValue
      console.log('\n📋 Step 6: Testing with setDataValue...');
      record.setDataValue('breakSessions', [newBreakSession]);
      console.log(`   After setDataValue: ${JSON.stringify(record.breakSessions)}`);
      console.log(`   Is changed: ${record.changed('breakSessions')}`);

      await record.save();
      console.log('✅ Save with setDataValue completed');
      
      await record.reload();
      console.log(`   Break Sessions (after setDataValue save): ${JSON.stringify(record.breakSessions)}`);

      // Step 7: Test with update method
      console.log('\n📋 Step 7: Testing with update method...');
      const updateResult = await record.update({
        breakSessions: [newBreakSession]
      });
      
      console.log('✅ Update method completed');
      console.log(`   Break Sessions (after update): ${JSON.stringify(updateResult.breakSessions)}`);

    } catch (error) {
      console.error('💥 Test failed:', error);
    }
  }

  async run() {
    await this.testSaveOperation();
    process.exit(0);
  }
}

const tester = new SequelizeSaveTester();
tester.run();