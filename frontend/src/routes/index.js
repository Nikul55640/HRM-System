// Central route configuration
import { lazy } from 'react';

// Import route configurations
import { adminRoutes as adminRoutesConfig } from './adminRoutes';
import { employeeRoutes as employeeRoutesConfig } from './employeeRoutes';
import { dashboardRoutes as dashboardRoutesConfig } from './dashboardRoutes';
import { essRoutes as essRoutesConfig } from './essRoutes';
import { hrRoutes as hrRoutesConfig } from './hrRoutes';
import { organizationRoutes as organizationRoutesConfig } from './organizationRoutes';
import { calendarRoutes as calendarRoutesConfig } from './calendarRoutes';
import { generalRoutes as generalRoutesConfig } from './generalRoutes';
import { leadRoutes as leadRoutesConfig } from './leadRoutes';

// Route configuration object
export const routeConfig = {
  // Public routes (no authentication required)
  public: [
    {
      path: '/login',
      component: lazy(() => import('../modules/auth/pages/Login')),
      exact: true
    }
  ],

  // Protected routes (authentication required)
  protected: [
    {
      path: '/dashboard/*',
      component: lazy(() => import('./dashboardRoutes')),
      roles: ['SuperAdmin', 'HR', 'Employee']
    },
    {
      path: '/admin/*',
      component: lazy(() => import('./adminRoutes')),
      roles: ['SuperAdmin', 'HR']
    },
    {
      path: '/employee/*',
      component: lazy(() => import('./essRoutes')),
      roles: ['Employee', 'HR', 'SuperAdmin']
    }
  ],

  // Default redirects based on role
  defaultRedirects: {
    SuperAdmin: '/dashboard',
    HR: '/dashboard',
    Employee: '/dashboard'
  }
};

// Module route mappings for 8 Core Features
export const moduleRoutes = {
  // Feature 1: Profile & Bank Details Management
  profile: {
    employee: '/employee/profile',
    bankDetails: '/employee/bank-details'
  },

  // Feature 2: Attendance Management
  attendance: {
    employee: '/employee/attendance',
    admin: '/admin/attendance'
  },

  // Feature 3: Leave Management
  leave: {
    employee: '/employee/leave',
    admin: '/admin/leave',
    balances: '/admin/leave-balances'
  },

  // Feature 4: Employee Management
  employees: {
    admin: '/admin/employees',
    departments: '/admin/departments',
    users: '/admin/users'
  },

  // Feature 5: Lead Management
  leads: {
    employee: '/employee/leads',
    admin: '/admin/leads'
  },

  // Feature 6: Shift Management
  shifts: {
    employee: '/employee/shifts',
    admin: '/admin/shifts'
  },

  // Feature 7: Calendar & Events
  calendar: {
    employee: '/employee/calendar',
    events: '/admin/events',
    holidays: '/admin/holidays'
  },

  // Feature 8: Audit Logs
  audit: {
    logs: '/admin/audit-logs'
  },

  // System Configuration
  system: {
    policies: '/admin/system-policies'
  }
};

// Get default route for user role
export const getDefaultRoute = (userRole) => {
  return routeConfig.defaultRedirects[userRole] || '/dashboard';
};

// Export individual route configurations
export const adminRoutes = adminRoutesConfig;
export const employeeRoutes = employeeRoutesConfig;
export const dashboardRoutes = dashboardRoutesConfig;
export const essRoutes = essRoutesConfig;
export const hrRoutes = hrRoutesConfig;
export const organizationRoutes = organizationRoutesConfig;
export const calendarRoutes = calendarRoutesConfig;
export const generalRoutes = generalRoutesConfig;
export const leadRoutes = leadRoutesConfig;

export default routeConfig;