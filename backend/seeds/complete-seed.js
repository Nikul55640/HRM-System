import bcrypt from 'bcryptjs';
import sequelize from '../src/config/sequelize.js';
import User from '../src/models/sequelize/User.js';
import Department from '../src/models/sequelize/Department.js';
import Employee from '../src/models/sequelize/Employee.js';
import Holiday from '../src/models/sequelize/Holiday.js';
import LeaveBalance from '../src/models/sequelize/LeaveBalance.js';
import Lead from '../src/models/sequelize/Lead.js';
import SystemPolicy from '../src/models/sequelize/SystemPolicy.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting complete database seeding...\n');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // ============================================
    // 1. CREATE DEPARTMENTS
    // ============================================
    console.log('📁 Creating departments...');

    const departments = await Department.bulkCreate([
      {
        name: 'Human Resources',
        code: 'HR',
        description: 'Human Resources Department',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Information Technology',
        code: 'IT',
        description: 'IT Department',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Finance',
        code: 'FIN',
        description: 'Finance Department',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sales',
        code: 'SALES',
        description: 'Sales Department',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Marketing',
        code: 'MKT',
        description: 'Marketing Department',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log(`✅ Created ${departments.length} departments`);

    // ============================================
    // 2. CREATE EMPLOYEES (excluding SuperAdmin)
    // ============================================
    console.log('👥 Creating employees...');

    const employees = await Employee.bulkCreate([
      {
        employeeId: 'EMP002',
        firstName: 'HR',
        lastName: 'Manager',
        phone: '+1234567891',
        dateOfBirth: '1988-05-15',
        gender: 'female',
        maritalStatus: 'married',
        address: '456 HR Avenue',
        city: 'HR City',
        state: 'HR State',
        zipCode: '12346',
        country: 'USA',
        designation: 'HR Manager',
        department: 'Human Resources',
        employmentType: 'full_time',
        joiningDate: '2024-01-15',
        salary: 70000,
        reportingManager: null,
        status: 'Active',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        employeeId: 'EMP003',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567892',
        dateOfBirth: '1992-03-20',
        gender: 'male',
        maritalStatus: 'single',
        address: '789 Employee Lane',
        city: 'Employee City',
        state: 'Employee State',
        zipCode: '12347',
        country: 'USA',
        designation: 'Software Developer',
        department: 'Information Technology',
        employmentType: 'full_time',
        joiningDate: '2024-02-01',
        salary: 60000,
        reportingManager: 'EMP002',
        status: 'Active',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        employeeId: 'EMP004',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1234567893',
        dateOfBirth: '1991-07-10',
        gender: 'female',
        maritalStatus: 'married',
        address: '321 Sales Street',
        city: 'Sales City',
        state: 'Sales State',
        zipCode: '12348',
        country: 'USA',
        designation: 'Sales Executive',
        department: 'Sales',
        employmentType: 'full_time',
        joiningDate: '2024-02-15',
        salary: 55000,
        reportingManager: 'EMP002',
        status: 'Active',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        employeeId: 'EMP005',
        firstName: 'Alice',
        lastName: 'Johnson',
        phone: '+1234567894',
        dateOfBirth: '1990-01-25',
        gender: 'female',
        maritalStatus: 'single',
        address: '555 Marketing Ave',
        city: 'Marketing City',
        state: 'Marketing State',
        zipCode: '12349',
        country: 'USA',
        designation: 'Marketing Manager',
        department: 'Marketing',
        employmentType: 'full_time',
        joiningDate: '2023-03-10',
        salary: 65000,
        reportingManager: 'EMP002',
        status: 'Active',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        employeeId: 'EMP006',
        firstName: 'Bob',
        lastName: 'Wilson',
        phone: '+1234567895',
        dateOfBirth: '1985-12-05',
        gender: 'male',
        maritalStatus: 'married',
        address: '777 Finance Blvd',
        city: 'Finance City',
        state: 'Finance State',
        zipCode: '12350',
        country: 'USA',
        designation: 'Finance Manager',
        department: 'Finance',
        employmentType: 'full_time',
        joiningDate: '2022-06-20',
        salary: 75000,
        reportingManager: 'EMP002',
        status: 'Active',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log(`✅ Created ${employees.length} employees`);

    // ============================================
    // 3. CREATE USERS (SuperAdmin without employee record)
    // ============================================
    console.log('🔐 Creating users...');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const users = await User.bulkCreate([
      {
        name: 'Admin User',
        email: 'admin@hrms.com',
        password: hashedPassword,
        role: 'SuperAdmin',
        employeeId: null, // SuperAdmin doesn't have an employee record
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'HR Manager',
        email: 'hr@hrms.com',
        password: hashedPassword,
        role: 'HR Manager',
        employeeId: employees[0].id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'John Doe',
        email: 'john.doe@hrms.com',
        password: hashedPassword,
        role: 'Employee',
        employeeId: employees[1].id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@hrms.com',
        password: hashedPassword,
        role: 'Employee',
        employeeId: employees[2].id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@hrms.com',
        password: hashedPassword,
        role: 'Employee',
        employeeId: employees[3].id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bob Wilson',
        email: 'bob.wilson@hrms.com',
        password: hashedPassword,
        role: 'Employee',
        employeeId: employees[4].id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log(`✅ Created ${users.length} users`);

    // ============================================
    // 4. PHASE 2: CREATE LEAVE TYPES
    // ============================================
    console.log('📋 Phase 2: Creating leave types...');

    const leaveTypes = await LeaveType.bulkCreate([
      {
        name: 'Annual Leave',
        code: 'AL',
        description: 'Annual paid leave for employees',
        maxDaysPerYear: 20,
        carryForward: true,
        carryForwardLimit: 5,
        isPaid: true,
        requiresApproval: true,
        advanceNoticeRequired: 1,
        applicableGender: 'all',
        minServiceMonths: 0,
        isActive: true,
        color: '#3b82f6',
        createdBy: users[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sick Leave',
        code: 'SL',
        description: 'Leave for medical reasons',
        maxDaysPerYear: 10,
        carryForward: false,
        carryForwardLimit: 0,
        isPaid: true,
        requiresApproval: true,
        advanceNoticeRequired: 0,
        applicableGender: 'all',
        minServiceMonths: 0,
        isActive: true,
        color: '#ef4444',
        createdBy: users[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Casual Leave',
        code: 'CL',
        description: 'Short-term casual leave',
        maxDaysPerYear: 7,
        carryForward: false,
        carryForwardLimit: 0,
        isPaid: true,
        requiresApproval: true,
        advanceNoticeRequired: 1,
        applicableGender: 'all',
        minServiceMonths: 3,
        isActive: true,
        color: '#10b981',
        createdBy: users[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Maternity Leave',
        code: 'ML',
        description: 'Maternity leave for female employees',
        maxDaysPerYear: 90,
        carryForward: false,
        carryForwardLimit: 0,
        isPaid: true,
        requiresApproval: true,
        advanceNoticeRequired: 30,
        applicableGender: 'female',
        minServiceMonths: 12,
        isActive: true,
        color: '#ec4899',
        createdBy: users[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log(`✅ Created ${leaveTypes.length} leave types`);

    // ============================================
    // 5. PHASE 2: CREATE HOLIDAYS
    // ============================================
    console.log('🎉 Phase 2: Creating holidays...');

    const currentYear = new Date().getFullYear();
    const holidays = await Holiday.bulkCreate([
      {
        name: "New Year's Day",
        description: 'New Year celebration',
        date: new Date(`${currentYear}-01-01`),
        type: 'national',
        isRecurring: true,
        applicableTo: 'all',
        isOptional: false,
        isPaid: true,
        isActive: true,
        color: '#3b82f6',
        createdBy: users[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Independence Day',
        description: 'National Independence Day',
        date: new Date(`${currentYear}-07-04`),
        type: 'national',
        isRecurring: true,
        applicableTo: 'all',
        isOptional: false,
        isPaid: true,
        isActive: true,
        color: '#ef4444',
        createdBy: users[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Christmas Day',
        description: 'Christmas celebration',
        date: new Date(`${currentYear}-12-25`),
        type: 'religious',
        isRecurring: true,
        applicableTo: 'all',
        isOptional: false,
        isPaid: true,
        isActive: true,
        color: '#10b981',
        createdBy: users[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log(`✅ Created ${holidays.length} holidays`);

    // ============================================
    // 6. CREATE LEAVE BALANCES
    // ============================================
    console.log('⚖️ Creating leave balances...');

    const leaveBalances = [];
    for (const employee of employees) {
      for (const leaveType of leaveTypes) {
        leaveBalances.push({
          employeeId: employee.id,
          year: currentYear,
          leaveTypeId: leaveType.id,
          allocated: leaveType.maxDaysPerYear,
          used: 0,
          pending: 0,
          remaining: leaveType.maxDaysPerYear,
          carryForward: 0,
          createdBy: users[0].id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    await LeaveBalance.bulkCreate(leaveBalances);
    console.log(`✅ Created ${leaveBalances.length} leave balance records`);

    // ============================================
    // 7. PHASE 4: CREATE SAMPLE LEADS
    // ============================================
    console.log('💼 Phase 4: Creating sample leads...');

    const leads = await Lead.bulkCreate([
      {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        phone: '+1234567894',
        company: 'Tech Solutions Inc',
        position: 'CTO',
        source: 'website',
        status: 'new',
        priority: 'high',
        estimatedValue: 50000.00,
        expectedCloseDate: new Date('2025-03-01'),
        assignedTo: employees[2].id, // Jane Smith
        description: 'Interested in our HR management solution for their growing company',
        tags: ['enterprise', 'tech', 'high-value'],
        customFields: {
          companySize: '100-500',
          industry: 'Technology',
          budget: '$50,000'
        },
        isActive: true,
        createdBy: employees[0].id, // HR Manager
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@manufacturing.com',
        phone: '+1234567895',
        company: 'Wilson Manufacturing',
        position: 'HR Director',
        source: 'referral',
        status: 'contacted',
        priority: 'medium',
        estimatedValue: 25000.00,
        expectedCloseDate: new Date('2025-04-15'),
        assignedTo: employees[2].id, // Jane Smith
        description: 'Looking for attendance management system',
        tags: ['manufacturing', 'attendance'],
        customFields: {
          companySize: '50-100',
          industry: 'Manufacturing',
          budget: '$25,000'
        },
        lastContactDate: new Date(),
        nextFollowUpDate: new Date('2025-01-15'),
        isActive: true,
        createdBy: employees[0].id, // HR Manager
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log(`✅ Created ${leads.length} sample leads`);

    // ============================================
    // 8. CREATE SYSTEM CONFIGURATION
    // ============================================
    console.log('⚙️ Creating system configuration...');

    const configs = await Config.bulkCreate([
      {
        key: 'company_info',
        value: {
          name: 'HRMS Company',
          address: '123 Business Street, Business City, BC 12345',
          phone: '+1-555-0123',
          email: 'info@hrms.com',
          website: 'https://hrms.com',
          logo: null
        },
        description: 'Company information and branding',
        category: 'general',
        isSystem: false,
        isActive: true,
        createdBy: users[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'attendance_settings',
        value: {
          workingHours: {
            start: '09:00',
            end: '17:00'
          },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          lateThreshold: 15,
          earlyExitThreshold: 15,
          overtimeThreshold: 480,
          breakTime: 60
        },
        description: 'Default attendance and working hours settings',
        category: 'attendance',
        isSystem: true,
        isActive: true,
        createdBy: users[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'leave_settings',
        value: {
          maxAdvanceDays: 30,
          minAdvanceDays: 1,
          autoApprovalLimit: 0,
          carryForwardDeadline: '2025-03-31',
          weekendIncluded: false
        },
        description: 'Leave management settings',
        category: 'leave',
        isSystem: true,
        isActive: true,
        createdBy: users[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log(`✅ Created ${configs.length} configuration records`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🏢 Departments: ${departments.length}`);
    console.log(`   👨‍💼 Employees: ${employees.length}`);
    console.log(`   📋 Leave Types: ${leaveTypes.length}`);
    console.log(`   🎉 Holidays: ${holidays.length}`);
    console.log(`   ⚖️ Leave Balances: ${leaveBalances.length}`);
    console.log(`   💼 Leads: ${leads.length}`);
    console.log(`   ⚙️ Configurations: ${configs.length}`);
    console.log('\n🔐 Login Credentials:');
    console.log('   📧 Admin: admin@hrms.com');
    console.log('   🔑 Password: admin123');
    console.log('   📧 HR Manager: hr@hrms.com');
    console.log('   🔑 Password: admin123');
    console.log('   📧 Employee: john.doe@hrms.com');
    console.log('   🔑 Password: admin123');
    console.log('\n✅ All Phase 1, 2, 3, 4 data has been seeded!');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seedDatabase;