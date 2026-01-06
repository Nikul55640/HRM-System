const { User } = require('./src/models');

async function updateUserRole() {
  try {
    // Replace 'your-email@example.com' with your actual email
    const userEmail = 'your-email@example.com'; // UPDATE THIS
    
    const user = await User.findOne({ where: { email: userEmail } });
    
    if (!user) {
      console.log('❌ User not found with email:', userEmail);
      return;
    }
    
    console.log('📋 Current user details:');
    console.log('- Email:', user.email);
    console.log('- Current Role:', user.role);
    console.log('- Name:', user.firstName, user.lastName);
    
    // Update role to SuperAdmin
    await user.update({ role: 'SuperAdmin' });
    
    console.log('✅ User role updated to SuperAdmin');
    console.log('🔄 Please refresh your browser and try accessing admin pages again');
    
  } catch (error) {
    console.error('❌ Error updating user role:', error);
  } finally {
    process.exit(0);
  }
}

updateUserRole();