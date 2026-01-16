// Test Configuration
export const testConfig = {
  // API Configuration
  baseUrl: process.env.API_URL || 'http://localhost:5000/api',
  timeout: 10000, // 10 seconds
  
  // Test Credentials
  credentials: {
    admin: {
      email: process.env.TEST_EMAIL || 'admin@example.com',
      password: process.env.TEST_PASSWORD || 'admin123'
    },
    employee: {
      email: process.env.TEST_EMPLOYEE_EMAIL || 'employee@example.com',
      password: process.env.TEST_EMPLOYEE_PASSWORD || 'employee123'
    },
    manager: {
      email: process.env.TEST_MANAGER_EMAIL || 'manager@example.com',
      password: process.env.TEST_MANAGER_PASSWORD || 'manager123'
    }
  },
  
  // Test Options
  options: {
    verbose: process.env.VERBOSE === 'true',
    saveReport: process.env.SAVE_REPORT === 'true',
    reportPath: './tests/reports',
    stopOnFailure: process.env.STOP_ON_FAILURE === 'true'
  },
  
  // Endpoints to test
  endpoints: {
    auth: [
      { method: 'POST', path: '/auth/login', requiresAuth: false },
      { method: 'GET', path: '/auth/verify', requiresAuth: true },
      { method: 'GET', path: '/auth/me', requiresAuth: true },
      { method: 'POST', path: '/auth/logout', requiresAuth: true }
    ],
    admin: {
      dashboard: [
        { method: 'GET', path: '/admin/dashboard/stats' },
        { method: 'GET', path: '/admin/dashboard/recent-activity' }
      ],
      employees: [
        { method: 'GET', path: '/employees' },
        { method: 'GET', path: '/admin/employee-management' }
      ],
      attendance: [
        { method: 'GET', path: '/admin/attendance' },
        { method: 'GET', path: '/admin/attendance/live' },
        { method: 'GET', path: '/admin/attendance/stats' }
      ],
      leave: [
        { method: 'GET', path: '/admin/leave' },
        { method: 'GET', path: '/admin/leave-balances' }
      ]
    },
    employee: {
      profile: [
        { method: 'GET', path: '/employee/profile' },
        { method: 'GET', path: '/employee/dashboard' }
      ],
      attendance: [
        { method: 'GET', path: '/employee/attendance' },
        { method: 'GET', path: '/employee/attendance/today' }
      ],
      leave: [
        { method: 'GET', path: '/employee/leave' },
        { method: 'GET', path: '/employee/leave/balance' }
      ]
    }
  }
};

export default testConfig;
