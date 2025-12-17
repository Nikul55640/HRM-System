import sequelize from './src/config/sequelize.js';
import { User } from './src/models/sequelize/index.js';

const createMissingUsers = async () => {
  try {
    console.log('🌱 Creating missing user accounts...');

    // Check existing users first
    const existingUsers = await User.findAll({
      attributes: ['email', 'name', 'role', 'employeeId']
    });

    console.log('📋 Existing users:');
    existingUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - Employee ID: ${user.employeeId || 'N/A'}`);
    });

    // Create missing users
    const usersToCreate = [
      {
        name: 'John Doe',
        email: 'john.doe@hrms.com',
        password: 'emp123',
        role: 'Employee',
        isActive: true,
        employeeId: 1, // Link to existing employee
        assignedDepartments: []
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@hrms.com',
        password: 'emp123',
        role: 'Employee',
        isActive: true,
        employeeId: 2, // Link to existing employee
        assignedDepartments: []
      },
      {
        name: 'Test Employee 1',
        email: 'test1@hrms.com',
        password: 'emp123',
        role: 'Employee',
        isActive: true,
        employeeId: 1, // Share employee profile for testing
        assignedDepartments: []
      },
      {
        name: 'Test Employee 2',
        email: 'test2@hrms.com',
        password: 'emp123',
        role: 'Employee',
        isActive: true,
        employeeId: 1, // Share employee profile for testing
        assignedDepartments: []
      }
    ];

    console.log('\n🔐 Creating user accounts...');
    
    for (const userData of usersToCreate) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: userData.email } });
        
        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`);
          continue;
        }

        const user = await User.create(userData);
        console.log(`✅ Created user: ${user.email} (${user.role})`);
      } catch (error) {
        console.log(`❌ Failed to create ${userData.email}:`, error.message);
      }
    }

    // Display all users after creation
    console.log('\n📋 All Users After Creation:');
    console.log('='.repeat(60));
    
    const allUsers = await User.findAll({
      attributes: ['email', 'name', 'role', 'employeeId', 'isActive']
    });

    allUsers.forEach(user => {
      console.log(`📧 ${user.email}`);
      console.log(`👤 Name: ${user.name}`);
      console.log(`🔑 Role: ${user.role}`);
      console.log(`🏢 Employee ID: ${user.employeeId || 'N/A'}`);
      console.log(`✅ Active: ${user.isActive}`);
      console.log('-'.repeat(30));
    });

    console.log('\n🧪 Test Accounts Available:');
    console.log('Employee accounts (password: emp123):');
    allUsers
      .filter(user => user.role === 'Employee' && user.employeeId)
      .forEach(user => {
        console.log(`  - ${user.email}`);
      });

    console.log('\nAdmin accounts:');
    allUsers
      .filter(user => user.role !== 'Employee')
      .forEach(user => {
        console.log(`  - ${user.email} (${user.role})`);
      });

    console.log('\n✅ User creation completed successfully!');

  } catch (error) {
    console.error('❌ Error creating users:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
};

// Run the script
createMissingUsers();