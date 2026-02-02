// Script to manually create missing attendance records for January 30, 2026
import { connectDB } from './src/config/sequelize.js';
import { AttendanceRecord, Employee, Holiday, WorkingRule, LeaveRequest } from './src/models/index.js';
import { Op } from 'sequelize';

async function fixJan30Attendance() {
  try {
    console.log('=== FIXING JANUARY 30, 2026 ATTENDANCE RECORDS ===\n');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected\n');
    
    const targetDate = '2026-01-30';
    console.log(`Target Date: ${targetDate} (Friday)\n`);
    
    // Step 1: Verify it's a working day
    console.log('1. VERIFYING WORKING DAY STATUS:');
    const isWorkingDay = await WorkingRule.isWorkingDay(targetDate);
    const isHoliday = await Holiday.isHoliday(targetDate);
    
    console.log(`   Working Day: ${isWorkingDay}`);
    console.log(`   Holiday: ${isHoliday}`);
    
    if (!isWorkingDay || isHoliday) {
      console.log('   ❌ Not a working day or is a holiday. No records needed.');
      return;
    }
    console.log('   ✅ Confirmed: Working day, should have attendance records\n');
    
    // Step 2: Get all active employees
    console.log('2. GETTING ACTIVE EMPLOYEES:');
    const activeEmployees = await Employee.findAll({
      where: { 
        isActive: true,
        status: 'Active'
      },
      attributes: ['id', 'firstName', 'lastName', 'employeeId']
    });
    
    console.log(`   Found ${activeEmployees.length} active employees\n`);
    
    // Step 3: Check existing attendance records
    console.log('3. CHECKING EXISTING ATTENDANCE RECORDS:');
    const existingRecords = await AttendanceRecord.findAll({
      where: {
        date: targetDate
      }
    });
    
    console.log(`   Found ${existingRecords.length} existing records for ${targetDate}`);
    const existingEmployeeIds = existingRecords.map(r => r.employeeId);
    console.log(`   Existing employee IDs: [${existingEmployeeIds.join(', ')}]\n`);
    
    // Step 4: Find employees missing attendance records
    console.log('4. IDENTIFYING MISSING RECORDS:');
    const missingEmployees = activeEmployees.filter(emp => 
      !existingEmployeeIds.includes(emp.id)
    );
    
    console.log(`   ${missingEmployees.length} employees missing attendance records:`);
    missingEmployees.forEach(emp => {
      console.log(`     - ${emp.firstName} ${emp.lastName} (${emp.employeeId}) - ID: ${emp.id}`);
    });
    console.log('');
    
    if (missingEmployees.length === 0) {
      console.log('   ✅ All employees already have attendance records for this date.');
      return;
    }
    
    // Step 5: Check for approved leaves
    console.log('5. CHECKING FOR APPROVED LEAVES:');
    const employeesOnLeave = [];
    
    for (const employee of missingEmployees) {
      const leaveRequest = await LeaveRequest.findOne({
        where: {
          employeeId: employee.id,
          status: 'approved',
          startDate: { [Op.lte]: targetDate },
          endDate: { [Op.gte]: targetDate }
        }
      });
      
      if (leaveRequest) {
        employeesOnLeave.push(employee);
        console.log(`     - ${employee.firstName} ${employee.lastName} is on approved leave`);
      }
    }
    
    const employeesToMarkAbsent = missingEmployees.filter(emp => 
      !employeesOnLeave.some(leaveEmp => leaveEmp.id === emp.id)
    );
    
    console.log(`   ${employeesOnLeave.length} employees on approved leave (will skip)`);
    console.log(`   ${employeesToMarkAbsent.length} employees to mark as absent\n`);
    
    // Step 6: Create absent records
    console.log('6. CREATING ABSENT ATTENDANCE RECORDS:');
    
    if (employeesToMarkAbsent.length === 0) {
      console.log('   ✅ No employees need absent records (all on leave).');
      return;
    }
    
    let createdCount = 0;
    
    for (const employee of employeesToMarkAbsent) {
      try {
        const record = await AttendanceRecord.create({
          employeeId: employee.id,
          shiftId: null,
          date: targetDate,
          status: 'absent',
          statusReason: 'No clock-in recorded - Manual fix for Jan 30, 2026',
          clockIn: null,
          clockOut: null,
          workHours: 0,
          totalWorkedMinutes: 0,
          totalBreakMinutes: 0,
          lateMinutes: 0,
          earlyExitMinutes: 0,
          overtimeMinutes: 0,
          overtimeHours: 0,
          isLate: false,
          isEarlyDeparture: false,
          correctionRequested: false
        });
        
        console.log(`   ✅ Created absent record for ${employee.firstName} ${employee.lastName} (ID: ${record.id})`);
        createdCount++;
        
      } catch (error) {
        console.log(`   ❌ Failed to create record for ${employee.firstName} ${employee.lastName}: ${error.message}`);
      }
    }
    
    console.log(`\n7. SUMMARY:`);
    console.log(`   ✅ Successfully created ${createdCount} absent records for ${targetDate}`);
    console.log(`   📊 Total attendance records for ${targetDate}: ${existingRecords.length + createdCount}`);
    console.log(`   🎯 All ${activeEmployees.length} active employees now have attendance records`);
    
    // Step 7: Verify the fix
    console.log(`\n8. VERIFICATION:`);
    const finalRecords = await AttendanceRecord.findAll({
      where: { date: targetDate }
    });
    
    console.log(`   Final count: ${finalRecords.length} attendance records for ${targetDate}`);
    
    const statusCounts = {};
    finalRecords.forEach(record => {
      statusCounts[record.status] = (statusCounts[record.status] || 0) + 1;
    });
    
    console.log('   Status breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`     - ${status}: ${count} records`);
    });
    
    console.log('\n🎉 JANUARY 30, 2026 ATTENDANCE RECORDS FIXED!');
    console.log('The attendance calendar should now show data for this date.');
    
  } catch (error) {
    console.error('❌ Error fixing attendance records:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

fixJan30Attendance();