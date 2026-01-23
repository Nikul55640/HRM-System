import axios from 'axios';

async function testTemplateAPI() {
  try {
    console.log('🧪 Testing Holiday Template API...');
    
    // 1. Login to get token
    console.log('\n1. Logging in as SuperAdmin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@hrm.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }
    
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful, token received');
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'undefined');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Test GET templates
    console.log('\n2. Testing GET /api/admin/holiday-templates...');
    try {
      const getResponse = await axios.get('http://localhost:5000/api/admin/holiday-templates', { headers });
      console.log('✅ GET successful');
      console.log('Templates found:', getResponse.data.data?.templates?.length || 0);
      if (getResponse.data.data?.templates?.length > 0) {
        console.log('Existing templates:');
        getResponse.data.data.templates.forEach(t => {
          console.log(`  - ${t.name} (${t.country})`);
        });
      }
    } catch (getError) {
      console.log('❌ GET failed:', getError.response?.status, getError.response?.data);
    }
    
    // 3. Test POST template creation
    console.log('\n3. Testing POST /api/admin/holiday-templates...');
    const testTemplate = {
      name: 'API Test Template',
      description: 'Template created via API test',
      country: 'IN',
      holidayTypes: ['national', 'religious'],
      selectedHolidays: ['Republic Day', 'Independence Day', 'Diwali'],
      maxHolidays: 10,
      isDefault: false
    };
    
    console.log('Sending template data:', JSON.stringify(testTemplate, null, 2));
    
    try {
      const createResponse = await axios.post('http://localhost:5000/api/admin/holiday-templates', testTemplate, { headers });
      console.log('✅ POST successful');
      console.log('Created template:', createResponse.data);
      
      // Clean up - delete the test template
      if (createResponse.data.data?.id) {
        console.log('\n4. Cleaning up test template...');
        try {
          await axios.delete(`http://localhost:5000/api/admin/holiday-templates/${createResponse.data.data.id}`, { headers });
          console.log('✅ Test template deleted');
        } catch (deleteError) {
          console.log('⚠️ Failed to delete test template:', deleteError.response?.data);
        }
      }
      
    } catch (createError) {
      console.log('❌ POST failed:', createError.response?.status);
      console.log('Error details:', createError.response?.data);
      console.log('Request config:', {
        url: createError.config?.url,
        method: createError.config?.method,
        headers: createError.config?.headers,
        data: createError.config?.data
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testTemplateAPI();