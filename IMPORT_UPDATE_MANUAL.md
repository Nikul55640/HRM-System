# Import Path Updates - Manual Find & Replace

**Purpose:** Update import paths after manual migration  
**Method:** Find and Replace in VS Code  
**Time:** 10 minutes

---

## 🎯 HOW TO USE VS CODE FIND & REPLACE

### Step 1: Open VS Code
Open your project in VS Code

### Step 2: Open Find & Replace
- Press `Ctrl+Shift+H` (Find and Replace in Files)
- Or go to Edit → Replace in Files

### Step 3: Configure Search
- Make sure "Use Regular Expression" is OFF (the `.*` icon should NOT be highlighted)
- Set "files to include" to: `frontend/src/**/*.{js,jsx}`

---

## 📋 REPLACEMENTS TO DO

### Employee Features (7 replacements)

#### 1. Profile
**Find:** `features/ess/profile`  
**Replace:** `features/employee/profile`  
Click "Replace All"

**Also find:** `../ess/profile`  
**Replace:** `../employee/profile`  
Click "Replace All"

#### 2. Attendance
**Find:** `features/ess/attendance`  
**Replace:** `features/employee/attendance`  
Click "Replace All"

**Also find:** `../ess/attendance`  
**Replace:** `../employee/attendance`  
Click "Replace All"

#### 3. Leave
**Find:** `features/ess/leave`  
**Replace:** `features/employee/leave`  
Click "Replace All"

**Also find:** `../ess/leave`  
**Replace:** `../employee/leave`  
Click "Replace All"

#### 4. Payslips → Payroll
**Find:** `features/ess/payslips`  
**Replace:** `features/employee/payroll`  
Click "Replace All"

**Also find:** `../ess/payslips`  
**Replace:** `../employee/payroll`  
Click "Replace All"

#### 5. Documents
**Find:** `features/ess/documents`  
**Replace:** `features/employee/documents`  
Click "Replace All"

**Also find:** `../ess/documents`  
**Replace:** `../employee/documents`  
Click "Replace All"

#### 6. Bank Details
**Find:** `features/ess/bankdetails`  
**Replace:** `features/employee/bank-details`  
Click "Replace All"

**Also find:** `../ess/bankdetails`  
**Replace:** `../employee/bank-details`  
Click "Replace All"

#### 7. Employee Dashboard
**Find:** `features/dashboard/employee`  
**Replace:** `features/employee/dashboard`  
Click "Replace All"

**Also find:** `../dashboard/employee`  
**Replace:** `../employee/dashboard`  
Click "Replace All"

---

### Admin Features (7 replacements)

#### 8. Employee Management
**Find:** `features/employees`  
**Replace:** `features/admin/employees`  
Click "Replace All"

**Important:** This will match `features/employees` but NOT `admin/employees`

#### 9. HR Attendance
**Find:** `features/hr/attendance`  
**Replace:** `features/admin/attendance`  
Click "Replace All"

**Also find:** `../hr/attendance`  
**Replace:** `../admin/attendance`  
Click "Replace All"

#### 10. HR Leave
**Find:** `features/hr/leave`  
**Replace:** `features/admin/leave`  
Click "Replace All"

**Also find:** `../hr/leave`  
**Replace:** `../admin/leave`  
Click "Replace All"

#### 11. HR Organization
**Find:** `features/hr/organization`  
**Replace:** `features/admin/organization`  
Click "Replace All"

**Also find:** `../hr/organization`  
**Replace:** `../admin/organization`  
Click "Replace All"

#### 12. Admin Dashboard
**Find:** `features/dashboard/admin`  
**Replace:** `features/admin/dashboard`  
Click "Replace All"

**Also find:** `../dashboard/admin`  
**Replace:** `../admin/dashboard`  
Click "Replace All"

#### 13. Departments
**Find:** `features/departments`  
**Replace:** `features/admin/departments`  
Click "Replace All"

**Also find:** `../departments`  
**Replace:** `../admin/departments`  
Click "Replace All"

#### 14. Payroll
**Find:** `features/payroll`  
**Replace:** `features/admin/payroll`  
Click "Replace All"

**Also find:** `../payroll`  
**Replace:** `../admin/payroll`  
Click "Replace All"

---

### Shared Features (1 replacement)

#### 15. Auth
**Find:** `features/auth`  
**Replace:** `features/shared/auth`  
Click "Replace All"

**Also find:** `../auth`  
**Replace:** `../shared/auth`  
Click "Replace All"

---

## ✅ VERIFICATION

After all replacements:

### Check Files Updated
VS Code will show how many files were modified at the bottom of the Replace panel.

**Expected:** 50-100+ files modified

### Check Console
1. Start your dev server: `npm run dev`
2. Open browser console (F12)
3. Look for import errors
4. If any errors, manually fix those specific imports

---

## 🎯 QUICK CHECKLIST

- [ ] Profile paths updated
- [ ] Attendance paths updated
- [ ] Leave paths updated
- [ ] Payslips → Payroll updated
- [ ] Documents paths updated
- [ ] Bank details paths updated
- [ ] Employee dashboard updated
- [ ] Employee management (admin) updated
- [ ] HR attendance → admin updated
- [ ] HR leave → admin updated
- [ ] HR organization updated
- [ ] Admin dashboard updated
- [ ] Departments updated
- [ ] Payroll updated
- [ ] Auth → shared updated
- [ ] All relative paths (`../`) updated
- [ ] App starts without errors

---

## 🐛 TROUBLESHOOTING

### If imports still broken:

#### Check for these common patterns:
```javascript
// Old patterns to find manually:
'../../ess/'
'../../../ess/'
'../../hr/'
'../../../hr/'
'../../employees/'
```

#### Replace with:
```javascript
// New patterns:
'../../employee/'
'../../../employee/'
'../../admin/'
'../../../admin/'
'../../admin/employees/'
```

### Use VS Code's Problems Panel
- View → Problems (Ctrl+Shift+M)
- Shows all import errors
- Click each one to fix manually

---

## 💡 TIPS

1. **Save All Files:** File → Save All (Ctrl+K, S)
2. **Review Changes:** Use Git to see what changed
3. **Test Incrementally:** Start dev server after some replacements
4. **Undo if Needed:** Ctrl+Z works across all files

---

**Total Replacements:** ~30 find-and-replace operations  
**Time:** 10 minutes  
**Difficulty:** Easy - just follow the list!

---

*Let me know when done and I'll help test!* 🚀
