import { sequelize } from '../models/sequelize/index.js';
import User from '../models/sequelize/User.js';
import Employee from '../models/sequelize/Employee.js';
import Department from '../models/sequelize/Department.js';
import EmployeeProfile from '../models/sequelize/EmployeeProfile.js';
import AttendanceRecord from '../models/sequelize/AttendanceRecord.js';
import LeaveRequest from '../models/sequelize/LeaveRequest.js';
import LeaveBalance from '../models/sequelize/LeaveBalance.js';
import Config from '../models/sequelize/Config.js';
import AuditLog from '../models/sequelize/AuditLog.js';
import Notification from '../models/sequelize/Notification.js';
import Document from '../models/sequelize/Document.js';
import CompanyEvent from '../models/sequelize/CompanyEvent.js';
import Payslip from '../models/sequelize/Payslip.js';
import Request from '../models/sequelize/Request.js';
import SalaryStructure from '../models/sequelize/SalaryStructure.js';

const runMigration = async () => {
  try {
    console.log('🔄 Starting MySQL migration...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync all models (creates tables without foreign key constraints)
    await sequelize.sync({ force: true });
    console.log('✅ All tables created successfully');
    
    // Create default data
    console.log('📝 Creating default data...');
    
    // Create default department
    const defaultDept = await Department.create({
      name: 'Administration',
      description: 'Default administration department',
      isActive: true,
    });
    console.log('✅ Default department created');
    
    // Create default admin user
    const adminUser = await User.create({
      email: 'admin@hrms.com',
      password: 'admin123', // Will be hashed by the hook
      role: 'SuperAdmin',
      isActive: true,
    });
    console.log('✅ Default admin user created');
    
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
    console.log('✅ Admin employee created');
    
    // Update user with employee reference
    await adminUser.update({ employeeId: adminEmployee.id });
    console.log('✅ User-Employee relationship established');
    
    // Create employee profile
    await EmployeeProfile.create({
      employeeId: adminEmployee.id,
      userId: adminUser.id,
      personalInfo: {},
      bankDetails: {},
      documents: [],
      changeHistory: [],
    });
    console.log('✅ Admin employee profile created');
    
    // Create some sample leave balances
    const leaveTypes = [
      { type: 'annual', allocated: 25, used: 0, pending: 0, available: 25 },
      { type: 'sick', allocated: 10, used: 0, pending: 0, available: 10 },
      { type: 'personal', allocated: 5, used: 0, pending: 0, available: 5 },
    ];
    
    await LeaveBalance.create({
      employeeId: adminEmployee.id,
      year: new Date().getFullYear(),
      leaveTypes,
    });
    console.log('✅ Default leave balances created');
    
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
    
    console.log('✅ Default configuration created');
    
    console.log('🎉 Migration completed successfully!');
    console.log('');
    console.log('📧 Admin Email: admin@hrms.com');
    console.log('🔑 Admin Password: admin123');
    console.log('');
    console.log('🚀 You can now start the backend server!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    await sequelize.close();
  }
};

runMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));