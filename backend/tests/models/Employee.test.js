const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Employee = require('../../src/models/Employee');

let mongoServer;

describe('Employee Model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }, 30000); // 30 second timeout for MongoDB Memory Server startup

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  }, 30000);

  afterEach(async () => {
    await Employee.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid employee with required fields', async () => {
      const validEmployee = {
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
        },
        contactInfo: {
          email: 'john.doe@company.com',
        },
        jobInfo: {
          jobTitle: 'Software Engineer',
          department: new mongoose.Types.ObjectId(),
          hireDate: new Date('2024-01-01'),
          employmentType: 'Full-time',
        },
      };

      const employee = new Employee(validEmployee);
      const savedEmployee = await employee.save();

      expect(savedEmployee._id).toBeDefined();
      expect(savedEmployee.employeeId).toMatch(/^EMP-\d{8}-\d{4}$/);
      expect(savedEmployee.personalInfo.firstName).toBe('John');
      expect(savedEmployee.contactInfo.email).toBe('john.doe@company.com');
      expect(savedEmployee.status).toBe('Active');
    });

    it('should fail validation when required fields are missing', async () => {
      const invalidEmployee = new Employee({
        personalInfo: {
          firstName: 'John',
        },
      });

      await expect(invalidEmployee.save()).rejects.toThrow();
    });

    it('should normalize email to lowercase', async () => {
      const employee = new Employee({
        personalInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
        },
        contactInfo: {
          email: 'Jane.Smith@COMPANY.COM',
        },
        jobInfo: {
          jobTitle: 'Manager',
          department: new mongoose.Types.ObjectId(),
          hireDate: new Date('2024-01-01'),
          employmentType: 'Full-time',
        },
      });

      const savedEmployee = await employee.save();
      expect(savedEmployee.contactInfo.email).toBe('jane.smith@company.com');
    });
  });

  describe('Indexes', () => {
    it('should have unique index on email', async () => {
      const departmentId = new mongoose.Types.ObjectId();
      
      const employee1 = new Employee({
        personalInfo: { firstName: 'John', lastName: 'Doe' },
        contactInfo: { email: 'duplicate@company.com' },
        jobInfo: {
          jobTitle: 'Engineer',
          department: departmentId,
          hireDate: new Date(),
          employmentType: 'Full-time',
        },
      });

      await employee1.save();

      const employee2 = new Employee({
        personalInfo: { firstName: 'Jane', lastName: 'Smith' },
        contactInfo: { email: 'duplicate@company.com' },
        jobInfo: {
          jobTitle: 'Manager',
          department: departmentId,
          hireDate: new Date(),
          employmentType: 'Full-time',
        },
      });

      await expect(employee2.save()).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    it('should return correct full name via virtual', async () => {
      const employee = new Employee({
        personalInfo: { firstName: 'John', lastName: 'Doe' },
        contactInfo: { email: 'john@company.com' },
        jobInfo: {
          jobTitle: 'Engineer',
          department: new mongoose.Types.ObjectId(),
          hireDate: new Date(),
          employmentType: 'Full-time',
        },
      });

      expect(employee.fullName).toBe('John Doe');
    });

    it('should check if employee is active', async () => {
      const employee = new Employee({
        personalInfo: { firstName: 'John', lastName: 'Doe' },
        contactInfo: { email: 'john@company.com' },
        jobInfo: {
          jobTitle: 'Engineer',
          department: new mongoose.Types.ObjectId(),
          hireDate: new Date(),
          employmentType: 'Full-time',
        },
        status: 'Active',
      });

      expect(employee.isActive()).toBe(true);

      employee.status = 'Terminated';
      expect(employee.isActive()).toBe(false);
    });
  });
});
