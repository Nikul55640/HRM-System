# ✅ Migration Checklist

**Print this out or keep it open while working!**

---

## 📁 PART 1: CREATE FOLDERS

Location: `frontend/src/features/`

### Shared Folder
- [ ] Create `shared/`
- [ ] Create `shared/auth/`
- [ ] Create `shared/components/`
- [ ] Create `shared/services/`

### Employee Folder
- [ ] Create `employee/`
- [ ] Create `employee/dashboard/`
- [ ] Create `employee/profile/`
- [ ] Create `employee/attendance/`
- [ ] Create `employee/leave/`
- [ ] Create `employee/payroll/`
- [ ] Create `employee/documents/`
- [ ] Create `employee/bank-details/`
- [ ] Create `employee/requests/`
- [ ] Create `employee/notifications/`

### Admin Folder  
- [ ] Create `admin/`
- [ ] Create `admin/dashboard/`
- [ ] Create `admin/employees/`
- [ ] Create `admin/attendance/`
- [ ] Create `admin/leave/`
- [ ] Create `admin/payroll/`
- [ ] Create `admin/departments/`
- [ ] Create `admin/organization/`
- [ ] Create `admin/reports/`
- [ ] Create `admin/users/`

---

## 📋 PART 2: COPY FILES (Employee)

- [ ] `ess/profile/` → `employee/profile/`
- [ ] `ess/attendance/` → `employee/attendance/`
- [ ] `ess/leave/` → `employee/leave/`
- [ ] `ess/payslips/` → `employee/payroll/`
- [ ] `ess/documents/` → `employee/documents/`
- [ ] `ess/bankdetails/` → `employee/bank-details/`
- [ ] `dashboard/employee/` → `employee/dashboard/`

---

## 📋 PART 3: COPY FILES (Admin)

- [ ] `employees/` → `admin/employees/`
- [ ] `hr/attendance/` → `admin/attendance/`
- [ ] `hr/leave/` → `admin/leave/`
- [ ] `hr/organization/` → `admin/organization/`
- [ ] `dashboard/admin/` → `admin/dashboard/`
- [ ] `departments/` → `admin/departments/`
- [ ] `payroll/` → `admin/payroll/`

---

## 📋 PART 4: COPY FILES (Shared)

- [ ] `auth/` → `shared/auth/`

---

## 🔍 PART 5: VERIFY FILES COPIED

Check these key files exist:

### Employee:
- [ ] `employee/dashboard/DashboardHome.jsx`
- [ ] `employee/profile/ProfilePage.jsx`
- [ ] `employee/leave/LeavePage.jsx`
- [ ] `employee/bank-details/BankDetailsPage.jsx`

### Admin:
- [ ] `admin/dashboard/AdminDashboard.jsx`
- [ ] `admin/employees/EmployeeDirectory.jsx`

### Shared:
- [ ] `shared/auth/Login.jsx`

---

## 🔧 PART 6: UPDATE IMPORTS (VS Code: Ctrl+Shift+H)

### Employee Features:
- [ ] Find: `features/ess/profile` → Replace: `features/employee/profile`
- [ ] Find: `../ess/profile` → Replace: `../employee/profile`
- [ ] Find: `features/ess/attendance` → Replace: `features/employee/attendance`
- [ ] Find: `../ess/attendance` → Replace: `../employee/attendance`
- [ ] Find: `features/ess/leave` → Replace: `features/employee/leave`
- [ ] Find: `../ess/leave` → Replace: `../employee/leave`
- [ ] Find: `features/ess/payslips` → Replace: `features/employee/payroll`
- [ ] Find: `../ess/payslips` → Replace: `../employee/payroll`
- [ ] Find: `features/ess/documents` → Replace: `features/employee/documents`
- [ ] Find: `../ess/documents` → Replace: `../employee/documents`
- [ ] Find: `features/ess/bankdetails` → Replace: `features/employee/bank-details`
- [ ] Find: `../ess/bankdetails` → Replace: `../employee/bank-details`
- [ ] Find: `features/dashboard/employee` → Replace: `features/employee/dashboard`
- [ ] Find: `../dashboard/employee` → Replace: `../employee/dashboard`

### Admin Features:
- [ ] Find: `features/employees` → Replace: `features/admin/employees`
- [ ] Find: `features/hr/attendance` → Replace: `features/admin/attendance`
- [ ] Find: `../hr/attendance` → Replace: `../admin/attendance`
- [ ] Find: `features/hr/leave` → Replace: `features/admin/leave`
- [ ] Find: `../hr/leave` → Replace: `../admin/leave`
- [ ] Find: `features/hr/organization` → Replace: `features/admin/organization`
- [ ] Find: `../hr/organization` → Replace: `../admin/organization`
- [ ] Find: `features/dashboard/admin` → Replace: `features/admin/dashboard`
- [ ] Find: `../dashboard/admin` → Replace: `../admin/dashboard`
- [ ] Find: `features/departments` → Replace: `features/admin/departments`
- [ ] Find: `../departments` → Replace: `../admin/departments`
- [ ] Find: `features/payroll` → Replace: `features/admin/payroll`
- [ ] Find: `../payroll` → Replace: `../admin/payroll`

### Shared:
- [ ] Find: `features/auth` → Replace: `features/shared/auth`
- [ ] Find: `../auth` → Replace: `../shared/auth`

---

## 🧪 PART 7: TEST

- [ ] Save all files in VS Code (Ctrl+K, S)
- [ ] Start dev server: `npm run dev`
- [ ] App starts without errors
- [ ] No import errors in console (F12)
- [ ] Login page works
- [ ] Employee dashboard loads
- [ ] Admin dashboard loads
- [ ] Profile page works
- [ ] Leave page works
- [ ] Bank details page works
- [ ] Navigate all routes - no 404 errors

---

## ✨ PART 8: FINAL STEPS

- [ ] All tests passed
- [ ] App works perfectly
- [ ] Commit changes: `git add . && git commit -m "Restructure frontend"`
- [ ] Test one more time
- [ ] **Only then:** Delete old folders:
  - [ ] Delete `ess/`
  - [ ] Delete `employees/`
  - [ ] Delete `hr/`
  - [ ] Delete `departments/`
  - [ ] Delete `payroll/`
  - [ ] Delete `auth/`
  - [ ] Delete `dashboard/` (keep services folder if needed)

---

## 📊 PROGRESS TRACKER

**Started:** _____________  
**Part 1 Done:** _____________  
**Part 2 Done:** _____________  
**Part 3 Done:** _____________  
**Part 4 Done:** _____________  
**Part 5 Done:** _____________  
**Part 6 Done:** _____________  
**Part 7 Done:** _____________  
**Part 8 Done:** _____________  
**Completed:** _____________

---

**Total Items:** 85 checkboxes  
**Estimated Time:** 30 minutes  
**Difficulty:** Easy - just follow the list!

---

*Check off each item as you complete it!* ✅
