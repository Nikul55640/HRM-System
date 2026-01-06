# 🔔 Kiro HRM Notification System

## Overview

Kiro HRM uses **Server-Sent Events (SSE)** for real-time notifications. Notifications are **one-way**, **role-based**, and **permission-controlled**. **Attendance late detection** triggers instant alerts to Employees, HR, and Admin. Notifications are **stored in DB**, **pushed via SSE**, and **marked as read from the UI**.

## Key Features

### ⚡ Real-time Communication
- **Server-Sent Events (SSE)** for instant delivery
- **One-way communication** (Server → Client only)
- **Automatic reconnection** on network interruptions
- **Live connection status** indicator

### 👥 Role-based Targeting
- **Employee**: Personal notifications (late alerts, leave approvals, shift assignments)
- **HR**: Team management alerts (leave applications, attendance corrections)
- **Admin**: System-wide notifications (audit events, bulk operations)

### 🔐 Permission-controlled
- **JWT authentication** for SSE connections
- **User isolation** - only see own notifications
- **Role-based access control** for notification types
- **Secure token handling** via query parameters for SSE

### 🕐 Late Attendance Detection
- **Automatic detection** on clock-in
- **Grace period** consideration per shift
- **Instant alerts** to Employee, HR, and Admin
- **Detailed metadata** (late minutes, shift info, employee details)

### 💾 Persistent Storage
- **Database storage** for all notifications
- **Metadata support** for rich context
- **Automatic cleanup** of old read notifications
- **Pagination** for large notification lists

### 🖥️ User Interface
- **Notification bell** in header with unread count
- **Dropdown preview** with recent notifications
- **Dedicated notifications page** (`/notifications`) for full history
- **Real-time updates** without page refresh
- **Mark as read/delete** actions

## Technical Architecture

### Backend Stack
- **Node.js + Express** for SSE server
- **MySQL + Sequelize** for data persistence
- **JWT authentication** for security
- **Role-based middleware** for access control

### Frontend Stack
- **React + Zustand** for state management
- **EventSource API** for SSE client
- **React Router** for navigation
- **Tailwind CSS** for styling

### Data Flow
```
Action Trigger → Notification Service → Database + SSE Manager → Connected Clients → UI Update
```

## Notification Categories

| Category | Description | Recipients | Auto-trigger |
|----------|-------------|------------|--------------|
| **attendance** | Late clock-ins, corrections | Employee, HR, Admin | ✅ |
| **leave** | Applications, approvals | Employee, HR, Admin | ✅ |
| **shift** | Assignments, changes | Employee | ✅ |
| **system** | Alerts, maintenance | Admin | Manual |
| **audit** | Security events | Admin | ✅ |

## Implementation Status

### ✅ Completed Features
- [x] SSE infrastructure with connection management
- [x] Database schema and models
- [x] Role-based notification targeting
- [x] Late attendance detection and alerts
- [x] Notification bell UI component
- [x] Dedicated notifications page
- [x] Real-time connection status
- [x] Mark as read/delete functionality
- [x] Automatic cleanup job
- [x] Integration with attendance system

### 🔄 Integration Points
- **Attendance Controller**: Late detection on clock-in
- **Leave System**: Application and approval notifications
- **Shift Management**: Assignment notifications
- **Audit System**: Security event notifications

## Usage Examples

### Automatic Late Detection
```javascript
// Triggered automatically in attendance.service.js
if (isLate) {
  await notificationService.notifyLateClockIn(attendanceRecord);
}
```

### Manual Notification
```javascript
await notificationService.sendToUser(userId, {
  title: 'Leave Approved',
  message: 'Your leave request has been approved',
  type: 'success',
  category: 'leave'
});
```

### Role-based Broadcasting
```javascript
await notificationService.sendToRoles(['hr', 'admin'], {
  title: 'New Leave Application',
  message: 'John Doe applied for annual leave',
  type: 'info',
  category: 'leave'
});
```

## Performance & Scalability

- **Lightweight SSE connections** (< 1KB per connection)
- **Efficient connection pooling** for multiple users
- **Database indexing** for fast notification queries
- **Automatic cleanup** prevents database bloat
- **Graceful degradation** if SSE unavailable

## Security Measures

- **JWT token validation** for all SSE connections
- **Role-based access control** for notification visibility
- **Input sanitization** for notification content
- **CORS protection** for cross-origin requests
- **Rate limiting** to prevent notification spam

## Monitoring & Debugging

- **Connection statistics** via SSE manager
- **Comprehensive logging** for all notification events
- **Test endpoints** for development and debugging
- **Browser dev tools** integration for troubleshooting

---

**Result**: A robust, real-time notification system that enhances user experience with instant alerts, role-based targeting, and seamless UI integration, specifically designed for HRM workflows including automatic late attendance detection.