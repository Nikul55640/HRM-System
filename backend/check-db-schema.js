import sequelize from './src/config/sequelize.js';

async function checkDBSchema() {
  try {
    console.log('🔍 Checking database schema...\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');

    // Check the users table structure
    console.log('📋 Users table structure:');
    const tableInfo = await sequelize.query(
      'DESCRIBE users',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    tableInfo.forEach(column => {
      console.log(`   ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(NOT NULL)' : '(NULL)'} ${column.Default ? `DEFAULT: ${column.Default}` : ''}`);
    });

    // Check the role column specifically
    console.log('\n🎭 Role column details:');
    const roleColumn = tableInfo.find(col => col.Field === 'role');
    if (roleColumn) {
      console.log(`   Type: ${roleColumn.Type}`);
      console.log(`   Null: ${roleColumn.Null}`);
      console.log(`   Default: ${roleColumn.Default}`);
      console.log(`   Extra: ${roleColumn.Extra}`);
    }

    // Try to get the ENUM values
    console.log('\n📝 ENUM values for role column:');
    try {
      const enumInfo = await sequelize.query(
        "SHOW COLUMNS FROM users LIKE 'role'",
        { type: sequelize.QueryTypes.SELECT }
      );
      
      if (enumInfo.length > 0) {
        console.log(`   ${enumInfo[0].Type}`);
      }
    } catch (error) {
      console.log('   Could not retrieve ENUM values:', error.message);
    }

    // Try updating with a valid ENUM value
    console.log('\n🔄 Attempting to update HR user with valid ENUM value...');
    
    try {
      const result = await sequelize.query(
        "UPDATE users SET role = 'HR Administrator' WHERE email = 'hr@hrm.com'",
        { type: sequelize.QueryTypes.UPDATE }
      );
      console.log('✅ Update successful');
    } catch (updateError) {
      console.log('❌ Update failed:', updateError.message);
      
      // Try with SuperAdmin instead
      console.log('\n🔄 Trying to update to SuperAdmin...');
      try {
        await sequelize.query(
          "UPDATE users SET role = 'SuperAdmin' WHERE email = 'hr@hrm.com'",
          { type: sequelize.QueryTypes.UPDATE }
        );
        console.log('✅ SuperAdmin update successful');
      } catch (superAdminError) {
        console.log('❌ SuperAdmin update also failed:', superAdminError.message);
      }
    }

    // Check final state
    console.log('\n📋 Final user roles:');
    const finalUsers = await sequelize.query(
      'SELECT id, email, role FROM users ORDER BY id',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    finalUsers.forEach(user => {
      console.log(`   ${user.id}. ${user.email} - "${user.role}"`);
    });

  } catch (error) {
    console.error('❌ Error checking database schema:', error);
  } finally {
    await sequelize.close();
  }
}

checkDBSchema();