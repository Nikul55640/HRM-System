/**
 * Test script to verify Employee Calendar API returns all employees' data
 * This tests the EXACT data you mentioned from the admin side
 */

import fetch from 'node-fetch';

const testEmployeeCalendarAPI = async () => {
  try {
    console.log('🧪 Testing Employee Calendar API...');
    console.log('📋 Expected data from admin side:');
    console.log('   - Holidays: Makar Sankranti (Jan 14), Republic Day (Jan 26), Holi (Mar 4), etc.');
    console.log('   - Leaves: John Employee (Jan 12), Nikkl Prajap (Feb 4)');
    console.log('   - Birthdays: Nikhil Prajapati (Jan 31), John Employee (Feb 1), Nikkl Prajap (Sep 30)');
    console.log('   - Anniversaries: Nikkl Prajap (Oct 9)');
    console.log('');
    
    const baseURL = 'http://localhost:5000/api';
    
    // First, login as John (employee)
    console.log('🔐 Logging in as John (employee)...');
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'john@hrm.com',
        password: 'john123'
      })
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText} - ${errorText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful as John Employee');
    console.log(`   User ID: ${loginData.data.user?.id}`);
    console.log(`   Employee ID: ${loginData.data.user?.employeeId}`);
    console.log(`   Role: ${loginData.data.user?.role}`);
    
    const token = loginData.data.accessToken;
    
    // Test multiple months to check all the data you mentioned
    const monthsToTest = [
      { year: 2026, month: 1, name: 'January 2026', expectedEvents: ['Makar Sankranti (Jan 14)', 'Republic Day (Jan 26)', 'John Employee Leave (Jan 12)', 'Nikhil Prajapati Birthday (Jan 31)'] },
      { year: 2026, month: 2, name: 'February 2026', expectedEvents: ['John Employee Birthday (Feb 1)', 'Nikkl Prajap Leave (Feb 4)'] },
      { year: 2026, month: 3, name: 'March 2026', expectedEvents: ['Holi (Mar 4)'] },
      { year: 2026, month: 9, name: 'September 2026', expectedEvents: ['Nikkl Prajap Birthday (Sep 30)'] },
      { year: 2026, month: 10, name: 'October 2026', expectedEvents: ['Nikkl Prajap Anniversary (Oct 9)'] }
    ];

    for (const testMonth of monthsToTest) {
      console.log(`\n📅 Testing ${testMonth.name}...`);
      console.log(`   Expected: ${testMonth.expectedEvents.join(', ')}`);
      
      const monthlyResponse = await fetch(`${baseURL}/employee/calendar/monthly?year=${testMonth.year}&month=${testMonth.month}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!monthlyResponse.ok) {
        const errorText = await monthlyResponse.text();
        console.log(`❌ ${testMonth.name} API failed: ${monthlyResponse.status} ${monthlyResponse.statusText} - ${errorText}`);
        continue;
      }

      const monthlyData = await monthlyResponse.json();
      
      if (monthlyData.success && monthlyData.calendar) {
        const calendar = monthlyData.calendar;
        
        let totalHolidays = 0;
        let totalLeaves = 0;
        let totalBirthdays = 0;
        let totalAnniversaries = 0;
        let totalEvents = 0;
        
        const foundEvents = [];
        
        Object.entries(calendar).forEach(([day, dayData]) => {
          const holidays = dayData.holidays || [];
          const leaves = dayData.leaves || [];
          const birthdays = dayData.birthdays || [];
          const anniversaries = dayData.anniversaries || [];
          const events = dayData.events || [];
          
          totalHolidays += holidays.length;
          totalLeaves += leaves.length;
          totalBirthdays += birthdays.length;
          totalAnniversaries += anniversaries.length;
          totalEvents += events.length;
          
          // Record specific events we found
          holidays.forEach(h => foundEvents.push(`${dayData.date}: Holiday - ${h.name}`));
          leaves.forEach(l => foundEvents.push(`${dayData.date}: Leave - ${l.employeeName} (${l.leaveType})`));
          birthdays.forEach(b => foundEvents.push(`${dayData.date}: Birthday - ${b.employeeName}`));
          anniversaries.forEach(a => foundEvents.push(`${dayData.date}: Anniversary - ${a.employeeName} (${a.years || '?'} years)`));
          events.forEach(e => foundEvents.push(`${dayData.date}: Event - ${e.title}`));
        });
        
        console.log(`   ✅ API Response: ${Object.keys(calendar).length} days`);
        console.log(`   📊 Events found: ${totalHolidays} holidays, ${totalLeaves} leaves, ${totalBirthdays} birthdays, ${totalAnniversaries} anniversaries, ${totalEvents} events`);
        
        if (foundEvents.length > 0) {
          console.log(`   📋 Specific events found:`);
          foundEvents.forEach(event => console.log(`      - ${event}`));
        } else {
          console.log(`   ⚠️ No events found in ${testMonth.name}`);
        }
        
        // Check for specific expected events
        const monthStr = String(testMonth.month).padStart(2, '0');
        
        // Check specific dates based on your admin data
        if (testMonth.month === 1) {
          // January checks
          const jan14 = calendar['14'];
          const jan26 = calendar['26'];
          const jan12 = calendar['12'];
          const jan31 = calendar['31'];
          
          console.log(`   🔍 Specific date checks:`);
          console.log(`      Jan 14 (Makar Sankranti): ${jan14?.holidays?.length || 0} holidays - ${jan14?.holidays?.map(h => h.name).join(', ') || 'none'}`);
          console.log(`      Jan 26 (Republic Day): ${jan26?.holidays?.length || 0} holidays - ${jan26?.holidays?.map(h => h.name).join(', ') || 'none'}`);
          console.log(`      Jan 12 (John's Leave): ${jan12?.leaves?.length || 0} leaves - ${jan12?.leaves?.map(l => `${l.employeeName} (${l.leaveType})`).join(', ') || 'none'}`);
          console.log(`      Jan 31 (Nikhil's Birthday): ${jan31?.birthdays?.length || 0} birthdays - ${jan31?.birthdays?.map(b => b.employeeName).join(', ') || 'none'}`);
        }
        
        if (testMonth.month === 2) {
          // February checks
          const feb01 = calendar['1'];
          const feb04 = calendar['4'];
          
          console.log(`   🔍 Specific date checks:`);
          console.log(`      Feb 1 (John's Birthday): ${feb01?.birthdays?.length || 0} birthdays - ${feb01?.birthdays?.map(b => b.employeeName).join(', ') || 'none'}`);
          console.log(`      Feb 4 (Nikkl's Leave): ${feb04?.leaves?.length || 0} leaves - ${feb04?.leaves?.map(l => `${l.employeeName} (${l.leaveType})`).join(', ') || 'none'}`);
        }
        
        if (testMonth.month === 3) {
          // March checks
          const mar04 = calendar['4'];
          console.log(`   🔍 Specific date checks:`);
          console.log(`      Mar 4 (Holi): ${mar04?.holidays?.length || 0} holidays - ${mar04?.holidays?.map(h => h.name).join(', ') || 'none'}`);
        }
        
        if (testMonth.month === 9) {
          // September checks
          const sep30 = calendar['30'];
          console.log(`   🔍 Specific date checks:`);
          console.log(`      Sep 30 (Nikkl's Birthday): ${sep30?.birthdays?.length || 0} birthdays - ${sep30?.birthdays?.map(b => b.employeeName).join(', ') || 'none'}`);
        }
        
        if (testMonth.month === 10) {
          // October checks
          const oct09 = calendar['9'];
          console.log(`   🔍 Specific date checks:`);
          console.log(`      Oct 9 (Nikkl's Anniversary): ${oct09?.anniversaries?.length || 0} anniversaries - ${oct09?.anniversaries?.map(a => `${a.employeeName} (${a.years || '?'} years)`).join(', ') || 'none'}`);
        }
        
      } else {
        console.log(`❌ ${testMonth.name} API returned unsuccessful response`);
        console.log(`   Response:`, monthlyData);
      }
    }

    console.log('\n🎯 SUMMARY:');
    console.log('This test checks if the Employee Calendar API (when logged in as John Employee)');
    console.log('returns the same data that you see in the Admin Calendar.');
    console.log('');
    console.log('✅ If you see the expected events above, the Employee Calendar is working correctly');
    console.log('❌ If events are missing, there may be an issue with the API or data access');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure the backend server is running on http://localhost:5000');
      console.log('   Run: cd HRM-System/backend && npm run dev');
    }
    
    if (error.message.includes('Login failed')) {
      console.log('\n💡 Check if the user credentials are correct:');
      console.log('   Email: john@hrm.com');
      console.log('   Password: john123');
      console.log('   Make sure this user exists in the database');
    }
  }
};

// Run the test
testEmployeeCalendarAPI();