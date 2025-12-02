import { lazy } from "react";

const UnifiedCalendar = lazy(() => import("../features/calendar/UnifiedCalendar"));
const DailyCalendarView = lazy(() => import("../features/calendar/DailyCalendarView"));
const MonthlyCalendarView = lazy(() => import("../features/calendar/MonthlyCalendarView"));

export const calendarRoutes = [
  { path: "calendar", element: UnifiedCalendar },
  { path: "calendar/daily", element: DailyCalendarView },
  { path: "calendar/monthly", element: MonthlyCalendarView },
];
