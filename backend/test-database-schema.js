/**
 * Database Schema Test
 * Check the actual database table structure
 */

import { config } from 'dotenv';
import { AttendanceRecord } from './src/models/sequelize/index.js';

// Load environment variables
config();

class DatabaseSchemaTester {
  async testTableStructure() {
    try {
      console.log('🔍 === DATABASE SCHEMA TEST ===');
      
      // Get table description
      const [results] = await AttendanceRecord.sequelize.query(
        'DESCRIBE attendance_records'
      );

      console.log('📊 Table Structure:');
      results.forEach(column => {
        console.log(`   ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });

      // Check if breakSessions column exists
      const breakSessionsColumn = results.find(col => col.Field === 'breakSessions');
      
      if (breakSessionsColumn) {
        console.log('\n✅ breakSessions column exists:');
        console.log(`   Type: ${breakSessionsColumn.Type}`);
        console.log(`   Null: ${breakSessionsColumn.Null}`);
        console.log(`   Default: ${breakSessionsColumn.Default}`);
      } else {
        console.log('\n❌ breakSessions column does NOT exist!');
      }

      // Test a simple update
      console.log('\n🔧 Testing direct SQL update...');
      const testData = JSON.stringify([{
        breakIn: new Date().toISOString(),
        breakOut: null,
        duration: 0
      }]);

      const [updateResult] = await AttendanceRecord.sequelize.query(
        'UPDATE attendance_records SET breakSessions = ? WHERE employeeId = 3 AND date = "2026-01-27"',
        {
          replacements: [testData]
        }
      );

      console.log(`✅ Update result: ${updateResult.affectedRows} rows affected`);

      // Verify the update
      const [selectResult] = await AttendanceRecord.sequelize.query(
        'SELECT id, employeeId, date, breakSessions FROM attendance_records WHERE employeeId = 3 AND date = "2026-01-27"'
      );

      console.log('\n📊 After direct SQL update:');
      selectResult.forEach(row => {
        console.log(`   ID: ${row.id}`);
        console.log(`   Employee ID: ${row.employeeId}`);
        console.log(`   Date: ${row.date}`);
        console.log(`   Break Sessions: ${row.breakSessions}`);
        console.log(`   Break Sessions Type: ${typeof row.breakSessions}`);
      });

    } catch (error) {
      console.error('💥 Test failed:', error.message);
    }
  }

  async run() {
    await this.testTableStructure();
    process.exit(0);
  }
}

const tester = new DatabaseSchemaTester();
tester.run();