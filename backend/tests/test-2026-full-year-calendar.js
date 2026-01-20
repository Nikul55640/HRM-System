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
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

function log(color, title, data = '') {
  console.log(`${color}${title}${colors.reset} ${data}`);
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

async function test2026FullYearCalendar() {
  log(colors.cyan, '\n========================================');
  log(colors.cyan, '📅 2026 FULL YEAR CALENDAR TEST');
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

    // Step 2: Login as Employee
    log(colors.blue, '\n📝 Step 2: Employee Login');
    const empLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john@hrm.com',
      password: 'john123'
    });
    const empToken = empLogin.data.data.accessToken;
    log(colors.green, '  ✅ Employee login successful');

    // Step 3: Test All 12 Months of 2026
    log(colors.blue, '\n📝 Step 3: Testing All 12 Months of 2026');
    
    const adminYearData = {
      totalLeaves: 0,
      totalBirthdays: 0,
      totalAnniversaries: 0,
      totalHolidays: 0,
      monthlyBreakdown: []
    };

    const empYearData = {
      totalLeaves: 0,
      totalBirthdays: 0,
      totalAnniversaries: 0,
      totalHolidays: 0,
      monthlyBreakdown: []
    };

    for (let month = 1; month <= 12; month++) {
      log(colors.yellow, `\n  📅 Testing ${MONTHS[month - 1]} 2026 (Month ${month})`);

      // Get Admin Calendar
      const adminCalendar = await axios.get(`${BASE_URL}/calendar/smart/monthly`, {
        params: { year: 2026, month },
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      // Get Employee Calendar
      const empCalendar = await axios.get(`${BASE_URL}/calendar/smart/monthly`, {
        params: { year: 2026, month },
        headers: { Authorization: `Bearer ${empToken}` }
      });

      // Process Admin Data
      const adminCalData = adminCalendar.data.data.calendar;
      const adminMonthStats = processMonthData(adminCalData, 'Admin');
      adminYearData.totalLeaves += adminMonthStats.leaves;
      adminYearData.totalBirthdays += adminMonthStats.birthdays;
      adminYearData.totalAnniversaries += adminMonthStats.anniversaries;
      adminYearData.totalHolidays += adminMonthStats.holidays;
      adminYearData.monthlyBreakdown.push({
        month: MONTHS[month - 1],
        ...adminMonthStats
      });

      // Process Employee Data
      const empCalData = empCalendar.data.data.calendar;
      const empMonthStats = processMonthData(empCalData, 'Employee');
      empYearData.totalLeaves += empMonthStats.leaves;
      empYearData.totalBirthdays += empMonthStats.birthdays;
      empYearData.totalAnniversaries += empMonthStats.anniversaries;
      empYearData.totalHolidays += empMonthStats.holidays;
      empYearData.monthlyBreakdown.push({
        month: MONTHS[month - 1],
        ...empMonthStats
      });

      // Log month summary
      log(colors.cyan, `    Admin: L:${adminMonthStats.leaves} B:${adminMonthStats.birthdays} A:${adminMonthStats.anniversaries} H:${adminMonthStats.holidays}`);
      log(colors.cyan, `    Emp:   L:${empMonthStats.leaves} B:${empMonthStats.birthdays} A:${empMonthStats.anniversaries} H:${empMonthStats.holidays}`);

      // Check if employee sees same data as admin
      const sameLeaves = empMonthStats.leaves === adminMonthStats.leaves;
      const sameBirthdays = empMonthStats.birthdays === adminMonthStats.birthdays;
      const sameAnniversaries = empMonthStats.anniversaries === adminMonthStats.anniversaries;
      
      if (sameLeaves && sameBirthdays && sameAnniversaries) {
        log(colors.green, `    ✅ Employee sees same data as admin`);
      } else {
        log(colors.red, `    ❌ Data mismatch: L:${sameLeaves} B:${sameBirthdays} A:${sameAnniversaries}`);
      }
    }

    // Step 4: Year Summary
    log(colors.magenta, '\n📊 2026 FULL YEAR SUMMARY');
    log(colors.yellow, '\n  👨‍💼 ADMIN VIEW (Full Year):');
    log(colors.cyan, `    Total Leaves: ${adminYearData.totalLeaves}`);
    log(colors.cyan, `    Total Birthdays: ${adminYearData.totalBirthdays}`);
    log(colors.cyan, `    Total Anniversaries: ${adminYearData.totalAnniversaries}`);
    log(colors.cyan, `    Total Holidays: ${adminYearData.totalHolidays}`);

    log(colors.yellow, '\n  👨‍💻 EMPLOYEE VIEW (Full Year):');
    log(colors.cyan, `    Total Leaves: ${empYearData.totalLeaves}`);
    log(colors.cyan, `    Total Birthdays: ${empYearData.totalBirthdays}`);
    log(colors.cyan, `    Total Anniversaries: ${empYearData.totalAnniversaries}`);
    log(colors.cyan, `    Total Holidays: ${empYearData.totalHolidays}`);

    // Step 5: Detailed Monthly Breakdown
    log(colors.magenta, '\n📅 MONTHLY BREAKDOWN');
    log(colors.yellow, '  Month        | Admin (L/B/A/H) | Employee (L/B/A/H) | Match?');
    log(colors.yellow, '  -------------|-----------------|-------------------|-------');
    
    for (let i = 0; i < 12; i++) {
      const adminMonth = adminYearData.monthlyBreakdown[i];
      const empMonth = empYearData.monthlyBreakdown[i];
      
      const adminStr = `${adminMonth.leaves}/${adminMonth.birthdays}/${adminMonth.anniversaries}/${adminMonth.holidays}`;
      const empStr = `${empMonth.leaves}/${empMonth.birthdays}/${empMonth.anniversaries}/${empMonth.holidays}`;
      
      const match = (adminMonth.leaves === empMonth.leaves && 
                    adminMonth.birthdays === empMonth.birthdays && 
                    adminMonth.anniversaries === empMonth.anniversaries) ? '✅' : '❌';
      
      const monthName = adminMonth.month.padEnd(12);
      log(colors.cyan, `  ${monthName} | ${adminStr.padEnd(15)} | ${empStr.padEnd(17)} | ${match}`);
    }

    // Step 6: Verification
    log(colors.magenta, '\n✅ VERIFICATION RESULTS');
    
    const leavesMatch = adminYearData.totalLeaves === empYearData.totalLeaves;
    const birthdaysMatch = adminYearData.totalBirthdays === empYearData.totalBirthdays;
    const anniversariesMatch = adminYearData.totalAnniversaries === empYearData.totalAnniversaries;
    const holidaysMatch = adminYearData.totalHolidays === empYearData.totalHolidays;

    log(leavesMatch ? colors.green : colors.red, 
        `  Leaves Match: ${leavesMatch ? '✅' : '❌'} (Admin: ${adminYearData.totalLeaves}, Employee: ${empYearData.totalLeaves})`);
    log(birthdaysMatch ? colors.green : colors.red, 
        `  Birthdays Match: ${birthdaysMatch ? '✅' : '❌'} (Admin: ${adminYearData.totalBirthdays}, Employee: ${empYearData.totalBirthdays})`);
    log(anniversariesMatch ? colors.green : colors.red, 
        `  Anniversaries Match: ${anniversariesMatch ? '✅' : '❌'} (Admin: ${adminYearData.totalAnniversaries}, Employee: ${empYearData.totalAnniversaries})`);
    log(holidaysMatch ? colors.green : colors.red, 
        `  Holidays Match: ${holidaysMatch ? '✅' : '❌'} (Admin: ${adminYearData.totalHolidays}, Employee: ${empYearData.totalHolidays})`);

    const allMatch = leavesMatch && birthdaysMatch && anniversariesMatch && holidaysMatch;
    
    if (allMatch) {
      log(colors.green, '\n  🎉 SUCCESS: Employee and Admin see identical calendar data for entire 2026!');
    } else {
      log(colors.red, '\n  ❌ ISSUE: Employee and Admin calendar data differs');
    }

    // Step 7: Sample Data Display
    log(colors.magenta, '\n📋 SAMPLE DATA FROM 2026');
    
    // Find months with most activity
    const activeMonths = adminYearData.monthlyBreakdown
      .map((month, index) => ({
        ...month,
        total: month.leaves + month.birthdays + month.anniversaries,
        index
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    log(colors.yellow, '  Most Active Months:');
    activeMonths.forEach(month => {
      log(colors.cyan, `    ${month.month}: ${month.total} total events (${month.leaves}L, ${month.birthdays}B, ${month.anniversaries}A, ${month.holidays}H)`);
    });

    log(colors.cyan, '\n========================================');
    log(colors.green, '✅ 2026 FULL YEAR CALENDAR TEST COMPLETED');
    log(colors.cyan, '========================================\n');

  } catch (error) {
    log(colors.red, '\n❌ TEST FAILED');
    log(colors.red, `Error: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      log(colors.red, `Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    log(colors.cyan, '\n========================================\n');
    process.exit(1);
  }
}

function processMonthData(calendarData, userType) {
  const stats = {
    leaves: 0,
    birthdays: 0,
    anniversaries: 0,
    holidays: 0
  };

  Object.keys(calendarData).forEach(dateKey => {
    const dayData = calendarData[dateKey];
    
    // Count single leave
    if (dayData.leave) {
      stats.leaves++;
    }
    
    // Count multiple leaves
    if (dayData.leaves && Array.isArray(dayData.leaves)) {
      stats.leaves += dayData.leaves.length;
    }
    
    // Count birthdays
    if (dayData.birthdays && Array.isArray(dayData.birthdays)) {
      stats.birthdays += dayData.birthdays.length;
    }
    
    // Count anniversaries
    if (dayData.anniversaries && Array.isArray(dayData.anniversaries)) {
      stats.anniversaries += dayData.anniversaries.length;
    }
    
    // Count holidays
    if (dayData.holiday) {
      stats.holidays++;
    }
  });

  return stats;
}

// Run the test
test2026FullYearCalendar();