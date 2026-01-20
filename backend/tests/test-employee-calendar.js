import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
let authToken = '';
let employeeId = '';

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

async function apiRequest(method, endpoint, data = null, useAuth = true) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: useAuth && authToken ? { Authorization: `Bearer ${authToken}` } : {}
    };
    
    if (data) {
      if (method === 'GET') config.params = data;
      else config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

async function testEmployeeCalendar() {
  log(colors.cyan, '\n========================================');
  log(colors.cyan, '🧪 EMPLOYEE CALENDAR DATA TEST');
  log(colors.cyan, '========================================\n');

  try {
    // Step 1: Login as Employee
    log(colors.blue, '📝 Step 1: Employee Login');
    log(colors.yellow, '  Attempting to login as employee...');
    
    const loginResponse = await apiRequest('POST', '/auth/login', {
      email: 'nikl@hrm.com',
      password: 'nikul123'
    }, false);

    if (!loginResponse.success) {
      throw new Error('Login failed: ' + loginResponse.message);
    }

    // Debug: Log the full response
    console.log('DEBUG - Full login response:', JSON.stringify(loginResponse, null, 2));

    authToken = loginResponse.data?.accessToken || loginResponse.data?.token || loginResponse.accessToken;
    employeeId = loginResponse.data?.user?.employee?.id || loginResponse.data?.user?.employeeId;
    
    if (!authToken) {
      throw new Error('No token received from login response');
    }
    
    log(colors.green, '  ✅ Login successful');
    log(colors.yellow, `  Token: ${authToken ? authToken.substring(0, 20) + '...' : 'N/A'}`);
    log(colors.yellow, `  Employee ID: ${employeeId}`);
    log(colors.yellow, `  User Role: ${loginResponse.data.user.role}`);

    // Step 2: Get Current Month Calendar
    log(colors.blue, '\n📅 Step 2: Fetch Smart Monthly Calendar');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    log(colors.yellow, `  Fetching calendar for: ${year}-${String(month).padStart(2, '0')}`);
    
    const calendarResponse = await apiRequest('GET', '/calendar/smart/monthly', {
      year,
      month
    }, true);

    if (!calendarResponse.success) {
      throw new Error('Calendar fetch failed: ' + calendarResponse.message);
    }

    log(colors.green, '  ✅ Calendar data fetched successfully');
    
    const calendarData = calendarResponse.data;
    log(colors.yellow, `  Total days in month: ${calendarData.summary.totalDays}`);
    log(colors.yellow, `  Working days: ${calendarData.summary.workingDays}`);
    log(colors.yellow, `  Weekends: ${calendarData.summary.weekends}`);
    log(colors.yellow, `  Holidays: ${calendarData.summary.holidays}`);
    log(colors.yellow, `  Leaves: ${calendarData.summary.leaves}`);

    // Step 3: Analyze Calendar Data
    log(colors.blue, '\n🔍 Step 3: Analyze Calendar Data');
    
    const calendar = calendarData.calendar || {};
    const dateKeys = Object.keys(calendar).sort();
    
    log(colors.yellow, `  Total dates in calendar: ${dateKeys.length}`);

    // Find dates with leaves
    const datesWithLeaves = [];
    const datesWithHolidays = [];
    const datesWithBirthdays = [];
    const datesWithAnniversaries = [];

    dateKeys.forEach(dateKey => {
      const dayData = calendar[dateKey];
      
      if (dayData.leave) {
        datesWithLeaves.push({ date: dateKey, leave: dayData.leave });
      }
      if (dayData.holiday) {
        datesWithHolidays.push({ date: dateKey, holiday: dayData.holiday });
      }
      if (dayData.birthdays && dayData.birthdays.length > 0) {
        datesWithBirthdays.push({ date: dateKey, birthdays: dayData.birthdays });
      }
      if (dayData.anniversaries && dayData.anniversaries.length > 0) {
        datesWithAnniversaries.push({ date: dateKey, anniversaries: dayData.anniversaries });
      }
    });

    // Step 4: Display Leave Data
    log(colors.magenta, '\n🎯 LEAVE DATA ANALYSIS');
    log(colors.yellow, `  Total dates with leaves: ${datesWithLeaves.length}`);
    
    if (datesWithLeaves.length > 0) {
      log(colors.green, '  ✅ Leaves found:');
      datesWithLeaves.forEach(({ date, leave }) => {
        log(colors.cyan, `    📅 ${date}:`);
        log(colors.yellow, `       Employee Name: ${leave.employeeName || 'N/A'}`);
        log(colors.yellow, `       Leave Type: ${leave.leaveType}`);
        log(colors.yellow, `       Status: ${leave.status}`);
        log(colors.yellow, `       Start Date: ${leave.startDate}`);
        log(colors.yellow, `       End Date: ${leave.endDate}`);
        
        // Verify employee name is present
        if (!leave.employeeName) {
          log(colors.red, `       ⚠️  WARNING: Employee name is missing!`);
        } else {
          log(colors.green, `       ✅ Employee name is present`);
        }
      });
    } else {
      log(colors.yellow, '  ℹ️  No leaves found in this month');
    }

    // Step 5: Display Holiday Data
    log(colors.magenta, '\n🎉 HOLIDAY DATA ANALYSIS');
    log(colors.yellow, `  Total dates with holidays: ${datesWithHolidays.length}`);
    
    if (datesWithHolidays.length > 0) {
      log(colors.green, '  ✅ Holidays found:');
      datesWithHolidays.slice(0, 3).forEach(({ date, holiday }) => {
        log(colors.cyan, `    📅 ${date}:`);
        log(colors.yellow, `       Name: ${holiday.name}`);
        log(colors.yellow, `       Type: ${holiday.type}`);
      });
      if (datesWithHolidays.length > 3) {
        log(colors.yellow, `    ... and ${datesWithHolidays.length - 3} more`);
      }
    } else {
      log(colors.yellow, '  ℹ️  No holidays found in this month');
    }

    // Step 6: Display Birthday Data
    log(colors.magenta, '\n🎂 BIRTHDAY DATA ANALYSIS');
    log(colors.yellow, `  Total dates with birthdays: ${datesWithBirthdays.length}`);
    
    if (datesWithBirthdays.length > 0) {
      log(colors.green, '  ✅ Birthdays found:');
      datesWithBirthdays.slice(0, 3).forEach(({ date, birthdays }) => {
        log(colors.cyan, `    📅 ${date}:`);
        birthdays.forEach(b => {
          log(colors.yellow, `       ${b.employeeName} (${b.employeeCode})`);
        });
      });
      if (datesWithBirthdays.length > 3) {
        log(colors.yellow, `    ... and ${datesWithBirthdays.length - 3} more`);
      }
    } else {
      log(colors.yellow, '  ℹ️  No birthdays found in this month');
    }

    // Step 7: Display Anniversary Data
    log(colors.magenta, '\n🎊 WORK ANNIVERSARY DATA ANALYSIS');
    log(colors.yellow, `  Total dates with anniversaries: ${datesWithAnniversaries.length}`);
    
    if (datesWithAnniversaries.length > 0) {
      log(colors.green, '  ✅ Anniversaries found:');
      datesWithAnniversaries.slice(0, 3).forEach(({ date, anniversaries }) => {
        log(colors.cyan, `    📅 ${date}:`);
        anniversaries.forEach(a => {
          log(colors.yellow, `       ${a.employeeName} (${a.employeeCode})`);
        });
      });
      if (datesWithAnniversaries.length > 3) {
        log(colors.yellow, `    ... and ${datesWithAnniversaries.length - 3} more`);
      }
    } else {
      log(colors.yellow, '  ℹ️  No anniversaries found in this month');
    }

    // Step 8: Test Specific Day Click
    if (datesWithLeaves.length > 0) {
      log(colors.blue, '\n📍 Step 8: Test Day Click (with leave)');
      const testDate = datesWithLeaves[0].date;
      log(colors.yellow, `  Testing day click for: ${testDate}`);
      
      const dayData = calendar[testDate];
      log(colors.green, '  ✅ Day data retrieved:');
      log(colors.yellow, `     Status: ${dayData.status}`);
      log(colors.yellow, `     Is Working Day: ${dayData.isWorkingDay}`);
      log(colors.yellow, `     Is Weekend: ${dayData.isWeekend}`);
      
      if (dayData.leave) {
        log(colors.cyan, '     Leave Information:');
        log(colors.yellow, `       - Employee: ${dayData.leave.employeeName}`);
        log(colors.yellow, `       - Type: ${dayData.leave.leaveType}`);
        log(colors.yellow, `       - Status: ${dayData.leave.status}`);
      }
    }

    // Step 9: Summary
    log(colors.magenta, '\n📊 SUMMARY');
    log(colors.green, '  ✅ All calendar data tests completed successfully');
    log(colors.yellow, `  Total events in calendar:`);
    log(colors.yellow, `    - Leaves: ${datesWithLeaves.length}`);
    log(colors.yellow, `    - Holidays: ${datesWithHolidays.length}`);
    log(colors.yellow, `    - Birthdays: ${datesWithBirthdays.length}`);
    log(colors.yellow, `    - Anniversaries: ${datesWithAnniversaries.length}`);

    // Verification
    log(colors.magenta, '\n✅ VERIFICATION CHECKLIST');
    log(colors.green, `  ✓ Employee login successful`);
    log(colors.green, `  ✓ Calendar data fetched`);
    log(colors.green, `  ✓ Leave data includes employee names: ${datesWithLeaves.length > 0 ? (datesWithLeaves[0].leave.employeeName ? '✅' : '❌') : 'N/A'}`);
    log(colors.green, `  ✓ Holiday data present: ${datesWithHolidays.length > 0 ? '✅' : 'ℹ️ None'}`);
    log(colors.green, `  ✓ Birthday data present: ${datesWithBirthdays.length > 0 ? '✅' : 'ℹ️ None'}`);
    log(colors.green, `  ✓ Anniversary data present: ${datesWithAnniversaries.length > 0 ? '✅' : 'ℹ️ None'}`);

    log(colors.cyan, '\n========================================');
    log(colors.green, '✅ TEST COMPLETED SUCCESSFULLY');
    log(colors.cyan, '========================================\n');

  } catch (error) {
    log(colors.red, '\n❌ TEST FAILED');
    log(colors.red, `Error: ${error.message || JSON.stringify(error)}`);
    log(colors.cyan, '\n========================================\n');
    process.exit(1);
  }
}

// Run the test
testEmployeeCalendar();
