import { lazy } from "react";

const UnifiedCalendar = lazy(() => import("../modules/attendance/calendar/UnifiedCalendar"));
const DailyCalendarView = lazy(() => import("../modules/attendance/calendar/DailyCalendarView"));
const MonthlyCalendarView = lazy(() => import("../modules/attendance/calendar/MonthlyCalendarView"));

export const calendarRoutes = [
  { path: "calendar", element: <UnifiedCalendar /> },
  { path: "calendar/daily", element: <DailyCalendarView /> },
  { path: "calendar/monthly", element: <MonthlyCalendarView /> },
];
