import sequelize from './src/config/sequelize.js';
import {
  User,
  Department,
  Employee,
  LeaveBalance,
} from './src/models/sequelize/index.js';

const createTestEmployees = async () => {
  try {
    console.log('🌱 Creating additional test employees...');

    // Get existing departments
    const departments = await Department.findAll();
    if (departments.length === 0) {
      console.log('❌ No departments found. Please run the main seed first.');
      return;
    }

    console.log(`📁 Found ${departments.length} departments`);

    // Create additional employees
    console.log('👥 Creating test employees...');
    const employees = await Employee.bulkCreate([
      {
        employeeId: 'EMP003',
        personalInfo: {
          firstName: 'Alice',
          lastName: 'Johnson',
          dateOfBirth: '1988-05-10',
          gender: 'Female',
          maritalStatus: 'Single',
          nationality: 'American',
          bloodGroup: 'B+',
          personalEmail: 'alice.johnson.personal@gmail.com',
          phoneNumber: '+1-555-3001',
          alternatePhone: '+1-555-3002',
          address: {
            street: '789 Pine Street',
            city: 'New York',
            state: 'NY',
            zipCode: '10003',
            country: 'USA'
          }
        },
        jobInfo: {
          department: departments[1].id, // IT
          jobTitle: 'Frontend Developer',
          employmentType: 'Full-time',
          workLocation: 'Head Office',
          joiningDate: '2022-01-15',
          probationEndDate: '2022-07-15',
          confirmationDate: '2022-07-15',
          reportingManager: null,
          workSchedule: {
            type: 'flexible',
            hoursPerWeek: 40,
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          }
        },
        salaryInfo: {
          baseSalary: 75000,
          currency: 'USD',
          payFrequency: 'Monthly',
          effectiveDate: '2022-01-15'
        },
        bankDetails: {
          accountNumber: '****5678',
          bankName: 'Bank of America',
          routingNumber: '021000021',
          accountType: 'Checking'
        },
        emergencyContact: {
          name: 'Bob Johnson',
          relationship: 'Brother',
          phoneNumber: '+1-555-3003',
          email: 'bob.johnson@gmail.com'
        },
        documentsList: [],
        status: 'Active',
        isActive: true
      },
      {
        employeeId: 'EMP004',
        personalInfo: {
          firstName: 'David',
          lastName: 'Wilson',
          dateOfBirth: '1992-09-25',
          gender: 'Male',
          maritalStatus: 'Married',
          nationality: 'American',
          bloodGroup: 'O-',
          personalEmail: 'david.wilson.personal@gmail.com',
          phoneNumber: '+1-555-4001',
          alternatePhone: '+1-555-4002',
          address: {
            street: '321 Elm Avenue',
            city: 'New York',
            state: 'NY',
            zipCode: '10004',
            country: 'USA'
          }
        },
        jobInfo: {
          department: departments[2].id, // Finance
          jobTitle: 'Financial Analyst',
          employmentType: 'Full-time',
          workLocation: 'Head Office',
          joiningDate: '2021-06-01',
          probationEndDate: '2021-12-01',
          confirmationDate: '2021-12-01',
          reportingManager: null,
          workSchedule: {
            type: 'standard',
            hoursPerWeek: 40,
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          }
        },
        salaryInfo: {
          baseSalary: 68000,
          currency: 'USD',
          payFrequency: 'Monthly',
          effectiveDate: '2021-06-01'
        },
        bankDetails: {
          accountNumber: '****9012',
          bankName: 'Wells Fargo',
          routingNumber: '121000248',
          accountType: 'Checking'
        },
        emergencyContact: {
          name: 'Lisa Wilson',
          relationship: 'Spouse',
          phoneNumber: '+1-555-4003',
          email: 'lisa.wilson@gmail.com'
        },
        documentsList: [],
        status: 'Active',
        isActive: true
      },
      {
        employeeId: 'EMP005',
        personalInfo: {
          firstName: 'Emma',
          lastName: 'Davis',
          dateOfBirth: '1995-12-08',
          gender: 'Female',
          maritalStatus: 'Single',
          nationality: 'American',
          bloodGroup: 'AB+',
          personalEmail: 'emma.davis.personal@gmail.com',
          phoneNumber: '+1-555-5001',
          alternatePhone: '+1-555-5002',
          address: {
            street: '654 Maple Drive',
            city: 'New York',
            state: 'NY',
            zipCode: '10005',
            country: 'USA'
          }
        },
        jobInfo: {
          department: departments[3].id, // Marketing
          jobTitle: 'Marketing Coordinator',
          employmentType: 'Full-time',
          workLocation: 'Head Office',
          joiningDate: '2023-03-01',
          probationEndDate: '2023-09-01',
          confirmationDate: '2023-09-01',
          reportingManager: null,
          workSchedule: {
            type: 'hybrid',
            hoursPerWeek: 40,
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          }
        },
        salaryInfo: {
          baseSalary: 55000,
          currency: 'USD',
          payFrequency: 'Monthly',
          effectiveDate: '2023-03-01'
        },
        bankDetails: {
          accountNumber: '****3456',
          bankName: 'Chase Bank',
          routingNumber: '021000021',
          accountType: 'Savings'
        },
        emergencyContact: {
          name: 'Robert Davis',
          relationship: 'Father',
          phoneNumber: '+1-555-5003',
          email: 'robert.davis@gmail.com'
        },
        documentsList: [],
        status: 'Active',
        isActive: true
      }
    ]);

    console.log(`✅ Created ${employees.length} employees`);

    // Create Users for the new employees
    console.log('🔐 Creating user accounts...');
    const users = await User.bulkCreate([
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@hrms.com',
        password: 'emp123',
        role: 'Employee',
        isActive: true,
        employeeId: employees[0].id,
        assignedDepartments: []
      },
      {
        name: 'David Wilson',
        email: 'david.wilson@hrms.com',
        password: 'emp123',
        role: 'Employee',
        isActive: true,
        employeeId: employees[1].id,
        assignedDepartments: []
      },
      {
        name: 'Emma Davis',
        email: 'emma.davis@hrms.com',
        password: 'emp123',
        role: 'Employee',
        isActive: true,
        employeeId: employees[2].id,
        assignedDepartments: []
      },
      // Create the missing John Doe user
      {
        name: 'John Doe',
        email: 'john.doe@hrms.com',
        password: 'emp123',
        role: 'Employee',
        isActive: true,
        employeeId: 1, // Assuming this employee already exists
        assignedDepartments: []
      }
    ], {
      individualHooks: true // This ensures beforeCreate hooks are triggered for password hashing
    });

    console.log(`✅ Created ${users.length} user accounts`);

    // Create Leave Balances for new employees
    console.log('🏖️ Creating leave balances...');
    const leaveBalances = [];
    const leaveTypes = [
      { type: 'Annual Leave', balance: 25, used: 0 },
      { type: 'Sick Leave', balance: 12, used: 0 },
      { type: 'Personal Leave', balance: 5, used: 0 },
      { type: 'Maternity/Paternity Leave', balance: 90, used: 0 }
    ];

    for (const employee of employees) {
      for (const leave of leaveTypes) {
        leaveBalances.push({
          employeeId: employee.id,
          leaveType: leave.type,
          totalDays: leave.balance,
          usedDays: leave.used,
          remainingDays: leave.balance - leave.used,
          year: new Date().getFullYear(),
          carryForward: 0,
          isActive: true
        });
      }
    }

    await LeaveBalance.bulkCreate(leaveBalances);
    console.log(`✅ Created ${leaveBalances.length} leave balance records`);

    // Display created users for testing
    console.log('\n📋 Test Users Created:');
    console.log('='.repeat(50));
    users.forEach(user => {
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Password: emp123`);
      console.log(`👤 Role: ${user.role}`);
      console.log(`🏢 Employee ID: ${user.employeeId}`);
      console.log('-'.repeat(30));
    });

    console.log('\n✅ Test employee creation completed successfully!');
    console.log('\n🧪 You can now test with these accounts:');
    console.log('- alice.johnson@hrms.com');
    console.log('- david.wilson@hrms.com');
    console.log('- emma.davis@hrms.com');
    console.log('- john.doe@hrms.com');

  } catch (error) {
    console.error('❌ Error creating test employees:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
};

// Run the script
createTestEmployees();