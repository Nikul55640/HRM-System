/**
 * Test script to verify birthday data in the employee dashboard
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Test credentials (adjust as needed)
const TEST_CREDENTIALS = {
  email: 'john@hrm.com',
  password: 'john123'
};

async function testBirthdayData() {
  try {
    console.log('🎂 Testing Birthday Data...\n');

    // 1. Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, TEST_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.accesstoken;
    console.log('✅ Login successful');

    // 2. Test employee calendar monthly endpoint for current month
    console.log('\n2. Testing current month calendar...');
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const currentMonthResponse = await axios.get(
      `${API_BASE_URL}/employee/calendar/monthly?year=${currentYear}&month=${currentMonth}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('Current month response:', currentMonthResponse.data.success);
    
    // Count birthdays in current month
    let currentMonthBirthdays = 0;
    if (currentMonthResponse.data.success && currentMonthResponse.data.calendar) {
      Object.values(currentMonthResponse.data.calendar).forEach(day => {
        if (day.birthdays && day.birthdays.length > 0) {
          currentMonthBirthdays += day.birthdays.length;
          console.log(`📅 ${day.date}: ${day.birthdays.length} birthday(s)`);
          day.birthdays.forEach(b => {
            console.log(`   - ${b.employeeName}: ${b.title}`);
          });
        }
      });
    }
    console.log(`✅ Current month (${currentYear}-${currentMonth}) has ${currentMonthBirthdays} birthdays`);

    // 3. Test next month
    console.log('\n3. Testing next month calendar...');
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    const nextMonthResponse = await axios.get(
      `${API_BASE_URL}/employee/calendar/monthly?year=${nextYear}&month=${nextMonth}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('Next month response:', nextMonthResponse.data.success);
    
    // Count birthdays in next month
    let nextMonthBirthdays = 0;
    if (nextMonthResponse.data.success && nextMonthResponse.data.calendar) {
      Object.values(nextMonthResponse.data.calendar).forEach(day => {
        if (day.birthdays && day.birthdays.length > 0) {
          nextMonthBirthdays += day.birthdays.length;
          console.log(`📅 ${day.date}: ${day.birthdays.length} birthday(s)`);
          day.birthdays.forEach(b => {
            console.log(`   - ${b.employeeName}: ${b.title}`);
          });
        }
      });
    }
    console.log(`✅ Next month (${nextYear}-${nextMonth}) has ${nextMonthBirthdays} birthdays`);

    // 4. Test a month with known birthdays (March - from seed data)
    console.log('\n4. Testing March 2026 (known birthday month)...');
    const marchResponse = await axios.get(
      `${API_BASE_URL}/employee/calendar/monthly?year=2026&month=3`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('March response:', marchResponse.data.success);
    
    let marchBirthdays = 0;
    if (marchResponse.data.success && marchResponse.data.calendar) {
      Object.values(marchResponse.data.calendar).forEach(day => {
        if (day.birthdays && day.birthdays.length > 0) {
          marchBirthdays += day.birthdays.length;
          console.log(`📅 ${day.date}: ${day.birthdays.length} birthday(s)`);
          day.birthdays.forEach(b => {
            console.log(`   - ${b.employeeName}: ${b.title}`);
          });
        }
      });
    }
    console.log(`✅ March 2026 has ${marchBirthdays} birthdays`);

    // 5. Summary
    console.log('\n📊 SUMMARY:');
    console.log(`Current month birthdays: ${currentMonthBirthdays}`);
    console.log(`Next month birthdays: ${nextMonthBirthdays}`);
    console.log(`March 2026 birthdays: ${marchBirthdays}`);
    console.log(`Total upcoming birthdays (current + next): ${currentMonthBirthdays + nextMonthBirthdays}`);

    if (currentMonthBirthdays + nextMonthBirthdays === 0) {
      console.log('\n❌ ISSUE FOUND: No birthdays in current or next month!');
      console.log('💡 SOLUTION: The getUpcomingBirthdays function should look at more months or show birthdays from the entire year.');
    } else if (currentMonthBirthdays + nextMonthBirthdays === 1) {
      console.log('\n⚠️  ISSUE FOUND: Only 1 birthday in current or next month!');
      console.log('💡 SOLUTION: The function should look at more months to show multiple birthdays.');
    } else {
      console.log('\n✅ Multiple birthdays found in upcoming months.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testBirthdayData();