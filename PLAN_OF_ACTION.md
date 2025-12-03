# 📌 HRM SYSTEM — PHASED REQUIREMENTS & TASK PLAN
Kiro, follow this phased plan to analyze, implement, and complete the HRM system.

Each phase contains:
- Requirements  
- Tasks  
- Expected Output  

Work phase-by-phase and generate the required code/files.

---

# PHASE 1 — PROJECT DISCOVERY & ANALYSIS

## Requirements
- Understand the entire codebase structure.
- Check frontend + backend folders.
- Identify missing files, errors, or incomplete modules.

## Tasks
1. Scan all directories and list all files.
2. Identify missing folders or modules.
3. Identify broken imports, components, models, or routes.
4. Identify connection gaps between frontend and backend.

## Expected Output
- A complete **PROJECT AUDIT REPORT** with findings and issues.
- No code changes yet — only a report.

---

# PHASE 2 — CORE BACKEND FOUNDATION

## Requirements
All backend models, controllers, routes, and middleware must be complete and fully functional.

## Tasks
1. Verify/Create all Sequelize Models:
   - User, Employee, Attendance, Leave, Payroll, SalaryTemplate
   - Job, Candidate, CalendarEvent
   - BankDetails, Documents
   - Role, Permission, RolePermission
   - AuditLog

2. Verify/Create Controllers:
   - AuthenticationController
   - EmployeeController
   - AttendanceController
   - PayrollController
   - LeaveController
   - RecruitmentController
   - CalendarController
   - SettingsController
   - AuditLogController
   - ESSController

3. Implement Middleware:
   - Auth middleware
   - Permission middleware
   - Error handler
   - Audit log middleware

4. Create & validate all routes:
   - /api/auth
   - /api/employees
   - /api/attendance
   - /api/payroll
   - /api/leaves
   - /api/recruitment
   - /api/calendar
   - /api/ess
   - /api/settings
   - /api/audit

## Expected Output
- A fully functional backend with all APIs working.
- Swagger or README API documentation (optional).

---

# PHASE 3 — FRONTEND ROUTES & PAGE STRUCTURE

## Requirements
Frontend must have all HRM pages created and routes connected.

## Tasks
1. Create/Verify Routing:
   - Dashboard
   - Employees (list, add, profile)
   - Attendance (overview, manage)
   - Payroll (setup, templates, run)
   - Leaves (apply, policies)
   - Recruitment (jobs, candidates)
   - Calendar (events, holidays)
   - ESS (employee self-service)
   - Settings (roles, permissions)
   - Audit Logs

2. Create page placeholder files if missing.
3. Connect layout, sidebar, header, and protected routes.

## Expected Output
- All pages exist.
- All routes load without error.

---

# PHASE 4 — REDUX STORE & API INTEGRATION

## Requirements
Every module must have a complete state management system.

## Tasks
For each module (Employees, Attendance, Payroll, Leaves, Recruitment, ESS, Settings, AuditLog):

1. Create/Verify Redux Slice.
2. Create Async Thunks (CRUD + extra operations).
3. Connect to backend APIs via services.
4. Handle loading, success, error states.
5. Build reusable API service files.

## Expected Output
- Fully connected Redux state for all modules.
- Working CRUD operations across the app.

---

# PHASE 5 — UI COMPONENTS & FUNCTIONALITY IMPLEMENTATION

## Requirements
All UI components must function correctly.

## Tasks
1. Fix/create:
   - Sidebar (framer-motion)
   - Header bar
   - Tables (sortable, searchable)
   - Forms
   - Modals
   - Cards & Widgets
   - Reusable input fields
   - Date pickers
   - Notifications/toasts

2. Add functionality to pages:
   - Employee forms, profile, documents, bank details
   - Attendance punch in/out
   - Payroll salary template builder
   - Leave apply + approval flows
   - Job posting, candidate Kanban board
   - Calendar events + holidays
   - ESS updates (profile, documents, payslips)

## Expected Output
- Fully interactive UI.
- All core HRM workflows functional.

---

# PHASE 6 — SECURITY, PERMISSIONS & AUDIT LOGS

## Requirements
System must support:
- Role-based access
- Permission checking
- Audit logging of all actions

## Tasks
1. Implement permission logic in backend.
2. Apply permission-based UI checks in frontend.
3. Log:
   - Create, update, delete actions
   - Payroll operations
   - Attendance operations
   - Leave approvals
4. Display audit logs page in frontend.

## Expected Output
- Secure app with role-based access.
- Full audit trail available.

---

# PHASE 7 — OPTIMIZATION & CLEANUP

## Requirements
Ensure code cleanliness, consistency, and performance.

## Tasks
1. Apply ESLint + Prettier across project.
2. Remove unused files and imports.
3. Standardize naming conventions.
4. Refactor duplicated logic into utilities.
5. Improve performance of heavy pages.

## Expected Output
- Clean, optimized codebase.
- Zero console errors.

---

# PHASE 8 — FINAL INTEGRATION & TESTING

## Requirements
System must run end-to-end smoothly.

## Tasks
1. Test all CRUD functionality.
2. Test login, permissions, and session handling.
3. Test each module:
   - Employees
   - Attendance
   - Leaves
   - Payroll
   - Recruitment
   - ESS
   - Calendar
4. Test all API endpoints.
5. Fix final bugs.

## Expected Output
- Fully working HRM system.
- Ready for deployment.

---

# PHASE 9 — DOCUMENTATION & DELIVERY

## Requirements
Produce developer-ready documentation.

## Tasks
1. API Documentation (Swagger or markdown)
2. Folder structure explanation
3. Environment variable setup
4. Deployment steps
5. Admin user instructions

## Expected Output
- Documentation folder
- Final production-ready product

---

# INSTRUCTIONS FOR KIRO
Kiro, follow the phases in order.

Phase 1: OUTPUT THE PROJECT AUDIT ONLY.  
Wait for approval before starting Phase 2.

Do not skip phases.
