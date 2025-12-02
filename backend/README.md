# HRMS Backend API

Node.js/Express backend for the HRMS Employee Management module.

## Directory Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Mongoose models
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic
│   ├── middleware/      # Custom middleware
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── validators/      # Request validation schemas
│   └── server.js        # Application entry point
├── uploads/             # Temporary file uploads
├── tests/               # Test files
├── .env.example         # Environment variables template
├── .eslintrc.json       # ESLint configuration
├── jest.config.js       # Jest configuration
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Employees
- `POST /api/employees` - Create employee
- `GET /api/employees` - List employees
- `GET /api/employees/:id` - Get employee details
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Soft delete employee
- `GET /api/employees/search` - Search employees
- `GET /api/employees/directory` - Public directory
- `PATCH /api/employees/:id/self-update` - Employee self-update
- `GET /api/employees/me` - Get current user profile

### Documents
- `POST /api/employees/:id/documents` - Upload document
- `GET /api/employees/:id/documents` - List documents
- `GET /api/documents/:documentId` - Download document
- `DELETE /api/documents/:documentId` - Delete document

### Users (SuperAdmin only)
- `POST /api/users` - Create user
- `GET /api/users` - List users
- `PUT /api/users/:id` - Update user
- `PATCH /api/users/:id/role` - Change user role
- `DELETE /api/users/:id` - Deactivate user

### Configuration (SuperAdmin only)
- `GET /api/config/departments` - Get departments
- `POST /api/config/departments` - Create department
- `PUT /api/config/departments/:id` - Update department
- `GET /api/config/custom-fields` - Get custom fields
- `POST /api/config/custom-fields` - Create custom field

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Environment Variables

Copy `.env.example` to `.env` and update the values.

## Testing

Tests are written using Jest and Supertest. Run tests with:

```bash
npm test
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```
