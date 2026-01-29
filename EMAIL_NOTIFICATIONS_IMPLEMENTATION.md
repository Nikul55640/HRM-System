# Email Notifications Implementation Guide

## ✅ IMPLEMENTATION COMPLETE

Your HRM system now supports email notifications! Employees and admins will receive important notifications both in-app and via email.

---

## 📧 What Was Added

### Email Service Features
- ✅ **SMTP Integration** - Uses nodemailer with Gmail/Outlook support
- ✅ **Professional Templates** - Beautiful HTML email templates
- ✅ **HRM-Specific Emails** - Attendance, leave, payroll, account notifications
- ✅ **Automatic Sending** - Emails sent automatically for important events
- ✅ **Fallback Support** - Works even if email fails (in-app notifications continue)
- ✅ **Testing Tools** - Admin panel to test email functionality

### Email Types Implemented
| Category | Email Type | When Sent |
|----------|------------|-----------|
| **Attendance** | Marked Absent | Auto-marked absent for no clock-in |
| **Attendance** | Correction Required | Missed clock-out, needs correction |
| **Attendance** | Auto-Finalized | Auto clock-out at shift end |
| **Leave** | Leave Approved | HR approves leave request |
| **Leave** | Leave Rejected | HR rejects leave request |
| **Account** | Password Reset | User requests password reset |
| **Account** | Account Created | New employee account created |
| **Payroll** | Payslip Generated | Monthly payslip ready |

---

## 🔧 Files Created/Modified

### New Files Created
1. **`src/services/emailService.js`** - Core email service
2. **`src/controllers/admin/emailConfig.controller.js`** - Email admin controls
3. **`src/routes/admin/emailConfig.routes.js`** - Email API routes
4. **`test-email.js`** - Email testing script

### Files Modified
1. **`src/services/notificationService.js`** - Added email support
2. **`src/jobs/attendanceFinalization.js`** - Email for auto-finalized attendance
3. **`src/app.js`** - Added email routes
4. **`.env`** - Added FRONTEND_URL

---

## ⚙️ Configuration

### Environment Variables (.env)
```bash
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@hrms.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5174
```

### Gmail Setup (Recommended)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Update .env**:
   ```bash
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

### Other Email Providers
| Provider | SMTP_HOST | SMTP_PORT | SMTP_SECURE |
|----------|-----------|-----------|-------------|
| Gmail | smtp.gmail.com | 587 | false |
| Outlook | smtp-mail.outlook.com | 587 | false |
| Yahoo | smtp.mail.yahoo.com | 587 | false |
| Zoho | smtp.zoho.com | 587 | false |

---

## 🚀 How to Test

### Method 1: Test Script (Recommended)
```bash
cd HRM-System/backend
node test-email.js
```

**Expected Output**:
```
🔧 Testing Email Service...

1. Checking email configuration...
✅ Email service is configured

2. Verifying SMTP connection...
✅ SMTP connection successful

3. Sending test email...
✅ Test email sent successfully to your-email@gmail.com

4. Testing HRM email templates...
✅ Absent notification email template test successful
✅ Leave approval email template test successful

🎉 Email service testing completed!
```

### Method 2: API Testing
```bash
# Test email service status
curl -X GET http://localhost:5000/api/admin/email/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Send test email
curl -X POST http://localhost:5000/api/admin/email/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Method 3: Real HRM Events
1. **Test Absent Notification**:
   - Don't clock in for a day
   - Wait for finalization job (runs every 15 minutes)
   - Check email for absent notification

2. **Test Leave Approval**:
   - Apply for leave as employee
   - Approve/reject as HR
   - Check email for approval/rejection

3. **Test Auto-Finalize**:
   - Clock in but don't clock out
   - Wait 30 minutes after shift end
   - Check email for auto-finalize notification

---

## 📊 Email Templates

