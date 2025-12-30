// src/routes/routeConfig.js
// Navigation & redirection helpers only

export const defaultRedirects = {
  SuperAdmin: "/dashboard",
  "HR Administrator": "/dashboard",
  "HR Manager": "/dashboard",
  Employee: "/dashboard",
};

export const getDefaultRoute = (userRole) => {
  return defaultRedirects[userRole] || "/dashboard";
};

export const moduleRoutes = {
  dashboard: "/dashboard",

  // Employee Self Service
  profile: "/profile",
  bankDetails: "/bank-details",
  attendance: "/attendance",
  leave: "/leave",
  calendar: "/calendar",
  shifts: "/shifts",
  leads: "/leads",

  // Admin / HR
  employees: "/employees",
  departments: "/departments",
  designations: "/designations",
  attendanceManage: "/attendance/manage",
  attendanceCorrections: "/attendance/corrections",
  attendanceLive: "/attendance/live",
  leaveBalances: "/leave-balances",
  calendarManagement: "/calendar/management",
  users: "/users",
  systemPolicies: "/system-policies",
  auditLogs: "/audit-logs",

  // General
  notifications: "/notifications",
  help: "/help",
};
