/**
 * API Connection Test Utility
 * Tests all employee backend APIs to verify frontend-backend connectivity
 */

import api from '../core/services/api';
import employeeSelfService from '../services/employeeSelfService';
import leaveService from '../core/services/leaveService';

const apiConnectionTest = {
  /**
   * Test all employee API endpoints
   */
  async testAllEmployeeAPIs() {
    const results = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    const addTest = (name, status, error = null, response = null) => {
      results.totalTests++;
      if (status === 'PASS') results.passed++;
      else results.failed++;
      
      results.tests.push({
        name,
        status,
        error: error?.message || error,
        response: response ? 'Data received' : null,
        timestamp: new Date().toISOString()
      });
    };

    console.log('🧪 Starting API Connection Tests...');

    // Test 1: Profile APIs
    try {
      const profile = await employeeSelfService.profile.get();
      addTest('GET /employee/profile', 'PASS', null, profile);
    } catch (error) {
      addTest('GET /employee/profile', 'FAIL', error);
    }

    // Test 2: Leave Balance APIs
    try {
      const balance = await leaveService.getMyLeaveBalance();
      addTest('GET /employee/leave-balance', 'PASS', null, balance);
    } catch (error) {
      addTest('GET /employee/leave-balance', 'FAIL', error);
    }

    // Test 3: Leave History APIs
    try {
      const history = await leaveService.getMyLeaveHistory();
      addTest('GET /employee/leave-requests', 'PASS', null, history);
    } catch (error) {
      addTest('GET /employee/leave-requests', 'FAIL', error);
    }

    // Test 4: Leave Export API
    try {
      const response = await api.get('/employee/leave-balance/export');
      addTest('GET /employee/leave-balance/export', 'PASS', null, response);
    } catch (error) {
      // This might fail if user has no leave balance data
      if (error.response?.status === 400) {
        addTest('GET /employee/leave-balance/export', 'PASS', 'No leave data (expected)', null);
      } else {
        addTest('GET /employee/leave-balance/export', 'FAIL', error);
      }
    }

    // Test 5: Attendance APIs
    try {
      const attendance = await employeeSelfService.attendance.list();
      addTest('GET /employee/attendance', 'PASS', null, attendance);
    } catch (error) {
      addTest('GET /employee/attendance', 'FAIL', error);
    }

    // Test 6: Attendance Today
    try {
      const todayAttendance = await employeeSelfService.attendance.getToday();
      addTest('GET /employee/attendance/today', 'PASS', null, todayAttendance);
    } catch (error) {
      addTest('GET /employee/attendance/today', 'FAIL', error);
    }

    // Test 7: Bank Details APIs
    try {
      const bankDetails = await employeeSelfService.bankDetails.get();
      addTest('GET /employee/bank-details', 'PASS', null, bankDetails);
    } catch (error) {
      // Bank details not found is expected for new employees
      if (error.response?.status === 404) {
        addTest('GET /employee/bank-details', 'PASS', 'No bank details (expected)', null);
      } else {
        addTest('GET /employee/bank-details', 'FAIL', error);
      }
    }

    // Test 8: Notifications APIs
    try {
      const notifications = await employeeSelfService.notifications.list();
      addTest('GET /employee/notifications', 'PASS', null, notifications);
    } catch (error) {
      addTest('GET /employee/notifications', 'FAIL', error);
    }

    // Test 9: Notifications Unread Count
    try {
      const unreadCount = await employeeSelfService.notifications.getUnreadCount();
      addTest('GET /employee/notifications/unread-count', 'PASS', null, unreadCount);
    } catch (error) {
      addTest('GET /employee/notifications/unread-count', 'FAIL', error);
    }

    // Test 10: Payslips APIs
    try {
      const payslips = await employeeSelfService.payslips.list();
      addTest('GET /employee/payslips', 'PASS', null, payslips);
    } catch (error) {
      addTest('GET /employee/payslips', 'FAIL', error);
    }

    // Test 11: Documents APIs
    try {
      const documents = await employeeSelfService.documents.list();
      addTest('GET /employee/profile/documents', 'PASS', null, documents);
    } catch (error) {
      addTest('GET /employee/profile/documents', 'FAIL', error);
    }

    // Test 12: Dashboard Data
    try {
      const response = await api.get('/employee/dashboard');
      addTest('GET /employee/dashboard', 'PASS', null, response);
    } catch (error) {
      addTest('GET /employee/dashboard', 'FAIL', error);
    }

    // Test 13: Calendar Data
    try {
      const response = await api.get('/employee/calendar');
      addTest('GET /employee/calendar', 'PASS', null, response);
    } catch (error) {
      addTest('GET /employee/calendar', 'FAIL', error);
    }

    // Test 14: Shifts Data
    try {
      const response = await api.get('/employee/shifts');
      addTest('GET /employee/shifts', 'PASS', null, response);
    } catch (error) {
      addTest('GET /employee/shifts', 'FAIL', error);
    }

    return results;
  },

  /**
   * Test specific API endpoint
   */
  async testEndpoint(method, endpoint, data = null) {
    try {
      let response;
      switch (method.toUpperCase()) {
        case 'GET':
          response = await api.get(endpoint);
          break;
        case 'POST':
          response = await api.post(endpoint, data);
          break;
        case 'PUT':
          response = await api.put(endpoint, data);
          break;
        case 'DELETE':
          response = await api.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      return {
        success: true,
        status: response.status,
        data: response.data,
        message: 'API call successful'
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 'NETWORK_ERROR',
        error: error.message,
        message: 'API call failed'
      };
    }
  },

  /**
   * Generate test report
   */
  generateReport(results) {
    const report = `
# API Connection Test Report
Generated: ${results.timestamp}

## Summary
- **Total Tests**: ${results.totalTests}
- **Passed**: ${results.passed} ✅
- **Failed**: ${results.failed} ❌
- **Success Rate**: ${((results.passed / results.totalTests) * 100).toFixed(1)}%

## Test Results
${results.tests.map(test => `
### ${test.name}
- **Status**: ${test.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}
- **Time**: ${test.timestamp}
${test.error ? `- **Error**: ${test.error}` : ''}
${test.response ? `- **Response**: ${test.response}` : ''}
`).join('')}

## Issues Found
${results.tests.filter(t => t.status === 'FAIL').map(test => `
- **${test.name}**: ${test.error}
`).join('')}
`;

    return report;
  }
};

export default apiConnectionTest;