import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
let authToken = '';
let testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to log test results
function logTest(name, status, message = '') {
  const statusColor = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.yellow;
  console.log(`${statusColor}[${status}]${colors.reset} ${name} ${message ? `- ${message}` : ''}`);
  
  testResults.tests.push({ name, status, message });
  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') testResults.failed++;
  else testResults.skipped++;
}

// Helper function to make API requests
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
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Test Categories

// ===================================================
// 1. HEALTH CHECK & AUTHENTICATION TESTS
// ===================================================
async function testHealthAndAuth() {
  console.log(`\n${colors.cyan}=== HEALTH CHECK & AUTHENTICATION ===${colors.reset}`);
  
  // Health check
  const health = await apiRequest('GET', '/health', null, false);
  if (!health.success) {
    console.log(`\n${colors.red}╔════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.red}║  ⚠️  BACKEND SERVER IS NOT RUNNING!               ║${colors.reset}`);
    console.log(`${colors.red}╚════════════════════════════════════════════════════╝${colors.reset}`);
    console.log(`\n${colors.yellow}To fix this:${colors.reset}`);
    console.log(`1. Open a NEW terminal window`);
    console.log(`2. Run: ${colors.cyan}cd HRM-System/backend${colors.reset}`);
    console.log(`3. Run: ${colors.cyan}npm run dev${colors.reset}`);
    console.log(`4. Wait for "Server running on port 5000"`);
    console.log(`5. Keep that terminal open`);
    console.log(`6. Run tests again in THIS terminal\n`);
    console.log(`${colors.cyan}Quick diagnostic: npm run test:diagnose${colors.reset}\n`);
  }
  logTest('Health Check', health.success ? 'PASS' : 'FAIL', health.success ? 'Server is running' : 'Server not running');
  
  // Login test
  const login = await apiRequest('POST', '/auth/login', {
    email: process.env.TEST_EMAIL || 'admin@example.com',
    password: process.env.TEST_PASSWORD || 'admin123'
  }, false);
  
  if (login.success && login.data.token) {
    authToken = login.data.token;
    logTest('Login', 'PASS', 'Token received');
  } else {
    logTest('Login', 'FAIL', login.error?.message || 'No token received');
    console.log(`${colors.red}⚠️  Authentication failed. Remaining tests may fail.${colors.reset}`);
  }
  
  // Verify token
  const verify = await apiRequest('GET', '/auth/verify');
  logTest('Token Verification', verify.success ? 'PASS' : 'FAIL');
  
  // Get current user
  const me = await apiRequest('GET', '/auth/me');
  logTest('Get Current User', me.success ? 'PASS' : 'FAIL');
}

// ===================================================
// 2. ADMIN DASHBOARD TESTS
// ===================================================
async function testAdminDashboard() {
  console.log(`\n${colors.cyan}=== ADMIN DASHBOARD ===${colors.reset}`);
  
  const stats = await apiRequest('GET', '/admin/dashboard/stats');
  logTest('Get Dashboard Stats', stats.success ? 'PASS' : 'FAIL');
  
  const recentActivity = await apiRequest('GET', '/admin/dashboard/recent-activity');
  logTest('Get Recent Activity', recentActivity.success ? 'PASS' : 'FAIL');
}

// ===================================================
// 3. EMPLOYEE MANAGEMENT TESTS
// ===================================================
async function testEmployeeManagement() {
  console.log(`\n${colors.cyan}=== EMPLOYEE MANAGEMENT ===${colors.reset}`);
  
  const employees = await apiRequest('GET', '/employees');
  logTest('Get All Employees', employees.success ? 'PASS' : 'FAIL');
  
  const employeeList = await apiRequest('GET', '/admin/employee-management');
  logTest('Get Employee List (Admin)', employeeList.success ? 'PASS' : 'FAIL');
  
  if (employees.success && employees.data?.data?.length > 0) {
    const empId = employees.data.data[0].id;
    const empDetail = await apiRequest('GET', `/employees/${empId}`);
    logTest('Get Employee Details', empDetail.success ? 'PASS' : 'FAIL');
  } else {
    logTest('Get Employee Details', 'SKIP', 'No employees found');
  }
}

