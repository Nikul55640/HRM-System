# 🔔 Real-time Notification System Setup Guide

This guide will help you set up the SSE-based real-time notification system in the HRM application.

## 📋 Overview

The notification system provides:
- **Real-time notifications** via Server-Sent Events (SSE)
- **Role-based targeting** (Employee, HR, Admin)
- **Persistent storage** in database
- **Automatic reconnection** on network issues
- **Clean UI integration** with notification bell
- **Late attendance detection** with instant alerts
- **Dedicated notifications page** for full history

## 🚀 Setup Instructions

### 1. Backend Setup

#### Run Database Migration
```bash
cd HRM-System/backend
npm run migrate:notifications
```

#### Test the System
```bash
npm run test:notifications
```

#### Start the Backend
```bash
npm run dev
```

### 2. Frontend Setup

The frontend components are already integrated. Just start the development server:

```bash
cd HRM-System/frontend
npm run dev
```

### 3. Verify Installation

1. **Login to the application**
2. **Look for the notification bell** in the top-right header
3. **Check connection status** - should show "Live" with green dot
4. **Visit notifications page** at `/notifications`
5. **Test notifications** by triggering actions like:
   - Clocking in late (triggers instant late alert)
   - Submitting attendance correction requests
   - Applying for leave (when implemented)
   - Admin actions

## 🔧 System Architecture

### Backend Components

```
backend/
├── src/
│   ├── models/sequelize/
│   │   └── Notification.js          # Database model
│   ├── services/
│   │   ├── notificationService.js   # Business logic
│   │   └── admin/attendance.service.js # Late detection integration
│   ├── utils/
│   │   └── sseManager.js           # SSE connection management
│   ├── controllers/employee/
│   │   └── notifications.controller.js # API endpoints
│   ├── routes/employee/
│   │   └── notifications.routes.js  # Route definitions
│   └── jobs/
│       └── notificationCleanup.js   # Cleanup old notifications
├── migrations/
│   └── create-notifications.js      # Database schema
└── test-notifications.js           # Test script
```

### Frontend Components

```
frontend/
├── src/
│   ├── components/
│   │   └── NotificationBell.jsx     # Main notification UI
│   ├── modules/notifications/pages/
│   │   └── NotificationsPage.jsx    # Full notifications page
│   ├── services/
│   │   └── notificationService.js   # SSE client & API calls
│   ├── stores/
│   │   └── useNotificationStore.js  # Zustand state management
│   ├── hooks/
│   │   └── useNotifications.js      # Connection lifecycle
│   └── core/layout/
│       ├── Header.jsx               # Updated with notification bell
│       ├── Sidebar.jsx              # Added notifications link
│       └── MainLayout.jsx           # Initializes notifications
```

## 📡 API Endpoints

### SSE Stream
- `GET /api/employee/notifications/stream` - Real-time notification stream

### REST API
- `GET /api/employee/notifications` - List notifications
- `GET /api/employee/notifications/unread-count` - Get unread count
- `PUT /api/employee/notifications/:id/read` - Mark as read
- `PUT /api/employee/notifications/read-all` - Mark all as read
- `DELETE /api/employee/notifications/:id` - Delete notification

## 🎯 Notification Types & Recipients

| Event | Employee | HR | Admin | Type | Auto-Trigger |
|-------|----------|----|----|------|--------------|
| Late clock-in | ✅ | ✅ | ✅ | warning | ✅ Instant |
| Leave applied | ❌ | ✅ | ✅ | info | ✅ |
| Leave approved | ✅ | ❌ | ✅ | success | ✅ |
| Attendance correction | ❌ | ✅ | ✅ | info | ✅ |
| Shift assigned | ✅ | ❌ | ❌ | info | ✅ |

## ⚡ Late Attendance Detection

The system automatically detects late clock-ins and sends instant notifications:

### How It Works
1. **Employee clocks in** via attendance system
2. **System calculates lateness** based on shift start time + grace period
3. **If late detected**, instant notifications sent to:
   - Employee (warning about being late)
   - HR team (alert about late employee)
   - Admin (system alert)
4. **Real-time delivery** via SSE to all connected users

### Configuration
- **Grace period** configurable per shift (default: 15 minutes)
- **Shift times** managed in shift management
- **Notification content** includes late minutes and employee details

## 🔌 Integration Examples

### Send Notification to User
```javascript
import notificationService from '../services/notificationService.js';

await notificationService.sendToUser(userId, {
  title: 'Leave Approved',
  message: 'Your leave request has been approved',
  type: 'success',
  category: 'leave',
  metadata: { leaveRequestId: 123 }
});
```

### Send Notification to Role
```javascript
await notificationService.sendToRoles(['admin', 'hr'], {
  title: 'New Leave Application',
  message: 'John Doe has applied for leave',
  type: 'info',
  category: 'leave',
  metadata: { employeeId: 456 }
});
```

### Late Clock-in (Automatic)
```javascript
// Automatically triggered in attendance.service.js
await notificationService.notifyLateClockIn(attendanceRecord);
```

## 🖥️ User Interface

### Notification Bell
- **Location**: Top-right header
- **Features**: 
  - Unread count badge
  - Connection status indicator
  - Dropdown with recent notifications
  - Mark as read/delete actions
  - Link to full notifications page

### Notifications Page
- **URL**: `/notifications`
- **Features**:
  - Full notification history
  - Search and filtering
  - Real-time connection status
  - Bulk actions (mark all read)
  - Detailed metadata display
  - Pagination support

## 🛠️ Troubleshooting

### SSE Connection Issues

1. **Check browser console** for connection errors
2. **Verify JWT token** is valid and not expired
3. **Check network tab** for SSE stream status
4. **Look at backend logs** for authentication errors

### Database Issues

1. **Run migration** if notifications table doesn't exist:
   ```bash
   npm run migrate:notifications
   ```

2. **Check database connection** in backend logs

3. **Verify user roles** are correctly set

### Frontend Issues

1. **Check notification store** in browser dev tools
2. **Verify API base URL** in environment variables
3. **Check for JavaScript errors** in console

## 🔄 Rollback Instructions

If you need to remove the notification system:

### 1. Remove Database Table
```bash
cd HRM-System/backend
npm run migrate:notifications:down
```

### 2. Remove Frontend Integration
- Remove `NotificationBell` from `Header.jsx`
- Remove `useNotifications()` from `MainLayout.jsx`
- Remove notifications link from `Sidebar.jsx`
- Delete notification-related files

## 📈 Performance Considerations

- **SSE connections** are lightweight and efficient
- **Database cleanup** runs daily at 2 AM (configurable)
- **Connection pooling** handles multiple users
- **Automatic reconnection** prevents connection leaks
- **Lazy loading** for notifications page components

## 🔒 Security Features

- **JWT authentication** for SSE connections
- **Role-based access control** for notifications
- **User isolation** - users only see their own notifications
- **Input validation** on all endpoints
- **CORS protection** for cross-origin requests

## 🎉 Success!

Your real-time notification system is now ready! Users will receive instant notifications for:
- **Late clock-ins** (automatic detection)
- Leave requests and approvals
- Attendance corrections
- Shift assignments
- System alerts

The system automatically handles connection management, reconnection, and provides a clean user experience with both the notification bell and dedicated notifications page.