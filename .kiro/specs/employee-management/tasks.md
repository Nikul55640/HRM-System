# Implementation Plan

- [x] 1. Set up project structure and initialize repositories
  - Create monorepo structure with separate frontend and backend directories
  - Initialize React app with Create React App or Vite
  - Initialize Node.js/Express backend with proper folder structure (routes, controllers, services, models, middleware)
  - Set up environment configuration files (.env.example) for both frontend and backend
  - Configure ESLint and Prettier for code quality
  - Initialize Git repository with .gitignore files
  - _Requirements: All requirements depend on proper project setup_

- [x] 2. Set up database and core data models
  - [x] 2.1 Configure MongoDB connection
    - Install Mongoose and create database connection utility
    - Set up connection pooling and error handling
    - Create database configuration for different environments
    - _Requirements: All requirements depend on database connectivity_
  
  - [x] 2.2 Implement Employee schema and model
    - Create Mongoose schema for Employee with all fields (personalInfo, contactInfo, jobInfo)
    - Add schema validation rules and custom validators
    - Implement pre-save hooks for data normalization
    - Add indexes for frequently queried fields (email, employeeId, department)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2, 4.3_
  
  - [x] 2.3 Implement User schema and model
    - Create Mongoose schema for User with authentication fields
    - Add password hashing pre-save hook using bcrypt
    - Implement methods for password comparison and token generation
    - Add role-based field validation
    - _Requirements: 10.3, 11.1, 11.2_
  
  - [x] 2.4 Implement Department schema and model
    - Create Mongoose schema for Department
    - Add hierarchical department support with parent references
    - Implement validation for unique department codes
    - _Requirements: 12.1, 13.1, 13.5_
  
  - [x] 2.5 Implement Document schema and model
    - Create Mongoose schema for Document with file metadata
    - Add document type enumeration and validation
    - Implement reference to Employee model
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1, 7.2_
  
  - [x] 2.6 Implement AuditLog schema and model
    - Create Mongoose schema for AuditLog
    - Add indexes for efficient querying by entity and timestamp
    - Implement TTL index for automatic log cleanup after 7 years
    - _Requirements: 1.5, 2.2, 11.3, 12.3_

- [x] 3. Implement authentication and authorization system
  - [x] 3.1 Create JWT authentication utilities
    - Implement token generation functions (access and refresh tokens)
    - Create token verification and decoding utilities
    - Set up token expiration handling
    - _Requirements: 10.3, 11.5_
  
  - [x] 3.2 Implement authentication middleware
    - Create middleware to extract and validate JWT from request headers
    - Attach authenticated user to request object
    - Handle token expiration and invalid token errors
    - _Requirements: 10.5, 11.5_
  
  - [x] 3.3 Implement RBAC middleware
    - Create authorize middleware that accepts role array
    - Implement scope checking for HR Manager role
    - Add department-based access filtering
    - Return appropriate error responses for unauthorized access
    - _Requirements: 10.5, 13.1, 13.2, 13.3, 13.5_
  
  - [x] 3.4 Create authentication routes and controllers
    - Implement POST /api/auth/login endpoint with credential validation
    - Implement POST /api/auth/register endpoint (for initial setup)
    - Implement POST /api/auth/refresh endpoint for token refresh
    - Implement POST /api/auth/logout endpoint
    - Add password reset flow endpoints
    - _Requirements: 10.3_

- [x] 4. Implement employee management core functionality
  - [x] 4.1 Create employee service layer
    - Implement createEmployee service method with validation
    - Implement updateEmployee service method with audit logging
    - Implement getEmployeeById with role-based filtering
    - Implement listEmployees with pagination and scope filtering
    - Implement softDeleteEmployee method
    - Add email uniqueness checking
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 4.2 Create employee routes and controllers
    - Implement POST /api/employees endpoint with RBAC (HR Admin+)
    - Implement GET /api/employees endpoint with pagination and filtering
    - Implement GET /api/employees/:id endpoint
    - Implement PUT /api/employees/:id endpoint with RBAC (HR Admin+)
    - Implement DELETE /api/employees/:id endpoint with RBAC (HR Admin+)
    - Add request validation middleware for each endpoint
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 4.3 Implement employee validation schemas
    - Create Joi schemas for employee creation validation
    - Create Joi schemas for employee update validation
    - Add email format validation
    - Add phone number format validation
    - Implement custom validators for business rules
    - _Requirements: 1.1, 1.2, 1.3, 2.3, 10.1, 10.2_
  
  - [x] 4.4 Implement audit logging service
    - Create service method to log employee creation
    - Create service method to log employee updates with field changes
    - Create service method to log employee deletion
    - Implement automatic logging in employee service methods
    - _Requirements: 1.5, 2.2, 11.3, 12.3_
  
  - [x] 4.5 Implement email notification service
    - Set up Nodemailer with SMTP configuration
    - Create email templates for welcome emails
    - Create email templates for profile update notifications
    - Implement sendWelcomeEmail function
    - Implement sendProfileUpdateEmail function
    - _Requirements: 1.4, 2.5_

