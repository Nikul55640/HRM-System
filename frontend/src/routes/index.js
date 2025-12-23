// Central route configuration
import { lazy } from 'react';

// Import route configurations
import { adminRoutes as adminRoutesConfig } from './adminRoutes';
import { managerRoutes as managerRoutesConfig } from './managerRoutes';
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
      roles: ['admin', 'manager', 'employee']
    },
    {
      path: '/admin/*',
      component: lazy(() => import('./adminRoutes')),
      roles: ['admin']
    },
    {
      path: '/manager/*',
      component: lazy(() => import('./managerRoutes')),
      roles: ['manager', 'admin']
    },
    {
      path: '/employee/*',
      component: lazy(() => import('./employeeRoutes')),
      roles: ['employee', 'manager', 'admin']
    }
  ],

  // Default redirects based on role
  defaultRedirects: {
    admin: '/admin/dashboard',
    manager: '/manager/dashboard',
    employee: '/employee/dashboard'
  }
};

// Module route mappings
export const moduleRoutes = {
  // Organization module routes
  organization: {
    admin: {
      systemConfig: '/admin/organization/system-config',
      userManagement: '/admin/organization/users',
      customFields: '/admin/organization/custom-fields'
    }
  },

  // ESS module routes
  ess: {
    profile: '/employee/profile',
    settings: '/employee/settings',
    bankDetails: '/employee/bank-details',
    payslips: '/employee/payslips',
    leaveBalance: '/employee/leave-balance',
    attendance: '/employee/attendance'
  },

  // HR module routes
  hr: {
    dashboard: '/hr/dashboard',
    employees: '/hr/employees',
    attendance: '/hr/attendance',
    leave: '/hr/leave'
  },

  // Manager module routes
  manager: {
    dashboard: '/manager/dashboard',
    team: '/manager/team',
    attendance: '/manager/attendance',
    leave: '/manager/leave-requests',
    reports: '/manager/reports'
  },

  // Documents module routes
  documents: {
    list: '/documents',
    upload: '/documents/upload',
    categories: '/documents/categories'
  }
};

// Navigation menu structure
export const navigationConfig = {
  admin: [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: 'dashboard'
    },
    {
      title: 'Organization',
      icon: 'organization',
      children: [
        {
          title: 'System Config',
          path: moduleRoutes.organization.admin.systemConfig
        },
        {
          title: 'User Management',
          path: moduleRoutes.organization.admin.userManagement
        },
        {
          title: 'Custom Fields',
          path: moduleRoutes.organization.admin.customFields
        }
      ]
    },
    {
      title: 'HR Management',
      icon: 'hr',
      children: [
        {
          title: 'Employees',
          path: '/admin/employees'
        },
        {
          title: 'Attendance',
          path: '/admin/attendance'
        },
        {
          title: 'Leave Management',
          path: '/admin/leave'
        }
      ]
    },
    {
      title: 'Documents',
      path: moduleRoutes.documents.list,
      icon: 'documents'
    }
  ],

  manager: [
    {
      title: 'Dashboard',
      path: '/manager/dashboard',
      icon: 'dashboard'
    },
    {
      title: 'My Team',
      path: moduleRoutes.manager.team,
      icon: 'team'
    },
    {
      title: 'Attendance',
      path: moduleRoutes.manager.attendance,
      icon: 'attendance'
    },
    {
      title: 'Leave Requests',
      path: moduleRoutes.manager.leave,
      icon: 'leave'
    },
    {
      title: 'Reports',
      path: moduleRoutes.manager.reports,
      icon: 'reports'
    }
  ],

  employee: [
    {
      title: 'Dashboard',
      path: '/employee/dashboard',
      icon: 'dashboard'
    },
    {
      title: 'My Profile',
      path: moduleRoutes.ess.profile,
      icon: 'profile'
    },
    {
      title: 'Settings',
      path: moduleRoutes.ess.settings,
      icon: 'settings'
    },
    {
      title: 'Bank Details',
      path: moduleRoutes.ess.bankDetails,
      icon: 'bank'
    },
    {
      title: 'Payslips',
      path: moduleRoutes.ess.payslips,
      icon: 'payslips'
    },
    {
      title: 'Leave Balance',
      path: moduleRoutes.ess.leaveBalance,
      icon: 'leave'
    },
    {
      title: 'Attendance',
      path: moduleRoutes.ess.attendance,
      icon: 'attendance'
    },
    {
      title: 'Documents',
      path: moduleRoutes.documents.list,
      icon: 'documents'
    }
  ]
};

// Route permissions helper
export const hasRoutePermission = (userRole, requiredRoles) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.includes(userRole);
};

// Get default route for user role
export const getDefaultRoute = (userRole) => {
  return routeConfig.defaultRedirects[userRole] || '/dashboard';
};

// Export individual route configurations
export const adminRoutes = adminRoutesConfig;
export const managerRoutes = managerRoutesConfig;
export const employeeRoutes = employeeRoutesConfig;
export const dashboardRoutes = dashboardRoutesConfig;
export const essRoutes = essRoutesConfig;
export const hrRoutes = hrRoutesConfig;
export const organizationRoutes = organizationRoutesConfig;
export const calendarRoutes = calendarRoutesConfig;
export const generalRoutes = generalRoutesConfig;
export const leadRoutes = leadRoutesConfig;

export default routeConfig;