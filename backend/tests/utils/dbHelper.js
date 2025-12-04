/**
 * Database Helper for Tests
 * Provides utilities for managing test database
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

/**
 * Connect to in-memory MongoDB instance
 * @returns {Promise<void>}
 */
export const connectTestDB = async () => {
  try {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database
    await mongoose.connect(mongoUri);

    console.log('✅ Connected to test database');
  } catch (error) {
    console.error('❌ Error connecting to test database:', error);
    throw error;
  }
};

/**
 * Disconnect from test database and stop server
 * @returns {Promise<void>}
 */
export const disconnectTestDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('✅ Disconnected from test database');
  } catch (error) {
    console.error('❌ Error disconnecting from test database:', error);
    throw error;
  }
};

/**
 * Clear all collections in the test database
 * @returns {Promise<void>}
 */
export const clearTestDB = async () => {
  try {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }

    console.log('✅ Cleared test database');
  } catch (error) {
    console.error('❌ Error clearing test database:', error);
    throw error;
  }
};

/**
 * Seed test database with initial data
 * @param {Object} seedData - Data to seed
 * @returns {Promise<Object>} Seeded data
 */
export const seedTestDB = async (seedData = {}) => {
  try {
    const seeded = {};

    // Seed departments
    if (seedData.departments) {
      const Department = mongoose.model('Department');
      seeded.departments = await Department.insertMany(seedData.departments);
    }

    // Seed users
    if (seedData.users) {
      const User = mongoose.model('User');
      seeded.users = await User.insertMany(seedData.users);
    }

    // Seed employees
    if (seedData.employees) {
      const Employee = mongoose.model('Employee');
      seeded.employees = await Employee.insertMany(seedData.employees);
    }

    // Seed attendance records
    if (seedData.attendanceRecords) {
      const AttendanceRecord = mongoose.model('AttendanceRecord');
      seeded.attendanceRecords = await AttendanceRecord.insertMany(seedData.attendanceRecords);
    }

    // Seed leave requests
    if (seedData.leaveRequests) {
      const LeaveRequest = mongoose.model('LeaveRequest');
      seeded.leaveRequests = await LeaveRequest.insertMany(seedData.leaveRequests);
    }

    // Seed payslips
    if (seedData.payslips) {
      const Payslip = mongoose.model('Payslip');
      seeded.payslips = await Payslip.insertMany(seedData.payslips);
    }

    console.log('✅ Seeded test database');
    return seeded;
  } catch (error) {
    console.error('❌ Error seeding test database:', error);
    throw error;
  }
};

/**
 * Get database statistics
 * @returns {Promise<Object>} Database statistics
 */
export const getDBStats = async () => {
  const collections = mongoose.connection.collections;
  const stats = {};

  for (const key in collections) {
    const collection = collections[key];
    stats[key] = await collection.countDocuments();
  }

  return stats;
};

/**
 * Drop a specific collection
 * @param {string} collectionName - Name of collection to drop
 * @returns {Promise<void>}
 */
export const dropCollection = async (collectionName) => {
  try {
    const collection = mongoose.connection.collections[collectionName];
    if (collection) {
      await collection.drop();
      console.log(`✅ Dropped collection: ${collectionName}`);
    }
  } catch (error) {
    // Ignore error if collection doesn't exist
    if (error.message !== 'ns not found') {
      throw error;
    }
  }
};
