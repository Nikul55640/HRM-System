import sequelize from '../src/config/sequelize.js';
import {
  User,
  Department,
  Employee,
  EmployeeProfile,
  LeaveBalance,
  LeaveType,
  Config,
  SalaryStructure
} from '../src/models/sequelize/index.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting MySQL database seeding...');

    // Sync database (create tables)
    await sequelize.sync({ force: true });
    console.log('✅ Database synced successfully');

    // 1. Create Departments
    console.log('📁 Creating departments...');
    const departments = await Department.bulkCreate([
      {
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
      },
      {
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
      },
      {
        name: 'Finance',
        code: 'FIN',
        description: 'Manages financial operations, accounting, and budgeting',
        isActive: true,
        parentDepartment: null,
        manager: null,
        budget: 800000,
        location: 'Head Office - Floor 1',
        contactInfo: {
          email: 'finance@company.com',
          phone: '+1-555-0103',
          extension: '1001'
        }
      },
      {
        name: 'Marketing',
        code: 'MKT',
        description: 'Manages marketing campaigns, branding, and customer outreach',
        isActive: true,
        parentDepartment: null,
        manager: null,
        budget: 600000,
        location: 'Head Office - Floor 4',
        contactInfo: {
          email: 'marketing@company.com',
          phone: '+1-555-0104',
          extension: '4001'
        }
      },
      {
        name: 'Sales',
        code: 'SALES',
        description: 'Manages sales operations and customer relationships',
        isActive: true,
        parentDepartment: null,
        manager: null,
        budget: 900000,
        location: 'Head Office - Floor 5',
        contactInfo: {
          email: 'sales@company.com',
          phone: '+1-555-0105',
          extension: '5001'
        }
      }
    ]);

    // 2. Create Employees
    console.log('👥 Creating employees...');
    const employees = await Employee.bulkCreate([
      {
        employeeId: 'EMP001',
        personalInfo: {
          firstName: 'John',
          lastName: 'Smith',
          dateOfBirth: '1985-03-15',
          gender: 'Male',
          maritalStatus: 'Married',
          nationality: 'American',
          bloodGroup: 'O+',
          personalEmail: 'john.smith.personal@gmail.com',
          phoneNumber: '+1-555-1001',
          alternatePhone: '+1-555-1002',
          address: {
            street: '123 Main Street',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          }
        },
        jobInfo: {
          department: departments[0].id, // HR
          jobTitle: 'HR Director',
          employmentType: 'Full-time',
          workLocation: 'Head Office',
          joiningDate: '2020-01-15',
          probationEndDate: '2020-07-15',
          confirmationDate: '2020-07-15',
          reportingManager: null,
          workSchedule: {
            type: 'standard',
            hoursPerWeek: 40,
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          }
        },
        salaryInfo: {
          baseSalary: 95000,
          currency: 'USD',
          payFrequency: 'Monthly',
          effectiveDate: '2020-01-15'
        },
        bankDetails: {
          accountNumber: '****1234',
          bankName: 'Chase Bank',
          routingNumber: '021000021',
          accountType: 'Checking'
        },
        emergencyContact: {
          name: 'Jane Smith',
          relationship: 'Spouse',
          phoneNumber: '+1-555-1003',
          email: 'jane.smith@gmail.com'
        },
        documentsList: [],
        status: 'Active',
        isActive: true
      },
      {
        employeeId: 'EMP002',
        personalInfo: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          dateOfBirth: '1990-07-22',
          gender: 'Female',
          maritalStatus: 'Single',
          nationality: 'American',
          bloodGroup: 'A+',
          personalEmail: 'sarah.johnson@gmail.com',
          phoneNumber: '+1-555-2001',
          alternatePhone: '+1-555-2002',
          address: {
            street: '456 Oak Avenue',
            city: 'New York',
            state: 'NY',
            zipCode: '10002',
            country: 'USA'
          }
        },
        jobInfo: {
          department: departments[1].id, // IT
          jobTitle: 'Senior Software Engineer',
          employmentType: 'Full-time',
          workLocation: 'Head Office',
          joiningDate: '2021-03-01',
          probationEndDate: '2021-09-01',
          confirmationDate: '2021-09-01',
          reportingManager: null,
          workSchedule: {
            type: 'flexible',
            hoursPerWeek: 40,
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          }
        },
        salaryInfo: {
          baseSalary: 85000,
          currency: 'USD',
          payFrequency: 'Monthly',
          effectiveDate: '2021-03-01'
        },
        bankDetails: {
          accountNumber: '****5678',
          bankName: 'Bank of America',
          routingNumber: '026009593',
          accountType: 'Checking'
        },
        emergencyContact: {
          name: 'Robert Johnson',
          relationship: 'Father',
          phoneNumber: '+1-555-2003',
          email: 'robert.johnson@gmail.com'
        },
        documentsList: [],
        status: 'Active',
        isActive: true
      },
      {
        employeeId: 'EMP003',
        personalInfo: {
          firstName: 'Michael',
          lastName: 'Brown',
          dateOfBirth: '1988-11-10',
          gender: 'Male',
          maritalStatus: 'Married',
          nationality: 'American',
          bloodGroup: 'B+',
          personalEmail: 'michael.brown@gmail.com',
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
          department: departments[2].id, // Finance
          jobTitle: 'Finance Manager',
          employmentType: 'Full-time',
          workLocation: 'Head Office',
          joiningDate: '2019-06-15',
          probationEndDate: '2019-12-15',
          confirmationDate: '2019-12-15',
          reportingManager: null,
          workSchedule: {
            type: 'standard',
            hoursPerWeek: 40,
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          }
        },
        salaryInfo: {
          baseSalary: 78000,
          currency: 'USD',
          payFrequency: 'Monthly',
          effectiveDate: '2019-06-15'
        },
        bankDetails: {
          accountNumber: '****9012',
          bankName: 'Wells Fargo',
          routingNumber: '121000248',
          accountType: 'Checking'
        },
        emergencyContact: {
          name: 'Lisa Brown',
          relationship: 'Spouse',
          phoneNumber: '+1-555-3003',
          email: 'lisa.brown@gmail.com'
        },
        documentsList: [],
        status: 'Active',
        isActive: true
      },
      {
        employeeId: 'EMP004',
        personalInfo: {
          firstName: 'Emily',
          lastName: 'Davis',
          dateOfBirth: '1992-04-18',
          gender: 'Female',
          maritalStatus: 'Single',
          nationality: 'American',
          bloodGroup: 'AB+',
          personalEmail: 'emily.davis@gmail.com',
          phoneNumber: '+1-555-4001',
          alternatePhone: '+1-555-4002',
          address: {
            street: '321 Elm Street',
            city: 'New York',
            state: 'NY',
            zipCode: '10004',
            country: 'USA'
          }
        },
        jobInfo: {
          department: departments[3].id, // Marketing
          jobTitle: 'Marketing Specialist',
          employmentType: 'Full-time',
          workLocation: 'Head Office',
          joiningDate: '2022-01-10',
          probationEndDate: '2022-07-10',
          confirmationDate: '2022-07-10',
          reportingManager: null,
          workSchedule: {
            type: 'standard',
            hoursPerWeek: 40,
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          }
        },
        salaryInfo: {
          baseSalary: 62000,
          currency: 'USD',
          payFrequency: 'Monthly',
          effectiveDate: '2022-01-10'
        },
        bankDetails: {
          accountNumber: '****3456',
          bankName: 'Citibank',
          routingNumber: '021000089',
          accountType: 'Checking'
        },
        emergencyContact: {
          name: 'David Davis',
          relationship: 'Brother',
          phoneNumber: '+1-555-4003',
          email: 'david.davis@gmail.com'
        },
        documentsList: [],
        status: 'Active',
        isActive: true
      },
      {
        employeeId: 'EMP005',
        personalInfo: {
          firstName: 'James',
          lastName: 'Wilson',
          dateOfBirth: '1987-09-25',
          gender: 'Male',
          maritalStatus: 'Married',
          nationality: 'American',
          bloodGroup: 'O-',
          personalEmail: 'james.wilson@gmail.com',
          phoneNumber: '+1-555-5001',
          alternatePhone: '+1-555-5002',
          address: {
            street: '654 Maple Avenue',
            city: 'New York',
            state: 'NY',
            zipCode: '10005',
            country: 'USA'
          }
        },
        jobInfo: {
          department: departments[4].id, // Sales
          jobTitle: 'Sales Manager',
          employmentType: 'Full-time',
          workLocation: 'Head Office',
          joiningDate: '2020-08-01',
          probationEndDate: '2021-02-01',
          confirmationDate: '2021-02-01',
          reportingManager: null,
          workSchedule: {
            type: 'standard',
            hoursPerWeek: 40,
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          }
        },
        salaryInfo: {
          baseSalary: 72000,
          currency: 'USD',
          payFrequency: 'Monthly',
          effectiveDate: '2020-08-01'
        },
        bankDetails: {
          accountNumber: '****7890',
          bankName: 'TD Bank',
          routingNumber: '031201360',
          accountType: 'Checking'
        },
        emergencyContact: {
          name: 'Maria Wilson',
          relationship: 'Spouse',
          phoneNumber: '+1-555-5003',
          email: 'maria.wilson@gmail.com'
        },
        documentsList: [],
        status: 'Active',
        isActive: true
      }
    ]);

    // 3. Create Users (Admin and Employee accounts)
    console.log('🔐 Creating users...');
    const users = await User.bulkCreate([
      {
        name: 'Super Administrator',
        email: 'admin@hrms.com',
        password: 'admin123',
        role: 'SuperAdmin',
        isActive: true,
        employeeId: null,
        assignedDepartments: []
      },
      {
        name: 'HR Administrator',
        email: 'hr@hrms.com',
        password: 'hr123',
        role: 'HR Administrator',
        isActive: true,
        employeeId: employees[0].id, // John Smith
        assignedDepartments: []
      },
      {
        name: 'IT Manager',
        email: 'it.manager@hrms.com',
        password: 'it123',
        role: 'HR Manager',
        isActive: true,
        employeeId: null,
        assignedDepartments: [departments[1].id] // IT Department
      },
      {
        name: 'John Smith',
        email: 'john.smith@hrms.com',
        password: 'emp123',
        role: 'Employee',
        isActive: true,
        employeeId: employees[0].id,
        assignedDepartments: []
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@hrms.com',
        password: 'emp123',
        role: 'Employee',
        isActive: true,
        employeeId: employees[1].id,
        assignedDepartments: []
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@hrms.com',
        password: 'emp123',
        role: 'Employee',
        isActive: true,
        employeeId: employees[2].id,
        assignedDepartments: []
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@hrms.com',
        password: 'emp123',
        role: 'Employee',
        isActive: true,
        employeeId: employees[3].id,
        assignedDepartments: []
      },
      {
        name: 'James Wilson',
        email: 'james.wilson@hrms.com',
        password: 'emp123',
        role: 'Employee',
        isActive: true,
        employeeId: employees[4].id,
        assignedDepartments: []
      }
    ], {
      individualHooks: true // This ensures beforeCreate hooks are triggered for password hashing
    });

    // 4. Create Leave Balances for all employees
    console.log('🏖️ Creating leave balances...');
    const leaveBalances = [];
    const leaveTypesList = [
      { type: 'Annual Leave', balance: 25, used: 0 },
      { type: 'Sick Leave', balance: 12, used: 0 },
      { type: 'Personal Leave', balance: 5, used: 0 },
      { type: 'Maternity/Paternity Leave', balance: 90, used: 0 }
    ];

    for (const employee of employees) {
      for (const leave of leaveTypesList) {
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

    // 5. Create System Configuration
    console.log('⚙️ Creating system configuration...');
    await Config.bulkCreate([
      {
        key: 'company_name',
        value: 'TechCorp Solutions',
        category: 'company',
        description: 'Company name displayed in the system',
        isActive: true
      },
      {
        key: 'company_address',
        value: '123 Business District, New York, NY 10001',
        category: 'company',
        description: 'Company headquarters address',
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
        key: 'working_days_per_week',
        value: '5',
        category: 'attendance',
        description: 'Standard working days per week',
        isActive: true
      },
      {
        key: 'annual_leave_days',
        value: '25',
        category: 'leave',
        description: 'Default annual leave days for new employees',
        isActive: true
      },
      {
        key: 'sick_leave_days',
        value: '12',
        category: 'leave',
        description: 'Default sick leave days for new employees',
        isActive: true
      },
      {
        key: 'probation_period_months',
        value: '6',
        category: 'hr',
        description: 'Default probation period in months',
        isActive: true
      },
      {
        key: 'currency',
        value: 'USD',
        category: 'payroll',
        description: 'Default currency for salary calculations',
        isActive: true
      }
    ]);

    // 6. Create Salary Structures
    console.log('💰 Creating salary structures...');
    const salaryStructures = [];
    for (const employee of employees) {
      salaryStructures.push({
        employeeId: employee.id,
        baseSalary: employee.salaryInfo.baseSalary,
        allowances: {
          housing: employee.salaryInfo.baseSalary * 0.15,
          transport: employee.salaryInfo.baseSalary * 0.05,
          medical: employee.salaryInfo.baseSalary * 0.08
        },
        deductions: {
          tax: employee.salaryInfo.baseSalary * 0.12,
          insurance: employee.salaryInfo.baseSalary * 0.03,
          retirement: employee.salaryInfo.baseSalary * 0.06
        },
        effectiveDate: employee.jobInfo.joiningDate,
        isActive: true,
        status: 'Active'
      });
    }

    await SalaryStructure.bulkCreate(salaryStructures);

    // 7. Create Leave Types
    console.log('🏖️ Creating leave types...');
    const leaveTypes = await LeaveType.bulkCreate([
      {
        name: 'Annual Leave',
        code: 'AL',
        description: 'Yearly vacation leave for rest and recreation',
        maxDaysPerYear: 21,
        maxConsecutiveDays: 15,
        carryForward: true,
        carryForwardLimit: 5,
        isPaid: true,
        requiresApproval: true,
        advanceNoticeRequired: 7,
        applicableGender: 'all',
        minServiceMonths: 6,
        isActive: true,
        color: '#3B82F6',
        createdBy: 1
      },
      {
        name: 'Sick Leave',
        code: 'SL',
        description: 'Leave for medical reasons and health issues',
        maxDaysPerYear: 12,
        maxConsecutiveDays: 7,
        carryForward: false,
        carryForwardLimit: null,
        isPaid: true,
        requiresApproval: false,
        advanceNoticeRequired: 0,
        applicableGender: 'all',
        minServiceMonths: 0,
        isActive: true,
        color: '#EF4444',
        createdBy: 1
      },
      {
        name: 'Maternity Leave',
        code: 'ML',
        description: 'Leave for new mothers before and after childbirth',
        maxDaysPerYear: 90,
        maxConsecutiveDays: 90,
        carryForward: false,
        carryForwardLimit: null,
        isPaid: true,
        requiresApproval: true,
        advanceNoticeRequired: 30,
        applicableGender: 'female',
        minServiceMonths: 12,
        isActive: true,
        color: '#EC4899',
        createdBy: 1
      },
      {
        name: 'Paternity Leave',
        code: 'PL',
        description: 'Leave for new fathers to support family',
        maxDaysPerYear: 15,
        maxConsecutiveDays: 15,
        carryForward: false,
        carryForwardLimit: null,
        isPaid: true,
        requiresApproval: true,
        advanceNoticeRequired: 15,
        applicableGender: 'male',
        minServiceMonths: 12,
        isActive: true,
        color: '#10B981',
        createdBy: 1
      },
      {
        name: 'Emergency Leave',
        code: 'EL',
        description: 'Urgent leave for unforeseen circumstances',
        maxDaysPerYear: 5,
        maxConsecutiveDays: 3,
        carryForward: false,
        carryForwardLimit: null,
        isPaid: true,
        requiresApproval: true,
        advanceNoticeRequired: 0,
        applicableGender: 'all',
        minServiceMonths: 3,
        isActive: true,
        color: '#F59E0B',
        createdBy: 1
      },
      {
        name: 'Unpaid Leave',
        code: 'UL',
        description: 'Leave without pay for personal reasons',
        maxDaysPerYear: 30,
        maxConsecutiveDays: 15,
        carryForward: false,
        carryForwardLimit: null,
        isPaid: false,
        requiresApproval: true,
        advanceNoticeRequired: 14,
        applicableGender: 'all',
        minServiceMonths: 12,
        isActive: true,
        color: '#6B7280',
        createdBy: 1
      },
      {
        name: 'Bereavement Leave',
        code: 'BL',
        description: 'Leave for mourning the loss of family members',
        maxDaysPerYear: 7,
        maxConsecutiveDays: 7,
        carryForward: false,
        carryForwardLimit: null,
        isPaid: true,
        requiresApproval: true,
        advanceNoticeRequired: 0,
        applicableGender: 'all',
        minServiceMonths: 0,
        isActive: true,
        color: '#374151',
        createdBy: 1
      }
    ]);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded Data Summary:');
    console.log(`- Departments: ${departments.length}`);
    console.log(`- Employees: ${employees.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Leave Balances: ${leaveBalances.length}`);
    console.log(`- Leave Types: ${leaveTypes.length}`);
    console.log(`- System Configs: 8`);
    console.log(`- Salary Structures: ${salaryStructures.length}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Super Admin: admin@hrms.com / admin123');
    console.log('HR Admin: hr@hrms.com / hr123');
    console.log('IT Manager: it.manager@hrms.com / it123');
    console.log('Employee: john.smith@hrms.com / emp123');
    console.log('Employee: sarah.johnson@hrms.com / emp123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;