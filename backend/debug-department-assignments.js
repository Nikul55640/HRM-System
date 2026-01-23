import { User, Department } from './src/models/sequelize/index.js';
import sequelize from './src/config/sequelize.js';

async function debugDepartmentAssignments() {
  try {
    console.log('🔍 Debugging Department Assignments...\n');

    // Check if departments exist
    console.log('1. Checking available departments...');
    const departments = await Department.findAll({
      attributes: ['id', 'name', 'code'],
      order: [['name', 'ASC']]
    });
    
    console.log(`📊 Total departments: ${departments.length}`);
    departments.forEach(dept => {
      console.log(`   - ${dept.name} (ID: ${dept.id}, Code: ${dept.code})`);
    });
    console.log('');

    // Check users and their assigned departments
    console.log('2. Checking user department assignments...');
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'assignedDepartments'],
      order: [['email', 'ASC']]
    });

    console.log(`👥 Total users: ${users.length}`);
    users.forEach(user => {
      console.log(`👤 ${user.email} (${user.role}):`);
      console.log(`   assignedDepartments field: ${JSON.stringify(user.assignedDepartments)}`);
      console.log(`   Type: ${typeof user.assignedDepartments}`);
      console.log(`   Is Array: ${Array.isArray(user.assignedDepartments)}`);
      console.log(`   Length: ${user.assignedDepartments ? user.assignedDepartments.length : 'N/A'}`);
      console.log('');
    });

    // Test creating a user with department assignment
    if (departments.length > 0) {
      console.log('3. Testing department assignment...');
      const testDeptId = departments[0].id;
      
      console.log(`Attempting to assign department ID ${testDeptId} to a test user...`);
      
      // Check if test user exists
      let testUser = await User.findOne({ where: { email: 'test.hr@hrm.com' } });
      
      if (!testUser) {
        console.log('Creating test HR user...');
        testUser = await User.create({
          email: 'test.hr@hrm.com',
          password: 'test123',
          role: 'HR_Manager',
          assignedDepartments: [testDeptId],
          isActive: true
        });
        console.log('✅ Test user created with department assignment');
      } else {
        console.log('Updating existing test user...');
        testUser.assignedDepartments = [testDeptId];
        await testUser.save();
        console.log('✅ Test user updated with department assignment');
      }

      // Verify the assignment
      const updatedUser = await User.findByPk(testUser.id);
      console.log(`Verification - assignedDepartments: ${JSON.stringify(updatedUser.assignedDepartments)}`);
      
      // Test the service method
      console.log('\n4. Testing service method...');
      const { default: userService } = await import('./src/services/user.service.js');
      const userWithDepts = await userService.getUserById(testUser.id);
      console.log('Service result:');
      console.log(`   assignedDepartments: ${JSON.stringify(userWithDepts.assignedDepartments)}`);
    }

    console.log('\n🎉 Debug completed!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await sequelize.close();
  }
}

debugDepartmentAssignments();