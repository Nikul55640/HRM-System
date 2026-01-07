import { lazy } from "react";

const EmployeeCalendarPage = lazy(() => import("../modules/calendar/employee/EmployeeCalendarPage"));
const CalendarView = lazy(() => import("../modules/calendar/pages/CalendarView"));

export const calendarRoutes = [
  // Admin calendar management - HR can view company calendar but not delete holidays
  { path: "admin/calendar", element: <CalendarView />, roles: ["HR", "SuperAdmin"] },
];
