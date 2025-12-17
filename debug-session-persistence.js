const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
  email: 'john.doe@hrms.com',
  password: 'emp123'
};

let authToken = '';

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${BASE_URL}/auth/login`, testUser);
    
    if (response.data.success) {
      authToken = response.data.data.accessToken;
      console.log('✅ Login successful');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function debugSessionPersistence() {
  console.log('\n🔍 Debugging Session Persistence Issue\n');
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };

  try {
    // Step 1: Clear any existing sessions for today (if possible)
    console.log('🧹 Step 1: Getting current state...');
    let response = await axios.get(`${BASE_URL}/employee/attendance`, { headers });
    
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = response.data.data?.find(record => 
      record.date?.startsWith(today)
    );
    
    if (todayRecord) {
      console.log('📅 Found today\'s record:');
      console.log(`   ID: ${todayRecord.id}`);
      console.log(`   Sessions before: ${JSON.stringify(todayRecord.sessions)}`);
      console.log(`   Legacy checkIn: ${todayRecord.checkIn}`);
      console.log(`   Legacy checkOut: ${todayRecord.checkOut}`);
    } else {
      console.log('📅 No record found for today');
    }

    // Step 2: Start session and capture full response
    console.log('\n🟢 Step 2: Starting session with detailed logging...');
    response = await axios.post(`${BASE_URL}/employee/attendance/session/start`, {
      workLocation: 'office'
    }, { headers });
    
    console.log('📤 Session start response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      const sessionData = response.data.data;
      console.log('\n✅ Session created successfully');
      console.log(`🆔 Session ID: ${sessionData.session.sessionId}`);
      console.log(`📋 Record ID: ${sessionData.record.id}`);
      console.log(`📊 Sessions in response: ${sessionData.record.sessions?.length || 0}`);
      
      // Step 3: Immediately query the same record by ID
      console.log('\n📊 Step 3: Querying record immediately after creation...');
      
      // Wait a moment to ensure database write completes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      response = await axios.get(`${BASE_URL}/employee/attendance`, { headers });
      
      const updatedRecord = response.data.data?.find(record => 
        record.id === sessionData.record.id
      );
      
      if (updatedRecord) {
        console.log('📅 Found updated record:');
        console.log(`   ID: ${updatedRecord.id}`);
        console.log(`   Sessions after: ${JSON.stringify(updatedRecord.sessions)}`);
        console.log(`   Sessions count: ${updatedRecord.sessions?.length || 0}`);
        
        if (updatedRecord.sessions?.length > 0) {
          console.log('✅ SUCCESS: Session persisted correctly!');
          
          const persistedSession = updatedRecord.sessions[0];
          console.log('📋 Persisted session details:');
          console.log(`   Session ID: ${persistedSession.sessionId}`);
          console.log(`   Status: ${persistedSession.status}`);
          console.log(`   Work Location: ${persistedSession.workLocation}`);
          console.log(`   Check In: ${persistedSession.checkIn}`);
          
        } else {
          console.log('❌ FAILURE: Session did NOT persist');
          console.log('🔍 Possible causes:');
          console.log('   1. Database transaction rollback');
          console.log('   2. JSON field serialization issue');
          console.log('   3. Model save hook interference');
          console.log('   4. Sequelize configuration problem');
        }
      } else {
        console.log('❌ FAILURE: Could not find the record after creation');
      }
      
      // Step 4: Try different endpoints to see if data exists elsewhere
      console.log('\n📊 Step 4: Checking sessions endpoint...');
      response = await axios.get(`${BASE_URL}/employee/attendance/sessions`, { headers });
      
      const sessionRecord = response.data.data?.find(record => 
        record.date?.startsWith(today)
      );
      
      if (sessionRecord) {
        console.log('📅 Sessions endpoint record:');
        console.log(`   Sessions count: ${sessionRecord.sessions?.length || 0}`);
        console.log(`   Sessions: ${JSON.stringify(sessionRecord.sessions)}`);
      } else {
        console.log('❌ No record found in sessions endpoint');
      }
      
    } else {
      console.log('❌ Session creation failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.response?.data || error.message);
  }
}

async function runDebug() {
  console.log('🚀 Session Persistence Debug Tool\n');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  await debugSessionPersistence();
  
  console.log('\n✅ Debug completed!');
  console.log('\n💡 Next steps based on results:');
  console.log('   - If sessions persist: Issue is with specific endpoints');
  console.log('   - If sessions don\'t persist: Database/model issue');
  console.log('   - Check backend logs for Sequelize errors');
}

runDebug().catch(console.error);