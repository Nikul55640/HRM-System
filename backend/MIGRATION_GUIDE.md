# HRM System Migration Guide

## Overview
This guide helps you migrate from the old HRM system structure to the new restructured models with enhanced features including audit logging and policy management.

## Migration Options

### Option 1: Run Migration (Recommended for existing data)
```bash
# Run the migration to update existing database
npm run migrate

# Then seed with new data
npm run seed
```

### Option 2: Fresh Database Setup
```bash
# For completely fresh setup (will recreate all tables)
npm run reset

# Or step by step
npm run db:sync:force
npm run seed
```

### Option 3: Safe Sync (Recommended for development)
```bash
# Sync database structure without losing data
npm run db:sync
npm run seed
```

## What's New

### New Models
- **AuditLog**: Complete system activity tracking
- **SystemPolicy**: Centralized policy management

### Enhanced Models
- **Employee**: Restructured with proper fields (name, bank details, etc.)
- **AttendanceRecord**: Enhanced break tracking and corrections
- **LeaveRequest/LeaveBalance**: Simplified leave types and cancellation
- **Lead**: Integrated follow-up notes

### Removed Models
- EmployeeProfile (merged into Employee)
- LeaveType (simplified to enum)
- LeadActivity/LeadNote (simplified)
- Old Config/Notification models

## Default Credentials
- **SuperAdmin**: admin@hrm.com / admin123
- **HR Manager**: hr@hrm.com / hr123  
- **Employee**: john@hrm.com / john123

⚠️ **Change these passwords immediately in production!**

## Verification
After migration, verify:
1. All tables are created correctly
2. Default users can login
3. System policies are configured
4. Leave balances are assigned
5. Audit logging is working

## Rollback
If needed, rollback the migration:
```bash
npm run migrate:down
```

⚠️ **Warning**: Rollback may cause data loss. Backup first!