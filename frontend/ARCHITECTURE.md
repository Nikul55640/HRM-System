# Frontend Architecture Guide

## Current Structure (Recommended)

```
frontend/src/
├── features/              # Feature-based modules (GOOD ✅)
│   ├── auth/             # Authentication
│   ├── ess/              # Employee Self-Service
│   ├── hr/               # HR Management
│   ├── admin/            # Admin features
│   ├── manager/          # Manager features
│   ├── employees/        # Employee management
│   ├── payroll/          # Payroll features
│   ├── calendar/         # Calendar features
│   ├── departments/      # Department management
│   └── dashboard/        # Dashboard views
│
├── components/           # Shared/reusable components
│   ├── ui/nts (Sidebar, Header, etc.)
│   └── [feature]/       # Feature-sp              # shadcn/ui components
│   ├── common/          # Common components (PermissionGate, etc.)
│   ├── layout/          # Layout componeecific shared components
│
├── services/            # API services (centralized)
│   ├── api.js          # Axios instance
│   ├── authService.js
│   ├── employeeService.js
│   ├── leaveService.js
│   └── index.js        # Service exports
│
├── store/              # Redux store
│   ├── slices/        # Redux slices
│   ├── thunks/        # Async thunks
│   └── index.js       # Store configuration
│
├── routes/            # Route definitions
│   ├── adminRoutes.jsx
│   ├── essRoutes.jsx
│   └── index.js
│
├── hooks/             # Custom React hooks
│   ├── useAuth.js
│   ├── usePermissions.js
│   └── index.js
│
├── utils/             # Utility functions
│   ├── rolePermissions.js
│   ├── errorHandler.js
│   └── essHelpers.js
│
├── lib/               # Third-party library configs
│   └── utils.js       # shadcn utils
│
└── pages/             # Top-level pages
    ├── NotFound.jsx
    └── Unauthorized.jsx
```

## Why This Structure Works

### ✅ Strengths
1. **Feature-based organization** - Easy to find related code
2. **Separation of concerns** - Services, components, and features are separate
3. **Scalability** - Easy to add new features
4. **Reusability** - Shared components in `/components`
5. **Clear boundaries** - Each feature is self-contained

### 📋 Recommended Improvements (Optional)

#### 1. Add index.js exports in features
```javascript
// features/ess/index.js
export { default as MyLeave } from './leave/MyLeave';
export { default as MyAttendance } from './attendance/MyAttendance';
```

#### 2. Consolidate feature-specific components
Move components from `/components/[feature]` into `/features/[feature]/components`

Example:
```
features/
└── employees/
    ├── EmployeeList.jsx
    ├── EmployeeForm.jsx
    └── components/        # Feature-specific components
        ├── EmployeeCard.jsx
        └── EmployeeFilters.jsx
```

#### 3. Keep services centralized (roach is good)
Services should remain in `/services` for easy access across features

## File Naming Conventions

### Components
- **PascalCase**: `EmployeeList.jsx`, `MyLeave.jsx`
- **Feature folders**: lowercase with hyphens if needed

### Services
- **camelCase**: `employeeService.js`, `leaveService.js`

### Utilities
- **camelCase**: `rolePermissions.js`, `errorHandler.js`

## Import Patterns

### Good ✅
```javascript
// Absolute imports from services
import { employeeService, leaveService } from '@/services';

// Feature imports
import { MyLeave } from '@/features/ess';

// Component imports
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/common';
```

### Avoid ❌
```javascript
// Relative imports across features
import MyLeave from '../../../features/ess/leave/MyLeave';
```

## Feature Module Structure

Each feature should follow this pattern:

```
features/[feature-name]/
├── index.js                    # Exports
├── [FeatureName].jsx          # Main component
├── components/                 # Feature-specific components
│   ├── [Component].jsx
│   └── index.js
├── hooks/                      # Feature-specific hooks (optional)
│   └── use[Feature].js
└── utils/                      # Feature-specific utilities (optional)
    └── [feature]Helpers.js
```

## Current Issues to Fix

### 1. Duplicate Components
- Remove duplicate components in `/components/[feature]` if they exist in `/features/[feature]`

### 2. Inconsistent Exports
- Add barrel exports (index.js) in feature folders

### 3. Service Organization
- ✅ Already good - services are centralized

## Migration Guide (If Needed)

### Step 1: Add barrel exports
```bash
# Add index.js to each feature folder
echo "export { default as MyLeave } from './leave/MyLeave';" > features/ess/index.js
```

### Step 2: Update imports gradually
```javascript
// Before
import MyLeave from '../features/ess/leave/MyLeave';

// After
import { MyLeave } from '@/features/ess';
```

### Step 3: Move feature-specific components
```bash
# Move components from /components/employees to /features/employees/components
mv src/components/employees/* src/features/employees/components/
```

## Best Practices

1. **Keep features independent** - Avoid cross-feature imports
2. **Use services for API calls** - Don't call API directly from components
3. **Shared components in /components** - Only truly reusable components
4. **Feature-specific in /features** - Components used only in one feature
5. **Centralized routing** - All routes in `/routes`
6. **Centralized state** - Redux store in `/store`

## Conclusion

Your current structure is **already good**. The main improvements would be:
1. Add barrel exports (index.js) in features
2. Move feature-specific components from `/components/[feature]` to `/features/[feature]/components`
3. Keep everything else as-is

**No major restructuring needed!** 🎉
