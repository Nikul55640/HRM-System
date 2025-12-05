# Frontend Migration Script
# Purpose: Reorganize frontend features into employee/admin/shared structure
# Date: December 5, 2025
# Author: Antigravity AI

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"
$sourceBase = "frontend\src\features"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = "migration-log-$timestamp.txt"

# Color functions
function Write-Success { param($message) Write-Host $message -ForegroundColor Green }
function Write-Info { param($message) Write-Host $message -ForegroundColor Cyan }
function Write-Warning { param($message) Write-Host $message -ForegroundColor Yellow }
function Write-Error-Custom { param($message) Write-Host $message -ForegroundColor Red }

# Logging function
function Write-Log {
    param($message, $level = "INFO")
    $logMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [$level] $message"
    Add-Content -Path $logFile -Value $logMessage
    
    switch ($level) {
        "SUCCESS" { Write-Success $message }
        "WARNING" { Write-Warning $message }
        "ERROR" { Write-Error-Custom $message }
        default { Write-Info $message }
    }
}

# Banner
Write-Host "`n" -NoNewline
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "   Frontend Migration Script v1.0          " -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "`n"

if ($DryRun) {
    Write-Warning "DRY RUN MODE - No files will be copied"
    Write-Host ""
}

Write-Log "Starting Frontend Migration..." "INFO"
Write-Log "Log file: $logFile" "INFO"

# Check if we're in the right directory
if (!(Test-Path $sourceBase)) {
    Write-Log "ERROR: $sourceBase not found!" "ERROR"
    Write-Log "Please run this script from the HRM system root directory" "ERROR"
    exit 1
}

Write-Success "✓ Found features directory"

# ===== STEP 1: CREATE DIRECTORY STRUCTURE =====
Write-Host "`n" -NoNewline
Write-Log "STEP 1: Creating directory structure..." "INFO"
Write-Host ""

$directories = @(
    # Shared
    "shared",
    "shared\auth",
    "shared\components",
    "shared\services",
    
    # Employee
    "employee",
    "employee\dashboard",
    "employee\profile",
    "employee\attendance",
    "employee\leave",
    "employee\payroll",
    "employee\documents",
    "employee\bank-details",
    "employee\requests",
    "employee\notifications",
    
    # Admin
    "admin",
    "admin\dashboard",
    "admin\employees",
    "admin\attendance",
    "admin\leave",
    "admin\payroll",
    "admin\departments",
    "admin\organization",
    "admin\reports",
    "admin\users"
)

$createdCount = 0
foreach ($dir in $directories) {
    $fullPath = Join-Path $sourceBase $dir
    
    if (!(Test-Path $fullPath)) {
        if (!$DryRun) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        }
        Write-Log "  Created: features\$dir" "SUCCESS"
        $createdCount++
    } else {
        if ($Verbose) {
            Write-Log "  Exists: features\$dir" "INFO"
        }
    }
}

Write-Success "`n✓ Created $createdCount new directories"

# ===== STEP 2: COPY EMPLOYEE FEATURES =====
Write-Host "`n" -NoNewline
Write-Log "STEP 2: Copying Employee features..." "INFO"
Write-Host ""

$employeeMappings = @{
    "ess\profile" = "employee\profile"
    "ess\attendance" = "employee\attendance"
    "ess\leave" = "employee\leave"
    "ess\payslips" = "employee\payroll"
    "ess\documents" = "employee\documents"
    "ess\bankdetails" = "employee\bank-details"
    "dashboard\employee" = "employee\dashboard"
}

$copiedEmployee = 0
foreach ($mapping in $employeeMappings.GetEnumerator()) {
    $source = Join-Path $sourceBase $mapping.Key
    $dest = Join-Path $sourceBase $mapping.Value
    
    if (Test-Path $source) {
        if (!$DryRun) {
            # Copy all files and subdirectories
            Copy-Item -Path "$source\*" -Destination $dest -Recurse -Force -ErrorAction Stop
        }
        
        # Count files
        if (Test-Path $source) {
            $fileCount = (Get-ChildItem -Path $source -Recurse -File).Count
            Write-Log "  ✓ $($mapping.Key) → $($mapping.Value) ($fileCount files)" "SUCCESS"
            $copiedEmployee++
        }
    } else {
        Write-Log "  ⚠ Source not found: $($mapping.Key)" "WARNING"
    }
}

Write-Success "`n✓ Copied $copiedEmployee employee modules"

# ===== STEP 3: COPY ADMIN FEATURES =====
Write-Host "`n" -NoNewline
Write-Log "STEP 3: Copying Admin features..." "INFO"
Write-Host ""

$adminMappings = @{
    "employees" = "admin\employees"
    "hr\attendance" = "admin\attendance"
    "hr\leave" = "admin\leave"
    "hr\organization" = "admin\organization"
    "dashboard\admin" = "admin\dashboard"
    "departments" = "admin\departments"
    "payroll" = "admin\payroll"
}

$copiedAdmin = 0
foreach ($mapping in $adminMappings.GetEnumerator()) {
    $source = Join-Path $sourceBase $mapping.Key
    $dest = Join-Path $sourceBase $mapping.Value
    
    if (Test-Path $source) {
        if (!$DryRun) {
            Copy-Item -Path "$source\*" -Destination $dest -Recurse -Force -ErrorAction Stop
        }
        
        if (Test-Path $source) {
            $fileCount = (Get-ChildItem -Path $source -Recurse -File).Count
            Write-Log "  ✓ $($mapping.Key) → $($mapping.Value) ($fileCount files)" "SUCCESS"
            $copiedAdmin++
        }
    } else {
        Write-Log "  ⚠ Source not found: $($mapping.Key)" "WARNING"
    }
}

