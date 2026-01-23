import { User, Department } from './src/models/sequelize/index.js';
import sequelize from './src/config/sequelize.js';

async function assignDepartmentsToHRUsers() {
  try {
    console.log('🔧 Assigning Departments to HR Users...\n');

    // Get all departments
    const departments = await Department.findAll({
      attributes: ['id', 'name', 'code'],
      order: [['name', 'ASC']]
    });
    
    console.log(`📊 Available departments: ${departments.length}`);
    departments.forEach(dept => {
      console.log(`   - ${dept.name} (ID: ${dept.id})`);
    });
    console.log('');

    // Get HR users (both HR and HR_Manager roles)
    const hrUsers = await User.findAll({
      where: {
        role: ['HR', 'HR_Manager', 'HR_ADMIN']
      },
      attributes: ['id', 'email', 'role', 'assignedDepartments']
    });

    console.log(`👥 HR Users found: ${hrUsers.length}`);
    
    if (hrUsers.length === 0) {
      console.log('No HR users found. Let\'s check all users...');
      
      const allUsers = await User.findAll({
        attributes: ['id', 'email', 'role', 'assignedDepartments']
      });
      
      allUsers.forEach(user => {
        console.log(`   - ${user.email}: ${user.role}`);
      });
    }

    // Assign all departments to HR users (they should have access to all departments)
    const allDepartmentIds = departments.map(dept => dept.id);
    
    for (const user of hrUsers) {
      console.log(`\n🔄 Processing ${user.email} (${user.role})...`);
      console.log(`   Current departments: ${JSON.stringify(user.assignedDepartments)}`);
      
      // Assign all departments to HR users
      user.assignedDepartments = allDepartmentIds;
      await user.save();
      
      console.log(`   ✅ Updated departments: ${JSON.stringify(user.assignedDepartments)}`);
    }

    // Also let's create a proper HR_Manager user if none exists
    const hrManagerExists = await User.findOne({
      where: { role: 'HR_Manager' }
    });

    if (!hrManagerExists) {
      console.log('\n🆕 Creating HR_Manager user...');
      const hrManager = await User.create({
        email: 'hr.manager@hrm.com',
        password: 'hrmanager123',
        role: 'HR_Manager',
        assignedDepartments: allDepartmentIds,
        isActive: true
      });
      console.log(`✅ Created HR_Manager: ${hrManager.email}`);
    }

    // Test the updated assignments
    console.log('\n🧪 Testing updated assignments...');
    const { default: userService } = await import('./src/services/user.service.js');
    
    const updatedUsers = await User.findAll({
      where: {
        role: ['HR', 'HR_Manager', 'HR_ADMIN']
      }
    });

    for (const user of updatedUsers) {
      const userWithDepts = await userService.getUserById(user.id);
      console.log(`\n👤 ${userWithDepts.email}:`);
      console.log(`   Role: ${userWithDepts.role}`);
      console.log(`   Assigned Departments: ${userWithDepts.assignedDepartments.length}`);
      userWithDepts.assignedDepartments.forEach(dept => {
        console.log(`     - ${dept.name} (ID: ${dept.id})`);
      });
    }

    console.log('\n🎉 Department assignment completed!');

  } catch (error) {
    console.error('❌ Assignment failed:', error);
  } finally {
    await sequelize.close();
  }
}

assignDepartmentsToHRUsers();