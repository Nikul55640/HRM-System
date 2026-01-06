import { User } from './src/models/sequelize/index.js';
import sequelize from './src/config/sequelize.js';

async function checkRoles() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    const users = await User.findAll({
      attributes: ['id', 'email', 'role'],
      raw: true
    });
    
    console.log('📊 Current user roles in database:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    const roleDistribution = {};
    users.forEach(user => {
      roleDistribution[user.role] = (roleDistribution[user.role] || 0) + 1;
    });
    
    console.log('\n📈 Role distribution:');
    Object.entries(roleDistribution).forEach(([role, count]) => {
      console.log(`- ${role}: ${count} users`);
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRoles();