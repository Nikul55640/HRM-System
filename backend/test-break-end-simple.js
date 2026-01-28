/**
 * Simple Break End Test
 * Test the break-out endpoint directly
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function testBreakEnd() {
  try {
    console.log('🔴 Testing Break End Functionality');
    console.log('==================================');

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

    // Step 2: Check current status
    console.log('\n📊 Step 2: Check current attendance status...');
    const statusResponse = await fetch(`${API_BASE_URL}/employee/attendance/today`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const statusData = await statusResponse.json();
    console.log('Current break sessions:', JSON.stringify(statusData.data?.breakSessions, null, 2));

    const activeBreak = statusData.data?.breakSessions?.find(s => s.breakIn && !s.breakOut);
    if (activeBreak) {
      console.log('✅ Found active break:', activeBreak.breakIn);
    } else {
      console.log('❌ No active break found');
      return;
    }

    // Step 3: Test break-out endpoint
    console.log('\n🔴 Step 3: Testing break-out endpoint...');
    const breakOutResponse = await fetch(`${API_BASE_URL}/employee/attendance/break-out`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const breakOutData = await breakOutResponse.json();
    
    console.log(`Response Status: ${breakOutResponse.status}`);
    console.log('Response Data:', JSON.stringify(breakOutData, null, 2));

    if (breakOutData.success) {
      console.log('✅ Break ended successfully!');
      console.log('Message:', breakOutData.message);
      
      // Step 4: Verify the break was ended
      console.log('\n📊 Step 4: Verify break was ended...');
      const verifyResponse = await fetch(`${API_BASE_URL}/employee/attendance/today`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const verifyData = await verifyResponse.json();
      console.log('Updated break sessions:', JSON.stringify(verifyData.data?.breakSessions, null, 2));

      const stillActiveBreak = verifyData.data?.breakSessions?.find(s => s.breakIn && !s.breakOut);
      if (stillActiveBreak) {
        console.log('❌ Break is still active - end break failed');
      } else {
        console.log('✅ Break successfully ended - no active breaks found');
      }

    } else {
      console.log('❌ Break end failed');
      console.log('Error:', breakOutData.message);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testBreakEnd();