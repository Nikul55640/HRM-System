const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../src/models/User');

let mongoServer;

describe('User Model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  }, 30000);

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid user with required fields', async () => {
      const validUser = {
        email: 'admin@company.com',
        password: 'SecurePass123!',
        role: 'HR Administrator',
      };

      const user = new User(validUser);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe('admin@company.com');
      expect(savedUser.role).toBe('HR Administrator');
      expect(savedUser.isActive).toBe(true);
      expect(savedUser.password).not.toBe('SecurePass123!'); // Should be hashed
    });

    it('should fail validation when required fields are missing', async () => {
      const invalidUser = new User({
        email: 'test@company.com',
      });

      await expect(invalidUser.save()).rejects.toThrow();
    });

    it('should normalize email to lowercase', async () => {
      const user = new User({
        email: 'Test.User@COMPANY.COM',
        password: 'SecurePass123!',
        role: 'Employee',
      });

      const savedUser = await user.save();
      expect(savedUser.email).toBe('test.user@company.com');
    });

    it('should validate role enum values', async () => {
      const invalidUser = new User({
        email: 'test@company.com',
        password: 'SecurePass123!',
        role: 'InvalidRole',
      });

      await expect(invalidUser.save()).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const plainPassword = 'MySecurePassword123!';
      const user = new User({
        email: 'user@company.com',
        password: plainPassword,
        role: 'Employee',
      });

      await user.save();

      // Fetch user with password field
      const savedUser = await User.findById(user._id).select('+password');
      expect(savedUser.password).not.toBe(plainPassword);
      expect(savedUser.password).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash pattern
    });

    it('should not rehash password if not modified', async () => {
      const user = new User({
        email: 'user@company.com',
        password: 'SecurePass123!',
        role: 'Employee',
      });

      await user.save();
      const firstHash = (await User.findById(user._id).select('+password')).password;

      // Update non-password field
      user.isActive = false;
      await user.save();

      const secondHash = (await User.findById(user._id).select('+password')).password;
      expect(firstHash).toBe(secondHash);
    });
  });

  describe('Password Comparison', () => {
    it('should correctly compare valid password', async () => {
      const plainPassword = 'SecurePass123!';
      const user = new User({
        email: 'user@company.com',
        password: plainPassword,
        role: 'Employee',
      });

      await user.save();

      const savedUser = await User.findById(user._id).select('+password');
      const isMatch = await savedUser.comparePassword(plainPassword);
      expect(isMatch).toBe(true);
    });

    it('should reject invalid password', async () => {
      const user = new User({
        email: 'user@company.com',
        password: 'SecurePass123!',
        role: 'Employee',
      });

      await user.save();

      const savedUser = await User.findById(user._id).select('+password');
      const isMatch = await savedUser.comparePassword('WrongPassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('Token Generation', () => {
    it('should generate access token', async () => {
      const user = new User({
        email: 'user@company.com',
        password: 'SecurePass123!',
        role: 'HR Administrator',
      });

      await user.save();

      const token = user.generateAccessToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format
    });

    it('should generate refresh token', async () => {
      const user = new User({
        email: 'user@company.com',
        password: 'SecurePass123!',
        role: 'Employee',
      });

      await user.save();

      const token = user.generateRefreshToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate both tokens', async () => {
      const user = new User({
        email: 'user@company.com',
        password: 'SecurePass123!',
        role: 'SuperAdmin',
      });

      await user.save();

      const tokens = user.generateTokens();
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });
  });

  describe('Role-Based Validation', () => {
    it('should require assigned departments for HR Manager', async () => {
      const hrManager = new User({
        email: 'manager@company.com',
        password: 'SecurePass123!',
        role: 'HR Manager',
        assignedDepartments: [],
      });

      await expect(hrManager.save()).rejects.toThrow();
    });

    it('should allow HR Manager with assigned departments', async () => {
      const departmentId = new mongoose.Types.ObjectId();
      const hrManager = new User({
        email: 'manager@company.com',
        password: 'SecurePass123!',
        role: 'HR Manager',
        assignedDepartments: [departmentId],
      });

      const savedUser = await hrManager.save();
      expect(savedUser.assignedDepartments).toHaveLength(1);
      expect(savedUser.assignedDepartments[0].toString()).toBe(departmentId.toString());
    });

    it('should clear assigned departments for non-HR Manager roles', async () => {
      const departmentId = new mongoose.Types.ObjectId();
      const employee = new User({
        email: 'employee@company.com',
        password: 'SecurePass123!',
        role: 'Employee',
        assignedDepartments: [departmentId],
      });

      const savedUser = await employee.save();
      expect(savedUser.assignedDepartments).toHaveLength(0);
    });
  });

  describe('Instance Methods', () => {
    it('should check if user has specific role', async () => {
      const user = new User({
        email: 'admin@company.com',
        password: 'SecurePass123!',
        role: 'SuperAdmin',
      });

      await user.save();

      expect(user.hasRole('SuperAdmin')).toBe(true);
      expect(user.hasRole('Employee')).toBe(false);
      expect(user.hasRole(['SuperAdmin', 'HR Administrator'])).toBe(true);
    });

    it('should check department access for SuperAdmin', async () => {
      const user = new User({
        email: 'admin@company.com',
        password: 'SecurePass123!',
        role: 'SuperAdmin',
      });

      await user.save();

      const departmentId = new mongoose.Types.ObjectId();
      expect(user.canAccessDepartment(departmentId)).toBe(true);
    });

    it('should check department access for HR Manager', async () => {
      const dept1 = new mongoose.Types.ObjectId();
      const dept2 = new mongoose.Types.ObjectId();

      const user = new User({
        email: 'manager@company.com',
        password: 'SecurePass123!',
        role: 'HR Manager',
        assignedDepartments: [dept1],
      });

      await user.save();

      expect(user.canAccessDepartment(dept1)).toBe(true);
      expect(user.canAccessDepartment(dept2)).toBe(false);
    });
  });

  describe('Indexes', () => {
    it('should have unique index on email', async () => {
      const user1 = new User({
        email: 'duplicate@company.com',
        password: 'SecurePass123!',
        role: 'Employee',
      });

      await user1.save();

      const user2 = new User({
        email: 'duplicate@company.com',
        password: 'AnotherPass456!',
        role: 'HR Administrator',
      });

      await expect(user2.save()).rejects.toThrow();
    });
  });
});
