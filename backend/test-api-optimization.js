/**
 * Test Script for API Usage Optimization
 * Verifies that API calls are minimized through smart caching
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test credentials
const TEST_CREDENTIALS = {
  email: 'admin@hrm.com',
  password: 'admin123'
};

class ApiOptimizationTest {
  constructor() {
    this.authToken = null;
  }

  async login() {
    try {
      console.log('🔐 Logging in...');
      const response = await axios.post(`${API_URL}/auth/login`, TEST_CREDENTIALS);
      
      if (response.data.success) {
        this.authToken = response.data.data.accessToken;
        console.log('✅ Login successful');
        return true;
      } else {
        console.error('❌ Login failed:', response.data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Login error:', error.response?.data?.message || error.message);
      return false;
    }
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    };
  }

  async getApiUsageStats() {
    try {
      const response = await axios.get(
        `${API_URL}/admin/calendarific/api-usage`,
        { headers: this.getAuthHeaders() }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to get API usage stats:', error.response?.data || error.message);
      return null;
    }
  }

  async testCacheEfficiency() {
    console.log('\n🧪 Testing Cache Efficiency...');
    
    // Get initial stats
    const initialStats = await this.getApiUsageStats();
    console.log('📊 Initial API Usage:', {
      callsToday: initialStats?.apiCallsToday || 0,
      cacheEntries: initialStats?.validEntries || 0,
      cacheHitRate: initialStats?.cacheHitRate || 0
    });

    // Make the same request multiple times
    console.log('\n🔄 Making identical requests to test caching...');
    
    const requests = [];
    for (let i = 0; i < 3; i++) {
      requests.push(
        axios.get(
          `${API_URL}/admin/calendarific/festivals?country=IN&year=2026`,
          { headers: this.getAuthHeaders() }
        )
      );
    }

    const results = await Promise.all(requests);
    
    // Get final stats
    const finalStats = await this.getApiUsageStats();
    
    const apiCallsMade = (finalStats?.apiCallsToday || 0) - (initialStats?.apiCallsToday || 0);
    
    console.log('📊 Results:');
    console.log(`   - Requests made: 3`);
    console.log(`   - API calls made: ${apiCallsMade}`);
    console.log(`   - Cache hits: ${3 - apiCallsMade}`);
    console.log(`   - Cache efficiency: ${Math.round(((3 - apiCallsMade) / 3) * 100)}%`);
    
    if (apiCallsMade <= 1) {
      console.log('✅ Cache working efficiently - only 1 API call for 3 requests');
    } else {
      console.log('⚠️ Cache may need optimization - multiple API calls made');
    }

    return {
      requestsMade: 3,
      apiCallsMade,
      cacheHits: 3 - apiCallsMade,
      efficiency: Math.round(((3 - apiCallsMade) / 3) * 100)
    };
  }

  async testBatchOptimization() {
    console.log('\n🔄 Testing Batch Optimization...');
    
    const initialStats = await this.getApiUsageStats();
    
    // Test batch request
    const response = await axios.get(
      `${API_URL}/admin/calendarific/batch-preview?country=IN&year=2026&types=national,religious`,
      { headers: this.getAuthHeaders() }
    );
    
    const finalStats = await this.getApiUsageStats();
    const apiCallsMade = (finalStats?.apiCallsToday || 0) - (initialStats?.apiCallsToday || 0);
    
    console.log('📊 Batch Request Results:');
    console.log(`   - Holiday types requested: 2 (national, religious)`);
    console.log(`   - API calls made: ${apiCallsMade}`);
    console.log(`   - Holidays found: ${response.data.data.count}`);
    console.log(`   - API usage info:`, response.data.data.apiUsage);
    
    if (apiCallsMade <= 2) {
      console.log('✅ Batch optimization working - minimal API calls');
    } else {
      console.log('⚠️ Batch optimization may need improvement');
    }

    return {
      typesRequested: 2,
      apiCallsMade,
      holidaysFound: response.data.data.count
    };
  }

  async testFilterOptimization() {
    console.log('\n🎯 Testing Filter Optimization...');
    
    const initialStats = await this.getApiUsageStats();
    
    // Test filtered request
    const response = await axios.post(
      `${API_URL}/admin/calendarific/preview-filtered`,
      {
        country: 'IN',
        year: 2026,
        festivalsOnly: true,
        maxHolidays: 10
      },
      { headers: this.getAuthHeaders() }
    );
    
    const finalStats = await this.getApiUsageStats();
    const apiCallsMade = (finalStats?.apiCallsToday || 0) - (initialStats?.apiCallsToday || 0);
    
    console.log('📊 Filtered Request Results:');
    console.log(`   - Filters applied: festivalsOnly, maxHolidays`);
    console.log(`   - API calls made: ${apiCallsMade}`);
    console.log(`   - Holidays found: ${response.data.data.count}`);
    console.log(`   - API usage message:`, response.data.data.apiUsage?.message);
    
    if (response.data.data.apiUsage?.message?.includes('served from cache')) {
      console.log('✅ Filter optimization working - served from cache');
    } else if (apiCallsMade <= 1) {
      console.log('✅ Filter optimization working - minimal API calls');
    } else {
      console.log('⚠️ Filter optimization may need improvement');
    }

    return {
      filtersApplied: 2,
      apiCallsMade,
      holidaysFound: response.data.data.count,
      servedFromCache: response.data.data.apiUsage?.message?.includes('served from cache')
    };
  }

  async testRateLimiting() {
    console.log('\n⏱️ Testing Rate Limiting...');
    
    const startTime = Date.now();
    
    // Make multiple requests quickly
    const requests = [];
    for (let i = 0; i < 2; i++) {
      requests.push(
        axios.get(
          `${API_URL}/admin/calendarific/national?country=US&year=2026`,
          { headers: this.getAuthHeaders() }
        )
      );
    }

    await Promise.all(requests);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log('📊 Rate Limiting Results:');
    console.log(`   - Requests made: 2`);
    console.log(`   - Total time: ${totalTime}ms`);
    console.log(`   - Average time per request: ${Math.round(totalTime / 2)}ms`);
    
    if (totalTime > 1000) {
      console.log('✅ Rate limiting working - requests spaced appropriately');
    } else {
      console.log('ℹ️ Requests completed quickly (likely served from cache)');
    }

    return {
      requestsMade: 2,
      totalTime,
      averageTime: Math.round(totalTime / 2)
    };
  }

  async runOptimizationTests() {
    console.log('🚀 Starting API Optimization Tests\n');
    
    // Login first
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      console.error('❌ Cannot proceed without authentication');
      return;
    }

    // Get initial API usage stats
    const initialStats = await this.getApiUsageStats();
    console.log('\n📊 Initial API Usage Statistics:');
    console.log('   - API calls today:', initialStats?.apiCallsToday || 0);
    console.log('   - Remaining calls:', initialStats?.remainingCalls || 'Unknown');
    console.log('   - Cache entries:', initialStats?.validEntries || 0);
    console.log('   - Cache hit rate:', `${initialStats?.cacheHitRate || 0}%`);

    // Run all optimization tests
    const results = {
      cache: await this.testCacheEfficiency(),
      batch: await this.testBatchOptimization(),
      filter: await this.testFilterOptimization(),
      rateLimit: await this.testRateLimiting()
    };

    // Get final stats
    const finalStats = await this.getApiUsageStats();
    
    console.log('\n📊 Final API Usage Statistics:');
    console.log('   - API calls today:', finalStats?.apiCallsToday || 0);
    console.log('   - Remaining calls:', finalStats?.remainingCalls || 'Unknown');
    console.log('   - Cache entries:', finalStats?.validEntries || 0);
    console.log('   - Cache hit rate:', `${finalStats?.cacheHitRate || 0}%`);
    
    const totalApiCalls = (finalStats?.apiCallsToday || 0) - (initialStats?.apiCallsToday || 0);
    
    console.log('\n🎯 Optimization Test Summary:');
    console.log('   ✅ Cache Efficiency:', `${results.cache.efficiency}%`);
    console.log('   ✅ Batch Optimization:', `${results.batch.apiCallsMade} calls for ${results.batch.typesRequested} types`);
    console.log('   ✅ Filter Optimization:', results.filter.servedFromCache ? 'Served from cache' : `${results.filter.apiCallsMade} API calls`);
    console.log('   ✅ Rate Limiting:', `${results.rateLimit.averageTime}ms average`);
    console.log(`   📞 Total API calls made during tests: ${totalApiCalls}`);
    
    console.log('\n🎉 Optimization Status:');
    if (totalApiCalls <= 5) {
      console.log('   🟢 EXCELLENT - API usage is highly optimized');
    } else if (totalApiCalls <= 10) {
      console.log('   🟡 GOOD - API usage is reasonably optimized');
    } else {
      console.log('   🔴 NEEDS IMPROVEMENT - API usage could be more optimized');
    }
    
    console.log('\n💡 Recommendations:');
    console.log('   - Use filters to reduce data fetching');
    console.log('   - Leverage batch requests for multiple types');
    console.log('   - Cache is automatically managed for 7 days');
    console.log('   - Rate limiting prevents API abuse');
  }
}

// Run the optimization tests
const tester = new ApiOptimizationTest();
tester.runOptimizationTests().catch(console.error);








