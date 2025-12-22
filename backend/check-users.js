import { User, Employee } from './src/models/sequelize/index.js';

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
      console.log(`  ID: ${e.id}, EmployeeId: ${e.employeeId}, Name: ${e.personalInfo?.firstName} ${e.personalInfo?.lastName}, Email: ${e.personalInfo?.personalEmail || e.contactInfo?.email}`);
    });
    
    // Check if admin user has employee profile
    const adminUser = await User.findOne({ where: { email: 'admin@hrms.com' } });
    if (adminUser) {
      console.log(`\nAdmin user found: ID ${adminUser.id}, EmployeeId: ${adminUser.employeeId}`);
      
      if (!adminUser.employeeId) {
        console.log('Admin user has no employee profile. Checking if admin employee exists...');
        
        // Check if admin employee already exists
        const existingAdminEmployee = await Employee.findOne({ 
          where: { employeeId: 'EMP001' } 
        });
        
        if (existingAdminEmployee) {
          console.log('Admin employee profile already exists. Linking to user...');
          adminUser.employeeId = existingAdminEmployee.id;
          await adminUser.save();
          console.log(`Linked admin user to existing employee profile ID: ${existingAdminEmployee.id}`);
        } else {
          console.log('Creating new admin employee profile...');
          // Create employee profile for admin
          const adminEmployee = await Employee.create({
            employeeId: 'EMP001',
            personalInfo: {
              firstName: 'Admin',
              lastName: 'User',
              personalEmail: 'admin@hrms.com'
            },
            contactInfo: {
              email: 'admin@hrms.com'
            },
            jobInfo: {
              jobTitle: 'System Administrator',
              department: 'Administration',
              joiningDate: new Date()
            },
            status: 'Active'
          });
          
          // Link employee to user
          adminUser.employeeId = adminEmployee.id;
          await adminUser.save();
          
          console.log(`Created employee profile with ID: ${adminEmployee.id}`);
          console.log(`Linked admin user to employee profile`);
        }
      } else {
        console.log('Admin user already has employee profile');
      }
    }
    
    // Check if HR admin user has employee profile
    const hrAdminUser = await User.findOne({ where: { email: 'hradmin@hrms.com' } });
    if (hrAdminUser) {
      console.log(`\nHR Admin user found: ID ${hrAdminUser.id}, EmployeeId: ${hrAdminUser.employeeId}`);
      
      if (!hrAdminUser.employeeId) {
        console.log('HR Admin user has no employee profile. Checking if HR employee exists...');
        
        // Check if HR employee already exists
        const existingHREmployee = await Employee.findOne({ 
          where: { employeeId: 'EMP002' } 
        });
        
        if (existingHREmployee) {
          console.log('HR employee profile already exists. Linking to user...');
          hrAdminUser.employeeId = existingHREmployee.id;
          await hrAdminUser.save();
          console.log(`Linked HR admin user to existing employee profile ID: ${existingHREmployee.id}`);
        } else {
          console.log('Creating new HR employee profile...');
          // Create employee profile for HR admin
          const hrEmployee = await Employee.create({
            employeeId: 'EMP002',
            personalInfo: {
              firstName: 'HR',
              lastName: 'Administrator',
              personalEmail: 'hradmin@hrms.com'
            },
            contactInfo: {
              email: 'hradmin@hrms.com'
            },
            jobInfo: {
              jobTitle: 'HR Administrator',
              department: 'Human Resources',
              joiningDate: new Date()
            },
            status: 'Active'
          });
          
          // Link employee to user
          hrAdminUser.employeeId = hrEmployee.id;
          await hrAdminUser.save();
          
          console.log(`Created employee profile with ID: ${hrEmployee.id}`);
          console.log(`Linked HR admin user to employee profile`);
        }
      } else {
        console.log('HR Admin user already has employee profile');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

checkUsers();