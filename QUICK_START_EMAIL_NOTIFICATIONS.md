# 📧 **Quick Start: Email Notifications**

## **What's New**

Employees now receive professional emails when:
- ✅ Marked as absent (no clock-in)
- ✅ Missing clock-out (needs correction)
- ✅ Leave request approved
- ✅ Attendance auto-finalized

---

## **For Developers**

### **1. Email is Already Configured**
```bash
# Check if email service is working
curl http://localhost:5000/api/admin/email/verify
```

### **2. How to Send an Email**

**From Finalization Job** (automatic):
```javascript
// Already integrated! When employee is marked absent:
await sendAbsentNotification(employee, dateString, reason);
// → Sends SSE + Email automatically
```

**From Notification Service** (manual):
```javascript
import notificationService from './services/notificationService.js';

await notificationService.sendToUser(userId, {
  title: 'Attendance Alert',
  message: 'Your attendance needs correction',
  type: 'warning',
  category: 'attendance'
}, {
  sendEmail: true,
  emailData: { date: '2026-01-29', reason: 'Missing clock-out' }
});
```

**Direct Email** (advanced):
```javascript
import resendEmailService from './services/resendEmailService.js';

await resendEmailService.sendAttendanceAbsentEmail(
  employee,
  '2026-01-29',
  'No clock-in recorded'
);
```

### **3. Create New Email Template**

1. Create file: `backend/src/emails/templates/MyTemplate.jsx`
```jsx
import React from 'react';
import { Section, Text } from '@react-email/components';
import { BaseLayout } from '../components/BaseLayout';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const MyTemplate = ({ data }) => (
  <BaseLayout title="My Email">
    <Header title="Title" subtitle="Subtitle" />
    <Section>
      <Text>Your content here</Text>
    </Section>
    <Footer actionUrl="..." actionText="..." />
  </BaseLayout>
);
```

2. Add method to `resendEmailService.js`:
```javascript
async sendMyEmail(employee, data) {
  const template = (
    <MyTemplate
      employeeName={`${employee.firstName} ${employee.lastName}`}
      {...data}
    />
  );

  return this.sendEmail({
    to: employee.user?.email,
    subject: 'My Email Subject',
    template,
    metadata: { category: 'my_category', type: 'my_type' }
  });
}
```

3. Use it:
```javascript
await resendEmailService.sendMyEmail(employee, { /* data */ });
```

---

## **For QA/Testing**

### **Test Email Sending**
```bash
curl -X POST http://localhost:5000/api/admin/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "type": "attendance_absent",
    "data": {
      "employeeName": "John Doe",
      "date": "2026-01-29",
      "reason": "No clock-in recorded"
    }
  }'
```

### **Test Finalization with Email**
```bash
# Trigger finalization for today
curl -X POST http://localhost:5000/api/admin/attendance/finalize \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-01-29"}'
```

### **Check Email Delivery**
1. Go to [Resend Dashboard](https://resend.com)
2. Click "Emails"
3. Look for your test email
4. Check status (Delivered, Bounced, etc.)

---

## **For HR/Admin**

### **Email Configuration**
- **From Email**: `noreply@hrms.com` (configured in `.env`)
- **API Key**: Already set up (Resend account)
- **Base URL**: `http://localhost:5174` (for action links)

### **What Employees See**

**Absent Email**:
```
Subject: Attendance Marked as Absent - 2026-01-29

Hi John,

Your attendance for January 29, 2026 was marked as absent.

Reason: No clock-in recorded

If this is incorrect, please submit a correction request.

[Submit Correction] ← Click to go to correction form
```

**Correction Email**:
```
Subject: Attendance Correction Required - 2026-01-29

Hi John,

Your attendance for January 29, 2026 requires correction.

Issue: Missing clock-out

Please submit a correction request to resolve this.

[Submit Correction] ← Click to go to correction form
```

---

## **Troubleshooting**

### **Email Not Received**

1. **Check spam folder** - Resend emails might be marked as spam
2. **Verify email address** - Is the employee's email correct?
3. **Check Resend dashboard** - Did it bounce?
4. **Check logs** - `tail -f logs/error.log | grep -i email`

### **Email Configuration Error**

```bash
# Verify configuration
curl http://localhost:5000/api/admin/email/verify

# Should return:
# {
#   "valid": true,
#   "fromEmail": "noreply@hrms.com",
#   "message": "Resend email service is properly configured"
# }
```

If not valid:
1. Check `.env` file has `RESEND_API_KEY`
2. Check `.env` file has `RESEND_FROM_EMAIL`
3. Restart backend server
4. Try again

### **Email Template Error**

If email doesn't render:
1. Check React component syntax
2. Verify all imports are correct
3. Test with React Email preview tool
4. Check logs for render errors

---

## **Environment Variables**

```env
# Required for email
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@hrms.com
APP_BASE_URL=http://localhost:5174
```

---

## **Files to Know**

| File | Purpose |
|------|---------|
| `backend/src/services/resendEmailService.js` | Main email service |
| `backend/src/emails/templates/*.jsx` | Email templates |
| `backend/src/emails/components/*.jsx` | Email components |
| `backend/src/jobs/attendanceFinalization.js` | Triggers emails |
| `backend/src/services/notificationService.js` | Routes to email |
| `backend/.env` | Configuration |

---

## **Common Tasks**

### **Add Email to New Notification**
```javascript
// In notificationService.js
await this.sendToUser(userId, {
  title: 'My Title',
  message: 'My message',
  type: 'info',
  category: 'my_category'
}, {
  sendEmail: true,  // ← Enable email
  emailData: { /* data for template */ }
});
```

### **Disable Email for Specific Notification**
```javascript
// Just don't pass sendEmail option
await this.sendToUser(userId, {
  title: 'My Title',
  message: 'My message'
  // No sendEmail option = no email sent
});
```

### **Send Email Only (No SSE)**
```javascript
import resendEmailService from './services/resendEmailService.js';

// Direct email without notification
await resendEmailService.sendAttendanceAbsentEmail(employee, date, reason);
```

---

## **Support**

For issues or questions:
1. Check logs: `tail -f logs/error.log`
2. Check Resend dashboard: https://resend.com
3. Review email templates: `backend/src/emails/templates/`
4. Test configuration: `curl http://localhost:5000/api/admin/email/verify`

---

**Status**: ✅ **READY TO USE**
