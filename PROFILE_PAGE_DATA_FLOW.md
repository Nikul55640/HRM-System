# Profile Page Data Flow Analysis

## 📊 Data Flow Overview

```
ProfilePage.jsx
    ↓ uses
useProfile() hook
    ↓ calls
employeeSelfService.profile.get()
    ↓ API call
GET /employee/profile
    ↓ handled by
profile.controller.js → getProfile()
    ↓ returns
Employee data with User association
```

## ✅ Backend Data (What's Being Sent)

### From `profile.controller.js`:
```javascript
{
  success: true,
  data: {
    // Employee fields
    id: number,
    employeeId: string,
    firstName: string,
    lastName: string,
    gender: string,
    dateOfBirth: date,
    maritalStatus: string,
    about: string,
    phone: string,
    country: string,
    address: object/string,
    profilePicture: string,
    profilePhoto: string,
    nationality: string,
    bloodGroup: string,
    
    // Associated User data
    user: {
      id: number,
      email: string,
      role: string,
      isActive: boolean
    }
  }
}
```

## ✅ Frontend Data (What's Being Used)

### From `ProfilePage.jsx`:
```javascript
const {
  firstName,           // ✅ Available
  lastName,            // ✅ Available
  gender,              // ✅ Available
  dateOfBirth,         // ✅ Available
  phone,               // ✅ Available
  nationality,         // ✅ Available
  maritalStatus,       // ✅ Available
  bloodGroup,          // ✅ Available
  country,             // ✅ Available
  about,               // ✅ Available
  address,             // ✅ Available
  employeeId,          // ✅ Available
  profilePicture,      // ✅ Available
  user,                // ✅ Available
} = profile;

const email = user?.email;        // ✅ Available
const role = user?.role;          // ✅ Available
const status = user?.isActive;    // ✅ Available
```

## ⚠️ Hardcoded Stats (Not From Backend)

### In `ProfilePage.jsx`:
```javascript
<StatMiniCard title="Late Attendance" value={1} />      // ❌ Hardcoded
<StatMiniCard title="Leaves Taken" value={0} />         // ❌ Hardcoded
<StatMiniCard title="Present Days" value={22} />        // ❌ Hardcoded
<StatMiniCard title="Absent Days" value={2} />          // ❌ Hardcoded
```

**These should be fetched from backend!**

## 🔧 Recommended Fixes

### 1. Add Stats to Backend Response

Update `profile.controller.js` to include attendance stats:

```javascript
export const getProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: { userId: req.user.id },
      // ... existing includes
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    // ✅ ADD: Fetch attendance stats
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const attendanceStats = await AttendanceRecord.findAll({
      where: {
        employeeId: employee.id,
        date: {
          [Op.gte]: `${currentYear}-01-01`,
          [Op.lte]: `${currentYear}-12-31`
        }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN isLate = true THEN 1 END")), 'lateCount'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'present' THEN 1 END")), 'presentCount'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'leave' THEN 1 END")), 'leaveCount'],
      ],
      raw: true
    });

    // ✅ ADD: Fetch leave stats
    const leaveStats = await LeaveRequest.count({
      where: {
        employeeId: employee.id,
        status: 'approved',
        startDate: {
          [Op.gte]: `${currentYear}-01-01`
        }
      }
    });

    res.json({
      success: true,
      data: {
        ...employee.toJSON(),
        stats: {
          lateAttendance: attendanceStats[0]?.lateCount || 0,
          leavesTaken: leaveStats || 0,
          presentDays: attendanceStats[0]?.presentCount || 0,
          leaveDays: attendanceStats[0]?.leaveCount || 0,
        }
      },
    });
  } catch (error) {
    // ... error handling
  }
};
```

### 2. Update Frontend to Use Stats

Update `ProfilePage.jsx`:

```javascript
const {
  firstName,
  lastName,
  // ... other fields
  stats, // ✅ NEW: Get stats from backend
} = profile;

// ✅ Use real data instead of hardcoded values
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatMiniCard 
    title="Late Attendance" 
    value={stats?.lateAttendance || 0} 
  />
  <StatMiniCard 
    title="Leaves Taken" 
    value={stats?.leavesTaken || 0} 
  />
  <StatMiniCard 
    title="Present Days" 
    value={stats?.presentDays || 0} 
  />
  <StatMiniCard 
    title="Leave Days" 
    value={stats?.leaveDays || 0} 
  />
</div>
```

## 📝 Current Status

### ✅ Working Correctly
- Personal information display
- User account information
- Profile picture handling
- Address information
- Data fetching and loading states

### ❌ Needs Improvement
- **Stats are hardcoded** - Should fetch from backend
- **No real-time attendance data** - Stats should be dynamic
- **No leave balance integration** - Should show actual leave data

## 🎯 Implementation Priority

### High Priority
1. **Add attendance stats to backend** - Critical for accurate data
2. **Update frontend to use stats** - Remove hardcoded values

### Medium Priority
3. **Add caching for stats** - Improve performance
4. **Add date range filter** - Allow viewing different periods

### Low Priority
5. **Add export functionality** - Allow downloading profile data
6. **Add activity timeline** - Show recent profile changes

## 🔍 Testing Checklist

After implementing fixes:

- [ ] Stats show correct late attendance count
- [ ] Stats show correct leaves taken
- [ ] Stats show correct present days
- [ ] Stats show correct leave days
- [ ] Stats update when attendance changes
- [ ] Stats handle edge cases (no data, new employee)
- [ ] Loading states work correctly
- [ ] Error handling works properly

## 📚 Related Files

### Backend
- `controllers/employee/profile.controller.js` - Profile endpoint
- `models/sequelize/AttendanceRecord.js` - Attendance data
- `models/sequelize/LeaveRequest.js` - Leave data
- `routes/employee/profile.routes.js` - API routes

### Frontend
- `modules/employee/profile/ProfilePage.jsx` - Profile UI
- `services/employeeSelfService.js` - API service
- `services/useEmployeeSelfService.js` - Custom hooks

---

**Summary:** The profile page is fetching and displaying personal data correctly, but the attendance/leave stats are hardcoded and need to be fetched from the backend for accurate, real-time data.
