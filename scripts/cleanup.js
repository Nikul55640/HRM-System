import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Import models
import User from '../backend/src/models/User.js';
import Employee from '../backend/src/models/Employee.js';
import Department from '../backend/src/models/Department.js';
import LeaveBalance from '../backend/src/models/LeaveBalance.js';
import LeaveRequest from '../backend/src/models/LeaveRequest.js';
import Payslip from '../backend/src/models/Payslip.js';
import AttendanceRecord from '../backend/src/models/AttendanceRecord.js';
import Notification from '../backend/src/models/Notification.js';
import Document from '../backend/src/models/Document.js';
import Request from '../backend/src/models/Request.js';
import Config from '../backend/src/models/Config.js';
import AuditLog from '../backend/src/models/AuditLog.js';
import CompanyEvent from '../backend/src/models/CompanyEvent.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Cleanup old notifications
const cleanupOldNotifications = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true
    });

    console.log(`✅ Deleted ${result.deletedCount} old read notifications (older than ${daysOld} days)`);
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Error cleaning up notifications:', error);
    throw error;
  }
};

// Cleanup old audit logs
const cleanupOldAuditLogs = async (daysOld = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await AuditLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    console.log(`✅ Deleted ${result.deletedCount} old audit logs (older than ${daysOld} days)`);
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Error cleaning up audit logs:', error);
    throw error;
  }
};

// Cleanup orphaned records
const cleanupOrphanedRecords = async () => {
  try {
    let totalCleaned = 0;

    // Find all valid employee IDs
    const validEmployeeIds = await Employee.find({}, '_id').lean();
    const validIds = validEmployeeIds.map(e => e._id.toString());

    // Cleanup orphaned leave balances
    const orphanedLeaveBalances = await LeaveBalance.deleteMany({
      employeeId: { $nin: validIds }
    });
    console.log(`✅ Deleted ${orphanedLeaveBalances.deletedCount} orphaned leave balances`);
    totalCleaned += orphanedLeaveBalances.deletedCount;

    // Cleanup orphaned leave requests
    const orphanedLeaveRequests = await LeaveRequest.deleteMany({
      employeeId: { $nin: validIds }
    });
    console.log(`✅ Deleted ${orphanedLeaveRequests.deletedCount} orphaned leave requests`);
    totalCleaned += orphanedLeaveRequests.deletedCount;

    // Cleanup orphaned attendance records
    const orphanedAttendance = await AttendanceRecord.deleteMany({
      employeeId: { $nin: validIds }
    });
    console.log(`✅ Deleted ${orphanedAttendance.deletedCount} orphaned attendance records`);
    totalCleaned += orphanedAttendance.deletedCount;

    // Cleanup orphaned payslips
    const orphanedPayslips = await Payslip.deleteMany({
      employeeId: { $nin: validIds }
    });
    console.log(`✅ Deleted ${orphanedPayslips.deletedCount} orphaned payslips`);
    totalCleaned += orphanedPayslips.deletedCount;

    // Cleanup orphaned notifications
    const orphanedNotifications = await Notification.deleteMany({
      userId: { $nin: validIds }
    });
    console.log(`✅ Deleted ${orphanedNotifications.deletedCount} orphaned notifications`);
    totalCleaned += orphanedNotifications.deletedCount;

    return totalCleaned;
  } catch (error) {
    console.error('❌ Error cleaning up orphaned records:', error);
    throw error;
  }
};

// Cleanup old company events
const cleanupOldEvents = async (daysOld = 365) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await CompanyEvent.deleteMany({
      date: { $lt: cutoffDate }
    });

    console.log(`✅ Deleted ${result.deletedCount} old company events (older than ${daysOld} days)`);
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Error cleaning up company events:', error);
    throw error;
  }
};

// Full cleanup
const fullCleanup = async () => {
  console.log('🧹 Starting full database cleanup...\n');

  const notificationsDeleted = await cleanupOldNotifications(30);
  const auditLogsDeleted = await cleanupOldAuditLogs(90);
  const orphanedDeleted = await cleanupOrphanedRecords();
  const eventsDeleted = await cleanupOldEvents(365);

  console.log('\n📊 Cleanup Summary:');
  console.log(`   Old Notifications: ${notificationsDeleted}`);
  console.log(`   Old Audit Logs: ${auditLogsDeleted}`);
  console.log(`   Orphaned Records: ${orphanedDeleted}`);
  console.log(`   Old Events: ${eventsDeleted}`);
  console.log(`   Total Cleaned: ${notificationsDeleted + auditLogsDeleted + orphanedDeleted + eventsDeleted}`);
};

// Main execution
const main = async () => {
  await connectDB();

  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case '--notifications':
      case '-n':
        await cleanupOldNotifications(30);
        break;
      case '--audit':
      case '-a':
        await cleanupOldAuditLogs(90);
        break;
      case '--orphaned':
      case '-o':
        await cleanupOrphanedRecords();
        break;
      case '--events':
      case '-e':
        await cleanupOldEvents(365);
        break;
      case '--full':
      case '-f':
      default:
        await fullCleanup();
        break;
    }

    console.log('\n✅ Cleanup completed successfully!');
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  }

  await mongoose.connection.close();
  console.log('👋 Database connection closed');
  process.exit(0);
};

// Run the script
main();
