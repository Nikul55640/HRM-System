# Address Testing Guide

## Overview
This guide explains how to test the address functionality to ensure it's working correctly after the fixes.

## Test Files Created

1. **Backend Test Script**: `backend/scripts/test-address-functionality.js`
2. **Frontend Test Page**: `frontend/src/test-address.html`

---

## Backend Test (Recommended First)

### Run the Backend Test Script

```bash
cd HRM-System/backend
node scripts/test-address-functionality.js
```

### What It Tests

1. ✅ Finds test employee (EMP-003)
2. ✅ Checks current address format
3. ✅ Updates address with structured data
4. ✅ Reads back the updated address
5. ✅ Verifies all address fields
6. ✅ Simulates API response format
7. ✅ Tests frontend parsing logic

### Expected Output (Success)

```
🚀 Starting Address Functionality Tests
============================================================

🧪 Test 1: Finding test employee (EMP-003)...
✅ Found employee: John Employee (john@hrm.com)
   Current address: null
   Address type: object

🧪 Test 2: Checking current address format...
ℹ️  Address is NULL (expected after cleanup)

🧪 Test 3: Updating address with structured data...
   Updating with: { street: '123 Test Street', city: 'Test City', ... }
✅ Address updated successfully

🧪 Test 4: Reading back updated address...
   Retrieved address: { street: '123 Test Street', city: 'Test City', ... }
   Address type: object
✅ Address is stored as object ✅

🧪 Test 5: Verifying address fields...
✅   street: "123 Test Street" ✅
✅   city: "Test City" ✅
✅   state: "Test State" ✅
✅   zipCode: "12345" ✅
✅   country: "Test Country" ✅

🧪 Test 6: Simulating API response format...
✅ API would return address as object ✅

🧪 Test 7: Testing frontend address parsing...
   ✅ Address is already an object
✅ Frontend parsing would work correctly

============================================================
📊 Test Summary
============================================================

🎉 All tests PASSED! Address functionality is working correctly.
```

### If Tests Fail

If you see errors like:
```
❌ Address is STILL broken: [object Object]
```

**Fix steps:**
1. Restart backend server
2. Run cleanup script: `node scripts/fix-address-data.js`
3. Check controller file has the fix
4. Run test again

---

## Frontend Test (Visual Testing)

### Open the Test Page

1. Make sure backend is running on `http://localhost:5000`
2. Open in browser: `HRM-System/frontend/src/test-address.html`

### Test Steps

#### Step 1: Login
- Email: `john@hrm.com`
- Password: `password123`
- Click **Login**
- ✅ Should see: "Login successful!"

#### Step 2: Fetch Profile
- Click **Fetch Profile**
- ✅ Should see: "Address is a proper object" (green)
- ❌ If you see: "[object Object]" (red) → Backend needs restart

#### Step 3: Update Address
- Fill in address fields (or use defaults)
- Click **Update Address**
- ✅ Should see: "SUCCESS: Address saved as object" (green)
- ❌ If you see: "FAILED: Backend returned [object Object]" (red) → Controller not fixed

#### Step 4: Verify Address
- Click **Verify Address**
- ✅ Should see: "All fields match!" (green)
- All checkmarks should be green

### Visual Indicators

- 🟢 **Green** = Test passed
- 🔴 **Red** = Test failed
- 🟡 **Yellow** = Warning (needs attention)
- 🔵 **Blue** = Info

---

## Manual Testing in Application

### Test in Profile Page

1. Login as `john@hrm.com`
2. Go to **Profile** page
3. Check **Address Information** section
4. ✅ Should display all address fields correctly
5. ❌ Should NOT show "Not provided" for all fields

### Test in Profile Settings

1. Go to **Profile Settings** → **Contact Information**
2. Fill in address fields:
   - Street Address
   - City
   - State/Province
   - ZIP/Postal Code
   - Country
3. Click **Save Changes**
4. ✅ Should see success message
5. Go back to **Profile** page
6. ✅ Address should display correctly

---

## Troubleshooting

### Issue: Console shows `[object Object]` warnings

**Solution:**
```bash
cd HRM-System/backend
node scripts/fix-address-data.js
```

### Issue: Backend test fails

**Check:**
1. Backend server is running
2. Database connection is working
3. Employee EMP-003 exists
4. Controller file has the fix

**Verify controller:**
```javascript
// Should be:
updateData.address = contactInfo.address;

// NOT:
updateData.address = JSON.stringify(contactInfo.address);
```

### Issue: Frontend test shows "Backend returned [object Object]"

**Solution:**
1. Stop backend server (Ctrl+C)
2. Restart: `npm start`
3. Clear browser cache
4. Try again

### Issue: Address displays as "Not provided"

**Possible causes:**
1. Address is NULL in database → Re-enter address
2. Frontend parsing failed → Check browser console
3. API not returning address → Check network tab

---

## Success Criteria

All tests pass when:

✅ Backend test script shows "All tests PASSED"  
✅ Frontend test page shows all green checkmarks  
✅ Profile page displays address correctly  
✅ Profile settings can update address  
✅ No `[object Object]` in console  
✅ No `[object Object]` in API responses  

---

## Quick Test Commands

```bash
# Backend test
cd HRM-System/backend
node scripts/test-address-functionality.js

# Cleanup broken data
node scripts/fix-address-data.js

# Restart backend
npm start
```

---

## Test Data

**Test Employee:**
- ID: EMP-003
- Email: john@hrm.com
- Password: password123

**Test Address:**
```json
{
  "street": "123 Test Street",
  "city": "Test City",
  "state": "Test State",
  "zipCode": "12345",
  "country": "Test Country"
}
```

---

## Notes

- Run backend test first (faster, more detailed)
- Frontend test is visual and interactive
- Both tests use the same employee (EMP-003)
- Tests are non-destructive (can run multiple times)
- Original address is backed up before testing

---

## Support

If tests still fail after following this guide:

1. Check `ADDRESS_CLEANUP_GUIDE.md` for detailed fix steps
2. Check `ADDRESS_OBJECT_OBJECT_FIX.md` for technical details
3. Verify all files were updated correctly
4. Check backend logs for errors
