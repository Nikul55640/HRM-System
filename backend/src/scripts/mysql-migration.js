import { sequelize } from '../models/sequelize/index.js';
import User from '../models/sequelize/User.js';
import Employee from '../models/sequelize/Employee.js';
import Department from '../models/sequelize/Department.js';
import EmployeeProfile from '../models/sequelize/EmployeeProfile.js';
import AttendanceRecord from '../models/sequelize/AttendanceRecord.js';
import LeaveRequest from '../models/sequelize/LeaveRequest.js';
import LeaveBalance from '../models/sequelize/LeaveBalance.js';
import Config from '../models/sequelize/Config.js';
import logger from '../utils/logger.js';

const runMigration = async () => {
  try {
    logger.info('🔄 Starting MySQL migration...');
    
    // Test connection
    await sequelize.authenticate();
    logger.info('✅ Database connection established');
    
    // Drop all tables if they exist (for clean migration)
    await sequelize.drop({ cascade: true });
    logger.info('🗑️ Dropped existing tables');
    
    // Create tables in the correct order to avoid foreign key issues
    logger.info('📋 Creating tables...');
    
    // 1. Create User table first (no dependencies)
    await User.sync({ force: true });
    logger.info('✅ Users table created');
    
    // 2. Create Department table (no dependencies)
    await Department.sync({ force: true });
    logger.info('✅ Departments table created');
    
    // 3. Create Employee table (depends on User and Department)
    await Employee.sync({ force: true });
    logger.info('✅ Employees table created');
    
    // 4. Create remaining tables
    await EmployeeProfile.sync({ force: true });
    logger.info('✅ Employee Profiles table created');
    
    await AttendanceRecord.sync({ force: true });
    logger.info('✅ Attendance Records table created');
    
    await LeaveRequest.sync({ force: true });
    logger.info('✅ Leave Requests table created');
    
    await LeaveBalance.sync({ force: true });
    logger.info('✅ Leave Balances table created');
    
    await Config.sync({ force: true });
    logger.info('✅ Config table created');
    
    // Now add foreign key constraints manually if needed
    logger.info('🔗 Adding foreign key constraints...');
    
    // Add foreign key constraints using raw SQL
    await sequelize.query(`
      ALTER TABLE employees 
      ADD CONSTRAINT fk_employee_user 
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;
    `);
    
    await sequelize.query(`
      ALTER TABLE employees 
      ADD CONSTRAINT fk_employee_department 
      FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE RESTRICT;
    `);
    
    await sequelize.query(`
      ALTER TABLE employees 
      ADD CONSTRAINT fk_employee_manager 
      FOREIGN KEY (managerId) REFERENCES employees(id) ON DELETE SET NULL;
    `);
    
    await sequelize.query(`
      ALTER TABLE users 
      ADD CONSTRAINT fk_user_employee 
      FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE SET NULL;
    `);
    
    logger.info('✅ Foreign key constraints added');
    
    // Create default data
    logger.info('📝 Creating default data...');
    
    // Create default department
    const defaultDept = await Department.create({
      name: 'Administration',
      description: 'Default administration department',
      isActive: true,
    });
    logger.info('✅ Default department created');
    
    // Create default admin user (without employee reference first)
    const adminUser = await User.create({
      email: 'admin@hrms.com',
      password: 'admin123', // Will be hashed by the hook
      role: 'SuperAdmin',
      isActive: true,
    });
    logger.info('✅ Default admin user created');
    
    // Create admin employee record
    const adminEmployee = await Employee.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@hrms.com',
      jobTitle: 'System Administrator',
      departmentId: defaultDept.id,
      hireDate: new Date(),
      employmentType: 'Full-time',
      userId: adminUser.id,
      status: 'Active',
    });
    logger.info('✅ Admin employee created');
    
    // Update user with employee reference
    await adminUser.update({ employeeId: adminEmployee.id });
    logger.info('✅ User-Employee relationship established');
    
    // Create employee profile
    await EmployeeProfile.create({
      employeeId: adminEmployee.id,
      userId: adminUser.id,
      personalInfo: {},
      bankDetails: {},
      documents: [],
      changeHistory: [],
    });
    logger.info('✅ Admin employee profile created');
    
    // Create some sample leave balances
    const leaveTypes = ['Annual', 'Sick', 'Personal', 'Maternity/Paternity'];
    for (const leaveType of leaveTypes) {
      await LeaveBalance.create({
        employeeId: adminEmployee.id,
        leaveType,
        totalDays: leaveType === 'Annual' ? 25 : leaveType === 'Sick' ? 10 : 5,
        usedDays: 0,
        remainingDays: leaveType === 'Annual' ? 25 : leaveType === 'Sick' ? 10 : 5,
        year: new Date().getFullYear(),
      });
    }
    logger.info('✅ Default leave balances created');
    
    // Create default config
    await Config.create({
      key: 'company_name',
      value: 'HRM System',
      description: 'Company name for the system',
      category: 'general',
      dataType: 'string',
      updatedBy: adminUser.id,
    });
    
    await Config.create({
      key: 'working_hours_per_day',
      value: '8',
      description: 'Standard working hours per day',
      category: 'attendance',
      dataType: 'number',
      updatedBy: adminUser.id,
    });
    
    logger.info('✅ Default configuration created');
    
    logger.info('🎉 Migration completed successfully!');
    logger.info('');
    logger.info('📧 Admin Email: admin@hrms.com');
    logger.info('🔑 Admin Password: admin123');
    logger.info('');
    logger.info('🚀 You can now start the backend server!');
    
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    logger.error('Stack trace:', error.stack);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default runMigration;