# 📅 HRM Calendar System Architecture

## 🎯 Golden Rule
**Rules go to Smart Calendar, Events go to Unified Calendar**

## 🏗️ System Components

### 1. Smart Calendar (System Brain)
**Purpose:** Controls HOW time works in the system
**Location:** `/admin/smart-calendar`
**Manages:**
- ✅ Working Rules (Mon-Fri, Sat-Sun, etc.)
- ✅ Weekend Definitions
- ✅ Holiday Rules (recurring festivals, one-time holidays)
- ✅ Paid/Unpaid Holiday Logic
- ✅ Attendance Automation
- ✅ Payroll Impact Rules

**Who Can Access:**
- Admin: Full control (create, edit, delete)
- HR: Holiday management only
- Employee: No access

### 2. Unified Calendar (Events Layer)
**Purpose:** Controls WHAT happens on specific dates
**Location:** `/admin/calendar`
**Manages:**
- ✅ Company Events (townhalls, outings)
- ✅ Meetings (HR meetings, team meetings)
- ✅ Training Sessions (onboarding, workshops)
- ✅ Announcements (deadline reminders)
- ✅ Employee Events (birthdays, anniversaries - auto-generated)
- ✅ Leave Visibility (for awareness)

**Who Can Access:**
- Admin: Full control
- HR: Full control
- Employee: No access (view only)

### 3. Employee Calendar (Read-Only View)
**Purpose:** Unified view for employees
**Location:** `/employee/calendar`
**Shows:**
- ✅ All holidays (from Smart Calendar)
- ✅ All events (from Unified Calendar)
- ✅ All leaves (for visibility)
- ✅ Birthdays & anniversaries
- ❌ No create/edit/delete capabilities

## 🔄 Data Flow

```
Smart Calendar (Rules) → Attendance System → Unified Calendar (Events) → Employee Calendar (View)
```

### Example Flow:
1. **Smart Calendar** defines "Dec 25 = Christmas Holiday"
2. **Attendance System** auto-marks holiday attendance
3. **Unified Calendar** shows "Christmas Party Event"
4. **Employee Calendar** displays both holiday + event

## ❌ Common Mistakes to Avoid

- ❌ Adding festivals in Unified Calendar
- ❌ Adding meetings in Smart Calendar
- ❌ Letting employees create events
- ❌ Mixing rules with events
- ❌ Managing holidays in multiple places

## ✅ Decision Matrix

| Task | Use Which Calendar |
|------|-------------------|
| Define weekends | Smart Calendar |
| Define working days | Smart Calendar |
| Add recurring festivals | Smart Calendar |
| Add one-time holiday | Smart Calendar |
| Add company meeting | Unified Calendar |
| Add training | Unified Calendar |
| Show birthdays | Unified Calendar |
| Show leave | Unified Calendar |
| Attendance calculation | Smart Calendar |
| Event visibility | Unified Calendar |

## 🎯 Benefits of This Architecture

1. **Scalable:** Clear separation of concerns
2. **Maintainable:** No confusion about where to add what
3. **Enterprise-Ready:** Matches professional HRM systems
4. **Audit-Safe:** Clear data ownership
5. **User-Friendly:** Employees see everything in one place

## 🔧 Implementation Status

- ✅ Smart Calendar: Properly handles rules and holidays
- ✅ Unified Calendar: Now handles events only (holidays removed)
- ✅ Employee Calendar: Perfect read-only implementation
- ✅ Clear UI separation and messaging
- ✅ Proper role-based access control

## 📝 For Developers

When adding new calendar features, ask:
- **Is this a RULE?** → Smart Calendar
- **Is this an EVENT?** → Unified Calendar
- **Is this for viewing?** → Employee Calendar

This architecture ensures your HRM system remains professional, scalable, and easy to maintain.