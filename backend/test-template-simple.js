/**
 * Simple Holiday Template Test
 * Test without audit logging
 */

import sequelize from './src/config/sequelize.js';
import { HolidaySelectionTemplate } from './src/models/index.js';

async function testSimple() {
  try {
    console.log('🧪 Simple Holiday Template Test...\n');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Test direct model creation
    console.log('\n📝 Creating template directly...');
    
    const template = await HolidaySelectionTemplate.create({
      name: 'Simple Test Template',
      description: 'Simple test without audit logging',
      country: 'IN',
      holidayTypes: ['national', 'religious'],
      selectedHolidays: ['Republic Day', 'Independence Day', 'Diwali'],
      maxHolidays: 10,
      isDefault: false,
      createdBy: 1
    });
    
    console.log('✅ Template created successfully:');
    console.log(`   ID: ${template.id}`);
    console.log(`   Name: ${template.name}`);
    console.log(`   Country: ${template.country}`);
    console.log(`   Holiday Types: ${template.holidayTypes.join(', ')}`);
    console.log(`   Selected Holidays: ${template.selectedHolidays.join(', ')}`);
    
    // Test retrieval
    console.log('\n📖 Retrieving template...');
    const retrieved = await HolidaySelectionTemplate.findByPk(template.id);
    
    if (retrieved) {
      console.log('✅ Template retrieved successfully:', retrieved.name);
    } else {
      console.log('❌ Failed to retrieve template');
    }
    
    // Test filtering logic
    console.log('\n🔄 Testing holiday filtering...');
    const mockHolidays = [
      { name: 'Republic Day', date: '2024-01-26', category: 'national' },
      { name: 'Independence Day', date: '2024-08-15', category: 'national' },
      { name: 'Diwali', date: '2024-11-01', category: 'religious' },
      { name: 'Christmas', date: '2024-12-25', category: 'religious' },
      { name: 'Holi', date: '2024-03-13', category: 'religious' }
    ];
    
    const selectedHolidayNames = template.selectedHolidays;
    const filteredHolidays = mockHolidays.filter(holiday => 
      selectedHolidayNames.includes(holiday.name)
    );
    
    console.log(`✅ Filtering works: ${filteredHolidays.length} holidays selected from ${mockHolidays.length} total`);
    console.log('   Selected holidays:');
    filteredHolidays.forEach(holiday => {
      console.log(`     - ${holiday.name} (${holiday.date})`);
    });
    
    console.log('\n🎉 Simple test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testSimple();