// ===================================================
// 4. DEPARTMENT & DESIGNATION TESTS
// ===================================================
async function testDepartmentsAndDesignations() {
  console.log(`\n${colors.cyan}=== DEPARTMENTS & DESIGNATIONS ===${colors.reset}`);
  
  const departments = await apiRequest('GET', '/admin/departments');
  logTest('Get All Departments', departments.success ? 'PASS' : 'FAIL');
  
  const designations = await apiRequest('GET', '/admin/designations');
  logTest('Get All Designations', designations.success ? 'PASS' : 'FAIL');
}

// ===================================================
// 5. ATTENDANCE TESTS
// ===================================================
async function testAttendance() {
  console.log(`\n${colors.cyan}=== ATTENDANCE ===${colors.reset}`);
  
  // Admin attendance routes
  const adminAttendance = await apiRequest('GET', '/admin/attendance');
  logTest('Get Attendance Records (Admin)', adminAttendance.success ? 'PASS' : 'FAIL');
  
  const liveAttendance = await apiRequest('GET', '/admin/attendance/live');
  logTest('Get Live Attendance', liveAttendance.success ? 'PASS' : 'FAIL');
  
  const attendanceStats = await apiRequest('GET', '/admin/attendance/stats');
  logTest('Get Attendance Stats', attendanceStats.success ? 'PASS' : 'FAIL');
  
  // Employee attendance routes
  const empAttendance = await apiRequest('GET', '/employee/attendance');
  logTest('Get My Attendance (Employee)', empAttendance.success ? 'PASS' : 'FAIL');
  
  const todayAttendance = await apiRequest('GET', '/employee/attendance/today');
  logTest('Get Today Attendance', todayAttendance.success ? 'PASS' : 'FAIL');
  
  // Attendance corrections
  const corrections = await apiRequest('GET', '/admin/attendance-corrections');
  logTest('Get Attendance Corrections', corrections.success ? 'PASS' : 'FAIL');
  
  const empCorrections = await apiRequest('GET', '/employee/attendance-correction-requests');
  logTest('Get My Correction Requests', empCorrections.success ? 'PASS' : 'FAIL');
  
  // Attendance status
  const attendanceStatus = await apiRequest('GET', '/admin/attendance-status');
  logTest('Get Attendance Status Types', attendanceStatus.success ? 'PASS' : 'FAIL');
}

// ===================================================
// 6. LEAVE MANAGEMENT TESTS
// ===================================================
async function testLeaveManagement() {
  console.log(`\n${colors.cyan}=== LEAVE MANAGEMENT ===${colors.reset}`);
  
  // Admin leave routes
  const adminLeaves = await apiRequest('GET', '/admin/leave');
  logTest('Get All Leave Requests (Admin)', adminLeaves.success ? 'PASS' : 'FAIL');
  
  const leaveBalances = await apiRequest('GET', '/admin/leave-balances');
  logTest('Get Leave Balances', leaveBalances.success ? 'PASS' : 'FAIL');
  
  const leaveRollover = await apiRequest('GET', '/admin/leave-balance-rollover');
  logTest('Get Leave Rollover Settings', leaveRollover.success ? 'PASS' : 'FAIL');
  
  // Employee leave routes
  const empLeaves = await apiRequest('GET', '/employee/leave');
  logTest('Get My Leave Requests', empLeaves.success ? 'PASS' : 'FAIL');
  
  const myBalance = await apiRequest('GET', '/employee/leave/balance');
  logTest('Get My Leave Balance', myBalance.success ? 'PASS' : 'FAIL');
}

// ===================================================
// 7. SHIFT MANAGEMENT TESTS
// ===================================================
async function testShiftManagement() {
  console.log(`\n${colors.cyan}=== SHIFT MANAGEMENT ===${colors.reset}`);
  
  const shifts = await apiRequest('GET', '/admin/shifts');
  logTest('Get All Shifts', shifts.success ? 'PASS' : 'FAIL');
  
  const empShifts = await apiRequest('GET', '/employee/shifts');
  logTest('Get My Shifts', empShifts.success ? 'PASS' : 'FAIL');
  
  const currentShift = await apiRequest('GET', '/employee/shifts/current');
  logTest('Get Current Shift', currentShift.success ? 'PASS' : 'FAIL');
}

