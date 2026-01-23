import axios from 'axios';

async function simpleTest() {
  try {
    console.log('🧪 Simple Template API Test...');
    
    // Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@hrm.com',
      password: 'admin123'
    }, { timeout: 5000 });
    
    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');
    
    // Test template endpoint with timeout
    console.log('2. Testing template GET endpoint...');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    const templateResponse = await axios.get('http://localhost:5000/api/admin/holiday-templates', { 
      headers,
      timeout: 10000 
    });
    
    console.log('✅ Template GET endpoint working');
    console.log('Templates found:', templateResponse.data.data?.templates?.length || 0);
    
    // Test template creation
    console.log('3. Testing template creation...');
    const testTemplate = {
      name: 'Simple Test Template',
      description: 'Test template creation',
      country: 'IN',
      holidayTypes: ['national'],
      selectedHolidays: ['Republic Day'],
      maxHolidays: 5,
      isDefault: false
    };
    
    const createResponse = await axios.post('http://localhost:5000/api/admin/holiday-templates', testTemplate, { 
      headers,
      timeout: 10000 
    });
    
    console.log('✅ Template creation successful');
    console.log('Created template ID:', createResponse.data.data?.id);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Server is not running on port 5000');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
    } else if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

simpleTest();