### Template Structure
All emails use a consistent, professional template with:
- **Header** - HRM System branding with colored header
- **Content** - Clear message with important details highlighted
- **Action Button** - Direct link to relevant HRM page
- **Footer** - Professional footer with company info

### Template Types
| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| Success | Green | ✅ | Leave approved, account created |
| Error | Red | ❌ | Marked absent, leave rejected |
| Warning | Orange | ⚠️ | Correction required, late arrival |
| Info | Blue | ℹ️ | Auto-finalized, general updates |

### Sample Email (Absent Notification)
```html
Subject: Attendance Alert - Marked Absent (2026-01-29)

Hello John Doe,

Your attendance for 2026-01-29 has been marked as ABSENT.

Reason: No clock-in recorded

If this is incorrect, please submit a correction request 
immediately or contact HR.

[Submit Correction Request] (Button)

This is an automated message from HRM System.
© 2026 HRM System. All rights reserved.
```

---

## 🔄 How It Works

### Notification Flow
```
Event Happens (e.g., Leave Approved)
    ↓
notificationService.sendToUser()
    ├── Save to Database (in-app notification)
    ├── Send via SSE (real-time notification)
    └── Send Email (if enabled for this event type)
        ↓
    emailService.sendLeaveStatusEmail()
        ↓
    Generate HTML template
        ↓
    Send via SMTP
        ↓
    User receives email in Gmail/Outlook
```

### Email Decision Logic
```javascript
// Only send emails for important events
shouldSendEmail(notificationData) {
  const emailCategories = ['attendance', 'leave', 'account', 'payroll'];
  const emailTypes = ['error', 'warning', 'success'];
  
  return emailCategories.includes(category) || 
         emailTypes.includes(type);
}
```

### Automatic Email Events
| Event | Trigger | Email Sent To |
|-------|---------|---------------|
| Employee marked absent | Finalization job | Employee |
| Leave approved/rejected | HR action | Employee |
| Auto-finalized attendance | 30 min after shift | Employee |
| Password reset requested | User action | User |
| New account created | Admin action | New employee |
| Payslip generated | Payroll process | Employee |

---

## 🛠️ Admin Panel Features

### Email Status Check
**Endpoint**: `GET /api/admin/email/status`
**Access**: Super Admin, HR Admin

**Response**:
```json
{
  "success": true,
  "data": {
    "isConfigured": true,
    "connectionStatus": true,
    "smtpHost": "smtp.gmail.com",
    "smtpPort": "587",
    "smtpUser": "your-email@gmail.com",
    "emailFrom": "noreply@hrms.com",
    "lastChecked": "2026-01-29T10:30:00.000Z"
  }
}
```

### Send Test Email
**Endpoint**: `POST /api/admin/email/test`
**Access**: Super Admin only

**Request**:
```json
{
  "email": "test@example.com"
}
```

### Send Test Notification
**Endpoint**: `POST /api/admin/email/test-notification`
**Access**: Super Admin only

**Request**:
```json
{
  "userId": 1,
  "title": "Test Notification",
  "message": "This is a test notification with email",
  "type": "info",
  "category": "system",
  "sendEmail": true
}
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. "Email service not configured"
**Cause**: Missing SMTP environment variables
**Solution**: 
```bash
# Check .env file has all required variables
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@hrms.com
```

#### 2. "SMTP connection failed"
**Cause**: Wrong credentials or security settings
**Solution**:
- For Gmail: Use App Password, not regular password
- Enable 2-Factor Authentication first
- Check SMTP_HOST and SMTP_PORT are correct

#### 3. "Authentication failed"
**Cause**: Invalid email/password
**Solution**:
- Gmail: Generate new App Password
- Outlook: Use account password or App Password
- Check SMTP_USER is the full email address

#### 4. "Connection timeout"
**Cause**: Firewall or network issues
**Solution**:
- Check port 587 is not blocked
- Try SMTP_PORT=465 with SMTP_SECURE=true
- Check corporate firewall settings

#### 5. Emails not being sent
**Cause**: Email service disabled or failing silently
**Solution**:
```bash
# Check logs for email errors
tail -f backend/logs/combined.log | grep -i email

