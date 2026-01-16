# Attendance System Flow Diagram

## Complete Attendance Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    ATTENDANCE LIFECYCLE                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  MORNING     │
│  Employee    │
│  Arrives     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│  CLOCK IN (9:00 AM)                  │
│  ✓ Record created                    │
│  ✓ Late check (grace: 10 min)       │
│  ✓ Status: incomplete                │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  WORK DAY                            │
│  • Break sessions tracked            │
│  • Status: incomplete                │
└──────┬───────────────────────────────┘
       │
       ├─────────────────┬──────────────────┐
       │                 │                  │
       ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ SCENARIO 1   │  │ SCENARIO 2   │  │ SCENARIO 3   │
│ Normal       │  │ Forgot       │  │ Never        │
│ Clock-Out    │  │ Clock-Out    │  │ Came         │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Employee     │  │ Employee     │  │ No record    │
│ clocks out   │  │ forgets      │  │ exists       │
│ at 6:00 PM   │  │ to clock out │  │              │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       │                 │                  │
       └─────────────────┴──────────────────┘
                         │
                         ▼
       ┌─────────────────────────────────────────┐
       │  🔥 DAILY FINALIZATION JOB (6:05 PM)    │
       │  Runs automatically every day            │
       └─────────────────┬───────────────────────┘
                         │
                         ▼
       ┌─────────────────────────────────────────┐
       │  FINALIZATION LOGIC                      │
       │  1. Check if holiday/weekend → Skip      │
       │  2. For each employee:                   │
       │     • No record? → Create absent         │
       │     • No clock-out? → Auto clock-out     │
       │     • Calculate hours                    │
       │     • Determine final status             │
       └─────────────────┬───────────────────────┘
                         │
       ┌─────────────────┴─────────────────┐
       │                                    │
       ▼                                    ▼
┌──────────────────┐              ┌──────────────────┐
│ SCENARIO 1       │              │ SCENARIO 2       │
│ Normal Clock-Out │              │ Auto Clock-Out   │
│                  │              │                  │
│ Clock-in: 9:00   │              │ Clock-in: 9:00   │
│ Clock-out: 6:00  │              │ Clock-out: 6:00  │
│ Worked: 9h       │              │ (auto-set)       │
│ Status: present  │              │ Worked: 9h       │
│ ✅ Complete      │              │ Status: present  │
└──────────────────┘              │ ✅ Complete      │
                                  └──────────────────┘
       │
       ▼
┌──────────────────┐
│ SCENARIO 3       │
│ Never Came       │
│                  │
│ No clock-in      │
│ Status: absent   │
│ Reason: "No      │
│ clock-in         │
│ recorded"        │
│ ✅ Complete      │
└──────────────────┘
```

## Status Determination Logic

```
┌─────────────────────────────────────────────────────────────┐
│              WORKED HOURS → STATUS MAPPING                   │
└─────────────────────────────────────────────────────────────┘

Input: Worked Hours
       │
       ▼
┌──────────────────────────────────────┐
│ Is worked hours >= 8?                │
└──────┬───────────────────────────────┘
       │
   YES │                           NO
       ▼                            │
┌──────────────┐                   │
│ Status:      │                   │
│ PRESENT      │                   │
│ Half Day:    │                   │
│ full_day     │                   │
└──────────────┘                   │
                                   ▼
                    ┌──────────────────────────────────┐
                    │ Is worked hours >= 4?            │
                    └──────┬───────────────────────────┘
                           │
                       YES │                       NO
                           ▼                        │
                    ┌──────────────┐               │
                    │ Status:      │               │
                    │ HALF_DAY     │               │
                    │              │               │
                    │ Determine:   │               │
                    │ first_half   │               │
                    │ or           │               │
                    │ second_half  │               │
                    └──────────────┘               │
                                                   ▼
                                        ┌──────────────┐
                                        │ Status:      │
                                        │ LEAVE        │
                                        │              │
                                        │ Reason:      │
                                        │ Insufficient │
                                        │ hours        │
                                        └──────────────┘
```

## Half-Day Type Detection

```
┌─────────────────────────────────────────────────────────────┐
│           FIRST HALF vs SECOND HALF DETECTION                │
└─────────────────────────────────────────────────────────────┘

Shift: 9:00 AM - 6:00 PM
Midpoint: 12:30 PM

Timeline:
├────────────┼────────────┼────────────┼────────────┤
9:00 AM   10:30 AM   12:30 PM   3:00 PM   6:00 PM
           (Midpoint)

┌──────────────────────────────────────┐
│ Clock-in <= Midpoint (12:30 PM)?    │
└──────┬───────────────────────────────┘
       │
   YES │                           NO
       ▼                            │
┌──────────────┐                   │
│ FIRST_HALF   │                   │
│              │                   │
│ Employee     │                   │
│ worked       │                   │
│ morning      │                   │
│ shift        │                   │
└──────────────┘                   │
                                   ▼
                            ┌──────────────┐
                            │ SECOND_HALF  │
                            │              │
                            │ Employee     │
                            │ worked       │
                            │ afternoon    │
                            │ shift        │
                            └──────────────┘

