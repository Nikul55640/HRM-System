import sequelize from './src/config/sequelize.js';
import { User } from './src/models/sequelize/index.js';

async function fixUserRoles() {
  try {
    console.log('🔧 Fixing user roles...\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');

    // Update HR user role from "HR" to "HR Administrator"
    const [updatedCount] = await User.update(
      { role: 'HR Administrator' },
      { where: { role: 'HR' } }
    );

    console.log(`✅ Updated ${updatedCount} user(s) from "HR" to "HR Administrator"\n`);

    // Verify the changes
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'isActive'],
      order: [['id', 'ASC']]
    });

    console.log('📊 Updated Users in Database:');
    console.log('=====================================');
    
    users.forEach((user, index) => {
      const isAdmin = ['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(user.role);
      console.log(`${index + 1}. ${user.email} - "${user.role}" ${isAdmin ? '👑' : '👤'}`);
    });

    console.log('\n🎯 Admin Route Access:');
    console.log('=====================================');
    const adminUsers = users.filter(user => 
      ['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(user.role) && user.isActive
    );

    if (adminUsers.length > 0) {
      console.log('✅ These users can now access admin routes:');
      adminUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.role})`);
      });
    } else {
      console.log('❌ No users can access admin routes');
    }

  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
  } finally {
    await sequelize.close();
  }
}

fixUserRoles();