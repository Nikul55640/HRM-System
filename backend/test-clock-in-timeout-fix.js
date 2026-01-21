/**
 * Test script to verify clock-in timeout fix
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
    email: 'nikl@hrm.com',
    password: 'nikul123'
};

const clockInData = {
    workMode: 'office',
    workLocation: 'office',
    location: {
        type: 'gps',
        coordinates: {
            latitude: 28.6139,
            longitude: 77.2090
        },
        timestamp: new Date().toISOString(),
        source: 'browser_geolocation'
    },
    deviceInfo: {
        userAgent: 'Test Script',
        platform: 'Node.js',
        timestamp: new Date().toISOString()
    }
};

async function testClockInTimeout() {
    console.log('🔧 Testing Clock-In Timeout Fix\n');
    
    try {
        // Step 1: Login to get token
        console.log('1. Logging in...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser, {
            timeout: 5000
        });
        
        if (!loginResponse.data.success) {
            throw new Error('Login failed: ' + loginResponse.data.message);
        }
        
        console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
        const token = loginResponse.data.data.accessToken;
        console.log('✅ Login successful, token length:', token?.length);
        
        // Step 2: Test clock-in with timeout
        console.log('\n2. Testing clock-in (with 15s timeout)...');
        const startTime = Date.now();
        
        const clockInResponse = await axios.post(
            `${BASE_URL}/employee/attendance/clock-in`,
            clockInData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000 // 15 second timeout
            }
        );
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`✅ Clock-in successful in ${duration}ms`);
        console.log('Response:', {
            success: clockInResponse.data.success,
            message: clockInResponse.data.message,
            isLate: clockInResponse.data.data?.isLate,
            lateMinutes: clockInResponse.data.data?.lateMinutes
        });
        
        // Step 3: Performance check
        if (duration > 5000) {
            console.log('⚠️  WARNING: Clock-in took longer than 5 seconds');
        } else if (duration > 2000) {
            console.log('⚠️  NOTICE: Clock-in took longer than 2 seconds');
        } else {
            console.log('🚀 EXCELLENT: Clock-in completed quickly');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.code === 'ECONNABORTED') {
            console.error('🚨 TIMEOUT: The request timed out - our fix didn\'t work');
        } else if (error.response) {
            console.error('HTTP Error:', error.response.status, error.response.data);
        } else {
            console.error('Network Error:', error.message);
        }
        
        return false;
    }
}

// Run the test
testClockInTimeout()
    .then((success) => {
        if (success) {
            console.log('\n🎉 Clock-in timeout fix verification PASSED!');
            process.exit(0);
        } else {
            console.log('\n❌ Clock-in timeout fix verification FAILED!');
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error('\n💥 Test script error:', error);
        process.exit(1);
    });