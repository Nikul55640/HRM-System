# Leave Services Architecture

## Overview
The leave management functionality is split between two complementary services to provide clear separation of concerns and better maintainability.

## Services

### leaveService.js
**Purpose**: General leave operations for all user types
**Scope**: Employee self-service + basic admin operations

**Key Features**:
- Employee leave balance queries
- Employee leave request creation/cancellation
- Basic admin leave request approval/rejection
- Leave types management
- Leave calendar integration
- Basic reporting

### adminLeaveService.js
**Purpose**: Advanced admin-specific leave management
**Scope**: Administrative operations and bulk management

**Key Features**:
- Advanced leave request filtering and management
- Bulk operations (approve/reject multiple requests)
- Comprehensive leave balance management
- Leave analytics and trends
- Leave policy management
- Advanced reporting and exports
- Leave statistics and dashboard data

## Usage Examples

### Basic Leave Operations (leaveService)
```javascript
import { leaveService } from '../services';

// Employee operations
const balance = await leaveService.getMyLeaveBalance();
const history = await leaveService.getMyLeaveHistory();
await leaveService.createLeaveRequest(requestData);

// Basic admin operations
const requests = await leaveService.getLeaveRequests();
await leaveService.approveLeaveRequest(requestId, approvalData);
```

### Advanced Admin Operations (adminLeaveService)
```javascript
import { adminLeaveService } from '../services';

// Bulk operations
await adminLeaveService.bulkApproveLeaveRequests(requestIds, data);
await adminLeaveService.bulkAssignLeaveBalances(assignments);

// Analytics and reporting
const analytics = await adminLeaveService.getLeaveAnalytics(params);
const trends = await adminLeaveService.getLeaveTrends(params);
const report = await adminLeaveService.exportLeaveData(params);

// Policy management
const policies = await adminLeaveService.getLeavePolicies();
await adminLeaveService.createLeavePolicy(policyData);
```

## API Endpoints

### Common Endpoints (both services)
- `GET /admin/leave/leave-requests` - Get leave requests
- `PUT /admin/leave/leave-requests/:id/approve` - Approve request
- `PUT /admin/leave/leave-requests/:id/reject` - Reject request
- `GET /admin/leave/balances` - Get leave balances

### Admin-Specific Endpoints (adminLeaveService)
- `POST /admin/leave/leave-requests/bulk-approve` - Bulk approve
- `POST /admin/leave/leave-requests/bulk-reject` - Bulk reject
- `POST /admin/leave/balances/bulk-assign` - Bulk assign balances
- `GET /admin/leave/analytics` - Analytics data
- `GET /admin/leave/trends` - Trends data
- `GET /admin/leave/policies` - Leave policies
- `GET /admin/leave/export/excel` - Export to Excel
- `GET /admin/leave/export/pdf` - Export to PDF

## Error Handling
Both services include comprehensive error logging and consistent error handling patterns. All methods include try-catch blocks with descriptive error messages for debugging.

## Integration
Both services are exported from the main services index file and can be imported individually or together as needed by components.