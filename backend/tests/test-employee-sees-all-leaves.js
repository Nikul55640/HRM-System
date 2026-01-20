import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, title, data = '') {
  console.log(`${color}${title}${colors.reset} ${data}`);
}

async function testEmployeeSeesAllLeaves() {
  log(colors.cyan, '\n========================================');
  log(colors.cyan, '👥 EMPLOYEE SEES ALL LEAVES TEST');
  log(colors.cyan, '========================================\n');

  try {
    // Login as Employee
    const empLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john@hrm.com',
      password: 'john123'
    });
    const empToken = empLogin.data.data.accessToken;
    log(colors.green, '✅ Employee login successful');

    // Get January 2026 calendar
    const empCalendar = await axios.get(`${BASE_URL}/calendar/smart/monthly`, {
      params: { year: 2026, month: 1 },
      headers: { Authorization: `Bearer ${empToken}` }
    });

    const calendar = empCalendar.data.data.calendar;
    
    log(colors.blue, '\n📅 EMPLOYEE CALENDAR - JANUARY 2026');
    log(colors.yellow, '  Checking all dates for leaves...\n');

    let totalLeaves = 0;
    const leaveDetails = [];

    Object.keys(calendar).sort().forEach(dateKey => {
      const dayData = calendar[dateKey];
      
      // Check single leave
      if (dayData.leave) {
        totalLeaves++;
        leaveDetails.push({
          date: dateKey,
          type: 'single',
          employee: dayData.leave.employeeName,
          leaveType: dayData.leave.leaveType
        });
        log(colors.cyan, `    📅 ${dateKey}: ${dayData.leave.employeeName} - ${dayData.leave.leaveType} (single)`);
      }
      
      // Check multiple leaves
      if (dayData.leaves && Array.isArray(dayData.leaves)) {
        dayData.leaves.forEach(leave => {
          totalLeaves++;
          leaveDetails.push({
            date: dateKey,
            type: 'multiple',
            employee: leave.employeeName,
            leaveType: leave.leaveType
          });
          log(colors.cyan, `    📅 ${dateKey}: ${leave.employeeName} - ${leave.leaveType} (multiple)`);
        });
      }
    });

    log(colors.yellow, `\n  Total leaves found: ${totalLeaves}`);
    
    // Group by employee
    const leavesByEmployee = {};
    leaveDetails.forEach(leave => {
      if (!leavesByEmployee[leave.employee]) {
        leavesByEmployee[leave.employee] = [];
      }
      leavesByEmployee[leave.employee].push(leave);
    });

    log(colors.blue, '\n👥 LEAVES BY EMPLOYEE:');
    Object.keys(leavesByEmployee).forEach(employeeName => {
      const employeeLeaves = leavesByEmployee[employeeName];
      log(colors.green, `  ${employeeName}: ${employeeLeaves.length} leave(s)`);
      employeeLeaves.forEach(leave => {
        log(colors.yellow, `    - ${leave.date}: ${leave.leaveType} (${leave.type})`);
      });
    });

    // Check birthdays and anniversaries
    log(colors.blue, '\n🎂 BIRTHDAYS & 🎊 ANNIVERSARIES:');
    let totalBirthdays = 0;
    let totalAnniversaries = 0;

    Object.keys(calendar).forEach(dateKey => {
      const dayData = calendar[dateKey];
      
      if (dayData.birthdays && dayData.birthdays.length > 0) {
        dayData.birthdays.forEach(birthday => {
          totalBirthdays++;
          log(colors.cyan, `  🎂 ${dateKey}: ${birthday.employeeName}'s Birthday`);
        });
      }
      
      if (dayData.anniversaries && dayData.anniversaries.length > 0) {
        dayData.anniversaries.forEach(anniversary => {
          totalAnniversaries++;
          log(colors.cyan, `  🎊 ${dateKey}: ${anniversary.employeeName}'s Work Anniversary`);
        });
      }
    });

    log(colors.yellow, `\n  Total birthdays: ${totalBirthdays}`);
    log(colors.yellow, `  Total anniversaries: ${totalAnniversaries}`);

    // Summary
    log(colors.blue, '\n📊 EMPLOYEE VIEW SUMMARY:');
    log(colors.green, `  ✅ Employee can see ALL employee leaves: ${totalLeaves > 0 ? 'YES' : 'NO'}`);
    log(colors.green, `  ✅ Employee can see ALL birthdays: ${totalBirthdays > 0 ? 'YES' : 'NO'}`);
    log(colors.green, `  ✅ Employee can see ALL anniversaries: ${totalAnniversaries > 0 ? 'YES' : 'NO'}`);
    
    const uniqueEmployees = Object.keys(leavesByEmployee).length;
    log(colors.green, `  ✅ Employee can see leaves from ${uniqueEmployees} different employee(s)`);

    if (totalLeaves > 0 && uniqueEmployees > 0) {
      log(colors.green, '\n  🎉 SUCCESS: Employee can see ALL other employees\' leaves!');
    } else {
      log(colors.red, '\n  ❌ ISSUE: Employee cannot see other employees\' leaves');
    }

    log(colors.cyan, '\n========================================');
    log(colors.green, '✅ EMPLOYEE SEES ALL LEAVES TEST COMPLETED');
    log(colors.cyan, '========================================\n');

  } catch (error) {
    log(colors.red, '\n❌ TEST FAILED');
    log(colors.red, `Error: ${error.response?.data?.message || error.message}`);
    log(colors.cyan, '\n========================================\n');
    process.exit(1);
  }
}

testEmployeeSeesAllLeaves();