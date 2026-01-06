/**
 * Fix User Roles - Assign proper roles to users with empty roles
 */

import sequelize from './src/config/sequelize.js';

async function fixUserRoles() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Fix specific users based on their email patterns
    const fixes = [
      {
        email: 'admin@hrm.com',
        role: 'SUPER_ADMIN',
        description: 'System Administrator'
      },
      {
        email: 'hr@hrm.com', 
        role: 'HR_ADMIN',
        description: 'HR Administrator'
      }
    ];

    console.log('\n🔧 Fixing user roles...');
    console.log('========================');

    for (const fix of fixes) {
      try {
        const result = await sequelize.query(
          'UPDATE users SET role = ? WHERE email = ? AND (role = "" OR role IS NULL)',
          {
            replacements: [fix.role, fix.email],
            type: sequelize.QueryTypes.UPDATE
          }
        );

        if (result[1] > 0) {
          console.log(`✅ Updated ${fix.email} → ${fix.role} (${fix.description})`);
        } else {
          console.log(`⚠️  No update needed for ${fix.email} (already has valid role)`);
        }
      } catch (error) {
        console.error(`❌ Failed to update ${fix.email}:`, error.message);
      }
    }

    // Verify the fixes
    console.log('\n📋 Verification - Current user roles:');
    console.log('=====================================');
    
    const result = await sequelize.query('SELECT id, email, role FROM users ORDER BY id');
    
    result[0].forEach(user => {
      const status = user.role ? '✅' : '❌';
      console.log(`${status} ID: ${user.id}, Email: ${user.email}, Role: '${user.role}'`);
    });

    console.log('\n✅ User roles fix completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Database connection closed');
  }
}

fixUserRoles();