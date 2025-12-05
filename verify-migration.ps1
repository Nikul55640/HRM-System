# Migration Verification Script
# Purpose: Verify that migration completed successfully
# Date: December 5, 2025

$ErrorActionPreference = "Continue"

function Write-Success { param($message) Write-Host "  ✓ $message" -ForegroundColor Green }
function Write-Fail { param($message) Write-Host "  ✗ $message" -ForegroundColor Red }
function Write-Info { param($message) Write-Host $message -ForegroundColor Cyan }

Write-Host "`n============================================" -ForegroundColor Magenta
Write-Host "   Migration Verification Script           " -ForegroundColor Magenta
Write-Host "============================================`n" -ForegroundColor Magenta

$baseDir = "frontend\src\features"
$passed = 0
$failed = 0

# Check if new directories exist
Write-Info "Checking new directory structure..."

$requiredDirs = @(
    "employee",
    "employee\dashboard",
    "employee\profile",
    "employee\attendance",
    "employee\leave",
    "employee\payroll",
    "employee\documents",
    "employee\bank-details",
    "admin",
    "admin\dashboard",
    "admin\employees",
    "admin\attendance",
    "admin\leave",
    "admin\payroll",
    "admin\departments",
    "admin\organization",
    "shared",
    "shared\auth"
)

foreach ($dir in $requiredDirs) {
    $path = Join-Path $baseDir $dir
    if (Test-Path $path) {
        $fileCount = (Get-ChildItem -Path $path -Recurse -File -ErrorAction SilentlyContinue).Count
        if ($fileCount -gt 0) {
            Write-Success "$dir ($fileCount files)"
            $passed++
        } else {
            Write-Fail "$dir (empty directory)"
            $failed++
        }
    } else {
        Write-Fail "$dir (missing)"
        $failed++
    }
}

# Check for key files
Write-Host ""
Write-Info "Checking key files exist..."

$keyFiles = @{
    "employee\dashboard\DashboardHome.jsx" = "Employee Dashboard"
    "employee\profile\ProfilePage.jsx" = "Employee Profile"
    "employee\leave\LeavePage.jsx" = "Employee Leave"
    "employee\bank-details\BankDetailsPage.jsx" = "Bank Details"
    "admin\dashboard\AdminDashboard.jsx" = "Admin Dashboard"
    "admin\employees\EmployeeDirectory.jsx" = "Employee Directory"
    "shared\auth\Login.jsx" = "Login Component"
}

foreach ($file in $keyFiles.GetEnumerator()) {
    $path = Join-Path $baseDir $file.Key
    if (Test-Path $path) {
        Write-Success "$($file.Value)"
        $passed++
    } else {
        Write-Fail "$($file.Value) - Not found at: $($file.Key)"
        $failed++
    }
}

# File count comparison
Write-Host ""
Write-Info "Comparing file counts..."

$oldTotalFiles = 0
$newTotalFiles = 0

# Count old structure files (if they still exist)
$oldDirs = @("ess", "employees", "hr", "departments", "payroll", "dashboard\employee", "dashboard\admin")
foreach ($dir in $oldDirs) {
    $path = Join-Path $baseDir $dir
    if (Test-Path $path) {
        $count = (Get-ChildItem -Path $path -Recurse -File -ErrorAction SilentlyContinue).Count
        $oldTotalFiles += $count
    }
}

# Count new structure files
$newDirs = @("employee", "admin", "shared")
foreach ($dir in $newDirs) {
    $path = Join-Path $baseDir $dir
    if (Test-Path $path) {
        $count = (Get-ChildItem -Path $path -Recurse -File -ErrorAction SilentlyContinue).Count
        $newTotalFiles += $count
    }
}

Write-Host "  Old structure: $oldTotalFiles files" -ForegroundColor Yellow
Write-Host "  New structure: $newTotalFiles files" -ForegroundColor Cyan

if ($newTotalFiles -ge ($oldTotalFiles * 0.9)) {
    Write-Success "File count check passed (90% or more files migrated)"
    $passed++
} else {
    Write-Fail "File count mismatch - may be missing files"
    $failed++
}

# Summary
Write-Host "`n============================================" -ForegroundColor Magenta
Write-Host "                RESULTS                     " -ForegroundColor Magenta
Write-Host "============================================`n" -ForegroundColor Magenta

$total = $passed + $failed
$percentage = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 1) } else { 0 }

Write-Host "  Checks Passed: $passed" -ForegroundColor Green
Write-Host "  Checks Failed: $failed" -ForegroundColor Red
Write-Host "  Success Rate: $percentage%" -ForegroundColor $(if ($percentage -ge 90) { "Green" } else { "Yellow" })

Write-Host ""

if ($failed -eq 0) {
    Write-Host "  ✓ MIGRATION SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Info "Next Steps:"
    Write-Info "1. Run: .\update-imports.ps1 -DryRun"
    Write-Info "2. If dry run looks good: .\update-imports.ps1"
    Write-Info "3. Test the application"
    Write-Info "4. Do NOT delete old directories yet"
} elseif ($percentage -ge 80) {
    Write-Host "  ⚠ MIGRATION MOSTLY SUCCESSFUL" -ForegroundColor Yellow
    Write-Host ""
    Write-Info "Some files may be missing. Review the failures above."
    Write-Info "You can proceed with caution or re-run the migration."
} else {
    Write-Host "  ✗ MIGRATION MAY HAVE ISSUES" -ForegroundColor Red
    Write-Host ""
    Write-Info "Significant issues detected. Consider re-running migration."
}

Write-Host "`n============================================`n" -ForegroundColor Magenta
