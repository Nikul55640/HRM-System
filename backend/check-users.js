const { User, Employee } = require('./src/models/sequelize/index.js');

async function checkUsers() {
  try {
    console.log('Checking users and employees...');
    
    const users = await User.findAll();
    console.log('\nUsers:');
    users.forEach(u => {
      console.log(`  ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, EmployeeId: ${u.employeeId}`);
    });
    
    const employees = await Employee.findAll();
    console.log('\nEmployees:');
    employees.forEach(e => {
      console.log(`  ID: ${e.id}, Name: ${e.firstName} ${e.lastName}, Email: ${e.email}`);
    });
    
    // Check if admin user has employee profile
    const adminUser = await User.findOne({ where: { email: 'admin@hrms.com' } });
    if (adminUser) {
      console.log(`\nAdmin user found: ID ${adminUser.id}, EmployeeId: ${adminUser.employeeId}`);
      
      if (!adminUser.employeeId) {
        console.log('Admin user has no employee profile. Creating one...');
        
        // Create employee profile for admin
        const adminEmployee = await Employee.create({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@hrms.com',
          employeeCode: 'EMP001',
          department: 'Administration',
          designation: 'System Administrator',
          joiningDate: new Date(),
          status: 'active'
        });
        
        // Link employee to user
        adminUser.employeeId = adminEmployee.id;
        await adminUser.save();
        
        console.log(`Created employee profile with ID: ${adminEmployee.id}`);
        console.log(`Linked admin user to employee profile`);
      } else {
        console.log('Admin user already has employee profile');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

checkUsers();