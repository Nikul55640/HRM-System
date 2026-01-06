/**
 * Attendance Debug Utilities
 * Helper functions to debug attendance and break functionality
 */

import api from '../services/api';

export const attendanceDebugger = {
  /**
   * Test break functionality
   */
  async testBreakFlow() {
    console.log('🧪 [ATTENDANCE DEBUGGER] Starting break flow test...');
    
    try {
      // 1. Get current attendance status
      console.log('📊 Step 1: Getting current attendance status...');
      const todayResponse = await api.get('/employee/attendance/today');
      console.log('📊 Today response:', todayResponse.data);
      
      if (!todayResponse.data?.success) {
        console.error('❌ Failed to get today\'s attendance');
        return;
      }
      
      const todayRecord = todayResponse.data.data;
      console.log('📊 Today record:', todayRecord);
      
      // 2. Check if clocked in
      if (!todayRecord?.clockIn || todayRecord?.clockOut) {
        console.error('❌ Not clocked in or already clocked out');
        return;
      }
      
      // 3. Check current break status
      const activeBreak = todayRecord.breakSessions?.find(s => s.breakIn && !s.breakOut);
      console.log('☕ Active break:', activeBreak);
      
      if (activeBreak) {
        // End the current break
        console.log('🔄 Step 2: Ending current break...');
        const endBreakResponse = await api.post('/employee/attendance/break-out');
        console.log('🔄 End break response:', endBreakResponse.data);
      } else {
        // Start a new break
        console.log('▶️ Step 2: Starting new break...');
        const startBreakResponse = await api.post('/employee/attendance/break-in');
        console.log('▶️ Start break response:', startBreakResponse.data);
      }
      
      // 4. Get updated status
      console.log('🔄 Step 3: Getting updated status...');
      const updatedResponse = await api.get('/employee/attendance/today');
      console.log('🔄 Updated response:', updatedResponse.data);
      
      console.log('✅ Break flow test completed');
      
    } catch (error) {
      console.error('❌ Break flow test failed:', error);
      console.error('❌ Error details:', error.response?.data);
    }
  },

  /**
   * Test attendance data fetching
   */
  async testDataFetching() {
    console.log('🧪 [ATTENDANCE DEBUGGER] Starting data fetching test...');
    
    try {
      // Test today's attendance
      console.log('📊 Testing today\'s attendance...');
      const todayResponse = await api.get('/employee/attendance/today');
      console.log('📊 Today response:', todayResponse.data);
      
      // Test attendance records
      console.log('📊 Testing attendance records...');
      const recordsResponse = await api.get('/employee/attendance', {
        params: { month: new Date().getMonth() + 1, year: new Date().getFullYear() }
      });
      console.log('📊 Records response:', recordsResponse.data);
      
      // Test monthly summary
      console.log('📊 Testing monthly summary...');
      const summaryResponse = await api.get(`/employee/attendance/summary/${new Date().getFullYear()}/${new Date().getMonth() + 1}`);
      console.log('📊 Summary response:', summaryResponse.data);
      
      console.log('✅ Data fetching test completed');
      
    } catch (error) {
      console.error('❌ Data fetching test failed:', error);
      console.error('❌ Error details:', error.response?.data);
    }
  },

  /**
   * Analyze attendance store state
   */
  analyzeStoreState(store) {
    console.log('🧪 [ATTENDANCE DEBUGGER] Analyzing store state...');
    
    const state = store.getState();
    console.log('🏪 Store state:', state);
    
    const status = store.getState().getAttendanceStatus();
    console.log('📊 Attendance status:', status);
    
    // Check for common issues
    const issues = [];
    
    if (!state.todayRecord) {
      issues.push('No today record loaded');
    }
    
    if (state.error) {
      issues.push(`Store error: ${state.error}`);
    }
    
    if (!state.initialized) {
      issues.push('Store not initialized');
    }
    
    if (state.todayRecord && !state.todayRecord.breakSessions) {
      issues.push('No breakSessions array in today record');
    }
    
    if (issues.length > 0) {
      console.warn('Issues found:', issues);
    } else {
      console.log('✅ Store state looks good');
    }
    
    return { state, status, issues };
  },

  /**
   * Test API endpoints directly
   */
  async testEndpoints() {
    console.log('🧪 [ATTENDANCE DEBUGGER] Testing API endpoints...');
    
    const endpoints = [
      { method: 'GET', url: '/employee/attendance/today', name: 'Today\'s Attendance' },
      { method: 'GET', url: '/employee/attendance', name: 'Attendance Records' },
      { method: 'GET', url: '/employee/attendance/summary', name: 'Attendance Summary' },
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Testing ${endpoint.name}...`);
        const response = await api[endpoint.method.toLowerCase()](endpoint.url);
        console.log(`✅ ${endpoint.name}:`, response.data);
      } catch (error) {
        console.error(`❌ ${endpoint.name} failed:`, error.response?.data || error.message);
      }
    }
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.attendanceDebugger = attendanceDebugger;
}

export default attendanceDebugger;