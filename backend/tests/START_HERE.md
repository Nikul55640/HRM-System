# ⚠️ TESTS FAILING? READ THIS!

## Why All Tests Failed

Your tests failed because the **backend server wasn't running**.

## Fix in 2 Steps

### 1️⃣ Start Backend Server (New Terminal)

Open a **NEW terminal window** and run:

```bash
cd HRM-System/backend
npm run dev
```

Wait for: `Server running on port 5000`

**Keep this terminal open!**

### 2️⃣ Run Tests Again (This Terminal)

```bash
npm run test:api
```

## That's It!

Tests should now pass ✅

## Quick Check

Not sure what's wrong?

```bash
npm run test:diagnose
```

## Need More Help?

Read: `tests/FIX_TEST_FAILURES.md`

---

**Remember**: Backend server must be running in a separate terminal!
