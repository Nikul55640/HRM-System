# 📘 HRM System - Developer Guide

> **Quick Start:** Run `npm run dev` in both `backend/` and `frontend/` folders

---

## 📁 Project Structure

### 🎯 Overview
```
hrm-system/
├── 🔧 backend/          → Server (Node.js + Express + MongoDB)
├── 🎨 frontend/         → UI (React + Vite + Redux)
├── 📚 docs/             → Documentation
├── 📄 README.md         → Quick start guide
└── 📖 PROJECT_GUIDE.md  → This file
```

### 🔧 Backend Structure
```
backend/
├── src/
│   ├── 📋 models/          → Database schemas
│   │   ├── User.js         → User accounts
│   │   ├── Employee.js     → Employee data
│   │   ├── Leave.js        → Leave requests
│   │   └── Attendance.js   → Attendance records
│   │
│   ├── 🎮 controllers/     → Request handlers
│   │   ├── authController.js       → Login, logout
│   │   ├── employeeController.js   → CRUD employees
│   │   └── leaveController.js      → Leave management
│   │
│   ├── 🛣️ routes/          → API endpoints
│   │   ├── auth.js         → /api/auth/*
│   │   ├── employees.js    → /api/employees/*
│   │   └── index.js        → All routes combined
│   │
│   ├── 🔐 middleware/      → Security & validation
│   │   ├── auth.js         → Check if logged in
│   │   └── validate.js     → Validate data
│   │
│   ├── 💼 services/        → Business logic
│   ├── ⚙️ config/          → Settings
│   └── 🛠️ utils/           → Helper functions
│
├── 🌱 seeds/               → Sample data
└── 📦 package.json         → Dependencies
```

### 🎨 Frontend Structure
```
frontend/
├── src/
│   ├── 🧩 components/
│   │   ├── common/         → Shared components
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── layout/         → Page layout
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── MainLayout.jsx
│   │   │
│   │   └── ui/             → Basic UI elements
│   │       ├── button.jsx
│   │       ├── input.jsx
│   │       └── card.jsx
│   │
│   ├── 🎯 features/        → Main features
│   │   ├── auth/           → Login/Logout
│   │   │   └── Login.jsx
│   │   │
│   │   ├── dashboard/      → Home page
│   │   │   └── Dashboard.jsx
│   │   │
│   │   ├── employees/      → Employee management
│   │   │   ├── EmployeeList.jsx
│   │   │   ├── EmployeeForm.jsx
│   │   │   └── EmployeeProfile.jsx
│   │   │
│   │   └── ess/            → Employee Self-Service
│   │       ├── attendance/ → Clock in/out
│   │       ├── leave/      → Apply for leave
│   │       ├── payslips/   → View payslips
│   │       ├── documents/  → Upload documents
│   │       └── profile/    → Update profile
│   │
│   ├── 🌐 services/        → API calls
│   │   ├── api.js          → Axios setup
│   │   ├── authService.js  → Login API
│   │   └── employeeService.js → Employee API
│   │
│   ├── 🗄️ store/           → Redux state
│   │   ├── index.js        → Store setup
│   │   ├── slices/         → State slices
│   │   └── thunks/         → Async actions
│   │
│   ├── 🪝 hooks/           → Custom hooks
│   │   └── useAuth.js      → Auth hook
│   │
│   ├── 🛠️ utils/           → Helpers
│   ├── 📱 App.jsx          → Main component
│   └── 🚀 main.jsx         → Entry point
│
└── 📦 package.json         → Dependencies
```

---

## 🔄 How Data Flows

### 📤 Backend Flow (API Request)
```
User Request
    ↓
1. Route (/api/employees)
    ↓
2. Middleware (check auth)
    ↓
3. Controller (handle request)
    ↓
4. Service (business logic)
    ↓
5. Model (database query)
    ↓
6. Response (send data back)
```

**Example:** Get all employees
```javascript
// 1. Route: backend/src/routes/employees.js
router.get('/', employeeController.getAll);

// 2. Middleware: Check if user is logged in
router.use(authMiddleware);

// 3. Controller: backend/src/controllers/employeeController.js
const employees = await employeeService.getAllEmployees();

// 4. Service: backend/src/services/employeeService.js
const employees = await Employee.find();

// 5. Model: backend/src/models/Employee.js
const Employee = mongoose.model('Employee', employeeSchema);

// 6. Response: Send back to frontend
res.json({ employees });
```

### 📥 Frontend Flow (User Action)
```
User Clicks Button
    ↓
1. Component (handle click)
    ↓
2. Service (call API)
    ↓
3. Store (save data)
    ↓
4. Component (re-render)
    ↓
User Sees Updated UI
```

