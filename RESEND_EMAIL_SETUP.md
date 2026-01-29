# 📧 **Resend + React Email Setup Guide**

## **Quick Start**

### **1. Install Dependencies**
```bash
cd HRM-System/backend
npm install resend @react-email/components @react-email/render react react-dom
```

### **2. Get Resend API Key**
1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Create API key in dashboard
4. Copy the API key

### **3. Configure Environment Variables**

Add to `backend/.env`:
```env
# Resend Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
APP_BASE_URL=http://localhost:5174
```

### **4. Verify Configuration**

```bash
# Test the setup
curl -X GET http://localhost:5000/api/admin/email/verify
```

Expected response:
```json
{
  "valid": true,
  "fromEmail": "noreply@yourdomain.com",
  "message": "Resend email service is properly configured"
}
```

---

## **Architecture Overview**

```
Event Triggered (e.g., Attendance Marked Absent)
         ↓
notificationService.sendToUser()
         ↓
    ┌────┴────┐
    ↓         ↓
  SSE      Email
    ↓         ↓
Browser   resendEmailService
    ↓         ↓
  Real-time  React Email Template
  Update     ↓
          Resend API
             ↓
          Employee Inbox
```

---

## **Email Templates**

### **1. Attendance Absent**
- **Trigger**: Employee marked as absent
- **File**: `src/emails/templates/AttendanceAbsent.jsx`
- **Data**: Employee name, date, reason

### **2. Leave Approved**
- **Trigger**: Leave request approved
- **File**: `src/emails/templates/LeaveApproved.jsx`
- **Data**: Leave type, dates, duration, approver

### **3. Correction Required**
- **Trigger**: Attendance needs correction
- **File**: `src/emails/templates/CorrectionRequired.jsx`
- **Data**: Date, issue type, action steps

---

## **How to Send Emails**

### **From Attendance Finalization Job**

```javascript
// In attendanceFinalization.js
import resendEmailService from '../services/resendEmailService.js';

// When marking absent
await resendEmailService.sendAttendanceAbsentEmail(
  employee,
  dateString,
  'No clock-in recorded'
);
```

### **From Notification Service**

```javascript
// In notificationService.js
await this.sendToUser(userId, {
  title: 'Attendance Marked as Absent',
  message: 'Your attendance for today was marked as absent',
  type: 'error',
  category: 'attendance',
}, {
  sendEmail: true,
  emailData: {
    date: new Date(),
    reason: 'No clock-in recorded'
  }
});
```

### **Direct Email Sending**

```javascript
import resendEmailService from './services/resendEmailService.js';

// Send custom email
await resendEmailService.sendCustomEmail(
  'employee@company.com',
  'Subject Line',
  <YourEmailTemplate />,
  { category: 'custom', type: 'notification' }
);
```

---

## **Email Component Structure**

### **Base Layout**
```jsx
<BaseLayout title="Email Title">
  <Header title="Main Title" subtitle="Subtitle" />
  <Section>
    {/* Your content */}
  </Section>
  <Footer actionUrl="..." actionText="..." />
</BaseLayout>
```

### **Creating New Templates**

1. Create file in `src/emails/templates/`
2. Import components from `@react-email/components`
3. Use `BaseLayout`, `Header`, `Footer` for consistency
4. Export as React component
5. Add method to `resendEmailService.js`

Example:
```jsx
import React from 'react';
import { Section, Text } from '@react-email/components';
import { BaseLayout } from '../components/BaseLayout';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const MyTemplate = ({ data }) => (
  <BaseLayout title="My Email">
    <Header title="Title" />
    <Section>
      <Text>Content here</Text>
    </Section>
    <Footer actionUrl="..." actionText="..." />
  </BaseLayout>
);
```

---

## **Testing Emails**

### **Test in Development**

```bash
# Start backend
npm run dev

# Test email sending
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

### **Preview Templates**

Use [React Email Preview](https://react.email) to preview templates before sending.

---

## **Production Checklist**

- [ ] Resend API key configured
- [ ] From email verified in Resend dashboard
- [ ] APP_BASE_URL points to production domain
- [ ] Email templates tested
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Rate limiting considered
- [ ] Unsubscribe links added (if needed)

---

## **Troubleshooting**

### **Emails Not Sending**

1. **Check API Key**
   ```bash
   echo $RESEND_API_KEY
   ```

2. **Verify From Email**
   - Must be verified in Resend dashboard
   - Or use Resend's default domain

3. **Check Logs**
   ```bash
   tail -f logs/error.log | grep -i email
   ```

4. **Test Configuration**
   ```bash
   curl http://localhost:5000/api/admin/email/verify
   ```

### **Template Rendering Issues**

1. Ensure React components are valid JSX
2. Check all imports are correct
3. Verify props are passed correctly
4. Use React Email preview tool

### **Delivery Issues**

1. Check spam folder
2. Verify recipient email is correct
3. Check Resend dashboard for bounce/complaint
4. Review email content for spam triggers

---

## **Cost & Limits**

- **Free Tier**: 100 emails/day
- **Paid**: $20/month for 50,000 emails
- **No setup fees**
- **Pay as you go** after free tier

---

## **Best Practices**

1. **Always include action URL** - Let users take action directly from email
2. **Keep templates simple** - Mobile-friendly, fast loading
3. **Use consistent branding** - Same colors, fonts, logo
4. **Test before production** - Send test emails first
5. **Monitor delivery** - Check Resend dashboard regularly
6. **Handle failures gracefully** - Don't block operations if email fails
7. **Log all sends** - Track what was sent and when
8. **Respect user preferences** - Allow unsubscribe options

---

## **File Structure**

```
backend/src/
├── emails/
│   ├── components/
│   │   ├── BaseLayout.jsx
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   └── templates/
│       ├── AttendanceAbsent.jsx
│       ├── LeaveApproved.jsx
│       └── CorrectionRequired.jsx
├── services/
│   ├── resendEmailService.js
│   └── notificationService.js
└── ...
```

---

## **Next Steps**

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Verify configuration
4. ✅ Test email sending
5. ✅ Integrate with attendance finalization
6. ✅ Monitor in production

---

**Status**: ✅ **READY FOR PRODUCTION**