- [x] 5. Implement document management functionality
  - [x] 5.1 Set up file upload infrastructure
    - Configure Multer for multipart/form-data handling
    - Create file storage directory structure
    - Implement file type validation (PDF, DOC, DOCX, JPG, PNG)
    - Implement file size validation (10MB limit)
    - Add temporary file cleanup mechanism
    - _Requirements: 5.1, 7.1_
  
  - [x] 5.2 Implement document encryption service
    - Create encryption utility using crypto module (AES-256)
    - Implement encryptFile function
    - Implement decryptFile function
    - Set up secure key generation and storage
    - _Requirements: 10.4_
  
  - [x] 5.3 Create document service layer
    - Implement uploadDocument service method with encryption
    - Implement getDocumentsByEmployee service method
    - Implement downloadDocument service method with decryption
    - Implement deleteDocument service method
    - Add document metadata storage in database
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1, 7.2, 7.3, 7.4_
  
  - [x] 5.4 Create document routes and controllers
    - Implement POST /api/employees/:id/documents endpoint with file upload
    - Implement GET /api/employees/:id/documents endpoint
    - Implement GET /api/documents/:documentId endpoint for download
    - Implement DELETE /api/documents/:documentId endpoint (HR Admin+)
    - Add RBAC middleware to restrict document access
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 5.5 Implement malware scanning
    - Integrate ClamAV or similar antivirus library
    - Create scanFile utility function
    - Add scanning step in upload middleware
    - Implement quarantine mechanism for infected files
    - _Requirements: 5.5_

- [x] 6. Implement search and directory functionality


  - [x] 6.1 Create employee search service

    - Implement search by name, email, phone, employee ID
    - Add fuzzy matching for name searches
    - Implement role-based result filtering
    - Optimize search queries with proper indexes
    - _Requirements: 8.1, 8.2, 9.3_
  

  - [x] 6.2 Create employee filter service
    - Implement filtering by department
    - Implement filtering by job title
    - Implement filtering by employment type
    - Implement filtering by work location
    - Implement filtering by employment status
    - Support multiple simultaneous filters
    - _Requirements: 8.3, 8.4_

  
  - [x] 6.3 Create search and directory routes and controllers









    - Implement GET /api/employees/search endpoint with query parameters
    - Implement GET /api/employees/directory endpoint for public directory
    - Add pagination to search results
    - Implement privacy filtering (exclude private profiles)
    - Wire up searchEmployees, filterEmployees, and getEmployeeDirectory service methods to controllers
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 7. Implement employee self-service functionality



  - [x] 7.1 Create self-service routes and controllers



    - Implement PATCH /api/employees/:id/self-update endpoint
    - Add validation to allow only specific fields (phone, address, emergency contacts)
    - Implement GET /api/employees/me endpoint for current user profile
    - Add automatic audit logging for self-updates
    - _Requirements: 6.3, 6.4, 6.5_
  
  - [x] 7.2 Create dashboard data aggregation service









    - Implement service to fetch employee profile summary
    - Create placeholder methods for leave balance (to be implemented in Leave module)
    - Create placeholder methods for attendance records (to be implemented in Attendance module)
    - Implement recent activity feed from audit logs
    - _Requirements: 6.1, 6.2_


