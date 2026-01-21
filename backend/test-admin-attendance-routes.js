import axios from 'axios';
import fs from 'fs';

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_RESULTS_FILE = 'admin-attendance-routes-test-results.json';

// Test credentials - you may need to adjust these
const ADMIN_CREDENTIALS = {
  email: 'admin@company.com',
  password: 'admin123'
};

const HR_CREDENTIALS = {
  email: 'hr@company.com', 
  password: 'hr123'
};

class AdminAttendanceRouteTester {
  constructor() {
    this.results = [];
    this.adminToken = null;
    this.hrToken = null;
    this.testEmployeeId = null;
    this.testRecordId = null;
    this.testCorrectionId = null;
  }

  async login(credentials, role) {
    try {
      console.log(`🔐 Logging in as ${role}...`);
      const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
      
      if (response.data.success && response.data.data.token) {
        console.log(`✅ ${role} login successful`);
        return response.data.data.token;
      } else {
        throw new Error(`Login failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error(`❌ ${role} login failed:`, error.response?.data?.message || error.message);
      throw error;
    }
  }

  async setupAuth() {
    try {
      this.adminToken = await this.login(ADMIN_CREDENTIALS, 'Admin');
      this.hrToken = await this.login(HR_CREDENTIALS, 'HR');
    } catch (error) {
      console.error('❌ Authentication setup failed:', error.message);
      throw error;
    }
  }

  async testEndpoint(method, endpoint, token, data = null, description = '') {
    const testName = `${method.toUpperCase()} ${endpoint}`;
    console.log(`\n🧪 Testing: ${testName} - ${description}`);
    
    try {
      const config = {
        method: method.toLowerCase(),
        url: `${BASE_URL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (data && (method.toLowerCase() === 'post' || method.toLowerCase() === 'put' || method.toLowerCase() === 'patch')) {
        config.data = data;
      }

      const response = await axios(config);
      
      const result = {
        endpoint: testName,
        description,
        status: 'PASS',
        statusCode: response.status,
        responseTime: Date.now(),
        data: response.data?.success ? 'Success' : 'Response received',
        error: null
      };

      console.log(`✅ ${testName}: ${response.status} - ${response.data?.message || 'Success'}`);
      this.results.push(result);
      return response.data;
      
    } catch (error) {
      const result = {
        endpoint: testName,
        description,
        status: 'FAIL',
        statusCode: error.response?.status || 0,
        responseTime: Date.now(),
        data: null,
        error: error.response?.data?.message || error.message
      };

      console.log(`❌ ${testName}: ${error.response?.status || 'Network Error'} - ${error.response?.data?.message || error.message}`);
      this.results.push(result);
      return null;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Admin Attendance Routes Test Suite\n');
    
    try {
      // Setup authentication
      await this.setupAuth();

      // Test 1: Get Attendance Records
      await this.testEndpoint(
        'GET', 
        '/admin/attendance', 
        this.adminToken,
        null,
        'Get all attendance records with filtering'
      );

      // Test 2: Get Live Attendance
      await this.testEndpoint(
        'GET', 
        '/admin/attendance/live', 
        this.adminToken,
        null,
        'Get currently active attendance sessions'
      );

      // Test 3: Get Attendance Analytics
      await this.testEndpoint(
        'GET', 
        '/admin/attendance/analytics', 
        this.adminToken,
        null,
        'Get attendance analytics and statistics'
      );

      // Test 4: Get Pending Corrections
      await this.testEndpoint(
        'GET', 
        '/admin/attendance/corrections/pending', 
        this.adminToken,
        null,
        'Get pending attendance correction requests'
      );

      // Test 5: Get Late Arrivals Report
      await this.testEndpoint(
        'GET', 
        '/admin/attendance/reports/late-arrivals', 
        this.adminToken,
        null,
        'Get late arrivals report'
      );

      // Test 6: Get Early Departures Report
      await this.testEndpoint(
        'GET', 
        '/admin/attendance/reports/early-departures', 
        this.adminToken,
        null,
        'Get early departures report'
      );

      // Test 7: Get Overtime Report
      await this.testEndpoint(
        'GET', 
        '/admin/attendance/reports/overtime', 
        this.adminToken,
        null,
        'Get overtime report'
      );

      // Test 8: Get Break Violations Report
      await this.testEndpoint(
        'GET', 
        '/admin/attendance/reports/break-violations', 
        this.adminToken,
        null,
        'Get break violations report'
      );

      // Test 9: Export Attendance Data
      await this.testEndpoint(
        'GET', 
        '/admin/attendance/export', 
        this.adminToken,
        null,
        'Export attendance data'
      );

      // Test 10: Get All Employees Attendance (Legacy)
      await this.testEndpoint(
        'GET', 
        '/admin/attendance/all', 
        this.adminToken,
        null,
        'Legacy endpoint - Get all employees attendance'
      );

      // Test 11: Export Legacy
      await this.testEndpoint(
        'GET', 
        '/admin/attendance/export-legacy', 
        this.adminToken,
        null,
        'Legacy export endpoint'
      );

      // Test 12: Process End of Day Attendance
      await this.testEndpoint(
        'POST', 
        '/admin/attendance/process-end-of-day', 
        this.adminToken,
        { date: new Date().toISOString().split('T')[0] },
        'Process end-of-day attendance (automated job)'
      );

      // Test 13: Check Absent Employees
      await this.testEndpoint(
        'POST', 
        '/admin/attendance/check-absent', 
        this.adminToken,
        { date: new Date().toISOString().split('T')[0] },
        'Check and mark absent employees (automated job)'
      );

      // Test with sample employee ID and date parameters
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const sampleEmployeeId = 1; // You may need to adjust this

      // Test 14: Get Monthly Attendance Summary
      await this.testEndpoint(
        'GET', 
        `/admin/attendance/summary/${sampleEmployeeId}/${currentYear}/${currentMonth}`, 
        this.adminToken,
        null,
        'Get monthly attendance summary for specific employee'
      );

      // Test 15: Get Live Status for Specific Employee
      await this.testEndpoint(
        'GET', 
        `/admin/attendance/live/${sampleEmployeeId}`, 
        this.adminToken,
        null,
        'Get live attendance status for specific employee'
      );

      // Test HR permissions on some endpoints
      console.log('\n🔄 Testing HR user permissions...');
      
      await this.testEndpoint(
        'GET', 
        '/admin/attendance', 
        this.hrToken,
        null,
        'HR user - Get attendance records'
      );

      await this.testEndpoint(
        'GET', 
        '/admin/attendance/analytics', 
        this.hrToken,
        null,
        'HR user - Get attendance analytics'
      );

      // Test endpoints that require specific IDs (these might fail if no data exists)
      console.log('\n🔄 Testing endpoints requiring specific IDs (may fail if no data exists)...');
      
      const sampleCorrectionId = 1;
      const sampleRecordId = 1;

      // Test 16: Process Attendance Correction
      await this.testEndpoint(
        'PATCH', 
        `/admin/attendance/corrections/${sampleCorrectionId}/process`, 
        this.adminToken,
        { action: 'approve', comments: 'Test approval' },
        'Process specific attendance correction'
      );

      // Test 17: Bulk Approve Corrections
      await this.testEndpoint(
        'PATCH', 
        '/admin/attendance/corrections/bulk-approve', 
        this.adminToken,
        { correctionIds: [sampleCorrectionId], comments: 'Bulk approval test' },
        'Bulk approve attendance corrections'
      );

      // Test 18: Edit Attendance Record
      await this.testEndpoint(
        'PUT', 
        `/admin/attendance/${sampleRecordId}/edit`, 
        this.adminToken,
        { 
          clockIn: '09:00:00',
          clockOut: '17:00:00',
          reason: 'Test edit'
        },
        'Edit specific attendance record'
      );

      // Test 19: Legacy Update Attendance
      await this.testEndpoint(
        'PUT', 
        `/admin/attendance/${sampleRecordId}`, 
        this.adminToken,
        { 
          clockIn: '09:00:00',
          clockOut: '17:00:00',
          reason: 'Legacy test edit'
        },
        'Legacy endpoint - Update attendance record'
      );

    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    }

    // Generate summary
    this.generateSummary();
  }

  generateSummary() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = this.results.filter(r => r.status === 'FAIL').length;

    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(result => {
          console.log(`  • ${result.endpoint}: ${result.error}`);
        });
    }

    // Save detailed results to file
    const detailedResults = {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate: ((passedTests / totalTests) * 100).toFixed(1) + '%',
        timestamp: new Date().toISOString()
      },
      results: this.results
    };

    fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(detailedResults, null, 2));
    console.log(`\n📄 Detailed results saved to: ${TEST_RESULTS_FILE}`);
  }
}

// Run the tests
async function runTests() {
  const tester = new AdminAttendanceRouteTester();
  await tester.runAllTests();
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  });
}

export default AdminAttendanceRouteTester;