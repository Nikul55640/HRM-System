/**
 * Test script to check what calendar data exists in the database
 * This will verify if the data you mentioned from admin side actually exists
 */

import { 
  LeaveRequest, 
  Holiday, 
  Employee, 
  User,
  CompanyEvent 
} from './src/models/sequelize/index.js';

const testDatabaseCalendarData = async () => {
  try {
    console.log('🗄️ Checking calendar data in database...');
    console.log('📋 Expected data from admin side:');
    console.log('   - Holidays: Makar Sankranti (Jan 14), Republic Day (Jan 26), Holi (Mar 4), etc.');
    console.log('   - Leaves: John Employee (Jan 12), Nikkl Prajap (Feb 4)');
    console.log('   - Birthdays: Nikhil Prajapati (Jan 31), John Employee (Feb 1), Nikkl Prajap (Sep 30)');
    console.log('   - Anniversaries: Nikkl Prajap (Oct 9)');
    console.log('');

    // Check employees
    console.log('👥 Checking employees...');
    const employees = await Employee.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['email']
      }],
      attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'joiningDate']
    });

    console.log(`Found ${employees.length} employees:`);
    employees.forEach(emp => {
      const birthDate = emp.dateOfBirth ? new Date(emp.dateOfBirth).toDateString() : 'No birthday';
      const joinDate = emp.joiningDate ? new Date(emp.joiningDate).toDateString() : 'No join date';
      console.log(`   - ${emp.firstName} ${emp.lastName} (${emp.user?.email}) - Birthday: ${birthDate}, Joined: ${joinDate}`);
    });

    // Check holidays
    console.log('\n🎉 Checking holidays...');
    const holidays = await Holiday.findAll({
      where: {
        isActive: true
      },
      order: [['date', 'ASC']]
    });

    console.log(`Found ${holidays.length} holidays:`);
    holidays.forEach(holiday => {
      const holidayDate = holiday.date ? new Date(holiday.date).toDateString() : 'No date';
      console.log(`   - ${holiday.name} (${holidayDate}) - Type: ${holiday.type}, Category: ${holiday.category}`);
    });

    // Check leave requests
    console.log('\n🏖️ Checking leave requests...');
    const leaves = await LeaveRequest.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['firstName', 'lastName']
      }],
      order: [['startDate', 'ASC']]
    });

    console.log(`Found ${leaves.length} leave requests:`);
    leaves.forEach(leave => {
      const startDate = leave.startDate ? new Date(leave.startDate).toDateString() : 'No start date';
      const endDate = leave.endDate ? new Date(leave.endDate).toDateString() : 'No end date';
      const employeeName = leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : 'Unknown Employee';
      console.log(`   - ${employeeName} - ${leave.leaveType} (${startDate} to ${endDate}) - Status: ${leave.status}`);
    });

    // Check company events
    console.log('\n📅 Checking company events...');
    const companyEvents = await CompanyEvent.findAll({
      order: [['startDate', 'ASC']]
    });

    console.log(`Found ${companyEvents.length} company events:`);
    companyEvents.forEach(event => {
      const startDate = event.startDate ? new Date(event.startDate).toDateString() : 'No start date';
      console.log(`   - ${event.title} (${startDate}) - Type: ${event.eventType}, Status: ${event.status}`);
    });

    // Analyze specific dates mentioned in admin data
    console.log('\n🔍 Checking specific dates from admin data...');
    
    // January 2026 events
    console.log('\n📅 January 2026 events:');
    
    // Jan 14 - Makar Sankranti
    const jan14Holiday = holidays.find(h => {
      const hDate = new Date(h.date);
      return hDate.getMonth() === 0 && hDate.getDate() === 14 && hDate.getFullYear() === 2026;
    });
    console.log(`   Jan 14 (Makar Sankranti): ${jan14Holiday ? `✅ ${jan14Holiday.name}` : '❌ Not found'}`);
    
    // Jan 26 - Republic Day
    const jan26Holiday = holidays.find(h => {
      const hDate = new Date(h.date);
      return hDate.getMonth() === 0 && hDate.getDate() === 26 && hDate.getFullYear() === 2026;
    });
    console.log(`   Jan 26 (Republic Day): ${jan26Holiday ? `✅ ${jan26Holiday.name}` : '❌ Not found'}`);
    
    // Jan 12 - John's Leave
    const jan12Leave = leaves.find(l => {
      const lDate = new Date(l.startDate);
      return lDate.getMonth() === 0 && lDate.getDate() === 12 && lDate.getFullYear() === 2026;
    });
    console.log(`   Jan 12 (John's Leave): ${jan12Leave ? `✅ ${jan12Leave.employee?.firstName} ${jan12Leave.employee?.lastName} - ${jan12Leave.leaveType}` : '❌ Not found'}`);
    
    // Jan 31 - Nikhil's Birthday
    const nikhilEmployee = employees.find(e => e.firstName.includes('Nikhil'));
    if (nikhilEmployee && nikhilEmployee.dateOfBirth) {
      const birthDate = new Date(nikhilEmployee.dateOfBirth);
      const isJan31 = birthDate.getMonth() === 0 && birthDate.getDate() === 31;
      console.log(`   Jan 31 (Nikhil's Birthday): ${isJan31 ? `✅ ${nikhilEmployee.firstName} ${nikhilEmployee.lastName}` : `❌ Birthday is ${birthDate.toDateString()}`}`);
    } else {
      console.log(`   Jan 31 (Nikhil's Birthday): ❌ Nikhil not found or no birthday`);
    }

    // February 2026 events
    console.log('\n📅 February 2026 events:');
    
    // Feb 1 - John's Birthday
    const johnEmployee = employees.find(e => e.firstName.includes('John'));
    if (johnEmployee && johnEmployee.dateOfBirth) {
      const birthDate = new Date(johnEmployee.dateOfBirth);
      const isFeb1 = birthDate.getMonth() === 1 && birthDate.getDate() === 1;
      console.log(`   Feb 1 (John's Birthday): ${isFeb1 ? `✅ ${johnEmployee.firstName} ${johnEmployee.lastName}` : `❌ Birthday is ${birthDate.toDateString()}`}`);
    } else {
      console.log(`   Feb 1 (John's Birthday): ❌ John not found or no birthday`);
    }
    
    // Feb 4 - Nikkl's Leave
    const feb4Leave = leaves.find(l => {
      const lDate = new Date(l.startDate);
      return lDate.getMonth() === 1 && lDate.getDate() === 4 && lDate.getFullYear() === 2026;
    });
    console.log(`   Feb 4 (Nikkl's Leave): ${feb4Leave ? `✅ ${feb4Leave.employee?.firstName} ${feb4Leave.employee?.lastName} - ${feb4Leave.leaveType}` : '❌ Not found'}`);

    // March 2026 events
    console.log('\n📅 March 2026 events:');
    
    // Mar 4 - Holi
    const mar4Holiday = holidays.find(h => {
      const hDate = new Date(h.date);
      return hDate.getMonth() === 2 && hDate.getDate() === 4 && hDate.getFullYear() === 2026;
    });
    console.log(`   Mar 4 (Holi): ${mar4Holiday ? `✅ ${mar4Holiday.name}` : '❌ Not found'}`);

    // September 2026 events
    console.log('\n📅 September 2026 events:');
    
    // Sep 30 - Nikkl's Birthday
    const nikklEmployee = employees.find(e => e.firstName.includes('Nikkl'));
    if (nikklEmployee && nikklEmployee.dateOfBirth) {
      const birthDate = new Date(nikklEmployee.dateOfBirth);
      const isSep30 = birthDate.getMonth() === 8 && birthDate.getDate() === 30;
      console.log(`   Sep 30 (Nikkl's Birthday): ${isSep30 ? `✅ ${nikklEmployee.firstName} ${nikklEmployee.lastName}` : `❌ Birthday is ${birthDate.toDateString()}`}`);
    } else {
      console.log(`   Sep 30 (Nikkl's Birthday): ❌ Nikkl not found or no birthday`);
    }

    // October 2026 events
    console.log('\n📅 October 2026 events:');
    
    // Oct 9 - Nikkl's Anniversary
    if (nikklEmployee && nikklEmployee.joiningDate) {
      const joinDate = new Date(nikklEmployee.joiningDate);
      const isOct9 = joinDate.getMonth() === 9 && joinDate.getDate() === 9;
      console.log(`   Oct 9 (Nikkl's Anniversary): ${isOct9 ? `✅ ${nikklEmployee.firstName} ${nikklEmployee.lastName}` : `❌ Join date is ${joinDate.toDateString()}`}`);
    } else {
      console.log(`   Oct 9 (Nikkl's Anniversary): ❌ Nikkl not found or no join date`);
    }

    console.log('\n🎯 SUMMARY:');
    console.log('This test checks what calendar data actually exists in your database.');
    console.log('If data is missing, it means the Employee Calendar API cannot return it.');
    console.log('If data exists here but not in the Employee Calendar, there may be an API issue.');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error(error);
  }
};

// Run the test
testDatabaseCalendarData().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});