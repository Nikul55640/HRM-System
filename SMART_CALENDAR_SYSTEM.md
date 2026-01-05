# 🎯 Smart Calendar System - Implementation Guide

## Overview

Your HRM system now has a **Smart Calendar System** that implements enterprise-grade calendar management with:

- ✅ **Working Rules Management** - Centralized weekend/working day configuration
- ✅ **Smart Holiday System** - One-time and recurring holidays without yearly maintenance
- ✅ **Intelligent Day Status** - Automatic working/non-working day evaluation
- ✅ **Leave Integration** - Smart leave validation against working rules
- ✅ **Event Separation** - Events don't block attendance (only holidays do)
- ✅ **Future-Proof Design** - No manual yearly calendar updates needed

## 🏗️ Architecture

### 3-Layer Calendar System

```
📅 Smart Calendar System
├── 🔧 Working Rules (Weekends & Working Days)
├── 🏖️ Holidays (One-time & Recurring)
└── 🎉 Events (Meetings / Trainings / Notices)
```

### Database Models

#### 1. **WorkingRule** - Weekend/Working Day Management
```sql
working_rules:
- workingDays: [1,2,3,4,5]  -- Mon-Fri
- weekendDays: [0,6]        -- Sun & Sat
- effectiveFrom/To          -- Date ranges
- isDefault, isActive       -- Status flags
```

#### 2. **Holiday** - Smart Holiday Management
```sql
holidays:
- type: 'ONE_TIME' | 'RECURRING'
- date: '2025-08-15'           -- For one-time holidays
- recurringDate: '08-15'       -- MM-DD for recurring
- category: 'public' | 'national' | 'company' | etc.
- appliesEveryYear: boolean
```

#### 3. **CompanyEvent** - Event Management (Updated)
```sql
company_events:
- eventType: 'meeting' | 'training' | 'announcement' | etc.
- NOTE: 'holiday' type removed (holidays are separate)
- Events are informational, don't block attendance
```

## 🚀 Installation & Setup

### 1. Run Database Migration

```bash
cd HRM-System/backend
node run-smart-calendar-migration.js
```

This will:
- Create `working_rules` table
- Update `holidays` table structure
- Insert default working rule (Mon-Fri)
- Convert existing holidays to new format

### 2. Restart Backend Server

```bash
npm run dev
# or
npm start
```

### 3. Access Smart Calendar Management

Navigate to: **Admin Panel → Calendar Management → Smart Calendar**

## 📋 Key Features

### 1. Working Rules Management

**What it does:**
- Centralized weekend/working day configuration
- Date-range based rules (can change over time)
- Default rule system

**Example Working Rules:**
```javascript
// Standard Mon-Fri
{
  ruleName: "Standard Monday-Friday",
  workingDays: [1, 2, 3, 4, 5],
  weekendDays: [0, 6],
  effectiveFrom: "2024-01-01"
}

// Alternate Saturday
{
  ruleName: "Alternate Saturday Off",
  workingDays: [1, 2, 3, 4, 5, 6], // Include Saturday
  weekendDays: [0],                 // Only Sunday
  effectiveFrom: "2025-01-01"
}
```

### 2. Smart Holiday System

**Recurring Holidays (Set Once, Works Forever):**
```javascript
{
  name: "Independence Day",
  type: "RECURRING",
  recurringDate: "08-15",  // MM-DD format
  appliesEveryYear: true
}
```

**One-Time Holidays:**
```javascript
{
  name: "Company Anniversary 2025",
  type: "ONE_TIME",
  date: "2025-03-15"
}
```

### 3. Intelligent Day Status Evaluation

**Priority Logic:**
1. **Weekend** → Non-working (highest priority)
2. **Holiday** → Non-working
3. **Leave** → Non-working (employee-specific)
4. **Working Day** → Working (default)

**Example API Response:**
```javascript
{
  status: "HOLIDAY",
  type: "non_working",
  attendanceRequired: false,
  reason: "Independence Day",
  holiday: { name: "Independence Day", ... }
}
```

## 🔌 API Endpoints

### Smart Calendar APIs

```javascript
// Monthly calendar with smart day evaluation
GET /api/calendar/smart/monthly?year=2025&month=8

// Daily calendar with day status
GET /api/calendar/smart/daily?date=2025-08-15

// Validate leave application
POST /api/calendar/smart/validate-leave
{
  startDate: "2025-08-14",
  endDate: "2025-08-16",
  employeeId: 123
}

// Get working days count
GET /api/calendar/smart/working-days?startDate=2025-08-01&endDate=2025-08-31
```

### Working Rules APIs

```javascript
// Get all working rules
GET /api/admin/working-rules

// Get active working rule
GET /api/admin/working-rules/active

// Create working rule
POST /api/admin/working-rules

// Check if date is working day
GET /api/admin/working-rules/check/2025-08-15
```

### Enhanced Holiday APIs

