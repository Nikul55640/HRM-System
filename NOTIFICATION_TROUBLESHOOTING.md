# 🔧 Notification System Troubleshooting Guide

## Common Issues & Solutions

### 1. "No authentication token available" / "Please login to receive notifications"

**Symptoms:**
- Notification bell shows "Offline" status
- Connection error message in notifications page
- SSE connection fails to establish

**Causes & Solutions:**

#### A. User Not Logged In
```bash
# Check if user is authenticated
# In browser console:
localStorage.getItem('auth_token')
# Should return a JWT token, not null
```

**Solution:** Login to the application first

#### B. Token Expired
```bash
# Check token expiration
# Decode JWT token at jwt.io or:
const token = localStorage.getItem('auth_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token expires:', new Date(payload.exp * 1000));
```

**Solution:** Refresh the page to trigger token refresh, or login again

#### C. Token Storage Issue
```bash
# Check token storage
console.log('Auth token:', localStorage.getItem('auth_token'));
console.log('Refresh token:', localStorage.getItem('refresh_token'));
```

**Solution:** Clear storage and login again:
```javascript
localStorage.clear();
window.location.href = '/login';
```

### 2. SSE Connection Fails

**Symptoms:**
- Connection status shows "Offline"
- No real-time notifications received
- Console errors about EventSource

**Solutions:**

#### A. Check Backend Server
```bash
# Verify backend is running
curl http://localhost:5000/api/employee/notifications/stream?token=YOUR_TOKEN
```

#### B. CORS Issues
- Ensure backend CORS is configured for frontend URL
- Check browser network tab for CORS errors

#### C. Firewall/Proxy Issues
- SSE requires persistent HTTP connections
- Some corporate firewalls block SSE
- Try different network if possible

### 3. Notifications Not Appearing

**Symptoms:**
- SSE connected but no notifications show
- Database has notifications but UI doesn't update

**Solutions:**

#### A. Check Notification Store
```javascript
// In browser console:
window.useNotificationStore?.getState?.()
// Should show notifications array and connection status
```

#### B. Test with Debug Component
- Debug component appears in bottom-right in development mode
- Use "Add Test Notification" button to test UI
- Check connection status and token presence

#### C. Backend Notification Sending
```bash
# Test notification creation
npm run test:notifications
```

### 4. Performance Issues

**Symptoms:**
- Slow notification loading
- High memory usage
- Connection drops frequently

**Solutions:**

#### A. Connection Cleanup
```javascript
// Check active connections (backend)
// In backend console, SSE manager should show connection count
```

#### B. Database Performance
```sql
-- Check notification table size
SELECT COUNT(*) FROM notifications;

-- Check indexes
SHOW INDEX FROM notifications;
```

#### C. Cleanup Old Notifications
```bash
# Run cleanup job manually
node -e "
const service = require('./src/services/notificationService.js').default;
service.cleanupOldNotifications(30).then(console.log);
"
```

## Debug Tools

### 1. Browser Console Commands

```javascript
// Check notification store state
window.useNotificationStore?.getState?.()

// Check authentication
localStorage.getItem('auth_token')

// Manual SSE connection test
const token = localStorage.getItem('auth_token');
const es = new EventSource(`http://localhost:5000/api/employee/notifications/stream?token=${token}`);
es.onmessage = console.log;
es.onerror = console.error;
```

### 2. Backend Debug Commands

```bash
# Test notification system
npm run test:notifications

# Check database connection
node -e "
const sequelize = require('./src/config/sequelize.js').default;
sequelize.authenticate().then(() => console.log('DB OK')).catch(console.error);
"

# Test SSE endpoint
curl -N "http://localhost:5000/api/employee/notifications/stream?token=YOUR_TOKEN"
```

### 3. Development Debug Component

The debug component (bottom-right corner in dev mode) shows:
- Authentication status
- Token presence
- SSE connection status
- Notification count
- Error messages
- Test buttons

## Environment-Specific Issues

### Development Environment
- Use debug component for real-time monitoring
- Check console for detailed error messages
- Verify environment variables (VITE_API_BASE_URL)

### Production Environment
- Check server logs for SSE connection errors
- Verify SSL certificates for HTTPS
- Monitor connection counts and cleanup

## Quick Fixes

### 1. Complete Reset
```javascript
// Clear all data and restart
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

### 2. Force Reconnection
```javascript
// In browser console
const service = window.notificationService;
service?.disconnectFromSSE();
setTimeout(() => service?.connectToSSE(), 1000);
```

### 3. Check Service Status
```javascript
// Verify all services are working
const checks = {
  token: !!localStorage.getItem('auth_token'),
  store: !!window.useNotificationStore,
  service: !!window.notificationService
};
console.log('Service Status:', checks);
```

## Getting Help

If issues persist:

1. **Check browser console** for JavaScript errors
2. **Check network tab** for failed requests
3. **Check backend logs** for server errors
4. **Use debug component** to verify system state
5. **Test with different user accounts** to isolate user-specific issues
6. **Try different browsers** to rule out browser-specific problems

## Prevention

- **Regular token refresh** (handled automatically)
- **Connection monitoring** (built-in reconnection)
- **Error handling** (graceful degradation)
- **Database maintenance** (automated cleanup)
- **Performance monitoring** (connection limits)