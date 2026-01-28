/**
 * Test Clock Out Issue
 * Check why clock out is not working
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function testClockOutIssue() {
  try {
    console.log('🔍 Testing Clock Out Issue');
    console.log('===========================');

    // Step 1: Login
    console.log('\n🔐 Step 1: Login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john@hrm.com',
        password: 'john123'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error('Login failed: ' + loginData.message);
    }

    const token = loginData.data.accessToken;
    console.log('✅ Login successful');

    // Step 2: Check current attendance status
    console.log('\n📊 Step 2: Check current attendance status...');
    const statusResponse = await fetch(`${API_BASE_URL}/employee/attendance/today`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const statusData = await statusResponse.json();
    console.log('Current attendance record:', JSON.stringify(statusData.data, null, 2));

    if (!statusData.data) {
      console.log('❌ No attendance record found for today');
      return;
    }

    const record = statusData.data;
    console.log('\n📋 Attendance Analysis:');
    console.log('- Clock In:', record.clockIn ? new Date(record.clockIn).toLocaleString() : 'Not clocked in');
    console.log('- Clock Out:', record.clockOut ? new Date(record.clockOut).toLocaleString() : 'Not clocked out');
    console.log('- Status:', record.status);
    console.log('- Break Sessions:', record.breakSessions?.length || 0);
    
    // Check for active breaks
    const activeBreak = record.breakSessions?.find(s => s.breakIn && !s.breakOut);
    if (activeBreak) {
      console.log('- Active Break:', 'YES - Started at', new Date(activeBreak.breakIn).toLocaleString());
    } else {
      console.log('- Active Break:', 'NO');
    }

    // Step 3: Check button states
    console.log('\n🔘 Step 3: Check button states...');
    const buttonResponse = await fetch(`${API_BASE_URL}/employee/attendance/button-states`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const buttonData = await buttonResponse.json();
    console.log('Button states:', JSON.stringify(buttonData.data, null, 2));

    // Step 4: Try to clock out
    console.log('\n🔴 Step 4: Attempting to clock out...');
    const clockOutResponse = await fetch(`${API_BASE_URL}/employee/attendance/clock-out`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const clockOutData = await clockOutResponse.json();
    console.log(`Clock out response status: ${clockOutResponse.status}`);
    console.log('Clock out response:', JSON.stringify(clockOutData, null, 2));

    if (clockOutData.success) {
      console.log('✅ Clock out successful!');
    } else {
      console.log('❌ Clock out failed:', clockOutData.message);
      console.log('Error details:', clockOutData.error);
    }

    // Step 5: Final verification
    console.log('\n📊 Step 5: Final verification...');
    const finalResponse = await fetch(`${API_BASE_URL}/employee/attendance/today`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const finalData = await finalResponse.json();
    const finalRecord = finalData.data;
    
    if (finalRecord) {
      console.log('Final status:');
      console.log('- Clock In:', finalRecord.clockIn ? new Date(finalRecord.clockIn).toLocaleString() : 'Not clocked in');
      console.log('- Clock Out:', finalRecord.clockOut ? new Date(finalRecord.clockOut).toLocaleString() : 'Not clocked out');
      console.log('- Status:', finalRecord.status);
      console.log('- Work Hours:', finalRecord.workHours);
      console.log('- Total Worked Minutes:', finalRecord.totalWorkedMinutes);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testClockOutIssue();