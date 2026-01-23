/**
 * Test Holiday Template Permissions
 * Test if SuperAdmin can access holiday template endpoints
 */

const axios = require('axios');

const testHolidayTemplatePermissions = async () => {
  try {
    console.log('🧪 Testing Holiday Template Permissions...');
    
    // First, login as SuperAdmin
    console.log('1. Logging in as SuperAdmin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@hrm.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.data.token;
    const userRole = loginResponse.data.data.user.role;
    
    console.log('✅ Login successful');
    console.log('👤 User role:', userRole);
    console.log('🔑 Token received');
    
    // Test holiday template endpoints
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('\n2. Testing GET /api/admin/holiday-templates...');
    try {
      const getResponse = await axios.get('http://localhost:5000/api/admin/holiday-templates', { headers });
      console.log('✅ GET holiday-templates successful');
      console.log('📊 Response:', getResponse.data);
    } catch (error) {
      console.log('❌ GET holiday-templates failed:', error.response?.status, error.response?.data);
    }
    
    console.log('\n3. Testing POST /api/admin/holiday-templates...');
    try {
      const createResponse = await axios.post('http://localhost:5000/api/admin/holiday-templates', {
        name: 'Test Template',
        description: 'Test template for permission check',
        country: 'IN',
        holidayTypes: ['national'],
        selectedHolidays: ['Republic Day', 'Independence Day'],
        maxHolidays: 10,
        isDefault: false
      }, { headers });
      console.log('✅ POST holiday-templates successful');
      console.log('📊 Response:', createResponse.data);
    } catch (error) {
      console.log('❌ POST holiday-templates failed:', error.response?.status, error.response?.data);
    }
    
    console.log('\n🎉 Permission test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Run the test
testHolidayTemplatePermissions();