# Calendar Module

A comprehensive calendar system for the HRM application that displays events, holidays, leaves, birthdays, anniversaries, and attendance data.

## Components

### CalendarGrid
The main calendar grid component that displays a monthly view with:
- Navigation controls (previous/next month, today button)
- Day headers
- Calendar cells with events and attendance indicators

### CalendarCell
Individual calendar cell component that shows:
- Date number
- Event indicators (holidays, leaves, birthdays, anniversaries)
- Attendance status indicators
- Visual styling for today, selected date, and current month

### CalendarSidebar
Sidebar component displaying:
- Monthly summary statistics
- Upcoming events (next 7 days)
- Quick stats overview
- Leave types breakdown
- Attendance summary

## Pages

### CalendarPage
Main calendar page that integrates all components and provides:
- Full calendar view with sidebar
- View type selector (Month/Week/Day)
- Export functionality
- Add event button

### CalendarTestPage
Development test page for verifying calendar API functionality:
- Tests monthly calendar data endpoint
- Tests daily calendar data endpoint
- Displays test results and raw data
- Shows current user context

## Services

### calendarViewService
Service for interacting with calendar APIs:
- `getMonthlyCalendarData()` - Fetch monthly calendar data
- `getDailyCalendarData()` - Fetch daily calendar data
- `applyLeaveFromCalendar()` - Apply for leave from calendar
- `exportCalendarData()` - Export calendar data

## Store

### useCalendarStore
Zustand store for calendar state management:
- Current date and selected date
- Calendar data and loading states
- Navigation helpers
- Data filtering helpers

## Features

- **Multi-role Support**: Different data visibility based on user role (Employee, Manager, HR, Admin)
- **Event Types**: Holidays, company events, leaves, birthdays, anniversaries
- **Attendance Integration**: Shows attendance status on calendar cells
- **Responsive Design**: Works on desktop and mobile devices
- **Export Functionality**: Export calendar data to Excel
- **Real-time Updates**: Automatic data refresh when navigating months

## Usage

```jsx
import { CalendarPage } from '../modules/calendar';

// Use in routes
<Route path="/calendar" element={<CalendarPage />} />
```

## API Endpoints

- `GET /api/calendar/view/monthly` - Get monthly calendar data
- `GET /api/calendar/view/daily` - Get daily calendar data
- `POST /api/calendar/view/apply-leave` - Apply for leave from calendar
- `GET /api/calendar/export` - Export calendar data

## Permissions

Calendar access is controlled by the `MODULES.LEAVE.VIEW_CALENDAR` permission.

## Navigation

Calendar is accessible through the sidebar under the "Calendar" section:
- Calendar Overview (`/calendar`)
- Calendar Test (`/calendar/test`)
- Attendance Calendar (`/calendar/attendance`)