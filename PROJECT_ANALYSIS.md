# HRMS Project - Complete File Dependency Analysis

## Project Overview
This is a full-stack Human Resource Management System (HRMS) built with:
- **Backend**: Node.js + Express + MySQL (Sequelize ORM)
- **Frontend**: React + Vite + Zustand (State Management)
- **Architecture**: Monorepo with separate frontend/backend workspaces

## Root Level Structure

### Configuration Files
- `package.json` - Root workspace configuration with scripts for both frontend/backend
- `docker-compose.yml` - Complete containerization setup (MongoDB, Redis, Backend, Frontend, Nginx)
- `.editorconfig`, `.gitignore`, `.gitattributes` - Development environment setup

### Key Scripts (Root package.json)
```json
{
  "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
  "build": "npm run build:backend && npm run build:frontend",
  "test": "npm run test:backend && npm run test:frontend"
}
```

## Backend Architecture (`/backend`)

### Entry Points & Core Files
1. **`src/server.js`** - Main server entry point
   - Imports `app.js`
   - Connects to database via `config/sequelize.js`
   - Initializes cron jobs from `jobs/notificationCleanup.js`

2. **`src/app.js`** - Express application setup
   - **Security**: helmet, cors, hpp, rate limiting
   - **Routes**: All API route imports and mounting
   - **Middleware**: Error handling, logging, compression

### Database Layer
3. **`src/config/index.js`** - Central configuration
   - Database connection settings (MySQL)
   - JWT configuration
   - Email, file upload, security settings

4. **`src/config/sequelize.js`** - Database connection setup

5. **`src/models/sequelize/index.js`** - Model definitions and associations
   - **Core Models**: User, Employee, Department, EmployeeProfile
   - **HR Models**: AttendanceRecord, LeaveRequest, LeaveBalance, LeaveType, Holiday
   - **System Models**: AuditLog, Config, Notification, CompanyEvent
   - **CRM Models**: Lead, LeadActivity, LeadNote

### API Routes Structure
```
/api/auth/*                    - Authentication (login, register, refresh)
/api/admin/dashboard/*         - Admin dashboard
/api/admin/leave/*            - Leave management (admin)
/api/admin/attendance/*       - Attendance management (admin)
/api/admin/departments/*      - Department management
/api/employees/*              - Employee CRUD operations
/api/employee/*               - Employee self-service
/api/calendar/*               - Calendar events
/api/users/*                  - User management
/api/config/*                 - System configuration
```

### Key Dependencies (Backend)
- **Database**: `sequelize`, `mysql2`
- **Authentication**: `jsonwebtoken`, `bcryptjs`
- **Security**: `helmet`, `cors`, `hpp`, `express-rate-limit`
- **File Handling**: `multer`, `exceljs`, `pdfkit`, `puppeteer`
- **Email**: `nodemailer`
- **Validation**: `joi`
- **Logging**: `winston`
- **Scheduling**: `node-cron`

## Frontend Architecture (`/frontend`)

### Entry Points & Core Files
1. **`index.html`** - HTML entry point
2. **`src/main.jsx`** - React application bootstrap
   - Renders `App.jsx` with React Router
3. **`src/App.jsx`** - Main application component
   - Route configuration and layout setup
   - State management initialization
   - Error boundaries and loading states

### Build Configuration
4. **`vite.config.js`** - Build and development configuration
   - Path aliases (`@` → `./src`)
   - Proxy setup for API calls
   - Code splitting and optimization

### State Management (Zustand)
5. **`src/stores/`** - Centralized state management
   - `useAuthStore.js` - Authentication state
   - `useEmployeeStore.js` - Employee data
   - `useAttendanceStore.js` - Attendance tracking
   - `useLeaveStore.js` - Leave management
   - `useCalendarStore.js` - Calendar events
   - `useUIStore.js` - UI state (modals, loading, etc.)

### Routing System
6. **`src/routes/index.js`** - Central route configuration
   - Role-based route access
   - Module-specific route groupings
   - Navigation configuration

### Module Structure
```
src/modules/
├── auth/                 - Authentication pages
├── employee/            - Employee management
├── attendance/          - Attendance tracking
├── leave/              - Leave management
├── calendar/           - Calendar functionality
└── organization/       - Organization settings
```

### Key Dependencies (Frontend)
- **Core**: `react`, `react-dom`, `react-router-dom`
- **State**: `zustand`
- **UI Components**: `@radix-ui/*` components, `lucide-react`
- **Forms**: `react-hook-form`, `@hookform/resolvers`, `zod`
- **HTTP**: `axios`
- **Styling**: `tailwindcss`, `framer-motion`
- **Notifications**: `react-hot-toast`, `react-toastify`

## File Dependency Flow

### Backend Request Flow
```
server.js → app.js → routes/*.js → controllers/*.js → services/*.js → models/sequelize/*.js
```

### Frontend Component Flow
```
main.jsx → App.jsx → routes/index.js → modules/*/pages/*.jsx → components/*.jsx → stores/*.js
```

### Database Dependencies
```
config/sequelize.js → models/sequelize/index.js → Individual Model Files
```

### API Integration Flow
```
Frontend stores → services/api.js → Backend routes → Controllers → Services → Models
```

## Critical Integration Points

### Authentication Flow
1. **Frontend**: `modules/auth/pages/Login.jsx`
2. **Store**: `stores/useAuthStore.js`
3. **API**: `services/authService.js`
4. **Backend**: `routes/auth.routes.js` → `controllers/authController.js`
5. **Middleware**: `middleware/auth.js`

### Employee Management Flow
1. **Frontend**: `modules/employee/pages/EmployeeList.jsx`
2. **Store**: `stores/useEmployeeStore.js`
3. **Backend**: `routes/admin/employee.routes.js` → `controllers/employeeController.js`
4. **Models**: `models/sequelize/Employee.js`, `models/sequelize/EmployeeProfile.js`

### Attendance System Flow
1. **Frontend**: `modules/attendance/` components
2. **Store**: `stores/useAttendanceStore.js`
3. **Backend**: `routes/admin/attendance.routes.js`
4. **Models**: `models/sequelize/AttendanceRecord.js`

## Configuration Dependencies

### Environment Variables
- **Backend**: `.env` (based on `.env.example`)
- **Frontend**: `.env` (API URL configuration)

### Build Dependencies
- **Root**: `package.json` (workspace configuration)
- **Backend**: `package.json` (Node.js dependencies)
- **Frontend**: `package.json` (React dependencies)

### Docker Dependencies
- `docker-compose.yml` references both `backend/Dockerfile` and `frontend/Dockerfile`
- Volume mounts for uploads, logs, and database persistence

## Testing Structure
- **Backend**: Jest configuration in `jest.config.js`
- **Frontend**: Jest + React Testing Library
- **Test Files**: Located in respective `tests/` directories

## Key Integration Files

### Most Critical Files (High Usage)
1. **`backend/src/app.js`** - Central backend configuration
2. **`frontend/src/App.jsx`** - Central frontend configuration
3. **`backend/src/models/sequelize/index.js`** - Database model definitions
4. **`frontend/src/routes/index.js`** - Route configuration
5. **`backend/src/config/index.js`** - System configuration
6. **`frontend/src/stores/setupStores.js`** - State management setup

### Configuration Files (System Setup)
1. **`package.json`** (root) - Workspace and script configuration
2. **`docker-compose.yml`** - Container orchestration
3. **`vite.config.js`** - Frontend build configuration
4. **`.env.example`** files - Environment setup templates

This analysis shows a well-structured monorepo with clear separation of concerns, comprehensive state management, and robust API architecture suitable for enterprise HR management.