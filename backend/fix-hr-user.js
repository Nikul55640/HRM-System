import sequelize from './src/config/sequelize.js';
import { User } from './src/models/sequelize/index.js';

async function fixHRUser() {
  try {
    console.log('🔧 Fixing HR user role...\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');

    // Find the HR user specifically
    const hrUser = await User.findOne({ where: { email: 'hr@hrm.com' } });
    
    if (!hrUser) {
      console.log('❌ HR user not found!');
      return;
    }

    console.log(`📋 Current HR user: ${hrUser.email} - Role: "${hrUser.role}"`);

    // Update the HR user's role to "HR Administrator"
    await hrUser.update({ role: 'HR Administrator' });
    
    console.log(`✅ Updated HR user role to "HR Administrator"\n`);

    // Verify all users
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'isActive'],
      order: [['id', 'ASC']]
    });

    console.log('📊 All Users After Fix:');
    console.log('=====================================');
    
    users.forEach((user, index) => {
      const isAdmin = ['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(user.role);
      const status = user.isActive ? '✅' : '❌';
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Role: "${user.role}" ${isAdmin ? '👑 (Admin)' : '👤 (Regular)'}`);
      console.log(`   Active: ${status}`);
      console.log('   ---');
    });

    // Check admin access
    const adminUsers = users.filter(user => 
      ['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(user.role) && user.isActive
    );

    console.log('\n🎯 Users with Admin Access:');
    console.log('=====================================');
    if (adminUsers.length > 0) {
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.role}`);
      });
      console.log('\n✅ These users can access /admin/attendance/corrections');
    } else {
      console.log('❌ No users have admin access!');
    }

  } catch (error) {
    console.error('❌ Error fixing HR user:', error);
  } finally {
    await sequelize.close();
  }
}

fixHRUser();