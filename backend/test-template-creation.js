/**
 * Test Holiday Template Creation
 * Simple test to verify the template system works
 */

import holidaySelectionTemplateService from './src/services/admin/holidaySelectionTemplate.service.js';
import sequelize from './src/config/sequelize.js';

async function testTemplateSystem() {
  try {
    console.log('🧪 Testing Holiday Selection Template System...\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Test 1: Create a template
    console.log('\n📝 Test 1: Creating a holiday template...');
    const templateData = {
      name: 'Test Company Holidays',
      description: 'Test template for company holidays',
      country: 'IN',
      holidayTypes: ['national', 'religious'],
      selectedHolidays: ['Republic Day', 'Independence Day', 'Diwali', 'Holi'],
      maxHolidays: 10,
      isDefault: false
    };
    
    const createResult = await holidaySelectionTemplateService.createTemplate(templateData, 1);
    
    if (createResult.success) {
      console.log('✅ Template created successfully:', createResult.data.name);
      console.log(`   ID: ${createResult.data.id}`);
      console.log(`   Country: ${createResult.data.country}`);
      console.log(`   Holiday Types: ${createResult.data.holidayTypes.join(', ')}`);
      console.log(`   Selected Holidays: ${createResult.data.selectedHolidays.join(', ')}`);
      
      const templateId = createResult.data.id;
      
      // Test 2: Get template by ID
      console.log('\n📖 Test 2: Retrieving template by ID...');
      const getResult = await holidaySelectionTemplateService.getTemplateById(templateId);
      
      if (getResult.success) {
        console.log('✅ Template retrieved successfully:', getResult.data.name);
      } else {
        console.log('❌ Failed to retrieve template:', getResult.message);
      }
      
      // Test 3: Get all templates
      console.log('\n📋 Test 3: Getting all templates...');
      const listResult = await holidaySelectionTemplateService.getTemplates();
      
      if (listResult.success) {
        console.log(`✅ Found ${listResult.data.templates.length} templates`);
        listResult.data.templates.forEach(template => {
          console.log(`   - ${template.name} (${template.country}): ${template.selectedHolidays.length} holidays`);
        });
      } else {
        console.log('❌ Failed to list templates:', listResult.message);
      }
      
      // Test 4: Apply template to holidays
      console.log('\n🔄 Test 4: Applying template to filter holidays...');
      const mockHolidays = [
        { name: 'Republic Day', date: '2024-01-26', category: 'national' },
        { name: 'Independence Day', date: '2024-08-15', category: 'national' },
        { name: 'Diwali', date: '2024-11-01', category: 'religious' },
        { name: 'Christmas', date: '2024-12-25', category: 'religious' },
        { name: 'Holi', date: '2024-03-13', category: 'religious' }
      ];
      
      const applyResult = await holidaySelectionTemplateService.applyTemplateToHolidays(templateId, mockHolidays);
      
      if (applyResult.success) {
        console.log('✅ Template applied successfully');
        console.log(`   Original holidays: ${applyResult.data.originalCount}`);
        console.log(`   Filtered holidays: ${applyResult.data.filteredCount}`);
        console.log('   Selected holidays:');
        applyResult.data.holidays.forEach(holiday => {
          console.log(`     - ${holiday.name} (${holiday.date})`);
        });
      } else {
        console.log('❌ Failed to apply template:', applyResult.message);
      }
      
      // Test 5: Update template
      console.log('\n✏️ Test 5: Updating template...');
      const updateResult = await holidaySelectionTemplateService.updateTemplate(templateId, {
        description: 'Updated test template description',
        maxHolidays: 8
      }, 1);
      
      if (updateResult.success) {
        console.log('✅ Template updated successfully');
        console.log(`   New description: ${updateResult.data.description}`);
        console.log(`   New max holidays: ${updateResult.data.maxHolidays}`);
      } else {
        console.log('❌ Failed to update template:', updateResult.message);
      }
      
      // Test 6: Clone template
      console.log('\n📋 Test 6: Cloning template...');
      const cloneResult = await holidaySelectionTemplateService.cloneTemplate(templateId, {
        name: 'Cloned Test Template',
        country: 'US',
        description: 'Cloned from test template'
      }, 1);
      
      if (cloneResult.success) {
        console.log('✅ Template cloned successfully:', cloneResult.data.name);
        console.log(`   Cloned ID: ${cloneResult.data.id}`);
        console.log(`   New country: ${cloneResult.data.country}`);
      } else {
        console.log('❌ Failed to clone template:', cloneResult.message);
      }
      
    } else {
      console.log('❌ Failed to create template:', createResult.message);
    }
    
    console.log('\n🎉 Holiday Template System Test Completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

testTemplateSystem();