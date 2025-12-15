import sequelize from './src/config/sequelize.js';
import {
  User,
  Department,
  Employee,
  LeaveBalance,
  Config
} from './src/models/sequelize/index.js';

const createFreshData = async () => {
  try {
    console.log('🗑️ Clearing all existing data...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Drop and recreate all tables (this will delete all data)
    await sequelize.sync({ force: true });
    console.log('✅ All tables recreated - old data deleted');

    // 1. Create Departments
    console.log('📁 Creating fresh departments...');
    const departments = await Department.create({
      name: 'Human Resources',
      code: 'HR',
      description: 'Manages employee relations, recruitment, and policies',
      isActive: true,
      parentDepartment: null,
      manager: null,
      budget: 500000,
      location: 'Head Office - Floor 2',
      contactInfo: {
        email: 'hr@company.com',
        phone: '+1-555-0101',
        extension: '2001'
      }
    });

    const itDept = await Department.create({
      name: 'Information Technology',
      code: 'IT',
      description: 'Manages technology infrastructure and software development',
      isActive: true,
      parentDepartment: null,
      manager: null,
      budget: 1200000,
      location: 'Head Office - Floor 3',
      contactInfo: {
        email: 'it@company.com',
        phone: '+1-555-0102',
        extension: '3001'
      }
    });

    // 2. Create Users with proper password hashing (using individual creates to trigger hooks)
    console.log('🔐 Creating fresh users...');
    
    const adminUser = await User.create({
      name: 'Super Administrator',
      email: 'admin@hrms.com',
      password: 'admin123',
      role: 'SuperAdmin',
      isActive: true,
      employeeId: null,
      assignedDepartments: []
    });
    console.log('✅ Created admin user');

    const hrUser = await User.create({
      name: 'HR Administrator',
      email: 'hr@hrms.com',
      password: 'hr123',
      role: 'HR Administrator',
      isActive: true,
      employeeId: null,
      assignedDepartments: []
    });
    console.log('✅ Created HR user');

    const managerUser = await User.create({
      name: 'IT Manager',
      email: 'manager@hrms.com',
      password: 'manager123',
      role: 'HR Manager',
      isActive: true,
      employeeId: null,
      assignedDepartments: [itDept.id]
    });
    console.log('✅ Created manager user');

    // 3. Create a sample employee
    console.log('👥 Creating sample employee...');
    const employee = await Employee.create({
      employeeId: 'EMP001',
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-15',
        gender: 'Male',
        maritalStatus: 'Single',
        nationality: 'American',
        bloodGroup: 'O+',
        personalEmail: 'john.doe@gmail.com',
        phoneNumber: '+1-555-1001',
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        }
      },
      jobInfo: {
        department: itDept.id,
        jobTitle: 'Software Developer',
        employmentType: 'Full-time',
        workLocation: 'Head Office',
        joiningDate: '2024-01-15',
        probationEndDate: '2024-07-15',
        confirmationDate: '2024-07-15',
        reportingManager: null,
        workSchedule: {
          type: 'standard',
          hoursPerWeek: 40,
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }
      },
      salaryInfo: {
        baseSalary: 75000,
        currency: 'USD',
        payFrequency: 'Monthly',
        effectiveDate: '2024-01-15'
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Sister',
        phoneNumber: '+1-555-1002',
        email: 'jane.doe@gmail.com'
      },
      documentsList: [],
      status: 'Active',
      isActive: true
    });

    // Create employee user account
    const empUser = await User.create({
      name: 'John Doe',
      email: 'john.doe@hrms.com',
      password: 'emp123',
      role: 'Employee',
      isActive: true,
      employeeId: employee.id,
      assignedDepartments: []
    });
    console.log('✅ Created employee user');

    // 4. Create leave balances for the employee
    console.log('🏖️ Creating leave balances...');
    const leaveTypes = [
      { type: 'annual', allocated: 25, used: 0 },
      { type: 'sick', allocated: 12, used: 0 },
      { type: 'emergency', allocated: 5, used: 0 }
    ];

    for (const leave of leaveTypes) {
      await LeaveBalance.create({
        employeeId: employee.id,
        year: new Date().getFullYear(),
        leaveType: leave.type,
        allocated: leave.allocated,
        used: leave.used,
        pending: 0,
        remaining: leave.allocated - leave.used,
        carryForward: 0
      });
    }

    // 5. Create system configuration
    console.log('⚙️ Creating system configuration...');
    await Config.bulkCreate([
      {
        key: 'company_name',
        value: '"TechCorp Solutions"',
        category: 'company',
        description: 'Company name displayed in the system',
        isActive: true
      },
      {
        key: 'working_hours_per_day',
        value: '8',
        category: 'attendance',
        description: 'Standard working hours per day',
        isActive: true
      },
      {
        key: 'annual_leave_days',
        value: '25',
        category: 'leave',
        description: 'Default annual leave days for new employees',
        isActive: true
      }
    ]);

    console.log('✅ Fresh database created successfully!');
    console.log('\n📊 Fresh Data Summary:');
    console.log('- Departments: 2 (HR, IT)');
    console.log('- Users: 4 (Admin, HR, Manager, Employee)');
    console.log('- Employees: 1 (John Doe)');
    console.log('- Leave Balances: 3 types');
    console.log('- System Configs: 3');
    
    console.log('\n🔑 Fresh Login Credentials:');
    console.log('Super Admin: admin@hrms.com / admin123');
    console.log('HR Admin: hr@hrms.com / hr123');
    console.log('Manager: manager@hrms.com / manager123');
    console.log('Employee: john.doe@hrms.com / emp123');

    await sequelize.close();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error creating fresh data:', error);
    throw error;
  }
};

createFreshData()
  .then(() => {
    console.log('🎉 Fresh data creation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fresh data creation failed:', error);
    process.exit(1);
  });