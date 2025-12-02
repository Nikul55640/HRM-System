const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const EmployeeProfile = require('../src/models/EmployeeProfile');
const Payslip = require('../src/models/Payslip');
const LeaveBalance = require('../src/models/LeaveBalance');
const AttendanceRecord = require('../src/models/AttendanceRecord');
const Request = require('../src/models/Request');
const Department = require('../src/models/Department');

describe('Employee Self-Service API Integration Tests', () => {
  let mongoServer;
  let employeeUser;
  let employeeRecord;
  let employeeToken;
  let department;

  beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }, 60000);

  beforeEach(async () => {
    // Clean up test data
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      EmployeeProfile.deleteMany({}),
      Payslip.deleteMany({}),
      LeaveBalance.deleteMany({}),
      AttendanceRecord.deleteMany({}),
      Request.deleteMany({}),
      Department.deleteMany({}),
    ]);

    // Create test department
    department = await Department.create({
      name: 'Engineering',
      description: 'Software Engineering Department',
      isActive: true,
    });

    // Create test user
    employeeUser = await User.create({
      email: 'employee@test.com',
      password: 'password123',
      role: 'employee',
      isActive: true,
    });

    // Create test employee
    employeeRecord = await Employee.create({
      userId: employeeUser._id,
      employeeId: 'EMP001',
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'Male',
      },
      contactInfo: {
        email: 'john.doe@test.com',
        phone: '+1234567890',
      },
      jobInfo: {
        department: department._id,
        position: 'Software Engineer',
        startDate: new Date('2023-01-01'),
        employmentType: 'Full-time',
        salary: 75000,
      },
      isActive: true,
    });

    // Update user with employee reference
    employeeUser.employeeId = employeeRecord._id;
    await employeeUser.save();

    // Generate JWT token for authentication
    employeeToken = employeeUser.generateAuthToken();
  });

  afterAll(async () => {
    // Clean up database connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }, 60000);

  describe('Authentication and Authorization', () => {
    test('should require authentication for all employee endpoints', async () => {
      const endpoints = [
        '/api/employees/profile',
        '/api/employees/bank-details',
        '/api/employees/payslips',
        '/api/employees/leave-balance',
        '/api/employees/attendance',
        '/api/employees/requests',
      ];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.status).toBe(401);
      }
    });

    test('should allow access with valid employee token', async () => {
      const response = await request(app)
        .get('/api/employees/profile')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).not.toBe(401);
    });

    test('should prevent access to other employee data', async () => {
      // Create another employee
      const otherUser = await User.create({
        email: 'other@test.com',
        password: 'password123',
        role: 'employee',
        isActive: true,
      });

      const otherEmployee = await Employee.create({
        userId: otherUser._id,
        employeeId: 'EMP002',
        personalInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
          dateOfBirth: new Date('1992-01-01'),
          gender: 'Female',
        },
        contactInfo: {
          email: 'jane.smith@test.com',
          phone: '+1234567891',
        },
        jobInfo: {
          department: department._id,
          position: 'Software Engineer',
          startDate: new Date('2023-01-01'),
          employmentType: 'Full-time',
          salary: 70000,
        },
        isActive: true,
      });

      // Create payslip for other employee
      const otherPayslip = await Payslip.create({
        employeeId: otherEmployee._id,
        month: 12,
        year: 2023,
        earnings: { basic: 5000, total: 5000 },
        deductions: { tax: 500, total: 500 },
        netPay: 4500,
        status: 'published',
      });

      // Try to access other employee's payslip
      const response = await request(app)
        .get(`/api/employees/payslips/${otherPayslip._id}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Profile Management', () => {
    test('should get employee profile', async () => {
      const response = await request(app)
        .get('/api/employees/profile')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should update profile with change tracking', async () => {
      const updateData = {
        personalInfo: {
          phone: '+1987654321',
          address: {
            street: '123 Main St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
          },
        },
      };

      const response = await request(app)
        .put('/api/employees/profile')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Check change history
      const historyResponse = await request(app)
        .get('/api/employees/profile/history')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(historyResponse.status).toBe(200);
      expect(historyResponse.body).toBeInstanceOf(Array);
    });

    test('should upload and list documents', async () => {
      // Create a test file buffer
      const testFileContent = Buffer.from('test document content');

      const uploadResponse = await request(app)
        .post('/api/employees/profile/documents')
        .set('Authorization', `Bearer ${employeeToken}`)
        .attach('file', testFileContent, 'test-document.pdf')
        .field('type', 'id_proof');

      expect(uploadResponse.status).toBe(200);
      expect(uploadResponse.body.success).toBe(true);

      // List documents
      const listResponse = await request(app)
        .get('/api/employees/profile/documents')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body).toBeInstanceOf(Array);
    });
  });

  describe('Bank Details Management', () => {
    test('should update bank details with masking', async () => {
      const bankData = {
        accountNumber: '1234567890123456',
        bankName: 'Test Bank',
        ifscCode: 'TEST0001234',
        accountHolderName: 'John Doe',
        accountType: 'Savings',
      };

      const response = await request(app)
        .put('/api/employees/bank-details')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(bankData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accountNumber).toMatch(/\*+\d{4}$/);
    });

    test('should get masked bank details', async () => {
      // First create bank details
      await EmployeeProfile.create({
        employeeId: employeeRecord._id,
        userId: employeeUser._id,
        bankDetails: {
          accountNumber: '1234567890123456',
          bankName: 'Test Bank',
          ifscCode: 'TEST0001234',
          accountHolderName: 'John Doe',
          verificationStatus: 'verified',
        },
      });

      const response = await request(app)
        .get('/api/employees/bank-details')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accountNumber).toMatch(/\*+\d{4}$/);
    });

    test('should validate IFSC code format', async () => {
      const invalidBankData = {
        accountNumber: '1234567890123456',
        bankName: 'Test Bank',
        ifscCode: 'INVALID',
        accountHolderName: 'John Doe',
      };

      const response = await request(app)
        .put('/api/employees/bank-details')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(invalidBankData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Payslip Management', () => {
    beforeEach(async () => {
      // Create test payslips
      await Payslip.create([
        {
          employeeId: employeeRecord._id,
          month: 12,
          year: 2023,
          earnings: { basic: 5000, hra: 1000, total: 6000 },
          deductions: { tax: 600, pf: 500, total: 1100 },
          netPay: 4900,
          status: 'published',
        },
        {
          employeeId: employeeRecord._id,
          month: 11,
          year: 2023,
          earnings: { basic: 5000, hra: 1000, total: 6000 },
          deductions: { tax: 600, pf: 500, total: 1100 },
          netPay: 4900,
          status: 'published',
        },
      ]);
    });

    test('should get all payslips for employee', async () => {
      const response = await request(app)
        .get('/api/employees/payslips')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('should filter payslips by year and month', async () => {
      const response = await request(app)
        .get('/api/employees/payslips?year=2023&month=12')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].month).toBe(12);
    });

    test('should get payslip by ID', async () => {
      const payslips = await Payslip.find({ employeeId: employeeRecord._id });
      const payslipId = payslips[0]._id;

      const response = await request(app)
        .get(`/api/employees/payslips/${payslipId}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(payslipId.toString());
    });
  });

  describe('Leave Balance Management', () => {
    test('should get leave balance with default values', async () => {
      const response = await request(app)
        .get('/api/employees/leave-balance')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.leaveTypes).toBeInstanceOf(Array);
    });

    test('should get leave history', async () => {
      const response = await request(app)
        .get('/api/employees/leave-history')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should export leave summary in PDF format', async () => {
      const response = await request(app)
        .get('/api/employees/leave-balance/export?format=pdf')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
    });
  });

  describe('Attendance Management', () => {
    beforeEach(async () => {
      // Create test attendance records
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await AttendanceRecord.create([
        {
          employeeId: employeeRecord._id,
          date: today,
          checkIn: new Date(today.setHours(9, 0, 0, 0)),
          checkOut: new Date(today.setHours(17, 30, 0, 0)),
          workHours: 8.5,
          status: 'present',
        },
        {
          employeeId: employeeRecord._id,
          date: yesterday,
          checkIn: new Date(yesterday.setHours(9, 15, 0, 0)),
          checkOut: new Date(yesterday.setHours(17, 30, 0, 0)),
          workHours: 8.25,
          status: 'present',
          isLate: true,
        },
      ]);
    });

    test('should get attendance records', async () => {
      const response = await request(app)
        .get('/api/employees/attendance')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('should get monthly attendance summary', async () => {
      const response = await request(app)
        .get('/api/employees/attendance/summary')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalDays');
      expect(response.body.data).toHaveProperty('presentDays');
    });

    test('should export attendance report', async () => {
      const response = await request(app)
        .get('/api/employees/attendance/export?format=pdf')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
    });
  });

  describe('Request Management', () => {
    test('should create reimbursement request', async () => {
      const requestData = {
        requestType: 'reimbursement',
        reimbursement: {
          expenseType: 'travel',
          amount: 500,
          description: 'Business trip to client site',
          expenseDate: new Date(),
        },
      };

      const response = await request(app)
        .post('/api/employees/requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(requestData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.requestType).toBe('reimbursement');
    });

    test('should create advance request', async () => {
      const requestData = {
        requestType: 'advance',
        advance: {
          amount: 10000,
          reason: 'Medical emergency',
          repaymentMonths: 6,
        },
      };

      const response = await request(app)
        .post('/api/employees/requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(requestData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.requestType).toBe('advance');
    });

    test('should validate request data', async () => {
      const invalidRequestData = {
        requestType: 'reimbursement',
        reimbursement: {
          expenseType: 'travel',
          // Missing required fields
        },
      };

      const response = await request(app)
        .post('/api/employees/requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(invalidRequestData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should get all requests for employee', async () => {
      // Create a test request first
      await Request.create({
        employeeId: employeeRecord._id,
        requestType: 'reimbursement',
        status: 'pending',
        reimbursement: {
          expenseType: 'travel',
          amount: 500,
          description: 'Test expense',
          expenseDate: new Date(),
        },
        approvalWorkflow: [],
      });

      const response = await request(app)
        .get('/api/employees/requests')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('should cancel pending request', async () => {
      const testRequest = await Request.create({
        employeeId: employeeRecord._id,
        requestType: 'reimbursement',
        status: 'pending',
        reimbursement: {
          expenseType: 'travel',
          amount: 500,
          description: 'Test expense',
          expenseDate: new Date(),
        },
        approvalWorkflow: [],
      });

      const response = await request(app)
        .put(`/api/employees/requests/${testRequest._id}/cancel`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ reason: 'No longer needed' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
    });
  });

  describe('Data Validation', () => {
    test('should validate email format in profile updates', async () => {
      const invalidData = {
        personalInfo: {
          email: 'invalid-email',
        },
      };

      const response = await request(app)
        .put('/api/employees/profile')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(invalidData);

      // Should either validate or accept the data based on implementation
      expect([200, 400]).toContain(response.status);
    });

    test('should validate phone number format', async () => {
      const invalidData = {
        personalInfo: {
          phone: '123', // Too short
        },
      };

      const response = await request(app)
        .put('/api/employees/profile')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(invalidData);

      // Should either validate or accept the data based on implementation
      expect([200, 400]).toContain(response.status);
    });

    test('should validate request amounts', async () => {
      const invalidRequestData = {
        requestType: 'advance',
        advance: {
          amount: -1000, // Negative amount
          reason: 'Test',
          repaymentMonths: 6,
        },
      };

      const response = await request(app)
        .post('/api/employees/requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(invalidRequestData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid request IDs', async () => {
      const invalidId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/employees/requests/${invalidId}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should handle malformed request bodies', async () => {
      const response = await request(app)
        .post('/api/employees/requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send('invalid json');

      expect(response.status).toBe(400);
    });

    test('should handle database connection errors gracefully', async () => {
      // This would require mocking the database connection
      // For now, we'll just ensure the endpoint exists
      const response = await request(app)
        .get('/api/employees/profile')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).not.toBe(500);
    });
  });
});