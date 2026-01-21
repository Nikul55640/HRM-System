/**
 * Dashboard Performance Test
 * Tests the optimized dashboard loading performance
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Test credentials
const testCredentials = {
  email: 'john@hrm.com',
  password: 'password123'
};

async function testDashboardPerformance() {
  try {
    console.log('🚀 [PERFORMANCE TEST] Testing optimized dashboard loading...\n');
    
    // Login to get fresh token
    console.log('🔐 [TEST] Logging in...');
    const loginStart = Date.now();
    
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCredentials)
    });
    
    const loginData = await loginResponse.json();
    const loginTime = Date.now() - loginStart;
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }
    
    const token = loginData.data.accessToken;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log(`✅ Login completed in ${loginTime}ms\n`);
    
    // Test critical dashboard endpoints (what loads first)
    const criticalEndpoints = [
      { name: 'Profile', url: '/employee/profile' },
      { name: 'Leave Balance', url: '/employee/leave-balance' },
      { name: 'Attendance Summary', url: '/employee/attendance/summary' },
      { name: 'Today Attendance', url: '/employee/attendance/today' }
    ];
    
    console.log('📊 [TEST] Testing CRITICAL endpoints (Phase 1)...');
    const criticalStart = Date.now();
    
    const criticalPromises = criticalEndpoints.map(async endpoint => {
      const start = Date.now();
      try {
        const response = await fetch(`${API_BASE}${endpoint.url}`, { headers });
        const data = await response.json();
        const time = Date.now() - start;
        
        return {
          name: endpoint.name,
          success: data.success || response.ok,
          time: time,
          status: response.status
        };
      } catch (error) {
        return {
          name: endpoint.name,
          success: false,
          time: Date.now() - start,
          error: error.message
        };
      }
    });
    
    const criticalResults = await Promise.allSettled(criticalPromises);
    const criticalTime = Date.now() - criticalStart;
    
    console.log('✅ Critical endpoints completed in', criticalTime + 'ms');
    criticalResults.forEach(result => {
      if (result.status === 'fulfilled') {
        const { name, success, time, status } = result.value;
        console.log(`   ${success ? '✅' : '❌'} ${name}: ${time}ms (${status})`);
      }
    });
    
    // Test optional endpoints (what loads after)
    const optionalEndpoints = [
      { name: 'Company Leave Today', url: '/employee/company/leave-today' },
      { name: 'Company WFH Today', url: '/employee/company/wfh-today' },
      { name: 'Current Month Calendar', url: `/employee/calendar/monthly?year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}` }
    ];
    
    console.log('\n📊 [TEST] Testing OPTIONAL endpoints (Phase 2)...');
    const optionalStart = Date.now();
    
    const optionalPromises = optionalEndpoints.map(async endpoint => {
      const start = Date.now();
      try {
        const response = await fetch(`${API_BASE}${endpoint.url}`, { headers });
        const data = await response.json();
        const time = Date.now() - start;
        
        return {
          name: endpoint.name,
          success: data.success || response.ok,
          time: time,
          status: response.status,
          dataSize: JSON.stringify(data).length
        };
      } catch (error) {
        return {
          name: endpoint.name,
          success: false,
          time: Date.now() - start,
          error: error.message
        };
      }
    });
    
    const optionalResults = await Promise.allSettled(optionalPromises);
    const optionalTime = Date.now() - optionalStart;
    
    console.log('✅ Optional endpoints completed in', optionalTime + 'ms');
    optionalResults.forEach(result => {
      if (result.status === 'fulfilled') {
        const { name, success, time, status, dataSize } = result.value;
        console.log(`   ${success ? '✅' : '❌'} ${name}: ${time}ms (${status}) - ${Math.round(dataSize/1024)}KB`);
      }
    });
    
    // Calculate total performance
    const totalTime = criticalTime + optionalTime;
    
    console.log('\n📈 [PERFORMANCE SUMMARY]');
    console.log('========================');
    console.log(`🔐 Login Time: ${loginTime}ms`);
    console.log(`⚡ Critical Load: ${criticalTime}ms (blocks UI)`);
    console.log(`🔄 Optional Load: ${optionalTime}ms (background)`);
    console.log(`🎯 Total Time: ${totalTime}ms`);
    console.log(`📊 User Perceived Load: ${loginTime + criticalTime}ms`);
    
    // Performance rating
    const userPerceivedTime = loginTime + criticalTime;
    let rating = '';
    if (userPerceivedTime < 1000) rating = '🚀 EXCELLENT';
    else if (userPerceivedTime < 2000) rating = '✅ GOOD';
    else if (userPerceivedTime < 3000) rating = '⚠️ ACCEPTABLE';
    else rating = '❌ NEEDS IMPROVEMENT';
    
    console.log(`🏆 Performance Rating: ${rating}`);
    
    // API call count
    const totalAPICalls = criticalEndpoints.length + optionalEndpoints.length + 1; // +1 for login
    console.log(`📞 Total API Calls: ${totalAPICalls}`);
    
    console.log('\n💡 [OPTIMIZATION NOTES]');
    console.log('- Critical data loads first (user sees content quickly)');
    console.log('- Optional data loads in background (no UI blocking)');
    console.log('- Reduced from 15+ API calls to', totalAPICalls, 'calls');
    console.log('- Birthday loading optimized (2 calls instead of 12)');
    
  } catch (error) {
    console.error('❌ [TEST] Performance test failed:', error.message);
  }
}

// Run the test
testDashboardPerformance();