- [x] 8. Implement user management functionality (SuperAdmin)




  - [x] 8.1 Create user service layer


    - Implement createUser service method with password hashing
    - Implement updateUser service method
    - Implement changeUserRole service method
    - Implement deactivateUser service method
    - Add validation to prevent last SuperAdmin deletion
    - _Requirements: 11.1, 11.2, 11.4_
  
  - [x] 8.2 Create user routes and controllers


    - Implement POST /api/users endpoint (SuperAdmin only)
    - Implement GET /api/users endpoint (SuperAdmin only)
    - Implement PUT /api/users/:id endpoint (SuperAdmin only)
    - Implement PATCH /api/users/:id/role endpoint (SuperAdmin only)
    - Implement DELETE /api/users/:id endpoint (SuperAdmin only)
    - Add audit logging for all user management actions
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 9. Implement system configuration functionality (SuperAdmin)



  - [x] 9.1 Create department service layer


    - Implement createDepartment service method
    - Implement updateDepartment service method
    - Implement getDepartments service method
    - Support hierarchical department structure
    - _Requirements: 12.1, 13.4_
  

  - [x] 9.2 Create configuration service layer

    - Implement getConfig service method
    - Implement setConfig service method
    - Support custom employee fields configuration
    - Support custom document categories configuration
    - _Requirements: 12.2_
  

  - [x] 9.3 Create configuration routes and controllers

    - Implement GET /api/config/departments endpoint
    - Implement POST /api/config/departments endpoint (SuperAdmin only)
    - Implement PUT /api/config/departments/:id endpoint (SuperAdmin only)
    - Implement GET /api/config/custom-fields endpoint
    - Implement POST /api/config/custom-fields endpoint (SuperAdmin only)
    - Add audit logging for configuration changes
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 10. Build frontend foundation and routing








  - [x] 10.1 Set up React project structure


    - Create folder structure (components, pages, services, store, utils, hooks)
    - Configure Tailwind CSS
    - Set up React Router with route definitions
    - Create layout components (Header, Sidebar, Footer)
    - _Requirements: All frontend requirements_
  
  - [x] 10.2 Set up Redux Toolkit store




    - Configure Redux store with slices
    - Create auth slice for authentication state
    - Create employee slice for employee data
    - Create UI slice for loading states and notifications
    - Set up Redux DevTools
    - _Requirements: All frontend requirements_
  

  - [x] 10.3 Create API service layer

    - Set up Axios instance with base URL and interceptors
    - Implement request interceptor to attach JWT token
    - Implement response interceptor for error handling
    - Create API service methods for all backend endpoints
    - _Requirements: All frontend requirements_
  
  - [x] 10.4 Implement authentication flow


    - Create Login page component
    - Create authentication actions and reducers
    - Implement protected route wrapper component
    - Add token storage in localStorage
    - Implement automatic token refresh logic
    - Create logout functionality
    - _Requirements: 10.3, 11.5_

- [x] 11. Build employee management UI







 

  - [x] 11.1 Create EmployeeList component



    - Build employee list with card/table view toggle
    - Implement pagination controls
    - Add loading and error states
    - Integrate with Redux for state management
    - Add quick action buttons (view, edit, delete)
    - _Requirements: 1.4, 8.5_
  
  - [x] 11.2 Create EmployeeForm component


    - Build multi-step form with Formik
    - Implement Personal Info step with validation
    - Implement Contact Info step with validation
    - Implement Job Details step with validation
    - Add form progress indicator
    - Implement form submission with API integration
    - Add success/error notifications
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.3, 10.1, 10.2_
  
  - [x] 11.3 Create EmployeeProfile component


    - Build tabbed interface (Overview, Documents, Activity)
    - Display all employee information in Overview tab
    - Implement edit mode toggle for HR roles
    - Add profile photo display and upload
    - Integrate with document list in Documents tab
    - Display audit log in Activity tab
    - _Requirements: 1.4, 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 11.4 Create EmployeeDirectory component






    - Build grid/list view toggle
    - Implement search bar with real-time search
    - Create filter sidebar with checkboxes
    - Display employee cards with contact info
    - Add click-to-email and click-to-call functionality
    - Implement privacy filtering
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 11.5 Create employee delete confirmation modal





    - Build confirmation dialog component
    - Display warning about soft delete

    - Show associated records warning
    - Implement delete action with API call
    - Add success/error handling
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 12. Build employee self-service UI

  - [x] 12.1 Create frontend dashboard service



    - Create dashboardService.js in frontend/src/services
    - Implement getDashboardData API call
    - Implement getProfileSummary API call
    - Implement getRecentActivity API call
    - Export service methods
    - _Requirements: 6.1, 6.2_

  - [x] 12.2 Create DashboardHome component


    - Build profile summary card with data from dashboard service
    - Display quick stats (leave balance, attendance placeholders)
    - Create recent activity feed from audit logs
    - Add quick action buttons with navigation
    - Implement responsive layout
    - Add loading and error states
    - _Requirements: 6.1, 6.2_
  
  - [x] 12.3 Create ProfileEditor component


    - Display all profile fields with read-only/editable indicators
    - Implement inline editing for allowed fields (phone, address, emergency contacts)
    - Add validation for editable fields using Yup
    - Implement save functionality using self-update endpoint
    - Add optimistic UI updates
    - Add success/error notifications
    - _Requirements: 6.3, 6.4, 6.5_
  

  - [x] 12.4 Create DocumentUpload component

    - Build drag-and-drop upload zone using file input
    - Add file type validation (PDF, DOC, DOCX, JPG, PNG)
    - Add file size validation (10MB limit)
    - Implement document category selection dropdown
    - Show upload progress bar
    - Display uploaded documents list with download links
    - Add download and preview functionality
    - Integrate with document service API
    - _Requirements: 7.1, 7.2, 7.3, 7.4_


  - [x] 12.5 Wire up self-service routes in App.jsx

    - Add route for /profile with ProfileEditor component
    - Add route for /documents with DocumentUpload component
    - Update Dashboard quick action buttons with navigation
    - Ensure routes are protected for authenticated users
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4_

