const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { connectDB, checkConnection, closeConnection } = require('../src/config/database');

let mongoServer;

describe('Database Connection', () => {
  beforeAll(async () => {
    // Create an in-memory MongoDB instance for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
  });

  afterAll(async () => {
    await closeConnection();
    await mongoServer.stop();
  });

  describe('connectDB', () => {
    it('should connect to MongoDB successfully', async () => {
      await connectDB();
      const status = checkConnection();
      
      expect(status.isConnected).toBe(true);
      expect(status.state).toBe('connected');
    });

    it('should handle connection to database', () => {
      expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    });
  });

  describe('checkConnection', () => {
    it('should return connection status', () => {
      const status = checkConnection();
      
      expect(status).toHaveProperty('state');
      expect(status).toHaveProperty('isConnected');
      expect(typeof status.isConnected).toBe('boolean');
    });
  });

  describe('closeConnection', () => {
    it('should close the database connection', async () => {
      await closeConnection();
      const status = checkConnection();
      
      expect(status.isConnected).toBe(false);
      expect(status.state).toBe('disconnected');
    });
  });
});