```javascript
// Create smart holiday
POST /api/admin/holidays
{
  name: "Diwali",
  type: "RECURRING",
  recurringDate: "10-24",  // MM-DD
  category: "religious"
}

// Get recurring holidays
GET /api/admin/holidays?type=RECURRING

// Get one-time holidays for year
GET /api/admin/holidays?type=ONE_TIME&year=2025
```

## 💻 Frontend Integration

### Smart Calendar Service

```javascript
import smartCalendarService from '../services/smartCalendarService';

// Get monthly calendar
const calendar = await smartCalendarService.getSmartMonthlyCalendar({
  year: 2025,
  month: 8
});

// Validate leave
const validation = await smartCalendarService.validateLeaveApplication({
  startDate: '2025-08-14',
  endDate: '2025-08-16',
  employeeId: 123
});

// Check working day
const dayStatus = await smartCalendarService.checkWorkingDay('2025-08-15');
```

### Smart Calendar Management Component

```jsx
import SmartCalendarManagement from '../modules/calendar/admin/SmartCalendarManagement';

// Use in admin routes
<Route path="/admin/calendar/smart" component={SmartCalendarManagement} />
```

## 🔄 Migration from Old System

### Automatic Conversion

The migration script automatically:

1. **Converts existing holidays** to new format
2. **Creates default working rule** (Mon-Fri)
3. **Updates holiday table structure**
4. **Preserves existing data**

### Manual Steps (if needed)

1. **Review converted holidays** in admin panel
2. **Set up recurring holidays** for common holidays
3. **Configure working rules** for your organization
4. **Test calendar functionality**

## 🎯 Benefits Achieved

### ✅ No More Yearly Work
- **Before:** Add holidays every year manually
- **After:** Set recurring holidays once, works forever

### ✅ Flexible Working Days
- **Before:** Fixed weekends in shift model
- **After:** Centralized, date-range based working rules

### ✅ Smart Leave Validation
- **Before:** Manual validation against holidays
- **After:** Automatic validation with detailed feedback

### ✅ Proper Event Separation
- **Before:** Events mixed with holidays
- **After:** Clear separation - only holidays block attendance

### ✅ Enterprise-Grade Logic
- **Before:** Simple date checks
- **After:** Priority-based day status evaluation

## 🧪 Testing the System

### 1. Test Working Rules

```bash
# Check if today is working day
curl "http://localhost:5000/api/admin/working-rules/check/2025-01-15"

# Get active working rule
curl "http://localhost:5000/api/admin/working-rules/active"
```

### 2. Test Smart Holidays

```bash
# Get monthly calendar
curl "http://localhost:5000/api/calendar/smart/monthly?year=2025&month=8"

# Check daily status
curl "http://localhost:5000/api/calendar/smart/daily?date=2025-08-15"
```

### 3. Test Leave Validation

```bash
curl -X POST "http://localhost:5000/api/calendar/smart/validate-leave" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2025-08-14",
    "endDate": "2025-08-16",
    "employeeId": 123
  }'
```

## 🔧 Configuration Examples

### Common Working Rules

```javascript
// Standard 5-day week
{
  ruleName: "Monday to Friday",
  workingDays: [1, 2, 3, 4, 5],
  weekendDays: [0, 6]
}

// 6-day week (Sunday off)
{
  ruleName: "Monday to Saturday",
  workingDays: [1, 2, 3, 4, 5, 6],
  weekendDays: [0]
}

// Custom week (Tuesday-Saturday)
{
  ruleName: "Tuesday to Saturday",
  workingDays: [2, 3, 4, 5, 6],
  weekendDays: [0, 1]
}
```

### Common Recurring Holidays

```javascript
// Indian National Holidays
[
  { name: "Republic Day", recurringDate: "01-26" },
  { name: "Independence Day", recurringDate: "08-15" },
  { name: "Gandhi Jayanti", recurringDate: "10-02" }
]

// International Holidays
[
  { name: "New Year's Day", recurringDate: "01-01" },
  { name: "Christmas Day", recurringDate: "12-25" }
]

// Company Holidays
[
  { name: "Company Foundation Day", recurringDate: "03-15" },
  { name: "Annual Day", recurringDate: "12-20" }
]
```

## 🚨 Important Notes

### Database Changes
- **New table:** `working_rules`
- **Updated table:** `holidays` (structure changed)
- **Existing data:** Preserved and converted

### API Changes
- **New endpoints:** `/api/calendar/smart/*`
- **New endpoints:** `/api/admin/working-rules/*`
- **Enhanced:** Holiday APIs support new format
- **Backward compatibility:** Old calendar APIs still work

### Frontend Changes
- **New component:** `SmartCalendarManagement`
- **New service:** `smartCalendarService`
- **Enhanced:** Calendar views with smart day status

## 🎉 Success!

Your HRM system now has a **Smart Calendar System** that:

1. **Eliminates yearly holiday maintenance**
2. **Provides flexible working day configuration**
3. **Offers intelligent day status evaluation**
4. **Integrates seamlessly with attendance & leave**
5. **Scales for future requirements**

The system is **production-ready** and follows **enterprise best practices** for calendar management in HR systems! 🚀