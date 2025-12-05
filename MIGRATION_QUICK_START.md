# 🚀 Frontend Migration - Quick Start Guide

**Created:** December 5, 2025  
**Script:** `migrate-frontend.ps1`  
**Estimated Time:** 5 minutes

---

## ⚡ QUICK START

### Step 1: Open PowerShell as Administrator

```powershell
# Right-click PowerShell and select "Run as Administrator"
# Or press Win+X and select "Windows PowerShell (Admin)"
```

### Step 2: Navigate to Project Directory

```powershell
cd "C:\Users\TECHY SQUAD\OneDrive\Desktop\hrm-system"
```

### Step 3: Enable Script Execution (One-time setup)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 4: Run Dry Run First (RECOMMENDED)

```powershell
.\migrate-frontend.ps1 -DryRun
```

This will show you what will happen WITHOUT actually copying files.

### Step 5: Run Actual Migration

```powershell
.\migrate-frontend.ps1
```

Or with verbose output:

```powershell
.\migrate-frontend.ps1 -Verbose
```

---

## 📊 WHAT THE SCRIPT DOES

### ✅ Creates New Structure
```
features/
├── shared/auth/         ← From: features/auth/
├── employee/
│   ├── dashboard/       ← From: features/dashboard/employee/
│   ├── profile/         ← From: features/ess/profile/
│   ├── attendance/      ← From: features/ess/attendance/
│   ├── leave/           ← From: features/ess/leave/
│   ├── payroll/         ← From: features/ess/payslips/
│   ├── documents/       ← From: features/ess/documents/
│   └── bank-details/    ← From: features/ess/bankdetails/
└── admin/
    ├── dashboard/       ← From: features/dashboard/admin/
    ├── employees/       ← From: features/employees/
    ├── attendance/      ← From: features/hr/attendance/
    ├── leave/           ← From: features/hr/leave/
    ├── organization/    ← From: features/hr/organization/
    ├── departments/     ← From: features/departments/
    └── payroll/         ← From: features/payroll/
```

### ✅ Copies ALL Files
- All .jsx components
- All .js files
- All subdirectories
- Preserves file structure

### ✅ Creates Logs
- Detailed migration log
- Timestamp on all actions
- Color-coded output
- Next steps guide

---

## 🎯 SCRIPT FEATURES

### Safety Features
- ✅ **Dry Run Mode** - Test before running
- ✅ **Verification** - Checks files copied correctly
- ✅ **Logging** - Full audit trail
- ✅ **Error Handling** - Stops on errors
- ✅ **Non-Destructive** - Doesn't delete originals

### Output Features
- 🎨 **Color-Coded** - Easy to read
- 📊 **Progress Tracking** - Shows what's happening
- ✅ **Success Confirmation** - Clear completion message
- 📝 **Summary Report** - What was done

---

## 📋 COMMAND OPTIONS

### Basic Usage
```powershell
.\migrate-frontend.ps1
```

### Dry Run (See what will happen)
```powershell
.\migrate-frontend.ps1 -DryRun
```

### Verbose Mode (More details)
```powershell
.\migrate-frontend.ps1 -Verbose
```

### Both Options
```powershell
.\migrate-frontend.ps1 -DryRun -Verbose
```

---

## ✅ EXPECTED OUTPUT

```
============================================
   Frontend Migration Script v1.0          
============================================

Starting Frontend Migration...
Log file: migration-log-20251205_142200.txt
✓ Found features directory

STEP 1: Creating directory structure...

  Created: features\shared
  Created: features\shared\auth
  Created: features\employee
  Created: features\employee\dashboard
  ...

✓ Created 24 new directories

STEP 2: Copying Employee features...

  ✓ ess\profile → employee\profile (3 files)
  ✓ ess\attendance → employee\attendance (10 files)
  ✓ ess\leave → employee\leave (3 files)
  ...

✓ Copied 7 employee modules

STEP 3: Copying Admin features...

  ✓ employees → admin\employees (13 files)
  ✓ hr\attendance → admin\attendance (2 files)
  ...

✓ Copied 7 admin modules

STEP 4: Copying Shared features...

  ✓ auth → shared\auth (5 files)

✓ Copied 1 shared modules

STEP 5: Verifying migration...

  ✓ employee\dashboard (5 files)
  ✓ employee\profile (3 files)
  ✓ admin\dashboard (4 files)
  ...

============================================
             MIGRATION SUMMARY              
============================================

Directories created: 24
Employee modules copied: 7
Admin modules copied: 7
Shared modules copied: 1
Verification: 6/6 paths OK

✓ MIGRATION COMPLETE!

Next Steps:
1. Review the log file: migration-log-20251205_142200.txt
2. Test the application to ensure all features work
3. Update imports (run update-imports.ps1)
4. Do NOT delete old directories until everything is tested

============================================
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Execution policy" error

**Error:**
```
.\migrate-frontend.ps1 : File cannot be loaded because running scripts is disabled
```

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: "Path not found" error

**Error:**
```
ERROR: frontend\src\features not found!
```

**Solution:**
Make sure you're in the correct directory:
```powershell
cd "C:\Users\TECHY SQUAD\OneDrive\Desktop\hrm-system"
```

### Issue: Permission denied

**Solution:**
Run PowerShell as Administrator

### Issue: Files already exist

**Solution:**
The script will overwrite existing files. This is safe if you're re-running the script.

---

## ✅ VERIFICATION CHECKLIST

After running the script:

### 1. Check the Log File
```powershell
notepad migration-log-*.txt
```

### 2. Verify New Directories Exist
```powershell
dir frontend\src\features\employee
dir frontend\src\features\admin
dir frontend\src\features\shared
```

### 3. Count Files
```powershell
# Should show files copied
(Get-ChildItem -Path frontend\src\features\employee -Recurse -File).Count
(Get-ChildItem -Path frontend\src\features\admin -Recurse -File).Count
```

### 4. Check Next Steps
```powershell
notepad MIGRATION_NEXT_STEPS.md
```

---

## 🎯 AFTER MIGRATION

### DO NOT DO YET:
- ❌ Don't delete old directories
- ❌ Don't modify old files
- ❌ Don't update imports yet

### DO DO NOW:
- ✅ Review migration log
- ✅ Verify files were copied
- ✅ Read MIGRATION_NEXT_STEPS.md
- ✅ Wait for import update script

---

## 📞 NEED HELP?

If something goes wrong:

1. **Check the log file** - It has details
2. **Run with -Verbose** - See more information
3. **Run with -DryRun** - Test without changes
4. **Take a screenshot** - Of any errors

The script is **safe** - it only copies files, never deletes them!

---

## 🎉 SUCCESS INDICATORS

✅ **Script completes without errors**  
✅ **Summary shows files copied**  
✅ **Verification shows paths OK**  
✅ **Log file created**  
✅ **MIGRATION_NEXT_STEPS.md created**

---

**Ready to run?** Just copy and paste the commands! 🚀

**Estimated Total Time:** 5 minutes

---

*Script created: December 5, 2025*  
*Last updated: December 5, 2025*