// ===================================================
// 8. CALENDAR TESTS
// ===================================================
async function testCalendar() {
  console.log(`\n${colors.cyan}=== CALENDAR ===${colors.reset}`);
  
  // Holidays
  const holidays = await apiRequest('GET', '/admin/holidays');
  logTest('Get Holidays', holidays.success ? 'PASS' : 'FAIL');
  
  // Company Events
  const events = await apiRequest('GET', '/admin/events');
  logTest('Get Company Events', events.success ? 'PASS' : 'FAIL');
  
  const eventTypes = await apiRequest('GET', '/admin/event-types');
  logTest('Get Event Types', eventTypes.success ? 'PASS' : 'FAIL');
  
  // Smart Calendar
  const smartCalendar = await apiRequest('GET', '/calendar/smart/day-status', {
    date: new Date().toISOString().split('T')[0]
  });
  logTest('Get Smart Calendar Day Status', smartCalendar.success ? 'PASS' : 'FAIL');
  
  // Working Rules
  const workingRules = await apiRequest('GET', '/admin/working-rules');
  logTest('Get Working Rules', workingRules.success ? 'PASS' : 'FAIL');
  
  // Calendarific Integration
  const calendarific = await apiRequest('GET', '/admin/calendarific/settings');
  logTest('Get Calendarific Settings', calendarific.success ? 'PASS' : 'FAIL');
  
  // Employee Calendar
  const empCalendar = await apiRequest('GET', '/employee/calendar');
  logTest('Get Employee Calendar', empCalendar.success ? 'PASS' : 'FAIL');
}

// ===================================================
// 9. PROFILE & SETTINGS TESTS
// ===================================================
async function testProfileAndSettings() {
  console.log(`\n${colors.cyan}=== PROFILE & SETTINGS ===${colors.reset}`);
  
  const profile = await apiRequest('GET', '/employee/profile');
  logTest('Get My Profile', profile.success ? 'PASS' : 'FAIL');
  
  const emergencyContacts = await apiRequest('GET', '/employee/emergency-contacts');
  logTest('Get Emergency Contacts', emergencyContacts.success ? 'PASS' : 'FAIL');
  
  const bankDetails = await apiRequest('GET', '/employee/bank-details');
  logTest('Get Bank Details', bankDetails.success ? 'PASS' : 'FAIL');
  
  const users = await apiRequest('GET', '/users');
  logTest('Get Users', users.success ? 'PASS' : 'FAIL');
  
  const config = await apiRequest('GET', '/config');
  logTest('Get System Config', config.success ? 'PASS' : 'FAIL');
}

// ===================================================
// 10. NOTIFICATIONS TESTS
// ===================================================
async function testNotifications() {
  console.log(`\n${colors.cyan}=== NOTIFICATIONS ===${colors.reset}`);
  
  const notifications = await apiRequest('GET', '/employee/notifications');
  logTest('Get Notifications', notifications.success ? 'PASS' : 'FAIL');
  
  const unreadCount = await apiRequest('GET', '/employee/notifications/unread-count');
  logTest('Get Unread Count', unreadCount.success ? 'PASS' : 'FAIL');
}

// ===================================================
// 11. LEADS MANAGEMENT TESTS
// ===================================================
async function testLeadsManagement() {
  console.log(`\n${colors.cyan}=== LEADS MANAGEMENT ===${colors.reset}`);
  
  const leads = await apiRequest('GET', '/admin/leads');
  logTest('Get All Leads', leads.success ? 'PASS' : 'FAIL');
}

// ===================================================
// 12. AUDIT LOGS TESTS
// ===================================================
async function testAuditLogs() {
  console.log(`\n${colors.cyan}=== AUDIT LOGS ===${colors.reset}`);
  
  const auditLogs = await apiRequest('GET', '/admin/audit-logs');
  logTest('Get Audit Logs', auditLogs.success ? 'PASS' : 'FAIL');
}

// ===================================================
// 13. SYSTEM POLICIES TESTS
// ===================================================
async function testSystemPolicies() {
  console.log(`\n${colors.cyan}=== SYSTEM POLICIES ===${colors.reset}`);
  
  const policies = await apiRequest('GET', '/admin/system-policies');
  logTest('Get System Policies', policies.success ? 'PASS' : 'FAIL');
}

