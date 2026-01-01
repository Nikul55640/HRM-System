import { lazy } from "react";

const EmployeeCalendarPage = lazy(() => import("../modules/calendar/employee/EmployeeCalendarPage"));
const CalendarView = lazy(() => import("../modules/calendar/pages/CalendarView"));

export const calendarRoutes = [
  // Admin calendar management
  { path: "admin/calendar", element: <CalendarView />, roles: ["HR", "SuperAdmin"] },
];
