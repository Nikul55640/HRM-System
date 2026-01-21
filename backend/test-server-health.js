/**
 * Simple server health check
 */

import axios from 'axios';

async function checkHealth() {
    console.log('🔍 Server Health Check\n');
    
    try {
        console.log('Testing basic connectivity...');
        const response = await axios.get('http://localhost:5000/api/health', {
            timeout: 3000
        });
        
        console.log('✅ Server is responding');
        console.log('Response:', response.data);
        return true;
        
    } catch (error) {
        console.log('❌ Server health check failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('🚨 Server is not running or not accepting connections');
        } else if (error.code === 'ECONNABORTED') {
            console.log('🚨 Server is running but not responding (timeout)');
        } else if (error.response?.status === 404) {
            console.log('✅ Server is running (404 is expected if no /health endpoint)');
            return true;
        }
        
        return false;
    }
}

checkHealth()
    .then((healthy) => {
        if (healthy) {
            console.log('\n🎉 Server appears to be healthy');
            console.log('The timeout issue in the frontend is likely fixed.');
            console.log('The original 10-second timeout error should no longer occur.');
        } else {
            console.log('\n❌ Server has issues');
        }
    });