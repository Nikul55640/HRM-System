/**
 * Test script to add sample calendar data for February 2026
 * This will help verify that the Employee Calendar shows all employees' data
 */

import { 
  LeaveRequest, 
  Holiday, 
  Employee, 
  User,
  CompanyEvent 
} from './src/models/sequelize/index.js';

const addTestCalendarData = async () => {
  try {
    console.log('🗓️ Adding test calendar data for February 2026...');

    // Get existing employees
    const employees = await Employee.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['email']
      }]
    });

    console.log(`Found ${employees.length} employees:`, employees.map(e => `${e.firstName} ${e.lastName} (${e.user?.email})`));

    // Add some holidays for February 2026
    const holidays = [
      {
        name: "Presidents' Day",
        date: new Date('2026-02-16'),
        type: 'ONE_TIME',
        category: 'national',
        color: '#EF4444',
        description: 'Federal Holiday - Presidents Day'
      },
      {
        name: "Valentine's Day",
        date: new Date('2026-02-14'),
        type: 'ONE_TIME',
        category: 'cultural',
        color: '#EC4899',
        description: 'Valentine\'s Day celebration'
      }
    ];

    for (const holiday of holidays) {
      const [holidayRecord, created] = await Holiday.findOrCreate({
        where: { name: holiday.name, date: holiday.date },
        defaults: holiday
      });
      
      if (created) {
        console.log(`✅ Added holiday: ${holiday.name} on ${holiday.date.toDateString()}`);
      } else {
        console.log(`ℹ️ Holiday already exists: ${holiday.name}`);
      }
    }

    // Add some leave requests for February 2026
    if (employees.length >= 2) {
      const leaveRequests = [
        {
          employeeId: employees[0].id,
          leaveType: 'Annual Leave',
          startDate: new Date('2026-02-10'),
          endDate: new Date('2026-02-12'),
          duration: 'Full Day',
          reason: 'Family vacation',
          status: 'approved',
          appliedDate: new Date('2026-01-15'),
          approvedBy: employees[1].id,
          approvedDate: new Date('2026-01-20')
        },
        {
          employeeId: employees[1].id,
          leaveType: 'Sick Leave',
          startDate: new Date('2026-02-05'),
          endDate: new Date('2026-02-05'),
          duration: 'Full Day',
          reason: 'Medical appointment',
          status: 'approved',
          appliedDate: new Date('2026-02-01'),
          approvedBy: employees[0].id,
          approvedDate: new Date('2026-02-02')
        }
      ];

      // Add more leave requests if we have more employees
      if (employees.length > 2) {
        leaveRequests.push({
          employeeId: employees[2].id,
          leaveType: 'Personal Leave',
          startDate: new Date('2026-02-20'),
          endDate: new Date('2026-02-21'),
          duration: 'Full Day',
          reason: 'Personal matters',
          status: 'approved',
          appliedDate: new Date('2026-02-10'),
          approvedBy: employees[0].id,
          approvedDate: new Date('2026-02-12')
        });
      }

      for (const leave of leaveRequests) {
        const [leaveRecord, created] = await LeaveRequest.findOrCreate({
          where: { 
            employeeId: leave.employeeId,
            startDate: leave.startDate,
            endDate: leave.endDate
          },
          defaults: leave
        });
        
        if (created) {
          const employee = employees.find(e => e.id === leave.employeeId);
          console.log(`✅ Added leave: ${employee.firstName} ${employee.lastName} - ${leave.leaveType} (${leave.startDate.toDateString()} to ${leave.endDate.toDateString()})`);
        } else {
          console.log(`ℹ️ Leave already exists for employee ${leave.employeeId}`);
        }
      }
    }

    // Add some company events
    const companyEvents = [
      {
        title: 'Team Building Event',
        description: 'Monthly team building activity',
        eventType: 'team_building',
        startDate: new Date('2026-02-28'),
        endDate: new Date('2026-02-28'),
        status: 'scheduled',
        color: '#3B82F6'
      },
      {
        title: 'All Hands Meeting',
        description: 'Quarterly all hands meeting',
        eventType: 'meeting',
        startDate: new Date('2026-02-25'),
        endDate: new Date('2026-02-25'),
        status: 'scheduled',
        color: '#8B5CF6'
      }
    ];

    for (const event of companyEvents) {
      const [eventRecord, created] = await CompanyEvent.findOrCreate({
        where: { title: event.title, startDate: event.startDate },
        defaults: event
      });
      
      if (created) {
        console.log(`✅ Added company event: ${event.title} on ${event.startDate.toDateString()}`);
      } else {
        console.log(`ℹ️ Company event already exists: ${event.title}`);
      }
    }

    console.log('🎉 Test calendar data added successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Holidays: ${holidays.length}`);
    console.log(`- Leave requests: ${employees.length >= 2 ? (employees.length > 2 ? 3 : 2) : 0}`);
    console.log(`- Company events: ${companyEvents.length}`);
    console.log('\n🔍 Now test the Employee Calendar to see all employees\' data!');

  } catch (error) {
    console.error('❌ Error adding test calendar data:', error);
  }
};

// Run the script
addTestCalendarData().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});