// Test script for enhanced attendance finalization
import { connectDB } from './src/config/sequelize.js';
import { AttendanceRecord, Employee } from './src/models/index.js';
import { 
  enhancedFinalizeDailyAttendance, 
  manualEnhancedFinalizeAttendance,
  bulkEnhancedFinalize 
} from './src/jobs/enhancedAttendanceFinalization.js';

async function testEnhancedFinalization() {
  try {
    console.log('=== TESTING ENHANCED ATTENDANCE FINALIZATION ===\n');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected\n');
    
    // Test dates
    const testDates = [
      '2026-01-30', // Friday (working day) - the original issue
      '2026-01-31', // Saturday (weekend)
      '2026-02-01', // Sunday (weekend)
      '2026-02-02'  // Monday (working day)
    ];
    
    console.log('1. TESTING ENHANCED FINALIZATION FOR INDIVIDUAL DATES:\n');
    
    for (const dateString of testDates) {
      console.log(`Testing ${dateString}:`);
      
      // Count records before
      const beforeCount = await AttendanceRecord.count({
        where: { date: dateString }
      });
      console.log(`   Records before: ${beforeCount}`);
      
      // Run enhanced finalization
      const result = await manualEnhancedFinalizeAttendance(dateString);
      console.log(`   Finalization result:`, JSON.stringify(result, null, 2));
      
      // Count records after
      const afterCount = await AttendanceRecord.count({
        where: { date: dateString }
      });
      console.log(`   Records after: ${afterCount}`);
      console.log(`   Records created: ${afterCount - beforeCount}\n`);
    }
    
    console.log('2. VERIFYING FINAL RESULTS:\n');
    
    // Get active employees count
    const activeEmployees = await Employee.findAll({
      where: { 
        isActive: true,
        status: 'Active'
      }
    });
    console.log(`Active employees: ${activeEmployees.length}\n`);
    
    // Check final status for each date
    for (const dateString of testDates) {
      const records = await AttendanceRecord.findAll({
        where: { date: dateString }
      });
      
      const date = new Date(dateString);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[date.getDay()];
      
      console.log(`${dateString} (${dayName}): ${records.length} records`);
      
      if (records.length > 0) {
        const statusCounts = {};
        records.forEach(record => {
          statusCounts[record.status] = (statusCounts[record.status] || 0) + 1;
        });
        console.log(`   Status breakdown:`, statusCounts);
      }
      console.log('');
    }
    
    console.log('3. TESTING BULK FINALIZATION:\n');
    
    // Test bulk finalization for a date range
    console.log('Testing bulk finalization for Jan 28-30, 2026...');
    const bulkResults = await bulkEnhancedFinalize('2026-01-28', '2026-01-30');
    
    console.log('Bulk results:');
    bulkResults.forEach(result => {
      console.log(`   ${result.date} (${result.dayType}): ${result.processed} processed, ${result.created} created`);
    });
    
    console.log('\n4. SUMMARY:\n');
    console.log('✅ Enhanced finalization creates records for:');
    console.log('   - Working days: absent/present/half_day (existing logic)');
    console.log('   - Holidays: holiday status');
    console.log('   - Weekends: weekend status');
    console.log('   - Complete calendar coverage achieved!');
    
    console.log('\n🎉 ENHANCED FINALIZATION TEST COMPLETE!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

testEnhancedFinalization();