// ===================================================
// 14. WORK LOCATIONS TESTS
// ===================================================
async function testWorkLocations() {
  console.log(`\n${colors.cyan}=== WORK LOCATIONS ===${colors.reset}`);
  
  const locations = await apiRequest('GET', '/admin/work-locations');
  logTest('Get Work Locations', locations.success ? 'PASS' : 'FAIL');
}

// ===================================================
// 15. BANK VERIFICATION TESTS
// ===================================================
async function testBankVerification() {
  console.log(`\n${colors.cyan}=== BANK VERIFICATION ===${colors.reset}`);
  
  const bankVerifications = await apiRequest('GET', '/admin/bank-verification');
  logTest('Get Bank Verifications', bankVerifications.success ? 'PASS' : 'FAIL');
}

// ===================================================
// 16. HELP & SUPPORT TESTS
// ===================================================
async function testHelpSupport() {
  console.log(`\n${colors.cyan}=== HELP & SUPPORT ===${colors.reset}`);
  
  const tickets = await apiRequest('GET', '/admin/help-support');
  logTest('Get Support Tickets', tickets.success ? 'PASS' : 'FAIL');
}

// ===================================================
// 17. PAYSLIPS TESTS
// ===================================================
async function testPayslips() {
  console.log(`\n${colors.cyan}=== PAYSLIPS ===${colors.reset}`);
  
  const payslips = await apiRequest('GET', '/employee/payslips');
  logTest('Get My Payslips', payslips.success ? 'PASS' : 'FAIL');
}

// ===================================================
// 18. DASHBOARD TESTS
// ===================================================
async function testDashboard() {
  console.log(`\n${colors.cyan}=== EMPLOYEE DASHBOARD ===${colors.reset}`);
  
  const dashboard = await apiRequest('GET', '/employee/dashboard');
  logTest('Get Employee Dashboard', dashboard.success ? 'PASS' : 'FAIL');
  
  const recentActivity = await apiRequest('GET', '/employee/recent-activity');
  logTest('Get Recent Activity', recentActivity.success ? 'PASS' : 'FAIL');
}

// ===================================================
// MAIN TEST RUNNER
// ===================================================
async function runAllTests() {
  console.log(`${colors.blue}╔════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║     HRM SYSTEM - COMPREHENSIVE API TEST SUITE     ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\n${colors.cyan}Base URL: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.cyan}Started at: ${new Date().toLocaleString()}${colors.reset}\n`);
  
  const startTime = Date.now();
  
  try {
    // Run all test suites
    await testHealthAndAuth();
    await testAdminDashboard();
    await testEmployeeManagement();
    await testDepartmentsAndDesignations();
    await testAttendance();
    await testLeaveManagement();
    await testShiftManagement();
    await testCalendar();
    await testProfileAndSettings();
    await testNotifications();
    await testLeadsManagement();
    await testAuditLogs();
    await testSystemPolicies();
    await testWorkLocations();
    await testBankVerification();
    await testHelpSupport();
    await testPayslips();
    await testDashboard();
    
  } catch (error) {
    console.error(`${colors.red}Fatal error during test execution:${colors.reset}`, error.message);
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Print summary
  console.log(`\n${colors.blue}╔════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║                   TEST SUMMARY                     ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`${colors.green}✓ Passed:  ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed:  ${testResults.failed}${colors.reset}`);
  console.log(`${colors.yellow}⊘ Skipped: ${testResults.skipped}${colors.reset}`);
  console.log(`${colors.cyan}Total:     ${testResults.tests.length}${colors.reset}`);
  console.log(`${colors.cyan}Duration:  ${duration}s${colors.reset}`);
  
  const successRate = ((testResults.passed / testResults.tests.length) * 100).toFixed(2);
  console.log(`${colors.cyan}Success Rate: ${successRate}%${colors.reset}\n`);
  
  // Show failed tests
  if (testResults.failed > 0) {
    console.log(`${colors.red}Failed Tests:${colors.reset}`);
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => console.log(`  - ${t.name}: ${t.message}`));
    console.log('');
  }
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests();