# Test email service
node test-email.js

# Check email status via API
curl -X GET http://localhost:5000/api/admin/email/status
```

### Debug Commands
```bash
# Test email service
node test-email.js

# Check email configuration
node -e "
import emailService from './src/services/emailService.js';
console.log('Configured:', emailService.isConfigured);
"

# Check environment variables
echo $SMTP_HOST
echo $SMTP_USER
echo $EMAIL_FROM
```

---

## 📈 Performance & Scalability

### Current Implementation
- **Synchronous**: Emails sent immediately when notification is created
- **Fallback**: If email fails, in-app notification still works
- **Error Handling**: Email failures don't break the notification flow

### Production Recommendations
1. **Queue System**: Use Redis/Bull for email queue (future enhancement)
2. **Rate Limiting**: Implement email rate limiting to avoid spam
3. **Email Service**: Consider SendGrid/SES for production (more reliable)
4. **Monitoring**: Add email delivery tracking and metrics
5. **Templates**: Store email templates in database for easy editing

### Scaling Options
```javascript
// Future: Queue-based email sending
import Queue from 'bull';
const emailQueue = new Queue('email processing');

emailQueue.process(async (job) => {
  const { userId, emailData } = job.data;
  await emailService.sendEmail(emailData);
});

// Add to queue instead of sending immediately
emailQueue.add('send-email', { userId, emailData });
```

---

## 🎯 Next Steps

### Immediate (Testing)
1. **Configure SMTP** - Update .env with your email credentials
2. **Run Test Script** - `node test-email.js`
3. **Test Real Events** - Try leave approval, absent marking, etc.
4. **Check Email Delivery** - Verify emails arrive in inbox

### Short Term (Enhancements)
1. **Email Preferences** - Let users choose which emails to receive
2. **Email Templates** - Add more email types (birthday, announcements)
3. **Email Tracking** - Track email delivery and open rates
4. **Bulk Emails** - Send emails to multiple users efficiently

### Long Term (Production)
1. **Professional Email Service** - Switch to SendGrid/SES
2. **Email Queue** - Implement background job processing
3. **Email Analytics** - Track email performance and engagement
4. **Advanced Templates** - Rich HTML templates with images

---

## 📋 Testing Checklist

### Email Service Setup
- [ ] SMTP credentials configured in .env
- [ ] Email service initializes without errors
- [ ] SMTP connection test passes
- [ ] Test email sends successfully

### HRM Email Integration
- [ ] Absent notification email works
- [ ] Leave approval email works
- [ ] Leave rejection email works
- [ ] Auto-finalized attendance email works
- [ ] Password reset email works
- [ ] Account created email works

### Admin Panel
- [ ] Email status endpoint works
- [ ] Test email endpoint works
- [ ] Test notification endpoint works
- [ ] Only authorized users can access

### Error Handling
- [ ] Email failures don't break notifications
- [ ] In-app notifications still work if email fails
- [ ] Proper error logging for email issues
- [ ] Graceful degradation when SMTP is down

---

## 📞 Support

### For Developers
- Check `src/services/emailService.js` for email logic
- Check `src/services/notificationService.js` for integration
- Use `test-email.js` for testing

### For Admins
- Use `/api/admin/email/status` to check email health
- Use `/api/admin/email/test` to send test emails
- Check logs in `backend/logs/combined.log`

### For Users
- Check spam folder if emails not received
- Contact admin if emails stop working
- Use in-app notifications as backup

---

**Implementation Date**: January 29, 2026  
**Status**: ✅ COMPLETE AND READY FOR TESTING  
**Dependencies**: nodemailer (already installed)  
**Configuration Required**: SMTP credentials in .env
