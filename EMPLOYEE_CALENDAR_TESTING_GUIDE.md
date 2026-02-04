# Employee Calendar Testing Guide

## Issue Summary
The Employee Calendar should show records for **all employees** (leaves, birthdays, anniversaries, holidays, company events), not just the logged-in employee.

## Current Status
✅ **Backend is correctly configured** - The API already returns data for all employees
✅ **Frontend service is correctly configured** - The service processes all employee data
✅ **Frontend component is correctly configured** - The calendar displays all events

## The Real Issue
The calendar is working correctly, but there's **insufficient test data** for the current date (February 2026).

## Testing Steps

### Step 1: Add Test Data
Run the test data script to add sample events for February 2026:

```bash
cd HRM-System/backend
node test-calendar-data.js
```

This will add:
- 2 holidays (Presidents' Day, Valentine's Day)
- 2-3 leave requests from different employees
- 2 company events

### Step 2: Test the API
Verify the API returns all employees' data:

```bash
cd HRM-System/backend
node test-employee-calendar-api.js
```

This will:
- Login as John (employee)
- Fetch February 2026 calendar data
- Show detailed breakdown of all events
- Verify all employees' data is included

### Step 3: Test in Browser
1. Start the development servers:
   ```bash
   cd HRM-System
   npm run dev
   ```

2. Login as John (employee):
   - Email: `john@hrm.com`
   - Password: `john123`

3. Navigate to Employee Calendar
4. Check February 2026 - you should now see:
   - ✅ Holidays for all employees
   - ✅ Leave requests from different employees
   - ✅ Birthdays from all employees (if any in February)
   - ✅ Work anniversaries from all employees (if any in February)
   - ✅ Company events

### Step 4: Verify Different Months
Test other months to see birthdays and anniversaries:
- March 2026: Should show John Smith's birthday (March 15)
- July 2026: Should show Sarah Johnson's birthday (July 22)

## What the Calendar Shows

### ✅ All Employee Data (Company-Wide)
- **Holidays**: All company holidays
- **Leaves**: Leave requests from ALL employees (approved leaves only)
- **Birthdays**: Birthdays of ALL employees
- **Work Anniversaries**: Work anniversaries of ALL employees  
- **Company Events**: Company-wide meetings, events, announcements

### ✅ Personal Data (Logged-in Employee Only)
- **Personal Attendance**: Only the logged-in employee's attendance
- **Personal Leave Status**: Only the logged-in employee's leave applications

## Security & Privacy
The calendar is designed to be **employee-safe**:
- ✅ Shows employee names and leave types (public information)
- ❌ Does NOT show sensitive details like leave reasons, salary, personal info
- ✅ Only shows approved leaves (not pending/rejected)
- ✅ Shows public celebration events (birthdays, anniversaries)

## Troubleshooting

### No Events Showing?
1. **Check the date**: Make sure you're viewing a month with test data
2. **Add test data**: Run `node backend/test-calendar-data.js`
3. **Check console**: Look for API errors in browser dev tools
4. **Verify backend**: Run `node backend/test-employee-calendar-api.js`

### Only Seeing Own Data?
This is expected for:
- ✅ **Attendance records** (personal only)
- ✅ **Leave application status** (personal only)

This is NOT expected for:
- ❌ **Other employees' approved leaves** (should show all)
- ❌ **Birthdays** (should show all)
- ❌ **Holidays** (should show all)

### API Errors?
1. Check backend server is running on `http://localhost:5000`
2. Check database connection
3. Verify user authentication
4. Check browser network tab for failed requests

## Expected Behavior

### Month View
- Shows all days of the month
- Each day shows colored indicators for different event types
- Hover shows detailed tooltip with all events for that day
- Click opens detailed drawer with full event list

### Event Types & Colors
- 🔴 **Holidays**: Red background
- 🟠 **Leaves**: Orange background  
- 🟢 **Birthdays**: Green background
- 🟣 **Anniversaries**: Purple background
- 🔵 **Company Events**: Blue background

### Multi-Employee Display
- Leave events show: "Employee Name - Leave Type"
- Birthday events show: "Employee Name's Birthday"
- Anniversary events show: "Employee Name's Work Anniversary (X years)"

## Success Criteria
✅ Calendar shows events from multiple employees
✅ Leave requests from different employees are visible
✅ All company holidays are displayed
✅ Birthdays from all employees appear on correct dates
✅ Work anniversaries from all employees appear on correct dates
✅ Company events are visible to all employees
✅ No sensitive personal information is exposed
✅ Performance is good (no excessive API calls)

## Development Notes
- The backend controller fetches ALL employees and their data
- The frontend service processes and categorizes all events
- The calendar component displays events with proper priority and colors
- Security is maintained by only exposing safe, public information