# Email Notifications - Quick Setup Guide

## 🚀 5-Minute Setup

### Step 1: Configure Gmail (Recommended)

1. **Enable 2-Factor Authentication**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
   - Copy the 16-character password

3. **Update .env file**
   ```bash
   # Replace with your details
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-16-character-app-password
   EMAIL_FROM=noreply@yourcompany.com
   ```

### Step 2: Test Email Service

```bash
cd HRM-System/backend
node test-email.js
```

**Expected Output**:
```
✅ Email service is configured
✅ SMTP connection successful
✅ Test email sent successfully
```

### Step 3: Test in HRM System

1. **Start your HRM system**
2. **Test absent notification**:
   - Don't clock in for a day
   - Wait 15+ minutes after shift end
   - Check email for absent notification

3. **Test leave approval**:
   - Apply for leave as employee
   - Approve as HR
   - Check email for approval notification

---

## 📧 Email Types You'll Get

| Event | Email Subject | When |
|-------|---------------|------|
| Marked Absent | "Attendance Alert - Marked Absent" | No clock-in recorded |
| Leave Approved | "Leave Request Approved" | HR approves leave |
| Leave Rejected | "Leave Request Rejected" | HR rejects leave |
| Auto-Finalized | "Attendance Auto-Finalized" | Auto clock-out at shift end |
| Password Reset | "Password Reset Request" | User requests reset |
| Account Created | "Welcome to HRM System" | New employee added |

---

## 🔧 Other Email Providers

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo Mail
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Company Email
```bash
SMTP_HOST=mail.yourcompany.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=hr@yourcompany.com
SMTP_PASS=your-password
```

---

## ❌ Troubleshooting

### "Email service not configured"
- Check all SMTP_ variables are set in .env
- Restart the server after changing .env

### "SMTP connection failed"
- Gmail: Use App Password, not regular password
- Check SMTP_HOST and SMTP_PORT are correct
- Try SMTP_PORT=465 with SMTP_SECURE=true

### "Authentication failed"
- Gmail: Generate new App Password
- Outlook: Use full email as SMTP_USER
- Check credentials are correct

### Emails not received
- Check spam/junk folder
- Verify EMAIL_FROM is valid
- Test with `node test-email.js`

---

## 🎯 Quick Test Commands

```bash
# Test email service
node test-email.js

# Check email status (need admin token)
curl -X GET http://localhost:5000/api/admin/email/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send test email (need admin token)
curl -X POST http://localhost:5000/api/admin/email/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## ✅ Success Checklist

- [ ] Gmail App Password generated
- [ ] .env file updated with SMTP credentials
- [ ] `node test-email.js` passes all tests
- [ ] Test email received in inbox
- [ ] HRM system sends emails for real events
- [ ] Admin panel shows email status as working

---

**That's it! Your HRM system now sends professional email notifications! 🎉**

For detailed documentation, see `EMAIL_NOTIFICATIONS_IMPLEMENTATION.md`