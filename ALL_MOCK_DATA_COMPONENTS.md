# All Components Using Mock Data

## Summary

Found **6 components** still using mock/hardcoded data instead of real API calls.

---

## 1. ✅ FIXED: Admin Dashboard
**File**: `frontend/src/features/admin/dashboard/pages/AdminDashboard.jsx`
**Status**: ✅ FIXED - Now uses real API data
**Service**: `adminDashboardService.js`

---

## 2. ❌ Designation Page (Mock Data)
**File**: `frontend/src/features/admin/organization/DesignationPage.jsx`
**Status**: ❌ Using mock data
**Mock Data**:
```javascript
setDesignations([
  { _id: '1', title: 'Software Engineer', description: 'Develops software applications', level: 'Junior', employeeCount: 15 },
  // ... more hardcoded designations
]);
```

**Fix Needed**:
- Create `/api/designations` endpoint in backend
- Create `designationService.js` in frontend
- Update component to fetch real data

---

## 3. ❌ Company Documents Page (Mock Data)
**File**: `frontend/src/features/admin/organization/CompanyDocumentsPage.jsx`
**Status**: ❌ Using mock data
**Mock Data**:
```javascript
setDocuments([
  { _id: '1', name: 'Employee Handbook.pdf', type: 'PDF', size: 2048000, uploadedAt: new Date() },
  // ... more hardcoded documents
]);
```

**Fix Needed**:
- Create `/api/company-documents` endpoint in backend
- Create `companyDocumentService.js` in frontend
- Update component to fetch real data

---

## 4. ❌ Policy Page (Mock Data)
**File**: `frontend/src/features/admin/organization/PolicyPage.jsx`
**Status**: ❌ Using mock data
**Mock Data**:
```javascript
setPolicies([
  { _id: '1', title: 'Leave Policy', description: 'Company leave and vacation policy', category: 'HR', updatedAt: new Date() },
  // ... more hardcoded policies
]);
```

**Fix Needed**:
- Create `/api/policies` endpoint in backend
- Create `policyService.js` in frontend
- Update component to fetch real data

---

## 5. ❌ Announcements Page (Mock Data)
**File**: `frontend/src/features/admin/dashboard/pages/AnnouncementsPage.jsx`
**Status**: ❌ Using mock data
**Warning**: `console.warn('⚠️ [ANNOUNCEMENTS] Using mock data - API endpoint not implemented yet');`
**Mock Data**:
```javascript
setAnnouncements([
  {
    id: 1,
    title: 'Welcome to the new HRM System',
    content: 'We are excited to announce...',
    // ... more hardcoded announcements
  },
]);
```

**Fix Needed**:
- Create `/api/announcements` endpoint in backend
- Create `announcementService.js` in frontend
- Update component to fetch real data

---

## 6. ❌ Audit Logs Page (Mock Data)
**File**: `frontend/src/features/admin/dashboard/pages/AuditLogsPage.jsx`
**Status**: ❌ Using mock data
**Warning**: `console.warn('⚠️ [AUDIT LOGS] Using mock data - API endpoint not implemented yet');`
**Mock Data**:
```javascript
setLogs([
  {
    id: 1,
    action: 'User Login',
    user: 'John Doe',
    timestamp: new Date(),
    // ... more hardcoded logs
  },
]);
```

**Fix Needed**:
- Backend already has audit logs (check `backend/src/services/auditService.js`)
- Create `/api/admin/audit-logs` endpoint
- Create `auditLogService.js` in frontend
- Update component to fetch real data

---

## Priority Ranking

### High Priority (Core Functionality)
1. ✅ **Admin Dashboard** - FIXED
2. ❌ **Audit Logs Page** - Important for security/compliance
3. ❌ **Announcements Page** - Important for communication

### Medium Priority (HR Features)
4. ❌ **Policy Page** - Important for HR management
5. ❌ **Designation Page** - Important for org structure

### Low Priority (Document Management)
6. ❌ **Company Documents Page** - Nice to have

---

## Backend Endpoints Needed

### Already Exists (Just needs frontend integration)
- ✅ Audit logs service exists: `backend/src/services/auditService.js`

### Needs to be Created
- ❌ `/api/designations` (CRUD operations)
- ❌ `/api/company-documents` (CRUD operations)
- ❌ `/api/policies` (CRUD operations)
- ❌ `/api/announcements` (CRUD operations)
- ❌ `/api/admin/audit-logs` (Read-only)

---

## Action Plan

### Phase 1: Fix High Priority (Do Now)
1. ✅ Admin Dashboard - DONE
2. ⏳ Audit Logs Page
   - Create backend route: `/api/admin/audit-logs`
   - Create frontend service: `auditLogService.js`
   - Update `AuditLogsPage.jsx`

3. ⏳ Announcements Page
   - Create backend model: `Announcement.js`
   - Create backend routes: `/api/announcements`
   - Create frontend service: `announcementService.js`
   - Update `AnnouncementsPage.jsx`

### Phase 2: Fix Medium Priority
4. ⏳ Policy Page
5. ⏳ Designation Page

### Phase 3: Fix Low Priority
6. ⏳ Company Documents Page

---

## Quick Fix Template

For each component, follow this pattern:

### 1. Create Backend Model (if needed)
```javascript
// backend/src/models/Announcement.js
const announcementSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});
```

### 2. Create Backend Routes
```javascript
// backend/src/routes/admin/announcementRoutes.js
router.get('/', authenticate, checkPermission(MODULES.ANNOUNCEMENT.VIEW_ALL), getAnnouncements);
router.post('/', authenticate, checkPermission(MODULES.ANNOUNCEMENT.CREATE), createAnnouncement);
```

### 3. Create Frontend Service
```javascript
// frontend/src/services/announcementService.js
const announcementService = {
  getAll: async () => {
    const response = await api.get('/announcements');
    return response.data;
  },
};
```

### 4. Update Component
```javascript
// frontend/src/features/admin/dashboard/pages/AnnouncementsPage.jsx
const fetchAnnouncements = async () => {
  const data = await announcementService.getAll();
  setAnnouncements(data);
};
```

---

## Testing Checklist

For each fixed component:
- [ ] Backend endpoint returns real data
- [ ] Frontend service calls correct endpoint
- [ ] Component displays real data
- [ ] Loading state works
- [ ] Error handling works
- [ ] CRUD operations work (if applicable)
- [ ] Permissions are checked
- [ ] No console errors

---

## Current Status

| Component | Status | Priority | Estimated Time |
|-----------|--------|----------|----------------|
| Admin Dashboard | ✅ Fixed | High | Done |
| Audit Logs | ❌ Mock | High | 2 hours |
| Announcements | ❌ Mock | High | 3 hours |
| Policies | ❌ Mock | Medium | 3 hours |
| Designations | ❌ Mock | Medium | 3 hours |
| Company Docs | ❌ Mock | Low | 3 hours |

**Total Estimated Time**: 14 hours

---

## Next Steps

1. Review this document
2. Prioritize which components to fix first
3. Create backend endpoints
4. Create frontend services
5. Update components
6. Test thoroughly
7. Deploy

Would you like me to fix the Audit Logs page next?

