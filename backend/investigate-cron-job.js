// Investigation script for attendance finalization cron job
import { connectDB } from './src/config/sequelize.js';
import { AttendanceRecord, Employee, Holiday, WorkingRule } from './src/models/index.js';
import { finalizeDailyAttendance, manualFinalizeAttendance } from './src/jobs/attendanceFinalization.js';
import { getLocalDateString } from './src/utils/dateUtils.js';

async function investigateCronJob() {
  try {
    console.log('=== INVESTIGATING ATTENDANCE FINALIZATION CRON JOB ===\n');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected\n');
    
    // Test dates
    const testDates = [
      '2026-01-30', // Friday (working day)
      '2026-01-31', // Saturday (weekend)
      '2026-02-01', // Sunday (weekend)
      '2026-02-02'  // Monday (today - working day)
    ];
    
    console.log('1. CURRENT CRON JOB BEHAVIOR ANALYSIS:');
    console.log('   Current logic: SKIPS holidays and weekends entirely');
    console.log('   Issue: No records created for holidays/weekends\n');
    
    // Test each date
    for (const dateString of testDates) {
      const date = new Date(dateString);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[date.getDay()];
      
      console.log(`2. TESTING DATE: ${dateString} (${dayName})`);
      
      // Check day type
      const isHoliday = await Holiday.isHoliday(dateString);
      const isWorkingDay = await WorkingRule.isWorkingDay(dateString);
      const isWeekend = !isWorkingDay && !isHoliday;
      
      console.log(`   Day Type: ${isHoliday ? 'HOLIDAY' : isWeekend ? 'WEEKEND' : 'WORKING_DAY'}`);
      console.log(`   Working Day: ${isWorkingDay}, Holiday: ${isHoliday}`);
      
      // Check existing records
      const existingRecords = await AttendanceRecord.findAll({
        where: { date: dateString }
      });
      
      console.log(`   Existing Records: ${existingRecords.length}`);
      
      if (existingRecords.length > 0) {
        const statusCounts = {};
        existingRecords.forEach(record => {
          statusCounts[record.status] = (statusCounts[record.status] || 0) + 1;
        });
        console.log('   Status Breakdown:', statusCounts);
      }
      
      // Test current job logic
      console.log('   Current Job Result:');
      try {
        const result = await manualFinalizeAttendance(dateString);
        console.log(`     ${JSON.stringify(result)}`);
      } catch (error) {
        console.log(`     Error: ${error.message}`);
      }
      
      console.log('');
    }
    
    console.log('3. ACTIVE EMPLOYEES COUNT:');
    const activeEmployees = await Employee.findAll({
      where: { 
        isActive: true,
        status: 'Active'
      }
    });
    console.log(`   Found ${activeEmployees.length} active employees\n`);
    
    console.log('4. CRON JOB SCHEDULE ANALYSIS:');
    console.log('   Current Schedule: */15 * * * * (every 15 minutes)');
    console.log('   Location: backend/src/jobs/attendanceFinalization.js');
    console.log('   Initialization: backend/src/server.js (line 24-27)');
    console.log('   Status: Should be running if server is started\n');
    
    console.log('5. ISSUES IDENTIFIED:');
    console.log('   ❌ Job SKIPS holidays and weekends (no records created)');
    console.log('   ❌ Frontend calendar shows empty for holidays/weekends');
    console.log('   ❌ No "holiday" or "weekend" status records in database');
    console.log('   ❌ January 30, 2026 missing because job may not be running\n');
    
    console.log('6. REQUIRED CHANGES:');
    console.log('   ✅ Modify job to CREATE records for holidays and weekends');
    console.log('   ✅ Add "holiday" and "weekend" status creation logic');
    console.log('   ✅ Ensure job runs for ALL dates, not just working days');
    console.log('   ✅ Fix January 30, 2026 missing records issue\n');
    
    console.log('=== INVESTIGATION COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Investigation failed:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

investigateCronJob();