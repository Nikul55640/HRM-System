const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const AuditLog = require('../../src/models/AuditLog');
const User = require('../../src/models/User');

let mongoServer;

describe('AuditLog Model', () => {
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
    await AuditLog.deleteMany({});
    await User.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid audit log with required fields', async () => {
      const userId = new mongoose.Types.ObjectId();
      const entityId = new mongoose.Types.ObjectId();

      const validLog = {
        action: 'CREATE',
        entityType: 'Employee',
        entityId,
        userId,
        userRole: 'HR Administrator',
      };

      const log = new AuditLog(validLog);
      const savedLog = await log.save();

      expect(savedLog._id).toBeDefined();
      expect(savedLog.action).toBe('CREATE');
      expect(savedLog.entityType).toBe('Employee');
      expect(savedLog.entityId.toString()).toBe(entityId.toString());
      expect(savedLog.userId.toString()).toBe(userId.toString());
      expect(savedLog.timestamp).toBeDefined();
    });

    it('should fail validation when required fields are missing', async () => {
      const invalidLog = new AuditLog({
        action: 'CREATE',
        entityType: 'Employee',
      });

      await expect(invalidLog.save()).rejects.toThrow();
    });

    it('should validate action enum values', async () => {
      const userId = new mongoose.Types.ObjectId();
      const entityId = new mongoose.Types.ObjectId();

      const invalidLog = new AuditLog({
        action: 'INVALID_ACTION',
        entityType: 'Employee',
        entityId,
        userId,
      });

      await expect(invalidLog.save()).rejects.toThrow();
    });

    it('should validate entityType enum values', async () => {
      const userId = new mongoose.Types.ObjectId();
      const entityId = new mongoose.Types.ObjectId();

      const invalidLog = new AuditLog({
        action: 'CREATE',
        entityType: 'InvalidEntity',
        entityId,
        userId,
      });

      await expect(invalidLog.save()).rejects.toThrow();
    });

    it('should accept all valid action types', async () => {
      const userId = new mongoose.Types.ObjectId();
      const entityId = new mongoose.Types.ObjectId();
      const actions = ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT'];

      const promises = actions.map((action) =>
        AuditLog.create({
          action,
          entityType: 'Employee',
          entityId,
          userId,
        })
      );

      const logs = await Promise.all(promises);
      expect(logs).toHaveLength(6);
    });

    it('should accept all valid entity types', async () => {
      const userId = new mongoose.Types.ObjectId();
      const entityId = new mongoose.Types.ObjectId();
      const entityTypes = ['Employee', 'User', 'Document', 'Department'];

      const promises = entityTypes.map((entityType) =>
        AuditLog.create({
          action: 'CREATE',
          entityType,
          entityId,
          userId,
        })
      );

      const logs = await Promise.all(promises);
      expect(logs).toHaveLength(4);
    });
  });

  describe('Changes Tracking', () => {
    it('should store field changes', async () => {
      const userId = new mongoose.Types.ObjectId();
      const entityId = new mongoose.Types.ObjectId();

      const log = await AuditLog.create({
        action: 'UPDATE',
        entityType: 'Employee',
        entityId,
        userId,
        changes: [
          {
            field: 'email',
            oldValue: 'old@company.com',
            newValue: 'new@company.com',
          },
          {
            field: 'jobTitle',
            oldValue: 'Developer',
            newValue: 'Senior Developer',
          },
        ],
      });

      expect(log.changes).toHaveLength(2);
      expect(log.changes[0].field).toBe('email');
      expect(log.changes[0].oldValue).toBe('old@company.com');
      expect(log.changes[0].newValue).toBe('new@company.com');
    });

    it('should handle complex data types in changes', async () => {
      const userId = new mongoose.Types.ObjectId();
      const entityId = new mongoose.Types.ObjectId();

      const log = await AuditLog.create({
        action: 'UPDATE',
        entityType: 'Employee',
        entityId,
        userId,
        changes: [
          {
            field: 'address',
            oldValue: { city: 'New York', state: 'NY' },
            newValue: { city: 'Boston', state: 'MA' },
          },
        ],
      });

      expect(log.changes[0].oldValue).toEqual({ city: 'New York', state: 'NY' });
      expect(log.changes[0].newValue).toEqual({ city: 'Boston', state: 'MA' });
    });
  });

  describe('Static Methods', () => {
    it('should log an action using logAction method', async () => {
      const userId = new mongoose.Types.ObjectId();
      const entityId = new mongoose.Types.ObjectId();

      const log = await AuditLog.logAction({
        action: 'CREATE',
        entityType: 'Employee',
        entityId,
        userId,
        userRole: 'HR Administrator',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(log._id).toBeDefined();
      expect(log.action).toBe('CREATE');
      expect(log.ipAddress).toBe('192.168.1.1');
      expect(log.userAgent).toBe('Mozilla/5.0');
    });

    it('should get entity logs', async () => {
      const userId = new mongoose.Types.ObjectId();
      const entityId = new mongoose.Types.ObjectId();

      await AuditLog.create({
        action: 'CREATE',
        entityType: 'Employee',
        entityId,
        userId,
      });

      await AuditLog.create({
        action: 'UPDATE',
        entityType: 'Employee',
        entityId,
        userId,
      });

      const logs = await AuditLog.getEntityLogs('Employee', entityId);
      expect(logs).toHaveLength(2);
      expect(logs[0].action).toBe('UPDATE'); // Most recent first
      expect(logs[1].action).toBe('CREATE');
    });

    it('should filter entity logs by action', async () => {
      const userId = new mongoose.Types.ObjectId();
      const entityId = new mongoose.Types.ObjectId();

      await AuditLog.create({
        action: 'CREATE',
        entityType: 'Employee',
        entityId,
        userId,
      });

      await AuditLog.create({
        action: 'UPDATE',
        entityType: 'Employee',
        entityId,
        userId,
      });

      const logs = await AuditLog.getEntityLogs('Employee', entityId, { action: 'UPDATE' });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('UPDATE');
    });

    it('should get user logs', async () => {
      const userId = new mongoose.Types.ObjectId();
      const entityId1 = new mongoose.Types.ObjectId();
      const entityId2 = new mongoose.Types.ObjectId();

      await AuditLog.create({
        action: 'CREATE',
        entityType: 'Employee',
        entityId: entityId1,
        userId,
      });

      await AuditLog.create({
        action: 'UPDATE',
        entityType: 'Document',
        entityId: entityId2,
        userId,
      });

      const logs = await AuditLog.getUserLogs(userId);
      expect(logs).toHaveLength(2);
    });

    it('should get recent logs', async () => {
      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();
      const entityId = new mongoose.Types.ObjectId();

      await AuditLog.create({
        action: 'CREATE',
        entityType: 'Employee',
        entityId,
        userId: userId1,
      });

      await AuditLog.create({
        action: 'UPDATE',
        entityType: 'Employee',
        entityId,
        userId: userId2,
      });

      const logs = await AuditLog.getRecentLogs({ limit: 10 });
      expect(logs).toHaveLength(2);
    });

    it('should get logs by date range', async () => {
      const userId = new mongoose.Types.ObjectId();
      const entityId = new mongoose.Types.ObjectId();

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await AuditLog.create({
        action: 'CREATE',
        entityType: 'Employee',
        entityId,
        userId,
        timestamp: new Date(),
      });

      const logs = await AuditLog.getLogsByDateRange(yesterday, tomorrow);
      expect(logs).toHaveLength(1);
    });

    it('should count logs', async () => {
      const userId = new mongoose.Types.ObjectId();
      const entityId = new mongoose.Types.ObjectId();

      await AuditLog.create({
        action: 'CREATE',
        entityType: 'Employee',
        entityId,
        userId,
      });

      await AuditLog.create({
        action: 'UPDATE',
        entityType: 'Employee',
        entityId,
        userId,
      });

      const count = await AuditLog.countLogs({ action: 'CREATE' });
      expect(count).toBe(1);
    });
  });

  describe('Instance Methods', () => {
    it('should format log for display', async () => {
      const userId = new mongoose.Types.ObjectId();
      const entityId = new mongoose.Types.ObjectId();

      const log = await AuditLog.create({
        action: 'UPDATE',
        entityType: 'Employee',
        entityId,
        userId,
        userRole: 'HR Administrator',
        ipAddress: '192.168.1.1',
        changes: [
          {
            field: 'email',
            oldValue: 'old@company.com',
            newValue: 'new@company.com',
          },
        ],
      });

      const formatted = log.formatForDisplay();
      expect(formatted.id).toBeDefined();
      expect(formatted.action).toBe('UPDATE');
      expect(formatted.entityType).toBe('Employee');
      expect(formatted.changes).toHaveLength(1);
      expect(formatted.ipAddress).toBe('192.168.1.1');
    });
  });

  describe('Indexes', () => {
    it('should have indexes on key fields', async () => {
      const indexes = AuditLog.schema.indexes();
      const indexFields = indexes.map((index) => Object.keys(index[0]));

      expect(indexFields).toContainEqual(['action']);
      expect(indexFields).toContainEqual(['entityType']);
      expect(indexFields).toContainEqual(['entityId']);
      expect(indexFields).toContainEqual(['userId']);
      expect(indexFields).toContainEqual(['timestamp']);
    });

    it('should have TTL index on timestamp', async () => {
      const indexes = AuditLog.schema.indexes();
      const ttlIndex = indexes.find(
        (index) => index[0].timestamp === 1 && index[1].expireAfterSeconds
      );

      expect(ttlIndex).toBeDefined();
      expect(ttlIndex[1].expireAfterSeconds).toBe(220838400); // 7 years in seconds
    });
  });

  describe('Pagination', () => {
    it('should paginate entity logs', async () => {
      const userId = new mongoose.Types.ObjectId();
      const entityId = new mongoose.Types.ObjectId();

      // Create 5 logs
      const promises = Array.from({ length: 5 }, (_, i) =>
        AuditLog.create({
          action: 'UPDATE',
          entityType: 'Employee',
          entityId,
          userId,
        })
      );

      await Promise.all(promises);

      const page1 = await AuditLog.getEntityLogs('Employee', entityId, { limit: 2, skip: 0 });
      const page2 = await AuditLog.getEntityLogs('Employee', entityId, { limit: 2, skip: 2 });

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
      expect(page1[0]._id.toString()).not.toBe(page2[0]._id.toString());
    });
  });
});
