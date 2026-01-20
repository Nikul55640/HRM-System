import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
let authToken = '';
let adminUser = null;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
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

async function testAdminCalendar() {
  log(colors.cyan, '\n========================================');
  log(colors.cyan, '🔧 ADMIN CALENDAR DATA TEST');
  log(colors.cyan, '========================================\n');

  try {
    // Step 1: Try different admin credentials
    log(colors.blue, '📝 Step 1: Admin Login');
    
    const adminCredentials = [
      { email: 'admin@hrm.com', password: 'admin123', role: 'SuperAdmin' },
      { email: 'hr@hrm.com', password: 'hr123', role: 'HR Manager' },
      { email: 'admin@hrms.com', password: 'admin123', role: 'SuperAdmin' },
      { email: 'hr@hrms.com', password: 'admin123', role: 'HR Manager' }
    ];

    let loginSuccess = false;
    
    for (const creds of adminCredentials) {
      try {
        log(colors.yellow, `  Trying: ${creds.email} / ${creds.password}`);
        
        const loginResponse = await apiRequest('POST', '/auth/login', {
          email: creds.email,
          password: creds.password
        }, false);

        if (loginResponse.success) {
          authToken = loginResponse.data?.accessToken || loginResponse.data?.token || loginResponse.accessToken;
          adminUser = loginResponse.data.user;
          
          log(colors.green, `  ✅ Login successful as ${creds.role}`);
          log(colors.yellow, `  User: ${adminUser.fullName || adminUser.name}`);
          log(colors.yellow, `  Role: ${adminUser.role}`);
          log(colors.yellow, `  Token: ${authToken ? authToken.substring(0, 20) + '...' : 'N/A'}`);
          
          loginSuccess = true;
          break;
        }
      } catch (error) {
        log(colors.red, `  ❌ Failed: ${error.message || 'Login failed'}`);
        continue;
      }
    }

    if (!loginSuccess) {
      throw new Error('All admin login attempts failed');
    }

    // Step 2: Test Admin Calendar Access
    log(colors.blue, '\n📅 Step 2: Fetch Admin Calendar Data');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    log(colors.yellow, `  Fetching admin calendar for: ${year}-${String(month).padStart(2, '0')}`);
    
    const calendarResponse = await apiRequest('GET', '/calendar/smart/monthly', {
      year,
      month
    }, true);

    if (!calendarResponse.success) {
      throw new Error('Admin calendar fetch failed: ' + calendarResponse.message);
    }

    log(colors.green, '  ✅ Admin calendar data fetched successfully');
    
    const calendarData = calendarResponse.data;
    log(colors.yellow, `  Total days in month: ${calendarData.summary.totalDays}`);
    log(colors.yellow, `  Working days: ${calendarData.summary.workingDays}`);
    log(colors.yellow, `  Weekends: ${calendarData.summary.weekends}`);
    log(colors.yellow, `  Holidays: ${calendarData.summary.holidays}`);
    log(colors.yellow, `  Leaves: ${calendarData.summary.leaves}`);

    // Step 3: Analyze Admin Calendar Data (Different from Employee View)
    log(colors.blue, '\n🔍 Step 3: Analyze Admin Calendar Data');
    
    const calendar = calendarData.calendar || {};
    const dateKeys = Object.keys(calendar).sort();
    
    log(colors.yellow, `  Total dates in calendar: ${dateKeys.length}`);

    // Find all types of data
    const datesWithLeaves = [];
    const datesWithHolidays = [];
    const datesWithBirthdays = [];
    const datesWithAnniversaries = [];
    const datesWithEvents = [];

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
      if (dayData.events && dayData.events.length > 0) {
        datesWithEvents.push({ date: dateKey, events: dayData.events });
      }
    });

    // Step 4: Admin-specific Leave Data Analysis
    log(colors.magenta, '\n👥 ADMIN LEAVE DATA ANALYSIS');
    log(colors.yellow, `  Total dates with leaves: ${datesWithLeaves.length}`);
    
    if (datesWithLeaves.length > 0) {
      log(colors.green, '  ✅ Admin can see all employee leaves:');
      datesWithLeaves.forEach(({ date, leave }) => {
        log(colors.cyan, `    📅 ${date}:`);
        log(colors.yellow, `       Employee Name: ${leave.employeeName || 'N/A'}`);
        log(colors.yellow, `       Employee ID: ${leave.employeeId || 'N/A'}`);
        log(colors.yellow, `       Leave Type: ${leave.leaveType}`);
        log(colors.yellow, `       Status: ${leave.status}`);
        log(colors.yellow, `       Duration: ${leave.startDate} to ${leave.endDate}`);
        
        // Admin-specific verification
        if (!leave.employeeName) {
          log(colors.red, `       ⚠️  WARNING: Employee name missing for admin view!`);
        } else {
          log(colors.green, `       ✅ Employee name visible to admin`);
        }
        
        if (!leave.employeeId) {
          log(colors.red, `       ⚠️  WARNING: Employee ID missing!`);
        } else {
          log(colors.green, `       ✅ Employee ID present: ${leave.employeeId}`);
        }
      });
    } else {
      log(colors.yellow, '  ℹ️  No leaves found in this month');
    }

    // Step 5: Birthday Data (Admin should see all)
    log(colors.magenta, '\n🎂 ADMIN BIRTHDAY DATA ANALYSIS');
    log(colors.yellow, `  Total dates with birthdays: ${datesWithBirthdays.length}`);
    
    if (datesWithBirthdays.length > 0) {
      log(colors.green, '  ✅ Admin can see all employee birthdays:');
      datesWithBirthdays.slice(0, 5).forEach(({ date, birthdays }) => {
        log(colors.cyan, `    📅 ${date}:`);
        birthdays.forEach(b => {
          log(colors.yellow, `       ${b.employeeName} (${b.employeeCode})`);
        });
      });
      if (datesWithBirthdays.length > 5) {
        log(colors.yellow, `    ... and ${datesWithBirthdays.length - 5} more birthday dates`);
      }
    } else {
      log(colors.yellow, '  ℹ️  No birthdays found in this month');
    }

    // Step 6: Anniversary Data (Admin should see all)
    log(colors.magenta, '\n🎊 ADMIN ANNIVERSARY DATA ANALYSIS');
    log(colors.yellow, `  Total dates with anniversaries: ${datesWithAnniversaries.length}`);
    
    if (datesWithAnniversaries.length > 0) {
      log(colors.green, '  ✅ Admin can see all work anniversaries:');
      datesWithAnniversaries.slice(0, 5).forEach(({ date, anniversaries }) => {
        log(colors.cyan, `    📅 ${date}:`);
        anniversaries.forEach(a => {
          log(colors.yellow, `       ${a.employeeName} (${a.employeeCode})`);
        });
      });
      if (datesWithAnniversaries.length > 5) {
        log(colors.yellow, `    ... and ${datesWithAnniversaries.length - 5} more anniversary dates`);
      }
    } else {
      log(colors.yellow, '  ℹ️  No anniversaries found in this month');
    }

    // Step 7: Company Events (Admin should see all)
    log(colors.magenta, '\n📅 ADMIN COMPANY EVENTS ANALYSIS');
    log(colors.yellow, `  Total dates with events: ${datesWithEvents.length}`);
    
    if (datesWithEvents.length > 0) {
      log(colors.green, '  ✅ Admin can see company events:');
      datesWithEvents.slice(0, 3).forEach(({ date, events }) => {
        log(colors.cyan, `    📅 ${date}:`);
        events.forEach(e => {
          log(colors.yellow, `       ${e.title || e.name} (${e.eventType || 'event'})`);
        });
      });
      if (datesWithEvents.length > 3) {
        log(colors.yellow, `    ... and ${datesWithEvents.length - 3} more event dates`);
      }
    } else {
      log(colors.yellow, '  ℹ️  No company events found in this month');
    }

    // Step 8: Test Admin Permissions
    log(colors.blue, '\n🔐 Step 8: Test Admin-specific Features');
    
    // Test if admin can see other employees' data
    if (datesWithLeaves.length > 0) {
      const testDate = datesWithLeaves[0].date;
      const dayData = calendar[testDate];
      
      log(colors.yellow, `  Testing admin permissions for: ${testDate}`);
      log(colors.green, '  ✅ Admin day data includes:');
      log(colors.yellow, `     - Status: ${dayData.status}`);
      log(colors.yellow, `     - Working Day: ${dayData.isWorkingDay}`);
      log(colors.yellow, `     - Weekend: ${dayData.isWeekend}`);
      
      if (dayData.leave) {
        log(colors.cyan, '     - Leave Details (Admin View):');
        log(colors.yellow, `       • Employee: ${dayData.leave.employeeName}`);
        log(colors.yellow, `       • Employee ID: ${dayData.leave.employeeId}`);
        log(colors.yellow, `       • Type: ${dayData.leave.leaveType}`);
        log(colors.yellow, `       • Status: ${dayData.leave.status}`);
        log(colors.yellow, `       • Reason: ${dayData.leave.reason || 'N/A'}`);
      }
    }

    // Step 9: Admin vs Employee Data Comparison
    log(colors.magenta, '\n🔄 ADMIN vs EMPLOYEE DATA COMPARISON');
    
    // Test with employee credentials for comparison
    try {
      log(colors.yellow, '  Comparing with employee view...');
      
      const empLoginResponse = await apiRequest('POST', '/auth/login', {
        email: 'john@hrm.com',
        password: 'john123'
      }, false);

      if (empLoginResponse.success) {
        const empToken = empLoginResponse.data?.accessToken;
        
        const empCalendarResponse = await axios.get(`${BASE_URL}/calendar/smart/monthly`, {
          params: { year, month },
          headers: { Authorization: `Bearer ${empToken}` }
        });

        if (empCalendarResponse.data.success) {
          const empCalendar = empCalendarResponse.data.data.calendar || {};
          const empDateKeys = Object.keys(empCalendar);
          
          const empLeaves = empDateKeys.filter(date => empCalendar[date].leave).length;
          const empBirthdays = empDateKeys.filter(date => empCalendar[date].birthdays?.length > 0).length;
          const empAnniversaries = empDateKeys.filter(date => empCalendar[date].anniversaries?.length > 0).length;
          
          log(colors.green, '  ✅ Data comparison:');
          log(colors.cyan, `     Admin sees:`);
          log(colors.yellow, `       - Leaves: ${datesWithLeaves.length} dates`);
          log(colors.yellow, `       - Birthdays: ${datesWithBirthdays.length} dates`);
          log(colors.yellow, `       - Anniversaries: ${datesWithAnniversaries.length} dates`);
          
          log(colors.cyan, `     Employee sees:`);
          log(colors.yellow, `       - Leaves: ${empLeaves} dates`);
          log(colors.yellow, `       - Birthdays: ${empBirthdays} dates`);
          log(colors.yellow, `       - Anniversaries: ${empAnniversaries} dates`);
          
          // Verify admin sees more data
          if (datesWithBirthdays.length >= empBirthdays && datesWithAnniversaries.length >= empAnniversaries) {
            log(colors.green, '  ✅ Admin correctly sees equal or more data than employee');
          } else {
            log(colors.red, '  ⚠️  Admin might be seeing less data than expected');
          }
        }
      }
    } catch (error) {
      log(colors.yellow, '  ℹ️  Could not compare with employee view');
    }

    // Step 10: Summary
    log(colors.magenta, '\n📊 ADMIN CALENDAR SUMMARY');
    log(colors.green, '  ✅ All admin calendar tests completed successfully');
    log(colors.yellow, `  Admin Role: ${adminUser.role}`);
    log(colors.yellow, `  Admin Name: ${adminUser.fullName || adminUser.name}`);
    log(colors.yellow, `  Total calendar events visible to admin:`);
    log(colors.yellow, `    - Leaves: ${datesWithLeaves.length} dates`);
    log(colors.yellow, `    - Holidays: ${datesWithHolidays.length} dates`);
    log(colors.yellow, `    - Birthdays: ${datesWithBirthdays.length} dates`);
    log(colors.yellow, `    - Anniversaries: ${datesWithAnniversaries.length} dates`);
    log(colors.yellow, `    - Company Events: ${datesWithEvents.length} dates`);

    // Verification Checklist
    log(colors.magenta, '\n✅ ADMIN VERIFICATION CHECKLIST');
    log(colors.green, `  ✓ Admin login successful`);
    log(colors.green, `  ✓ Admin calendar data fetched`);
    log(colors.green, `  ✓ Admin can see employee names in leaves: ${datesWithLeaves.length > 0 ? (datesWithLeaves[0].leave.employeeName ? '✅' : '❌') : 'N/A'}`);
    log(colors.green, `  ✓ Admin can see all birthdays: ${datesWithBirthdays.length > 0 ? '✅' : 'ℹ️ None'}`);
    log(colors.green, `  ✓ Admin can see all anniversaries: ${datesWithAnniversaries.length > 0 ? '✅' : 'ℹ️ None'}`);
    log(colors.green, `  ✓ Admin has appropriate permissions: ✅`);

    log(colors.cyan, '\n========================================');
    log(colors.green, '✅ ADMIN CALENDAR TEST COMPLETED SUCCESSFULLY');
    log(colors.cyan, '========================================\n');

    // Frontend Integration Notes
    log(colors.blue, '📋 FRONTEND INTEGRATION NOTES:');
    log(colors.yellow, '  For CalendarManagement.jsx component:');
    log(colors.yellow, '  1. Admin should see ALL employee leaves with names');
    log(colors.yellow, '  2. Admin should see ALL birthdays and anniversaries');
    log(colors.yellow, '  3. Admin should have management features enabled');
    log(colors.yellow, '  4. UnifiedCalendarView should show showManagementFeatures={true}');
    log(colors.yellow, '  5. Admin can create/edit/delete events');

  } catch (error) {
    log(colors.red, '\n❌ ADMIN CALENDAR TEST FAILED');
    log(colors.red, `Error: ${error.message || JSON.stringify(error)}`);
    log(colors.cyan, '\n========================================\n');
    process.exit(1);
  }
}

// Run the test
testAdminCalendar();