Write-Success "`n✓ Copied $copiedAdmin admin modules"

# ===== STEP 4: COPY SHARED FEATURES =====
Write-Host "`n" -NoNewline
Write-Log "STEP 4: Copying Shared features..." "INFO"
Write-Host ""

$sharedMappings = @{
    "auth" = "shared\auth"
}

$copiedShared = 0
foreach ($mapping in $sharedMappings.GetEnumerator()) {
    $source = Join-Path $sourceBase $mapping.Key
    $dest = Join-Path $sourceBase $mapping.Value
    
    if (Test-Path $source) {
        if (!$DryRun) {
            Copy-Item -Path "$source\*" -Destination $dest -Recurse -Force -ErrorAction Stop
        }
        
        if (Test-Path $source) {
            $fileCount = (Get-ChildItem -Path $source -Recurse -File).Count
            Write-Log "  ✓ $($mapping.Key) → $($mapping.Value) ($fileCount files)" "SUCCESS"
            $copiedShared++
        }
    } else {
        Write-Log "  ⚠ Source not found: $($mapping.Key)" "WARNING"
    }
}

Write-Success "`n✓ Copied $copiedShared shared modules"

# ===== STEP 5: VERIFICATION =====
Write-Host "`n" -NoNewline
Write-Log "STEP 5: Verifying migration..." "INFO"
Write-Host ""

$verificationPaths = @(
    "employee\dashboard",
    "employee\profile",
    "employee\leave",
    "admin\dashboard",
    "admin\employees",
    "shared\auth"
)

$verifiedCount = 0
$missingPaths = @()

foreach ($path in $verificationPaths) {
    $fullPath = Join-Path $sourceBase $path
    
    if (Test-Path $fullPath) {
        $fileCount = (Get-ChildItem -Path $fullPath -Recurse -File -ErrorAction SilentlyContinue).Count
        if ($fileCount -gt 0) {
            Write-Log "  ✓ $path ($fileCount files)" "SUCCESS"
            $verifiedCount++
        } else {
            Write-Log "  ⚠ $path (empty directory)" "WARNING"
            $missingPaths += $path
        }
    } else {
        Write-Log "  ✗ $path (missing)" "ERROR"
        $missingPaths += $path
    }
}

# ===== SUMMARY =====
Write-Host "`n" -NoNewline
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "             MIGRATION SUMMARY              " -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

Write-Log "Directories created: $createdCount" "INFO"
Write-Log "Employee modules copied: $copiedEmployee" "INFO"
Write-Log "Admin modules copied: $copiedAdmin" "INFO"
Write-Log "Shared modules copied: $copiedShared" "INFO"
Write-Log "Verification: $verifiedCount/$($verificationPaths.Count) paths OK" "INFO"

if ($missingPaths.Count -gt 0) {
    Write-Host ""
    Write-Warning "⚠ Warning: $($missingPaths.Count) paths empty or missing:"
    foreach ($path in $missingPaths) {
        Write-Warning "  - $path"
    }
}

Write-Host ""
if ($DryRun) {
    Write-Warning "DRY RUN COMPLETE - No files were actually copied"
    Write-Info "Run without -DryRun to perform actual migration"
} else {
    Write-Success "✓ MIGRATION COMPLETE!"
    Write-Info ""
    Write-Info "Next Steps:"
    Write-Info "1. Review the log file: $logFile"
    Write-Info "2. Test the application to ensure all features work"
    Write-Info "3. Update imports (run update-imports.ps1)"
    Write-Info "4. Do NOT delete old directories until everything is tested"
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

# Create next steps file
if (!$DryRun) {
    $nextSteps = @"
# Next Steps After Migration

## ✅ Completed
- [x] Directory structure created
- [x] Files copied to new locations

## 📋 TODO

### 1. Verify Migration (IMPORTANT)
- [ ] Check that all files were copied correctly
- [ ] Verify file counts match source directories
- [ ] Review migration log: $logFile

### 2. Update Imports
Files need import path updates:
- [ ] All component files
- [ ] All route files
- [ ] Service files
- [ ] Index files

Run: .\update-imports.ps1 (when ready)

### 3. Update Routes
- [ ] Update employee routes to use new paths
- [ ] Update admin routes to use new paths
- [ ] Update navigation menus

### 4. Testing
- [ ] Test employee features work
- [ ] Test admin features work
- [ ] Test authentication flow
- [ ] Test all navigation

### 5. Cleanup (LAST STEP - DO NOT DO YET)
Only after everything is tested and working:
- [ ] Delete old ess/ directory
- [ ] Delete old employees/ directory
- [ ] Delete old hr/ directory
- [ ] Delete old dashboard/ directory (keep services if needed)
- [ ] Delete old departments/ directory
- [ ] Delete old payroll/ directory
- [ ] Delete old auth/ directory

### 6. Documentation
- [ ] Update README with new structure
- [ ] Update development docs
- [ ] Inform team of changes

---
Migration completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Log file: $logFile
"@
    
    Set-Content -Path "MIGRATION_NEXT_STEPS.md" -Value $nextSteps
    Write-Info "Created: MIGRATION_NEXT_STEPS.md"
}

Write-Log "Script execution completed" "SUCCESS"
