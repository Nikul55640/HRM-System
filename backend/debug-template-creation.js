import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('hrm2', 'root', '123', {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log
});

async function debugTemplateCreation() {
  try {
    console.log('🔍 Debugging template creation...');
    
    // 1. Check if holiday_selection_templates table exists
    console.log('\n1. Checking if holiday_selection_templates table exists...');
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'holiday_selection_templates'");
    console.log('Table exists:', tables.length > 0);
    
    if (tables.length === 0) {
      console.log('❌ Table does not exist! Need to run migration.');
      await sequelize.close();
      return;
    }
    
    // 2. Check table structure
    console.log('\n2. Checking table structure...');
    const [columns] = await sequelize.query("DESCRIBE holiday_selection_templates");
    console.log('Table columns:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? col.Key : ''}`);
    });
    
    // 3. Check existing templates
    console.log('\n3. Checking existing templates...');
    const [templates] = await sequelize.query("SELECT * FROM holiday_selection_templates");
    console.log(`Found ${templates.length} existing templates:`);
    templates.forEach(template => {
      console.log(`  - ${template.name} (${template.country})`);
    });
    
    // 4. Test template creation with minimal data
    console.log('\n4. Testing template creation...');
    try {
      const [result] = await sequelize.query(`
        INSERT INTO holiday_selection_templates 
        (name, description, country, holidayTypes, selectedHolidays, maxHolidays, isDefault, isActive, createdBy, createdAt, updatedAt)
        VALUES 
        ('Test Template', 'Test Description', 'IN', '["national"]', '["Republic Day", "Independence Day"]', 10, false, true, 1, NOW(), NOW())
      `);
      console.log('✅ Direct SQL insert successful:', result);
      
      // Clean up test record
      await sequelize.query("DELETE FROM holiday_selection_templates WHERE name = 'Test Template'");
      console.log('✅ Test record cleaned up');
      
    } catch (insertError) {
      console.log('❌ Direct SQL insert failed:', insertError.message);
    }
    
    // 5. Check User table for foreign key
    console.log('\n5. Checking User table...');
    const [users] = await sequelize.query("SELECT id, email, role FROM users WHERE id = 1");
    console.log('User with id=1:', users[0] || 'Not found');
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugTemplateCreation();