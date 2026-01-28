/**
 * Complete Break Flow Test
 * Test start break -> end break -> start break -> end break
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function testCompleteBreakFlow() {
  try {
    console.log('🔄 Testing Complete Break Flow');
    console.log('===============================');

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

    // Step 2: Check initial status
    console.log('\n📊 Step 2: Check initial status...');
    const statusResponse = await fetch(`${API_BASE_URL}/employee/attendance/today`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const statusData = await statusResponse.json();
    console.log('Initial break sessions:', JSON.stringify(statusData.data?.breakSessions, null, 2));

    // Step 3: Start a new break
    console.log('\n🟢 Step 3: Start new break...');
    const startBreakResponse = await fetch(`${API_BASE_URL}/employee/attendance/break-in`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const startBreakData = await startBreakResponse.json();
    console.log(`Start break response: ${startBreakResponse.status}`);
    console.log('Start break data:', JSON.stringify(startBreakData, null, 2));

    if (!startBreakData.success) {
      console.log('❌ Failed to start break:', startBreakData.message);
      return;
    }

    console.log('✅ Break started successfully');

    // Step 4: Verify break started
    console.log('\n📊 Step 4: Verify break started...');
    const verifyStartResponse = await fetch(`${API_BASE_URL}/employee/attendance/today`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const verifyStartData = await verifyStartResponse.json();
    console.log('After start - break sessions:', JSON.stringify(verifyStartData.data?.breakSessions, null, 2));

    const activeBreak = verifyStartData.data?.breakSessions?.find(s => s.breakIn && !s.breakOut);
    if (activeBreak) {
      console.log('✅ Active break confirmed:', activeBreak.breakIn);
    } else {
      console.log('❌ No active break found after start');
      return;
    }

    // Step 5: Wait a moment then end break
    console.log('\n⏳ Step 5: Wait 2 seconds then end break...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const endBreakResponse = await fetch(`${API_BASE_URL}/employee/attendance/break-out`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const endBreakData = await endBreakResponse.json();
    console.log(`End break response: ${endBreakResponse.status}`);
    console.log('End break message:', endBreakData.message);

    if (!endBreakData.success) {
      console.log('❌ Failed to end break:', endBreakData.message);
      return;
    }

    console.log('✅ Break ended successfully');

    // Step 6: Final verification
    console.log('\n📊 Step 6: Final verification...');
    const finalResponse = await fetch(`${API_BASE_URL}/employee/attendance/today`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const finalData = await finalResponse.json();
    console.log('Final break sessions:', JSON.stringify(finalData.data?.breakSessions, null, 2));

    const stillActiveBreak = finalData.data?.breakSessions?.find(s => s.breakIn && !s.breakOut);
    if (stillActiveBreak) {
      console.log('❌ Break is still active - end break failed');
    } else {
      console.log('✅ Break successfully ended - no active breaks found');
      
      // Count completed breaks
      const completedBreaks = finalData.data?.breakSessions?.filter(s => s.breakIn && s.breakOut) || [];
      console.log(`✅ Total completed breaks today: ${completedBreaks.length}`);
    }

    console.log('\n🎉 Complete break flow test completed!');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testCompleteBreakFlow();