- [x] 13. Complete admin UI components

  - [x] 13.1 Create CustomFieldsSection component


    - Build custom employee fields management interface
    - Implement add/edit/delete custom field forms
    - Add field type selection (text, number, date, dropdown)
    - Implement save functionality with API integration
    - Add validation for field definitions
    - Display current custom fields in a table
    - _Requirements: 12.2, 12.3, 12.4, 12.5_


  - [x] 13.2 Create DocumentCategoriesSection component

    - Build document categories management interface
    - Implement add/edit/delete category forms
    - Display current categories in a list
    - Add category description field
    - Implement save functionality with API integration
    - Add validation for category names
    - _Requirements: 12.2, 12.3, 12.4, 12.5_


  - [x] 13.3 Wire up admin routes in App.jsx

    - Add route for /users with UserManagement component (SuperAdmin only)
    - Add route for /settings with SystemConfig component (SuperAdmin only)
    - Update navigation to include admin links for SuperAdmin role
    - Ensure routes use RoleGuard for proper access control
    - _Requirements: 11.1, 11.2, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.5_


- [x] 14. Implement role-based UI rendering



  - [x] 14.1 Create role-based component wrappers


    - Implement RoleGuard component that accepts allowed roles
    - Create useAuth hook for accessing current user and role
    - Add conditional rendering based on user role
    - Hide/show navigation items based on permissions
    - _Requirements: 10.5, 11.1, 12.4, 13.1, 13.2, 13.3_
  
  - [x] 14.2 Implement scope-based filtering for HR Managers


    - Add department filter to employee list for HR Managers
    - Restrict employee access based on assigned departments
    - Update search and directory to respect scope
    - Add visual indicators for scope restrictions
    - _Requirements: 13.1, 13.2, 13.3, 13.5_

- [x] 15. Implement comprehensive error handling

  - [x] 15.1 Implement API error handling utilities


    - Create error transformation utilities in frontend/src/utils
    - Map backend error codes to user-friendly messages
    - Handle network errors gracefully (timeout, connection refused)
    - Add retry logic for failed requests in API interceptor
    - Handle 401 (unauthorized) with automatic token refresh
    - Handle 403 (forbidden) with redirect to unauthorized page
    - _Requirements: All requirements_
  
  - [x] 15.2 Enhance error handling in components

    - Add try-catch blocks in all async operations
    - Display user-friendly error messages using toast notifications
    - Add error states to all data-fetching components
    - Implement fallback UI for failed data loads
    - Add error recovery actions (retry buttons)
    - _Requirements: All requirements_


