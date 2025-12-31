import { lazy } from "react";

const EmployeeCalendarPage = lazy(() => import("../modules/calendar/employee/EmployeeCalendarPage"));
const CalendarView = lazy(() => import("../modules/calendar/pages/CalendarView"));

export const calendarRoutes = [
  // Employee calendar - unified view
  { path: "calendar", element: <EmployeeCalendarPage />, roles: ["Employee", "HR", "SuperAdmin"] },

  // Admin calendar management
  { path: "admin/calendar", element: <CalendarView />, roles: ["HR", "SuperAdmin"] },
];
