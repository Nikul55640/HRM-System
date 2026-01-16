# Dashboard Debugging Guide 🔍

**Quick Reference for Testing Recent Activities & Notifications**

---

## 🚀 Quick Test

### 1. Open Browser Console
```
F12 → Console Tab
```

### 2. Login as Employee

### 3. Go to Dashboard

### 4. Look for These Logs:
```
✅ [DASHBOARD] Recent activities API full response: {...}
✅ [DASHBOARD] Activities count: X
✅ [DASHBOARD] Notifications loaded: X
```

---

## 📊 What You Should See

### If Everything Works:
```
✅ [DASHBOARD] Recent activities API full response: {success: true, data: Array(5), total: 5}
✅ [DASHBOARD] Activities count: 5
✅ [DASHBOARD] Notifications loaded: 3
```

### If No Data:
```
✅ [DASHBOARD] Recent activities API full response: {success: true, data: [], total: 0}
✅ [DASHBOARD] Activities count: 0
✅ [DASHBOARD] Notifications loaded: 0
```

### If API Error:
```
❌ Recent activities API error: Error: Network Error
⚠️ Failed to load notifications: Error: Request failed
```

---

## 🔧 Quick Fixes

### Problem: "No recent activities"
**Solution:** Create some activities:
1. Clock In/Out
2. Apply for leave
3. Request correction

### Problem: "Failed to load"
**Solution:** Check:
1. Backend server running?
2. Logged in properly?
3. Network tab shows 200 OK?

### Problem: Shows old data
**Solution:** 
- Dashboard only shows TODAY's activities
- Change `days: 1` to `days: 7` in code to see more

---

## 📍 Key Files

### Frontend:
- Dashboard: `frontend/src/modules/employee/pages/Dashboard/EmployeeDashboard.jsx`
- Service: `frontend/src/services/recentActivityService.js`
- Hook: `frontend/src/services/useEmployeeSelfService.js`

### Backend:
- Controller: `backend/src/controllers/employee/recentActivity.controller.js`
- Service: `backend/src/services/employee/recentActivity.service.js`
- Routes: `backend/src/routes/employee/recentActivity.routes.js`

---

## 🎯 API Endpoints

### Recent Activities:
```
GET /api/employee/recent-activities?limit=20&days=1
```

### Notifications:
```
GET /api/employee/notifications?limit=5
```

---

## ✅ Checklist

- [ ] Backend server running
- [ ] Logged in as employee
- [ ] Browser console open
- [ ] Dashboard loaded
- [ ] Check console logs
- [ ] Create test data if needed
- [ ] Refresh page to see updates

---

**Need Help?** Check `RECENT_ACTIVITY_NOTIFICATION_FIX.md` for detailed troubleshooting.
