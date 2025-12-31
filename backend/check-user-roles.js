import sequelize from './src/config/sequelize.js';
import { User } from './src/models/sequelize/index.js';

async function checkUserRoles() {
  try {
    console.log('🔍 Checking user roles in database...\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');

    // Get all users with their roles
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'isActive', 'assignedDepartments'],
      order: [['id', 'ASC']]
    });

    console.log('📊 Current Users in Database:');
    console.log('=====================================');
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      return;
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: "${user.role}" (type: ${typeof user.role})`);
      console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
      console.log(`   Assigned Departments: ${JSON.stringify(user.assignedDepartments)}`);
      console.log('   ---');
    });

    // Check distinct roles
    const distinctRoles = await sequelize.query(
      'SELECT DISTINCT role FROM users ORDER BY role',
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('\n🎭 Distinct Roles in Database:');
    console.log('=====================================');
    distinctRoles.forEach((row, index) => {
      console.log(`${index + 1}. "${row.role}"`);
    });

    // Check expected roles for admin routes
    const expectedRoles = ['SuperAdmin', 'HR Administrator', 'HR Manager'];
    console.log('\n🎯 Expected Roles for Admin Routes:');
    console.log('=====================================');
    expectedRoles.forEach((role, index) => {
      const hasRole = distinctRoles.some(r => r.role === role);
      console.log(`${index + 1}. "${role}" - ${hasRole ? '✅ Found' : '❌ Missing'}`);
    });

    // Check if any user has admin roles
    const adminUsers = users.filter(user => 
      expectedRoles.includes(user.role) && user.isActive
    );

    console.log('\n👑 Active Admin Users:');
    console.log('=====================================');
    if (adminUsers.length === 0) {
      console.log('❌ No active admin users found!');
      console.log('\n💡 To fix this, you can:');
      console.log('1. Update an existing user role:');
      console.log('   UPDATE users SET role = "SuperAdmin" WHERE email = "your-email@example.com";');
      console.log('2. Or create a new admin user through the registration endpoint');
    } else {
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.role}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking user roles:', error);
  } finally {
    await sequelize.close();
  }
}

checkUserRoles();