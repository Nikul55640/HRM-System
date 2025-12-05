# Import Path Update Script
# Purpose: Update import paths after frontend restructuring
# Date: December 5, 2025

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = "import-update-log-$timestamp.txt"
$updatedFiles = 0

# Color functions
function Write-Success { param($message) Write-Host $message -ForegroundColor Green }
function Write-Info { param($message) Write-Host $message -ForegroundColor Cyan }
function Write-Warning { param($message) Write-Host $message -ForegroundColor Yellow }

function Write-Log {
    param($message, $level = "INFO")
    $logMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [$level] $message"
    Add-Content -Path $logFile -Value $logMessage
    
    switch ($level) {
        "SUCCESS" { Write-Success $message }
        "WARNING" { Write-Warning $message }
        default { Write-Info $message }
    }
}

Write-Host "`n============================================" -ForegroundColor Magenta
Write-Host "   Import Path Update Script v1.0          " -ForegroundColor Magenta
Write-Host "============================================`n" -ForegroundColor Magenta

if ($DryRun) {
    Write-Warning "DRY RUN MODE - No files will be modified`n"
}

Write-Log "Starting import path updates..." "INFO"

# Define import path mappings (old path → new path)
$importMappings = @{
    # Employee features
    "features/ess/profile" = "features/employee/profile"
    "features/ess/attendance" = "features/employee/attendance"
    "features/ess/leave" = "features/employee/leave"
    "features/ess/payslips" = "features/employee/payroll"
    "features/ess/documents" = "features/employee/documents"
    "features/ess/bankdetails" = "features/employee/bank-details"
    "features/dashboard/employee" = "features/employee/dashboard"
    
    # Admin features
    "features/employees" = "features/admin/employees"
    "features/hr/attendance" = "features/admin/attendance"
    "features/hr/leave" = "features/admin/leave"
    "features/hr/organization" = "features/admin/organization"
    "features/dashboard/admin" = "features/admin/dashboard"
    "features/departments" = "features/admin/departments"
    "features/payroll" = "features/admin/payroll"
    
    # Shared
    "features/auth" = "features/shared/auth"
    
    # Also handle with backslashes
    "features\\ess\\profile" = "features/employee/profile"
    "features\\ess\\attendance" = "features/employee/attendance"
    "features\\ess\\leave" = "features/employee/leave"
    "features\\ess\\payslips" = "features/employee/payroll"
    "features\\ess\\documents" = "features/employee/documents"
    "features\\ess\\bankdetails" = "features/employee/bank-details"
    "features\\dashboard\\employee" = "features/employee/dashboard"
    "features\\employees" = "features/admin/employees"
    "features\\hr\\attendance" = "features/admin/attendance"
    "features\\hr\\leave" = "features/admin/leave"
    "features\\hr\\organization" = "features/admin/organization"
    "features\\dashboard\\admin" = "features/admin/dashboard"
    "features\\departments" = "features/admin/departments"
    "features\\payroll" = "features/admin/payroll"
    "features\\auth" = "features/shared/auth"
    
    # Relative paths variations
    "../ess/profile" = "../employee/profile"
    "../ess/attendance" = "../employee/attendance"
    "../ess/leave" = "../employee/leave"
    "../ess/payslips" = "../employee/payroll"
    "../ess/documents" = "../employee/documents"
    "../ess/bankdetails" = "../employee/bank-details"
    "../../ess/profile" = "../../employee/profile"
    "../../ess/attendance" = "../../employee/attendance"
    "../../../ess/profile" = "../../../employee/profile"
    "../../dashboard/employee" = "../../employee/dashboard"
    "../../../dashboard/employee" = "../../../employee/dashboard"
}

# Find all JavaScript/JSX files
$searchPaths = @(
    "frontend\src\features\employee",
    "frontend\src\features\admin",
    "frontend\src\features\shared",
    "frontend\src\routes",
    "frontend\src\App.jsx"
)

$filesToUpdate = @()
foreach ($searchPath in $searchPaths) {
    if (Test-Path $searchPath) {
        $files = Get-ChildItem -Path $searchPath -Include *.js,*.jsx -Recurse -File -ErrorAction SilentlyContinue
        $filesToUpdate += $files
    }
}

Write-Log "Found $($filesToUpdate.Count) files to scan" "INFO"
Write-Host ""

# Process each file
foreach ($file in $filesToUpdate) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    $fileUpdated = $false
    
    # Apply all mappings
    foreach ($mapping in $importMappings.GetEnumerator()) {
        if ($content -match [regex]::Escape($mapping.Key)) {
            $content = $content -replace [regex]::Escape($mapping.Key), $mapping.Value
            $fileUpdated = $true
        }
    }
    
    # If file was modified, save it
    if ($fileUpdated) {
        if (!$DryRun) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
        }
        
        $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
        Write-Log "  Updated: $relativePath" "SUCCESS"
        $updatedFiles++
    } elseif ($Verbose) {
        $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
        Write-Log "  Skipped: $relativePath (no changes needed)" "INFO"
    }
}

# Summary
Write-Host "`n============================================" -ForegroundColor Magenta
Write-Host "                SUMMARY                     " -ForegroundColor Magenta
Write-Host "============================================`n" -ForegroundColor Magenta

Write-Log "Files scanned: $($filesToUpdate.Count)" "INFO"
Write-Log "Files updated: $updatedFiles" "INFO"
Write-Log "Log file: $logFile" "INFO"

if ($DryRun) {
    Write-Host ""
    Write-Warning "DRY RUN COMPLETE - No files were actually modified"
    Write-Info "Run without -DryRun to perform actual updates"
} else {
    Write-Host ""
    Write-Success "✓ IMPORT PATHS UPDATED!"
    Write-Info ""
    Write-Info "Next Steps:"
    Write-Info "1. Test the application"
    Write-Info "2. Check for any import errors in console"
    Write-Info "3. If everything works, proceed with cleanup"
}

Write-Host "`n============================================`n" -ForegroundColor Magenta
