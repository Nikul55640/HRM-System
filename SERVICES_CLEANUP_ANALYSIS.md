# Services Folder Cleanup Analysis

## Current State Analysis

### Duplicate Services Found

#### 1. documentService
- **Location 1**: `frontend/src/services/documentService.js` (Employee-focused)
- **Location 2**: `frontend/src/modules/documents/services/documentService.js` (Admin-focused)
- **Differences**: 
  - Services version: Employee-centric with toast notifications, focuses on employee documents
  - Modules version: Admin-centric, more comprehensive with categories, filters, and bulk operations
- **Recommendation**: Keep modules version (more comprehensive), remove services version

#### 2. employeeSelfService
- **Location 1**: `frontend/src/services/employeeSelfService.js` (Comprehensive)
- **Location 2**: `frontend/src/modules/ess/services/employeeSelfService.js` (Basic)
- **Differences**:
  - Services version: Full-featured with profile, bank details, payslips, leave, attendance, requests, notifications
  - Modules version: Basic with only bank details, personal info, change history, and requests
- **Recommendation**: Keep services version (more comprehensive), remove modules version

#### 3. managerService
- **Location 1**: `frontend/src/services/managerService.js` (Comprehensive)
- **Location 2**: `frontend/src/modules/manager/services/managerService.js` (Basic)
- **Differences**:
  - Services version: Full-featured with team management, approvals, reports, dashboard, export
  - Modules version: Basic with limited functionality
- **Recommendation**: Keep services version (more comprehensive), remove modules version

### Unused Services Found

#### 1. notificationService
- **File**: `frontend/src/services/notificationService.js`
- **Usage**: Only exported in index.js, no actual imports found in frontend code
- **Backend**: Has backend implementation, but frontend service is unused
- **Recommendation**: Remove from frontend services (functionality exists in employeeSelfService.notifications)

#### 2. ipDetectionService
- **File**: `frontend/src/services/ipDetectionService.js`
- **Usage**: No imports found anywhere in codebase
- **Recommendation**: Remove completely (unused)

#### 3. leaveRequestService
- **File**: Referenced in index.js but file doesn't exist
- **Recommendation**: Remove from index.js exports

### Services to Keep (No Issues)

1. **adminDashboardService** - Used by admin dashboard
2. **employeeDashboardService** - Used by employee dashboard  
3. **calendarService** - Calendar functionality
4. **userService** - User management functionality

## Cleanup Plan

### Phase 1: Remove Unused Services
1. Delete `frontend/src/services/notificationService.js`
2. Delete `frontend/src/services/ipDetectionService.js`
3. Remove exports from `frontend/src/services/index.js`

### Phase 2: Consolidate Duplicates
1. **documentService**: Remove services version, update imports to use modules version
2. **employeeSelfService**: Remove modules version, update imports to use services version
3. **managerService**: Remove modules version, update imports to use services version

### Phase 3: Update Imports
1. Find and update all imports that reference the removed services
2. Ensure all functionality is preserved through the consolidated versions

## Files to be Removed
- `frontend/src/services/notificationService.js`
- `frontend/src/services/ipDetectionService.js`
- `frontend/src/services/documentService.js`
- `frontend/src/modules/ess/services/employeeSelfService.js`
- `frontend/src/modules/manager/services/managerService.js`

## Files to be Updated
- `frontend/src/services/index.js` (remove unused exports, update documentService export)
- Any files importing the removed services (to be identified)