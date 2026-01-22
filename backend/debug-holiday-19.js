/**
 * Debug Holiday ID 19 Issue
 * Investigate the recurring date validation error
 */

import { Holiday } from './src/models/index.js';

async function debugHoliday19() {
  try {
    console.log('🔍 Debugging Holiday ID 19...\n');
    
    // Get the holiday from database
    const holiday = await Holiday.findByPk(19);
    
    if (!holiday) {
      console.log('❌ Holiday with ID 19 not found');
      return;
    }
    
    console.log('📋 Current Holiday Data:');
    console.log('ID:', holiday.id);
    console.log('Name:', holiday.name);
    console.log('Type:', holiday.type);
    console.log('Date:', holiday.date);
    console.log('Recurring Date:', holiday.recurringDate);
    console.log('Category:', holiday.category);
    console.log('Description:', holiday.description);
    console.log('Is Paid:', holiday.isPaid);
    console.log('Color:', holiday.color);
    console.log('Is Active:', holiday.isActive);
    console.log('Applies Every Year:', holiday.appliesEveryYear);
    
    console.log('\n🔍 Validation Analysis:');
    
    if (holiday.type === 'RECURRING') {
      console.log('✅ Holiday is RECURRING type');
      
      if (holiday.recurringDate) {
        console.log('✅ Recurring date exists:', holiday.recurringDate);
        
        // Test the regex validation
        const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
        const isValidFormat = regex.test(holiday.recurringDate);
        console.log('✅ Format validation (MM-DD):', isValidFormat ? 'PASS' : 'FAIL');
        
        if (isValidFormat) {
          // Test actual date validity
          const [month, day] = holiday.recurringDate.split('-').map(Number);
          const testDate = new Date(2024, month - 1, day);
          const isValidDate = testDate.getMonth() === month - 1 && testDate.getDate() === day;
          console.log('✅ Date validity:', isValidDate ? 'PASS' : 'FAIL');
          
          if (isValidDate) {
            console.log('✅ Preview:', testDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }));
          }
        }
      } else {
        console.log('❌ Recurring date is missing or null');
      }
      
      if (holiday.date) {
        console.log('⚠️ WARNING: Recurring holiday has a specific date (should be null)');
      }
    } else if (holiday.type === 'ONE_TIME') {
      console.log('✅ Holiday is ONE_TIME type');
      
      if (holiday.date) {
        console.log('✅ Date exists:', holiday.date);
      } else {
        console.log('❌ Date is missing for one-time holiday');
      }
      
      if (holiday.recurringDate) {
        console.log('⚠️ WARNING: One-time holiday has recurring date (should be null)');
      }
    }
    
    console.log('\n🧪 Testing Update Payload:');
    
    // Simulate what the frontend might be sending
    const testPayload = {
      name: holiday.name,
      type: holiday.type,
      category: holiday.category,
      description: holiday.description,
      isPaid: holiday.isPaid,
      color: holiday.color,
      appliesEveryYear: holiday.type === 'RECURRING',
      isActive: true
    };
    
    if (holiday.type === 'ONE_TIME') {
      testPayload.date = holiday.date;
      testPayload.recurringDate = null;
    } else {
      testPayload.recurringDate = holiday.recurringDate;
      testPayload.date = null;
    }
    
    console.log('📤 Test payload:');
    console.log(JSON.stringify(testPayload, null, 2));
    
    // Test the service validation logic
    console.log('\n🔬 Service Validation Test:');
    
    if (testPayload.type === 'RECURRING' && !testPayload.recurringDate) {
      console.log('❌ VALIDATION FAIL: Recurring holidays must have a recurring date in MM-DD format');
    } else if (testPayload.type === 'ONE_TIME' && !testPayload.date) {
      console.log('❌ VALIDATION FAIL: One-time holidays must have a date');
    } else {
      console.log('✅ VALIDATION PASS: Payload should be valid');
    }
    
  } catch (error) {
    console.error('💥 Error debugging holiday:', error);
  }
}

debugHoliday19();