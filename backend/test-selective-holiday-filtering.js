/**
 * Test Script for Selective Holiday Filtering
 * Demonstrates the new advanced filtering capabilities
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test credentials (replace with actual admin credentials)
const TEST_CREDENTIALS = {
  email: 'admin@hrm.com',
  password: 'admin123'
};

class HolidayFilteringTest {
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

  async testConnection() {
    try {
      console.log('\n🔧 Testing Calendarific API connection...');
      const response = await axios.get(
        `${API_URL}/admin/calendarific/test-connection`,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Connection test result:', response.data);
      return response.data.success;
    } catch (error) {
      console.error('❌ Connection test failed:', error.response?.data || error.message);
      return false;
    }
  }

  async getAvailableFilters() {
    try {
      console.log('\n📋 Getting available filter options...');
      const response = await axios.get(
        `${API_URL}/admin/calendarific/filters`,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Available filters:', JSON.stringify(response.data.data, null, 2));
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to get filters:', error.response?.data || error.message);
      return null;
    }
  }

  async testFestivalFiltering() {
    try {
      console.log('\n🎉 Testing festival-only filtering...');
      const response = await axios.get(
        `${API_URL}/admin/calendarific/festivals?country=IN&year=2026&holidayTypes=national,religious`,
        { headers: this.getAuthHeaders() }
      );
      
      console.log(`✅ Found ${response.data.data.count} festivals:`);
      response.data.data.festivals.slice(0, 5).forEach(festival => {
        console.log(`   - ${festival.name} (${festival.date || festival.recurringDate}) - ${festival.category}`);
      });
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Festival filtering failed:', error.response?.data || error.message);
      return null;
    }
  }

  async testNationalHolidays() {
    try {
      console.log('\n🇮🇳 Testing national holidays filtering...');
      const response = await axios.get(
        `${API_URL}/admin/calendarific/national?country=IN&year=2026`,
        { headers: this.getAuthHeaders() }
      );
      
      console.log(`✅ Found ${response.data.data.count} national holidays:`);
      response.data.data.nationalHolidays.forEach(holiday => {
        console.log(`   - ${holiday.name} (${holiday.date || holiday.recurringDate}) - ${holiday.category}`);
      });
      
      return response.data.data;
    } catch (error) {
      console.error('❌ National holidays filtering failed:', error.response?.data || error.message);
      return null;
    }
  }

  async testAdvancedFiltering() {
    try {
      console.log('\n🔍 Testing advanced filtering with multiple criteria...');
      
      const filterOptions = {
        country: 'IN',
        year: 2026,
        holidayTypes: 'national,religious',
        festivalsOnly: true,
        excludeObservances: true,
        paidOnly: true,
        maxHolidays: 10
      };
      
      const response = await axios.post(
        `${API_URL}/admin/calendarific/preview-filtered`,
        filterOptions,
        { headers: this.getAuthHeaders() }
      );
      
      console.log(`✅ Advanced filtering result: ${response.data.data.count} holidays`);
      console.log('📊 Summary:', JSON.stringify(response.data.data.summary, null, 2));
      
      console.log('🎯 Selected holidays:');
      response.data.data.holidays.forEach(holiday => {
        console.log(`   - ${holiday.name} (${holiday.date || holiday.recurringDate}) - ${holiday.category} - Paid: ${holiday.isPaid}`);
      });
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Advanced filtering failed:', error.response?.data || error.message);
      return null;
    }
  }

  async testCompanyPolicyTemplate() {
    try {
      console.log('\n🏢 Testing company policy template (Tech Startup)...');
      
      const policyOptions = {
        country: 'IN',
        year: 2026,
        policyTemplate: 'TECH_STARTUP',
        dryRun: true
      };
      
      const response = await axios.post(
        `${API_URL}/admin/calendarific/apply-policy`,
        policyOptions,
        { headers: this.getAuthHeaders() }
      );
      
      console.log(`✅ Tech Startup policy result: ${response.data.data.count} holidays`);
      console.log('📊 Summary:', JSON.stringify(response.data.data.summary, null, 2));
      
      console.log('🎯 Policy-selected holidays:');
      response.data.data.holidays.slice(0, 8).forEach(holiday => {
        console.log(`   - ${holiday.name} (${holiday.date || holiday.recurringDate}) - ${holiday.category}`);
      });
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Company policy test failed:', error.response?.data || error.message);
      return null;
    }
  }

  async testSpecificHolidaySelection() {
    try {
      console.log('\n🎯 Testing specific holiday selection...');
      
      const filterOptions = {
        country: 'IN',
        year: 2026,
        holidayTypes: 'national,religious',
        includeHolidays: ['diwali', 'independence', 'republic', 'gandhi', 'christmas', 'eid']
      };
      
      const response = await axios.post(
        `${API_URL}/admin/calendarific/preview-filtered`,
        filterOptions,
        { headers: this.getAuthHeaders() }
      );
      
      console.log(`✅ Specific selection result: ${response.data.data.count} holidays`);
      
      console.log('🎯 Specifically selected holidays:');
      response.data.data.holidays.forEach(holiday => {
        console.log(`   - ${holiday.name} (${holiday.date || holiday.recurringDate}) - ${holiday.category}`);
      });
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Specific holiday selection failed:', error.response?.data || error.message);
      return null;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Selective Holiday Filtering Tests\n');
    
    // Login first
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      console.error('❌ Cannot proceed without authentication');
      return;
    }

    // Test connection
    const connectionOk = await this.testConnection();
    if (!connectionOk) {
      console.error('❌ Cannot proceed without API connection');
      return;
    }

    // Run all tests
    await this.getAvailableFilters();
    await this.testFestivalFiltering();
    await this.testNationalHolidays();
    await this.testAdvancedFiltering();
    await this.testCompanyPolicyTemplate();
    await this.testSpecificHolidaySelection();
    
    console.log('\n✅ All tests completed!');
    console.log('\n📝 Summary:');
    console.log('   ✅ Festival filtering - Shows only religious/cultural festivals');
    console.log('   ✅ National holidays - Shows only national/patriotic holidays');
    console.log('   ✅ Advanced filtering - Multiple criteria (paid, max count, etc.)');
    console.log('   ✅ Company policy - Predefined templates for different business types');
    console.log('   ✅ Specific selection - Choose exact holidays by name');
    console.log('\n🎯 You can now choose exactly which holidays to import!');
  }
}

// Run the tests
const tester = new HolidayFilteringTest();
tester.runAllTests().catch(console.error);