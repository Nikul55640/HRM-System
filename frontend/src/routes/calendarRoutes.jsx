import { lazy } from "react";

const CalendarView = lazy(() => import("../modules/calendar/pages/CalendarView"));
const DailyCalendarView = lazy(() => import("../modules/calendar/pages/DailyCalendarView"));
const MonthlyCalendarView = lazy(() => import("../modules/calendar/pages/MonthlyCalendarView"));

export const calendarRoutes = [
  { path: "/admin/calendar", element: <CalendarView /> },
  { path: "/employee/calendar", element: <CalendarView /> },
  { path: "/employee/calendar/daily", element: <DailyCalendarView /> },
  { path: "/employee/calendar/monthly", element: <MonthlyCalendarView /> },
];
