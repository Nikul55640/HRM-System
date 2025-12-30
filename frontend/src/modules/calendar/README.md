# Calendar Module Consolidation

## Overview
The calendar functionality has been consolidated from two separate components into a unified system that serves both admin management and general calendar viewing needs.

## Components

### UnifiedCalendarView
- **Location**: `src/modules/calendar/components/UnifiedCalendarView.jsx`
- **Purpose**: Core calendar component that handles both calendar view and list view modes
- **Props**:
  - `viewMode`: 'calendar' | 'list' - Controls display format
  - `showManagementFeatures`: boolean - Shows/hides admin management features

### CalendarManagement (Admin)
- **Location**: `src/modules/calendar/admin/CalendarManagement.jsx`
- **Purpose**: Admin wrapper for calendar management with list view and full CRUD operations
- **Route**: `/admin/calendar/management`

### CalendarView (General)
- **Location**: `src/modules/calendar/pages/CalendarView.jsx`
- **Purpose**: General calendar view for all users with read-only access
- **Routes**: `/admin/calendar`, `/employee/calendar`

## Features

### Admin Features (when `showManagementFeatures=true`)
- Create, edit, delete events and holidays
- Sync employee birthdays and anniversaries
- Advanced filtering and search
- List view with detailed management options

### General Features
- Calendar grid view with monthly navigation
- Event display with color coding by type
- Permission-based access control
- Responsive design

## Event Types
- **Holiday**: Company holidays (red)
- **Event**: Company events (blue)
- **Leave**: Employee leave (orange)
- **Birthday**: Employee birthdays (pink)
- **Anniversary**: Work anniversaries (purple)
- **Meeting**: Meetings (green)
- **Training**: Training sessions (indigo)

## Permissions
Uses the `usePermissions` hook with `MODULES.CALENDAR.MANAGE` to control access to management features.

## Service Integration
Integrates with `calendarService` for all API operations including:
- `getCalendarEvents()` - Fetch events and holidays
- `getHolidays()` - Fetch holidays by year
- `createEvent()` / `updateEvent()` / `deleteEvent()` - Event CRUD
- `createHoliday()` / `updateHoliday()` / `deleteHoliday()` - Holiday CRUD
- `syncEmployeeEvents()` - Sync birthdays and anniversaries