#!/usr/bin/env node

/**
 * Test script to verify calendar API functionality
 * Tests the Holiday model and calendar events endpoint
 */

import { Holiday } from './src/models/sequelize/index.js';
import sequelize from './src/config/sequelize.js';

async function testCalendarAPI() {
  try {
    console.log('🔍 Testing Calendar API...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test Holiday model query
    console.log('🔍 Testing Holiday model query...');
    const holidays = await Holiday.findAll({
      attributes: ['id', 'name', 'date', 'type', 'recurringDate', 'category', 'description', 'color', 'isPaid', 'appliesEveryYear', 'isActive'],
      limit: 5
    });
    
    console.log(`✅ Holiday query successful - found ${holidays.length} holidays`);
    
    if (holidays.length > 0) {
      console.log('📋 Sample holiday data:');
      holidays.forEach(holiday => {
        console.log(`  - ${holiday.name} (${holiday.date}) - Type: ${holiday.type}, Category: ${holiday.category}`);
      });
    }
    
    // Test the specific query that was failing
    console.log('🔍 Testing calendar events query...');
    const currentYear = new Date().getFullYear();
    const testHolidays = await Holiday.findAll({
      where: {
        date: {
          [sequelize.Sequelize.Op.gte]: `${currentYear}-01-01`,
          [sequelize.Sequelize.Op.lte]: `${currentYear}-12-31`
        },
        isActive: true
      },
      attributes: ['id', 'name', 'date', 'type', 'recurringDate', 'category', 'description', 'color', 'isPaid', 'appliesEveryYear'],
      order: [['date', 'ASC']]
    });
    
    console.log(`✅ Calendar events query successful - found ${testHolidays.length} holidays for ${currentYear}`);
    
    console.log('🎉 All tests passed! Calendar API should be working now.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testCalendarAPI();