# Import Fixes Needed

## 🚨 CRITICAL: Broken Imports After Cleanup

The following files have broken imports that need to be fixed to use the new shared/ui structure:

### Files with Basic UI Component Imports (CRITICAL)
These files import basic components that were moved to shared/ui/:

1. **frontend/src/modules/organization/pages/DesignationPage.jsx**
   - Fix: `components/ui/card` → `shared/ui/card`
   - Fix: `components/ui/button` → `shared/ui/button`

2. **frontend/src/modules/organization/pages/HolidayPage.jsx**
   - Fix: `components/ui/card` → `shared/ui/card`
   - Fix: `components/ui/button` → `shared/ui/button`

3. **frontend/src/modules/organization/pages/PolicyPage.jsx**
   - Fix: `components/ui/card` → `shared/ui/card`
   - Fix: `components/ui/button` → `shared/ui/button`

4. **frontend/src/modules/organization/pages/DepartmentPage.jsx**
   - Fix: `components/ui/card` → `shared/ui/card`
   - Fix: `components/ui/button` → `shared/ui/button`

5. **frontend/src/modules/organization/pages/CompanyDocumentsPage.jsx**
   - Fix: `components/ui/card` → `shared/ui/card`
   - Fix: `components/ui/button` → `shared/ui/button`

### Files with Complex Component Imports (KEEP AS-IS)
These files import specialized components that should remain in components/ui/:

1. **frontend/src/modules/organization/admin/UserManagement.jsx**
   - Keep: `components/ui/UserModal` (specialized modal)

2. **frontend/src/modules/payroll/employee/PayslipDetail.jsx**
   - Keep: `components/ui/dialog` (specialized dialog)

3. **frontend/src/modules/organization/components/PolicyModal.jsx**
   - Keep: `components/ui/dialog`, `components/ui/popover`, `components/ui/calendar` (specialized)

4. **frontend/src/modules/organization/components/HolidayModal.jsx**
   - Keep: `components/ui/dialog`, `components/ui/popover`, `components/ui/calendar` (specialized)

### Mixed Imports (PARTIAL FIX NEEDED)
These files have both basic and specialized imports:

1. **frontend/src/modules/organization/components/PolicyModal.jsx**
   - Fix: `components/ui/button` → `shared/ui/button`
   - Fix: `components/ui/input` → `shared/ui/input`
   - Fix: `components/ui/textarea` → `shared/ui/textarea`
   - Fix: `components/ui/label` → `shared/ui/label`
   - Fix: `components/ui/checkbox` → `shared/ui/checkbox`
   - Keep: `components/ui/dialog`, `components/ui/popover`, `components/ui/calendar`

2. **frontend/src/modules/organization/components/HolidayModal.jsx**
   - Fix: `components/ui/button` → `shared/ui/button`
   - Fix: `components/ui/input` → `shared/ui/input`
   - Fix: `components/ui/textarea` → `shared/ui/textarea`
   - Fix: `components/ui/label` → `shared/ui/label`
   - Fix: `components/ui/checkbox` → `shared/ui/checkbox`
   - Keep: `components/ui/dialog`, `components/ui/popover`, `components/ui/calendar`

3. **frontend/src/modules/organization/components/DocumentUpload.jsx**
   - Fix: `components/ui/button` → `shared/ui/button`
   - Fix: `components/ui/input` → `shared/ui/input`
   - Fix: `components/ui/label` → `shared/ui/label`
   - Fix: `components/ui/select` → `shared/ui/select`
   - Fix: `components/ui/card` → `shared/ui/card`

4. **frontend/src/modules/organization/components/PolicyTable.jsx**
   - Fix: `components/ui/card` → `shared/ui/card`
   - Fix: `components/ui/button` → `shared/ui/button`
   - Fix: `components/ui/table` → `shared/ui/table`

5. **frontend/src/modules/organization/components/HolidayTable.jsx**
   - Fix: `components/ui/card` → `shared/ui/card`
   - Fix: `components/ui/button` → `shared/ui/button`
   - Fix: `components/ui/table` → `shared/ui/table`

6. **frontend/src/modules/organization/components/DocumentList.jsx**
   - Fix: `components/ui/card` → `shared/ui/card`
   - Fix: `components/ui/button` → `shared/ui/button`
   - Fix: `components/ui/table` → `shared/ui/table`

## 🔧 Quick Fix Commands

To fix these imports quickly, use find-and-replace in your IDE:

### Find and Replace Operations:
1. Find: `from '../../../components/ui/button'`
   Replace: `from '../../../shared/ui/button'`

2. Find: `from '../../../components/ui/card'`
   Replace: `from '../../../shared/ui/card'`

3. Find: `from '../../../components/ui/input'`
   Replace: `from '../../../shared/ui/input'`

4. Find: `from '../../../components/ui/label'`
   Replace: `from '../../../shared/ui/label'`

5. Find: `from '../../../components/ui/textarea'`
   Replace: `from '../../../shared/ui/textarea'`

6. Find: `from '../../../components/ui/checkbox'`
   Replace: `from '../../../shared/ui/checkbox'`

7. Find: `from '../../../components/ui/select'`
   Replace: `from '../../../shared/ui/select'`

8. Find: `from '../../../components/ui/table'`
   Replace: `from '../../../shared/ui/table'`

9. Find: `from "../../../components/ui/button"`
   Replace: `from "../../../shared/ui/button"`

10. Find: `from "../../../components/ui/card"`
    Replace: `from "../../../shared/ui/card"`

## ⚠️ DO NOT CHANGE
Keep these imports as-is (specialized components):
- `components/ui/dialog`
- `components/ui/popover`
- `components/ui/calendar`
- `components/ui/UserModal`
- `components/ui/LeaveRequestModal`
- `components/ui/RequestDetailModal`
- `components/ui/DeleteConfirmModal`

## 🎯 Priority Order
1. **HIGH**: Fix basic component imports (button, card, input, label)
2. **MEDIUM**: Fix table and form component imports
3. **LOW**: Verify specialized components still work

After fixing these imports, the application should work normally with the new shared structure!