import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Import models
import User from '../backend/src/models/User.js';
import Employee from '../backend/src/models/Employee.js';
import Department from '../backend/src/models/Department.js';
import LeaveBalance from '../backend/src/models/LeaveBalance.js';
import Payslip from '../backend/src/models/Payslip.js';
import AttendanceRecord from '../backend/src/models/AttendanceRecord.js';
import Notification from '../backend/src/models/Notification.js';
import Document from '../backend/src/models/Document.js';
import Request from '../backend/src/models/Request.js';
import Config from '../backend/src/models/Config.js';

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

// Hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Import seed data
const importData = async () => {
  try {
    // Read seed data file
    const seedDataPath = path.join(__dirname, '../backend/seeds/hrm_seed_data.json');
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

    console.log('📦 Starting data import...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Department.deleteMany({}),
      User.deleteMany({}),
      Employee.deleteMany({}),
      LeaveBalance.deleteMany({}),
      Payslip.deleteMany({}),
      AttendanceRecord.deleteMany({}),
      Notification.deleteMany({}),
      Document.deleteMany({}),
      Request.deleteMany({}),
      Config.deleteMany({})
    ]);
    console.log('✅ Existing data cleared\n');

    // Import Departments
    if (seedData.departments && seedData.departments.length > 0) {
      console.log(`📁 Importing ${seedData.departments.length} departments...`);
      await Department.insertMany(seedData.departments);
      console.log('✅ Departments imported\n');
    }

    // Import Users with hashed passwords
    if (seedData.users && seedData.users.length > 0) {
      console.log(`👤 Importing ${seedData.users.length} users...`);
      const usersWithHashedPasswords = await Promise.all(
        seedData.users.map(async (user) => ({
          ...user,
          password: await hashPassword('password123'),
        }))
      );
      await User.insertMany(usersWithHashedPasswords);
      console.log('✅ Users imported (default password: password123)\n');
    }

    // Import Employees
    if (seedData.employees && seedData.employees.length > 0) {
      console.log(`👥 Importing ${seedData.employees.length} employees...`);
      await Employee.insertMany(seedData.employees);
      console.log('✅ Employees imported\n');
    }

    // Import Leave Balances
    if (seedData.leaveBalances && seedData.leaveBalances.length > 0) {
      console.log(`📅 Importing ${seedData.leaveBalances.length} leave balances...`);
      await LeaveBalance.insertMany(seedData.leaveBalances);
      console.log('✅ Leave balances imported\n');
    }

    // Import Payslips
    if (seedData.payslips && seedData.payslips.length > 0) {
      console.log(`💰 Importing ${seedData.payslips.length} payslips...`);
      await Payslip.insertMany(seedData.payslips);
      console.log('✅ Payslips imported\n');
    }

    // Import Attendance Records
    if (seedData.attendanceRecords && seedData.attendanceRecords.length > 0) {
      console.log(`⏰ Importing ${seedData.attendanceRecords.length} attendance records...`);
      await AttendanceRecord.insertMany(seedData.attendanceRecords);
      console.log('✅ Attendance records imported\n');
    }

    // Import Notifications
    if (seedData.notifications && seedData.notifications.length > 0) {
      console.log(`🔔 Importing ${seedData.notifications.length} notifications...`);
      await Notification.insertMany(seedData.notifications);
      console.log('✅ Notifications imported\n');
    }

    // Import Documents
    if (seedData.documents && seedData.documents.length > 0) {
      console.log(`📄 Importing ${seedData.documents.length} documents...`);
      await Document.insertMany(seedData.documents);
      console.log('✅ Documents imported\n');
    }

    // Import Requests
    if (seedData.requests && seedData.requests.length > 0) {
      console.log(`📝 Importing ${seedData.requests.length} requests...`);
      await Request.insertMany(seedData.requests);
      console.log('✅ Requests imported\n');
    }

    // Import Config
    if (seedData.config && seedData.config.length > 0) {
      console.log(`⚙️  Importing ${seedData.config.length} config items...`);
      await Config.insertMany(seedData.config);
      console.log('✅ Config imported\n');
    }

    console.log('🎉 All data imported successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Departments: ${seedData.departments?.length || 0}`);
    console.log(`   Users: ${seedData.users?.length || 0}`);
    console.log(`   Employees: ${seedData.employees?.length || 0}`);
    console.log(`   Leave Balances: ${seedData.leaveBalances?.length || 0}`);
    console.log(`   Payslips: ${seedData.payslips?.length || 0}`);
    console.log(`   Attendance Records: ${seedData.attendanceRecords?.length || 0}`);
    console.log(`   Notifications: ${seedData.notifications?.length || 0}`);
    console.log(`   Documents: ${seedData.documents?.length || 0}`);
    console.log(`   Requests: ${seedData.requests?.length || 0}`);
    console.log(`   Config Items: ${seedData.config?.length || 0}`);
    console.log('\n🔑 Login Credentials:');
    console.log('   SuperAdmin: admin@hrmsystem.com / password123');
    console.log('   HR Admin: hr.admin@hrmsystem.com / password123');
    console.log('   HR Manager: hr.manager.eng@hrmsystem.com / password123');

  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
};

// Delete all data
const deleteData = async () => {
  try {
    console.log('🗑️  Deleting all data...');
    await Promise.all([
      Department.deleteMany({}),
      User.deleteMany({}),
      Employee.deleteMany({}),
      LeaveBalance.deleteMany({}),
      Payslip.deleteMany({}),
      AttendanceRecord.deleteMany({}),
      Notification.deleteMany({}),
      Document.deleteMany({}),
      Request.deleteMany({}),
      Config.deleteMany({})
    ]);
    console.log('✅ All data deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting data:', error);
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  await connectDB();

  const args = process.argv.slice(2);
  const command = args[0];

  if (command === '--delete' || command === '-d') {
    await deleteData();
  } else if (command === '--import' || command === '-i' || !command) {
    await importData();
  } else {
    console.log('Usage:');
    console.log('  node scripts/seed.js          # Import seed data');
    console.log('  node scripts/seed.js --import # Import seed data');
    console.log('  node scripts/seed.js --delete # Delete all data');
  }

  await mongoose.connection.close();
  console.log('\n👋 Database connection closed');
  process.exit(0);
};

// Run the script
main();