- [x] 16. Enhance data validation and security

  - [x] 16.1 Review and enhance frontend validation

    - Review existing Yup schemas in EmployeeForm
    - Ensure validation matches backend requirements
    - Add real-time field validation feedback where missing
    - Implement custom validators for business rules (e.g., hire date not in future)
    - Add visual validation feedback improvements
    - _Requirements: 1.1, 1.2, 1.3, 2.3, 10.1, 10.2_
  
  - [x] 16.2 Implement XSS prevention measures


    - Review all user input rendering points
    - Sanitize user inputs before rendering using DOMPurify
    - Add Content Security Policy headers in backend
    - Test with XSS payloads to ensure protection
    - _Requirements: 10.4, 10.5_
  
  - [x] 16.3 Implement CSRF protection


    - Add CSRF token generation middleware in backend
    - Include CSRF token in API requests from frontend
    - Validate CSRF token in backend middleware
    - Add CSRF token to all state-changing requests
    - _Requirements: 10.5_

- [x] 17. Final integration and testing checkpoint



  - Manually test complete employee management workflow (create, view, edit, delete)
  - Test employee self-service features (profile view, self-update, document upload)
  - Test employee directory and search functionality
  - Test user management (SuperAdmin creating/editing users)
  - Test system configuration (departments, custom fields, document categories)
  - Test role-based access control for all user roles
  - Test error handling and edge cases
  - Verify all API endpoints are working correctly
  - Ensure all tests pass
  - Ask the user if any issues arise
  - _Requirements: All requirements_

- [ ]* 18. Write backend tests
  - [ ]* 18.1 Write unit tests for services
    - Test employee service CRUD operations
    - Test document service encryption/decryption
    - Test user service with role management
    - Test audit logging service
    - _Requirements: All requirements_
  
  - [ ]* 18.2 Write integration tests for API endpoints
    - Test employee endpoints with different roles
    - Test document upload and download flow
    - Test authentication and authorization
    - Test search and filter functionality
    - _Requirements: All requirements_
  
  - [ ]* 18.3 Write middleware tests
    - Test JWT authentication middleware
    - Test RBAC middleware with different roles
    - Test validation middleware
    - Test file upload middleware
    - _Requirements: 10.3, 10.5, 11.5_

- [ ]* 19. Write frontend tests
  - [ ]* 19.1 Write component tests
    - Test EmployeeList rendering and interactions
    - Test EmployeeForm validation and submission
    - Test EmployeeProfile tabs and editing
    - Test DashboardHome data display
    - Test ProfileEditor component
    - Test DocumentUpload component
    - _Requirements: All frontend requirements_
  
  - [ ]* 19.2 Write Redux tests
    - Test auth slice actions and reducers
    - Test employee slice actions and reducers
    - Test async thunks for API calls
    - _Requirements: All frontend requirements_
  
  - [ ]* 19.3 Write integration tests
    - Test complete employee creation flow
    - Test employee self-update flow
    - Test document upload flow
    - Test user management flow
    - _Requirements: All requirements_

- [ ]* 20. Set up deployment infrastructure
  - [ ]* 20.1 Create Docker configuration
    - Write Dockerfile for backend
    - Write Dockerfile for frontend
    - Create docker-compose.yml for local development
    - Configure environment variables
    - _Requirements: All requirements_
  
  - [ ]* 20.2 Set up CI/CD pipeline
    - Create GitHub Actions workflow
    - Add build and test steps
    - Configure automated deployment to staging
    - Add manual approval for production deployment
    - _Requirements: All requirements_
  
  - [ ]* 20.3 Configure production environment
    - Set up MongoDB Atlas cluster
    - Configure AWS S3 for document storage
    - Set up environment variables in hosting platform
    - Configure SSL certificates
    - Set up monitoring and logging
    - _Requirements: All requirements_

- [ ]* 21. Create seed data and documentation
  - [ ]* 21.1 Create database seed scripts
    - Create script to seed initial SuperAdmin user
    - Create script to seed sample departments
    - Create script to seed sample employees
    - Add instructions for running seed scripts
    - _Requirements: 11.1, 12.1_
  
  - [ ]* 21.2 Write API documentation
    - Document all API endpoints with request/response examples
    - Add authentication requirements for each endpoint
    - Document error responses
    - Create Postman collection
    - _Requirements: All requirements_
  
  - [ ]* 21.3 Write deployment documentation
    - Document environment variables
    - Write deployment instructions
    - Document backup and restore procedures
    - Create troubleshooting guide
    - _Requirements: All requirements_
