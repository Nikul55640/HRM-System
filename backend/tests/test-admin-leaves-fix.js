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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(color, title, data = '') {
  console.log(`${color}${title}${colors.reset} ${data}`);
}

async function testAdminLeavesFix() {
  log(colors.cyan, '\n========================================');
  log(colors.cyan, '🔧 ADMIN LEAVES FIX VERIFICATION');
  log(colors.cyan, '========================================\n');

  try {
    // Step 1: Login as Admin
    log(colors.blue, '📝 Step 1: Admin Login');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@hrm.com',
      password: 'admin123'
    });

    const adminToken = adminLogin.data.data.accessToken;
    log(colors.green, '  ✅ Admin login successful');

    // Step 2: Login as Employee and check their leave
    log(colors.blue, '\n📝 Step 2: Employee Login & Leave Check');
    const empLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john@hrm.com',
      password: 'john123'
    });

    const empToken = empLogin.data.data.accessToken;
    log(colors.green, '  ✅ Employee login successful');

    // Get employee calendar to see their leave
    const empCalendar = await axios.get(`${BASE_URL}/calendar/smart/monthly`, {
      params: { year: 2026, month: 1 },
      headers: { Authorization: `Bearer ${empToken}` }
    });

    const empLeaves = Object.keys(empCalendar.data.data.calendar)
      .filter(date => empCalendar.data.data.calendar[date].leave)
      .map(date => ({
        date,
        leave: empCalendar.data.data.calendar[date].leave
      }));

    log(colors.yellow, `  Employee sees ${empLeaves.length} leave(s)`);
    empLeaves.forEach(({ date, leave }) => {
      log(colors.cyan, `    📅 ${date}: ${leave.employeeName} - ${leave.leaveType}`);
    });

    // Step 3: Get Admin Calendar and Check Leaves
    log(colors.blue, '\n📝 Step 3: Admin Calendar - Check Global Leaves');
    const adminCalendar = await axios.get(`${BASE_URL}/calendar/smart/monthly`, {
      params: { year: 2026, month: 1 },
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const calendar = adminCalendar.data.data.calendar;
    
    // Check for single leaves (dayStatus.leave)
    const singleLeaves = Object.keys(calendar)
      .filter(date => calendar[date].leave)
      .map(date => ({
        date,
        leave: calendar[date].leave
      }));

    // Check for multiple leaves (dayStatus.leaves array)
    const multipleLeaves = Object.keys(calendar)
      .filter(date => calendar[date].leaves && calendar[date].leaves.length > 0)
      .map(date => ({
        date,
        leaves: calendar[date].leaves
      }));

    log(colors.yellow, `  Admin sees ${singleLeaves.length} single leave(s)`);
    log(colors.yellow, `  Admin sees ${multipleLeaves.length} date(s) with multiple leaves`);

    // Display single leaves
    if (singleLeaves.length > 0) {
      log(colors.green, '  ✅ Single leaves found:');
      singleLeaves.forEach(({ date, leave }) => {
        log(colors.cyan, `    📅 ${date}: ${leave.employeeName} - ${leave.leaveType}`);
      });
    }

    // Display multiple leaves
    if (multipleLeaves.length > 0) {
      log(colors.green, '  ✅ Multiple leaves found:');
      multipleLeaves.forEach(({ date, leaves }) => {
        log(colors.cyan, `    📅 ${date}:`);
        leaves.forEach(leave => {
          log(colors.yellow, `      - ${leave.employeeName} (${leave.employeeCode}) - ${leave.leaveType}`);
        });
      });
    }

    // Step 4: Verification
    log(colors.magenta, '\n📊 VERIFICATION RESULTS');
    
    const totalAdminLeaves = singleLeaves.length + multipleLeaves.reduce((sum, day) => sum + day.leaves.length, 0);
    const totalEmpLeaves = empLeaves.length;

    log(colors.yellow, `  Employee calendar shows: ${totalEmpLeaves} leave(s)`);
    log(colors.yellow, `  Admin calendar shows: ${totalAdminLeaves} leave(s)`);

    if (totalAdminLeaves >= totalEmpLeaves) {
      log(colors.green, '  ✅ SUCCESS: Admin sees equal or more leaves than employee');
      
      if (multipleLeaves.length > 0) {
        log(colors.green, '  ✅ SUCCESS: Admin can see multiple employees\' leaves');
      }
      
      // Check if employee names are present
      const hasEmployeeNames = [...singleLeaves, ...multipleLeaves.flatMap(d => d.leaves)]
        .every(leave => leave.employeeName || (leave.leave && leave.leave.employeeName));
      
      if (hasEmployeeNames) {
        log(colors.green, '  ✅ SUCCESS: All leaves include employee names');
      } else {
        log(colors.red, '  ❌ WARNING: Some leaves missing employee names');
      }
      
    } else {
      log(colors.red, '  ❌ ISSUE: Admin sees fewer leaves than employee');
    }

    log(colors.cyan, '\n========================================');
    log(colors.green, '✅ ADMIN LEAVES FIX TEST COMPLETED');
    log(colors.cyan, '========================================\n');

  } catch (error) {
    log(colors.red, '\n❌ TEST FAILED');
    log(colors.red, `Error: ${error.response?.data?.message || error.message}`);
    log(colors.cyan, '\n========================================\n');
    process.exit(1);
  }
}

testAdminLeavesFix();