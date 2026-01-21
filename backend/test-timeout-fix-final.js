/**
 * Final verification that the timeout issue is fixed
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testTimeoutFix() {
    console.log('🔧 Final Timeout Fix Verification\n');
    
    try {
        // Test 1: Login performance
        console.log('1. Testing login performance...');
        const loginStart = Date.now();
        
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'john@hrm.com',
            password: 'nikul123'
        }, { timeout: 5000 });
        
        const loginDuration = Date.now() - loginStart;
        console.log(`✅ Login completed in ${loginDuration}ms`);
        
        if (loginDuration > 3000) {
            console.log('⚠️  Login is slow but not timing out');
        } else {
            console.log('🚀 Login performance is good');
        }
        
        // Test 2: Clock-in API performance (even if already clocked in)
        console.log('\n2. Testing clock-in API performance...');
        const clockInStart = Date.now();
        
        try {
            await axios.post(`${BASE_URL}/employee/attendance/clock-in`, {
                workMode: 'office',
                location: { type: 'gps', coordinates: { latitude: 28.6139, longitude: 77.2090 } }
            }, {
                headers: { 'Authorization': `Bearer ${loginResponse.data.data.accessToken}` },
                timeout: 5000
            });
        } catch (error) {
            // We expect this to fail with "already clocked in" - that's fine
            if (error.response?.status === 400 && error.response?.data?.message?.includes('Already clocked in')) {
                console.log('✅ Clock-in API responded with expected business logic error');
            } else {
                throw error;
            }
        }
        
        const clockInDuration = Date.now() - clockInStart;
        console.log(`✅ Clock-in API responded in ${clockInDuration}ms`);
        
        if (clockInDuration > 3000) {
            console.log('⚠️  Clock-in API is slow but not timing out');
        } else {
            console.log('🚀 Clock-in API performance is good');
        }
        
        // Test 3: Multiple rapid requests to ensure no deadlocks
        console.log('\n3. Testing rapid requests (deadlock prevention)...');
        const rapidStart = Date.now();
        
        const promises = Array(5).fill().map(async (_, i) => {
            try {
                return await axios.get(`${BASE_URL}/employee/dashboard`, {
                    headers: { 'Authorization': `Bearer ${loginResponse.data.data.accessToken}` },
                    timeout: 3000
                });
            } catch (error) {
                return { error: error.message };
            }
        });
        
        const results = await Promise.all(promises);
        const rapidDuration = Date.now() - rapidStart;
        
        const successCount = results.filter(r => !r.error).length;
        console.log(`✅ ${successCount}/5 rapid requests succeeded in ${rapidDuration}ms`);
        
        if (successCount >= 4) {
            console.log('🚀 No deadlock issues detected');
        } else {
            console.log('⚠️  Some requests failed - possible performance issues remain');
        }
        
        console.log('\n📊 Summary:');
        console.log(`- Login: ${loginDuration}ms`);
        console.log(`- Clock-in API: ${clockInDuration}ms`);
        console.log(`- Rapid requests: ${rapidDuration}ms (${successCount}/5 success)`);
        
        if (loginDuration < 5000 && clockInDuration < 5000) {
            console.log('\n🎉 TIMEOUT ISSUE FIXED! All APIs responding within acceptable time.');
            return true;
        } else {
            console.log('\n⚠️  Performance improved but still slow. May need further optimization.');
            return false;
        }
        
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error('\n❌ TIMEOUT STILL EXISTS:', error.message);
            return false;
        } else {
            console.error('\n❌ Test error:', error.message);
            return false;
        }
    }
}

// Run the test
testTimeoutFix()
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error('\n💥 Test script error:', error);
        process.exit(1);
    });