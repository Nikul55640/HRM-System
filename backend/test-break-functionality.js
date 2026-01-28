/**
 * Break Functionality Test Script
 * Tests the complete break flow for user john@hrm.com
 * 
 * Usage: node test-break-functionality.js
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

// Load environment variables
config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const TEST_USER = {
  email: 'john@hrm.com',
  password: 'john123'
};

class BreakFunctionalityTester {
  constructor() {
    this.token = null;
    this.userId = null;
    this.employeeId = null;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers
    };

    console.log(`🔍 Making request to: ${endpoint}`);
    
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();
    
    console.log(`📊 Response (${response.status}):`, JSON.stringify(data, null, 2));
    
    return { response, data };
  }

  async login() {
    console.log('\n🔐 === AUTHENTICATION ===');
    
    const { response, data } = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(TEST_USER)
    });

    if (!response.ok || !data.success) {
      throw new Error(`Login failed: ${data.message}`);
    }

    this.token = data.data.accessToken;
    this.userId = data.data.user.id;
    this.employeeId = data.data.user.employee?.id;

    console.log(`✅ Login successful`);
    console.log(`   User ID: ${this.userId}`);
    console.log(`   Employee ID: ${this.employeeId}`);
    console.log(`   Role: ${data.data.user.role}`);
  }

  async getTodayAttendance() {
    console.log('\n📅 === TODAY\'S ATTENDANCE STATUS ===');
    
    const { response, data } = await this.makeRequest('/employee/attendance/today');

    if (!response.ok) {
      console.log('❌ Failed to get today\'s attendance');
      return null;
    }

    const record = data.data;
    console.log('📊 Today\'s Record Summary:');
    console.log(`   Clock In: ${record?.clockIn || 'Not clocked in'}`);
    console.log(`   Clock Out: ${record?.clockOut || 'Not clocked out'}`);
    console.log(`   Status: ${record?.status || 'Unknown'}`);
    console.log(`   Break Sessions: ${record?.breakSessions?.length || 0}`);
    
    if (record?.breakSessions?.length > 0) {
      console.log('   Break Details:');
      record.breakSessions.forEach((session, index) => {
        console.log(`     Break ${index + 1}: ${session.breakIn} - ${session.breakOut || 'ACTIVE'} (${session.duration || 0}m)`);
      });
    }

    return record;
  }

  async getButtonStates() {
    console.log('\n🔘 === BUTTON STATES ===');
    
    const { response, data } = await this.makeRequest('/employee/attendance/button-states');

    if (!response.ok) {
      console.log('❌ Failed to get button states');
      return null;
    }

    const states = data.data;
    console.log('🔘 Button States:');
    console.log(`   Clock In: ${states.clockIn.enabled ? '✅ Enabled' : '❌ Disabled'} - ${states.clockIn.reason || 'No reason'}`);
    console.log(`   Clock Out: ${states.clockOut.enabled ? '✅ Enabled' : '❌ Disabled'} - ${states.clockOut.reason || 'No reason'}`);
    console.log(`   Start Break: ${states.startBreak.enabled ? '✅ Enabled' : '❌ Disabled'} - ${states.startBreak.reason || 'No reason'}`);
    console.log(`   End Break: ${states.endBreak.enabled ? '✅ Enabled' : '❌ Disabled'} - ${states.endBreak.reason || 'No reason'}`);
    console.log(`   Current Status: ${states.currentStatus}`);
    console.log(`   Is On Break: ${states.isOnBreak ? 'Yes' : 'No'}`);

    return states;
  }

  async testBreakStart() {
    console.log('\n🟢 === TESTING BREAK START ===');
    
    const { response, data } = await this.makeRequest('/employee/attendance/break-in', {
      method: 'POST'
    });

    if (response.ok && data.success) {
      console.log('✅ Break started successfully');
      console.log(`   Message: ${data.message}`);
      if (data.data) {
        console.log(`   Break Session ID: ${data.data.breakSessionId || 'Not provided'}`);
        console.log(`   Break Start Time: ${data.data.breakStartTime || 'Not provided'}`);
      }
    } else {
      console.log('❌ Break start failed');
      console.log(`   Error: ${data.message}`);
    }

    return { success: response.ok && data.success, data };
  }

  async testBreakEnd() {
    console.log('\n🔴 === TESTING BREAK END ===');
    
    const { response, data } = await this.makeRequest('/employee/attendance/break-out', {
      method: 'POST'
    });

    if (response.ok && data.success) {
      console.log('✅ Break ended successfully');
      console.log(`   Message: ${data.message}`);
      if (data.data) {
        console.log(`   Break Duration: ${data.data.breakDuration || 'Not provided'} minutes`);
        console.log(`   Break End Time: ${data.data.breakEndTime || 'Not provided'}`);
      }
    } else {
      console.log('❌ Break end failed');
      console.log(`   Error: ${data.message}`);
    }

    return { success: response.ok && data.success, data };
  }

  async testCompleteBreakFlow() {
    console.log('\n🔄 === COMPLETE BREAK FLOW TEST ===');
    
    // Step 1: Check initial state
    console.log('\n📋 Step 1: Initial State Check');
    const initialRecord = await this.getTodayAttendance();
    const initialStates = await this.getButtonStates();

    if (!initialRecord?.clockIn) {
      console.log('❌ User is not clocked in. Please clock in first.');
      return;
    }

    if (!initialStates?.startBreak?.enabled) {
      console.log('❌ Cannot start break. Reason:', initialStates.startBreak.reason);
      return;
    }

    // Step 2: Start break
    console.log('\n📋 Step 2: Starting Break');
    const breakStartResult = await this.testBreakStart();
    
    if (!breakStartResult.success) {
      console.log('❌ Break start failed, stopping test');
      return;
    }

    // Step 3: Wait a moment and check state
    console.log('\n📋 Step 3: Checking State After Break Start');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    const afterStartRecord = await this.getTodayAttendance();
    const afterStartStates = await this.getButtonStates();

    // Verify break is active
    const activeBreak = afterStartRecord?.breakSessions?.find(s => s.breakIn && !s.breakOut);
    if (activeBreak) {
      console.log('✅ Break is active');
      console.log(`   Break started at: ${activeBreak.breakIn}`);
    } else {
      console.log('❌ Break is not showing as active in the record');
    }

    if (afterStartStates?.isOnBreak) {
      console.log('✅ Button states show user is on break');
    } else {
      console.log('❌ Button states do not show user is on break');
    }

    // Step 4: End break
    console.log('\n📋 Step 4: Ending Break');
    
    if (!afterStartStates?.endBreak?.enabled) {
      console.log('❌ Cannot end break. Reason:', afterStartStates.endBreak.reason);
      return;
    }

    const breakEndResult = await this.testBreakEnd();
    
    if (!breakEndResult.success) {
      console.log('❌ Break end failed');
      return;
    }

    // Step 5: Final state check
    console.log('\n📋 Step 5: Final State Check');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    const finalRecord = await this.getTodayAttendance();
    const finalStates = await this.getButtonStates();

    // Verify break is ended
    const completedBreaks = finalRecord?.breakSessions?.filter(s => s.breakIn && s.breakOut) || [];
    const activeBreakFinal = finalRecord?.breakSessions?.find(s => s.breakIn && !s.breakOut);

    console.log(`✅ Completed breaks: ${completedBreaks.length}`);
    console.log(`${activeBreakFinal ? '❌' : '✅'} Active breaks: ${activeBreakFinal ? '1' : '0'}`);

    if (finalStates?.isOnBreak) {
      console.log('❌ Button states still show user is on break');
    } else {
      console.log('✅ Button states show user is not on break');
    }

    console.log('\n🎯 === BREAK FLOW TEST COMPLETE ===');
  }

  async debugBreakSessions() {
    console.log('\n🔍 === BREAK SESSIONS DEBUG ===');
    
    const record = await this.getTodayAttendance();
    
    if (!record) {
      console.log('❌ No attendance record found');
      return;
    }

    console.log('🔍 Raw Break Sessions Data:');
    console.log(JSON.stringify(record.breakSessions, null, 2));

    console.log('\n🔍 Break Sessions Analysis:');
    const breakSessions = record.breakSessions || [];
    
    breakSessions.forEach((session, index) => {
      console.log(`\n   Break Session ${index + 1}:`);
      console.log(`     Break In: ${session.breakIn}`);
      console.log(`     Break Out: ${session.breakOut || 'ACTIVE'}`);
      console.log(`     Duration: ${session.duration || 0} minutes`);
      console.log(`     Is Active: ${session.breakIn && !session.breakOut ? 'Yes' : 'No'}`);
    });

    const activeBreaks = breakSessions.filter(s => s.breakIn && !s.breakOut);
    const completedBreaks = breakSessions.filter(s => s.breakIn && s.breakOut);

    console.log(`\n📊 Summary:`);
    console.log(`   Total Break Sessions: ${breakSessions.length}`);
    console.log(`   Active Breaks: ${activeBreaks.length}`);
    console.log(`   Completed Breaks: ${completedBreaks.length}`);
    console.log(`   Total Break Time: ${record.totalBreakMinutes || 0} minutes`);
  }

  async run() {
    try {
      console.log('🚀 Starting Break Functionality Test');
      console.log('=====================================');

      await this.login();
      await this.getTodayAttendance();
      await this.getButtonStates();
      await this.debugBreakSessions();
      
      // Ask user what they want to test
      console.log('\n🤔 What would you like to test?');
      console.log('1. Complete break flow (start + end)');
      console.log('2. Start break only');
      console.log('3. End break only');
      console.log('4. Debug break sessions only');
      
      // For now, let's run the complete flow
      await this.testCompleteBreakFlow();

    } catch (error) {
      console.error('💥 Test failed:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the test
const tester = new BreakFunctionalityTester();
tester.run();