**Example:** Load employee list
```javascript
// 1. Component: frontend/src/features/employees/EmployeeList.jsx
const handleLoad = () => {
  dispatch(fetchEmployees());
};

// 2. Service: frontend/src/services/employeeService.js
const response = await api.get('/employees');

// 3. Store: frontend/src/store/slices/employeeSlice.js
state.employees = action.payload;

// 4. Component re-renders with new data
{employees.map(emp => <EmployeeCard key={emp.id} {...emp} />)}
```

---

## 📝 Import Rules (CRITICAL!)

> **90% of errors come from wrong imports!** Read this carefully.

### ✅ Default Export (NO curly braces)

**When to use:** File exports ONE main thing
```javascript
// ✅ CORRECT
import LoadingSpinner from '../../components/common/LoadingSpinner';
import employeeService from '../../services/employeeService';
import useAuth from '../../hooks/useAuth';
import Header from '../../components/layout/Header';

// ❌ WRONG - Don't use { }
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { employeeService } from '../../services/employeeService';
```

**Files using default export:**
- All services: `employeeService`, `authService`, etc.
- Most components: `LoadingSpinner`, `Header`, `Sidebar`
- Custom hooks: `useAuth`, `useEmployees`

### ✅ Named Export (WITH curly braces)

**When to use:** File exports MULTIPLE things
```javascript
// ✅ CORRECT
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { loginSuccess, loginFailure } from '../../store/slices/authSlice';

// ❌ WRONG - Need { }
import Button from '../../components/ui/button';
import Card from '../../components/ui/card';
```

**Files using named exports:**
- UI components: `button`, `card`, `input`, `dialog`
- Redux actions: All store slices
- Utility functions: Multiple helpers in one file

### 🔍 How to Check Export Type

**Open the file and look at the bottom:**

```javascript
// Default export (no { })
export default LoadingSpinner;
→ import LoadingSpinner from './LoadingSpinner';

// Named export (use { })
export const Button = () => { ... };
→ import { Button } from './button';

// Multiple named exports (use { })
export const Card = () => { ... };
export const CardContent = () => { ... };
→ import { Card, CardContent } from './card';
```

### 📋 Quick Reference Table

| File Type | Import Style | Example |
|-----------|-------------|---------|
| Services | Default | `import employeeService from '...'` |
| Custom Hooks | Default | `import useAuth from '...'` |
| Layout Components | Default | `import Header from '...'` |
| Common Components | Default | `import LoadingSpinner from '...'` |
| UI Components | Named | `import { Button } from '...'` |
| Redux Actions | Named | `import { loginSuccess } from '...'` |
| Utils (multiple) | Named | `import { formatDate } from '...'` |

## 🔑 Key Files to Know

### Backend
- `backend/src/server.js` - Starts the server
- `backend/src/routes/index.js` - All API routes
- `backend/src/models/` - Database structure
- `backend/.env` - Configuration (database URL, secrets)

### Frontend
- `frontend/src/main.jsx` - App starts here
- `frontend/src/App.jsx` - Main routes
- `frontend/src/services/api.js` - API configuration
- `frontend/src/store/index.js` - Redux store setup

## 🚀 Quick Commands

### Start Development
```bash
# Backend
cd backend
npm run dev

# Frontend (in new terminal)
cd frontend
npm run dev
```

### Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## 🐛 Common Issues & Fixes

### Issue: Import Error
**Error:** "does not provide an export named..."
**Fix:** Check if it's default or named export (see Import Rules above)

### Issue: Module Not Found
**Error:** "Cannot find module..."
**Fix:** Check the file path is correct (use `../../` to go up folders)

### Issue: Port Already in Use
**Error:** "Port 5000 is already in use"
**Fix:** Kill the process or change port in `.env`

## 📂 Where to Add New Code

### Add New Page
1. Create component in `frontend/src/features/[feature-name]/`
2. Add route in `frontend/src/App.jsx`

### Add New API Endpoint
1. Create controller in `backend/src/controllers/`
2. Add route in `backend/src/routes/`
3. Create service in `frontend/src/services/`

### Add New Component
1. Reusable UI → `frontend/src/components/ui/`
2. Common component → `frontend/src/components/common/`
3. Feature-specific → `frontend/src/features/[feature]/`

## 💡 Tips

1. **Always use relative paths** like `../../components/ui/button`
2. **Check export type** before importing (default vs named)
3. **Restart dev server** after major changes
4. **Hard refresh browser** (Ctrl+Shift+R) if changes don't show
5. **Check console** for error messages

## 🎓 Learning Path

1. Start with `frontend/src/App.jsx` - see all routes
2. Look at `frontend/src/features/auth/Login.jsx` - simple page
3. Check `frontend/src/services/api.js` - how API calls work
4. Explore `backend/src/routes/` - see all endpoints
5. Read `backend/src/controllers/` - understand logic

---

**Need Help?** Check the error message carefully - it usually tells you exactly what's wrong!
