import { lazy } from "react";

const CalendarView = lazy(() => import("../modules/calendar/pages/CalendarView"));
const DailyCalendarView = lazy(() => import("../modules/calendar/pages/DailyCalendarView"));
const MonthlyCalendarView = lazy(() => import("../modules/calendar/pages/MonthlyCalendarView"));

export const calendarRoutes = [
  // Employee calendar
  { path: "calendar/daily", element: <DailyCalendarView />, roles: ["Employee", "HR", "SuperAdmin"] },
  { path: "calendar/monthly", element: <MonthlyCalendarView />, roles: ["Employee", "HR", "SuperAdmin"] },

  // Admin calendar (if same UI)
  { path: "admin/calendar", element: <CalendarView />, roles: ["HR", "SuperAdmin"] },
];
