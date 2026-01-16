# 🔧 Fix: All Tests Failing

## Problem
All tests are failing with "Health Check - Error" because the **backend server is not running**.

## Solution (2 Steps)

### Step 1: Start Backend Server

Open a **NEW terminal window** and run:

```bash
cd HRM-System/backend
npm run dev
```

You should see:
```
Server running on port 5000
Database connected successfully
```

**⚠️ IMPORTANT: Keep this terminal window open!** The server must stay running.

### Step 2: Run Tests Again

In your **ORIGINAL terminal**, run:

```bash
npm run test:api
```

Now tests should pass! ✅

## Quick Diagnostic

Not sure if server is running? Run:

```bash
npm run test:diagnose
```

This will tell you exactly what's wrong.

## Common Issues

### Issue 1: "Port 5000 already in use"
**Solution**: Another process is using port 5000
```bash
# Windows: Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Issue 2: "Database connection failed"
**Solution**: Check your database is running
- MySQL/MariaDB should be running
- Check `.env` file has correct database credentials

### Issue 3: "Cannot find module"
**Solution**: Install dependencies
```bash
npm install
```

## Visual Guide

```
Terminal 1 (Backend Server)          Terminal 2 (Tests)
┌─────────────────────────┐         ┌─────────────────────────┐
│ cd HRM-System/backend   │         │ cd HRM-System/backend   │
│ npm run dev             │         │ npm run test:api        │
│                         │         │                         │
│ Server running on 5000  │  ◄────► │ Running tests...        │
│ (Keep this open!)       │         │ ✅ Tests passing!       │
└─────────────────────────┘         └─────────────────────────┘
```

## Verification Steps

1. ✅ Backend server is running (`npm run dev` in separate terminal)
2. ✅ You see "Server running on port 5000"
3. ✅ Database is connected
4. ✅ Server terminal stays open
5. ✅ Run tests in different terminal

## Still Having Issues?

Run the diagnostic:
```bash
npm run test:diagnose
```

It will tell you exactly what's wrong and how to fix it.

---

**TL;DR**: You need TWO terminal windows:
1. Terminal 1: `npm run dev` (keep open)
2. Terminal 2: `npm run test:api`