Examples:
• Clock-in: 9:00 AM, Clock-out: 1:00 PM → FIRST_HALF (4h)
• Clock-in: 2:00 PM, Clock-out: 6:00 PM → SECOND_HALF (4h)
• Clock-in: 9:00 AM, Clock-out: 6:00 PM → FULL_DAY (9h)
```

## Edge Cases Handling

```
┌─────────────────────────────────────────────────────────────┐
│                    EDGE CASES MATRIX                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────┬──────────────┬─────────────┐
│ Clock-In         │ Clock-Out    │ Action       │ Final Status│
├──────────────────┼──────────────┼──────────────┼─────────────┤
│ ✅ Yes           │ ✅ Yes       │ Calculate    │ present/    │
│                  │              │ hours        │ half_day/   │
│                  │              │              │ leave       │
├──────────────────┼──────────────┼──────────────┼─────────────┤
│ ✅ Yes           │ ❌ No        │ Auto         │ present/    │
│                  │              │ clock-out    │ half_day    │
│                  │              │ at shift end│             │
├──────────────────┼──────────────┼──────────────┼─────────────┤
│ ❌ No            │ ✅ Yes       │ Invalid!     │ absent      │
│                  │              │ Clear        │             │
│                  │              │ clock-out    │             │
├──────────────────┼──────────────┼──────────────┼─────────────┤
│ ❌ No            │ ❌ No        │ Create       │ absent      │
│                  │              │ absent       │             │
│                  │              │ record       │             │
└──────────────────┴──────────────┴──────────────┴─────────────┘
```

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  ATTENDANCE SYSTEM LAYERS                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (Frontend)                               │
│  • Clock-in/out buttons                                      │
│  • Attendance dashboard                                      │
│  • Admin attendance management                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  API LAYER (Routes + Controllers)                            │
│  • POST /api/employee/attendance/clock-in                    │
│  • POST /api/employee/attendance/clock-out                   │
│  • POST /api/admin/attendance-finalization/trigger           │
│  • GET  /api/admin/attendance-finalization/status            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  BUSINESS LOGIC LAYER (Services + Models)                    │
│  • AttendanceRecord model                                    │
│  • calculateWorkingHours()                                   │
│  • determineHalfDayType()                                    │
│  • Shift model (rules)                                       │
│  • WorkingRule model                                         │
│  • Holiday model                                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  AUTOMATION LAYER (Cron Jobs)                                │
│  • attendanceFinalization.js                                 │
│  • Runs daily at 6:05 PM                                     │
│  • Auto-finalizes all incomplete records                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  DATA LAYER (Database)                                       │
│  • attendance_records table                                  │
│  • employees table                                           │
│  • shifts table                                              │
│  • employee_shifts table                                     │
│  • working_rules table                                       │
│  • holidays table                                            │
└─────────────────────────────────────────────────────────────┘
```

## Daily Timeline Example

```
┌─────────────────────────────────────────────────────────────┐
│              TYPICAL WORKING DAY TIMELINE                    │
└─────────────────────────────────────────────────────────────┘

08:00 AM  ├─────────────────────────────────────────────────┤
          │ Grace period starts                              │
          │                                                  │
09:00 AM  ├─────────────────────────────────────────────────┤
          │ ✅ Shift starts                                  │
          │ 👤 Employee clocks in                           │
          │ Status: incomplete                               │
          │                                                  │
09:10 AM  ├─────────────────────────────────────────────────┤
          │ Grace period ends                                │
          │ (Late if clock-in after this)                    │
          │                                                  │
12:30 PM  ├─────────────────────────────────────────────────┤
          │ 🕐 Shift midpoint                                │
          │ (Used for half-day type detection)               │
          │                                                  │
06:00 PM  ├─────────────────────────────────────────────────┤
          │ ✅ Shift ends                                    │
          │ 👤 Employee should clock out                    │
          │                                                  │
06:05 PM  ├─────────────────────────────────────────────────┤
          │ 🔥 FINALIZATION JOB RUNS                        │
          │                                                  │
          │ For employees who forgot to clock out:           │
          │ • Auto clock-out at 6:00 PM                      │
          │ • Calculate worked hours                         │
          │ • Set final status                               │
          │                                                  │
          │ For employees who never came:                    │
          │ • Create absent record                           │
          │                                                  │
          │ ✅ All records finalized                         │
          └─────────────────────────────────────────────────┘
```

## Key Takeaways

1. **Real-time Tracking**: Clock-in/out happens in real-time during the day
2. **Incomplete Status**: Records stay "incomplete" until finalized
3. **Daily Finalization**: Job runs at 6:05 PM to finalize all records
4. **Auto Clock-Out**: Employees who forget get auto clocked-out
5. **Auto Absent**: Employees who don't show up get marked absent
6. **Status Calculation**: Final status based on worked hours vs shift rules
7. **Half-Day Detection**: Smart detection of first_half vs second_half
8. **Edge Cases**: All scenarios handled (no clock-in, no clock-out, invalid data)
