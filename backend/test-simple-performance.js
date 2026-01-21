/**
 * Simple performance test to verify timeout fix
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testPerformance() {
    console.log('🔧 Simple Performance Test\n');
    
    try {
        // Test login performance multiple times
        const tests = [];
        
        for (let i = 1; i <= 3; i++) {
            console.log(`Test ${i}: Login performance...`);
            const start = Date.now();
            
            try {
                const response = await axios.post(`${BASE_URL}/auth/login`, {
                    email: 'nikl@hrm.com',
                    password: 'nikul123'
                }, { timeout: 8000 });
                
                const duration = Date.now() - start;
                console.log(`✅ Login ${i} completed in ${duration}ms`);
                tests.push({ test: `Login ${i}`, duration, success: true });
                
                // Small delay between tests
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                const duration = Date.now() - start;
                console.log(`❌ Login ${i} failed in ${duration}ms: ${error.message}`);
                tests.push({ test: `Login ${i}`, duration, success: false, error: error.message });
            }
        }
        
        console.log('\n📊 Results Summary:');
        tests.forEach(test => {
            const status = test.success ? '✅' : '❌';
            const errorMsg = test.error ? ` (${test.error})` : '';
            console.log(`${status} ${test.test}: ${test.duration}ms${errorMsg}`);
        });
        
        const successfulTests = tests.filter(t => t.success);
        const avgDuration = successfulTests.length > 0 
            ? Math.round(successfulTests.reduce((sum, t) => sum + t.duration, 0) / successfulTests.length)
            : 0;
            
        console.log(`\n📈 Average successful response time: ${avgDuration}ms`);
        
        if (successfulTests.length === 0) {
            console.log('❌ All tests failed - server might be down');
            return false;
        } else if (avgDuration > 10000) {
            console.log('❌ Still timing out (>10s average)');
            return false;
        } else if (avgDuration > 5000) {
            console.log('⚠️  Slow but not timing out (>5s average)');
            return true;
        } else {
            console.log('🎉 Good performance (<5s average)');
            return true;
        }
        
    } catch (error) {
        console.error('💥 Test error:', error.message);
        return false;
    }
}

testPerformance()
    .then((success) => {
        console.log(success ? '\n✅ Performance test PASSED' : '\n❌ Performance test FAILED');
        process.exit(success ? 0 : 1);
    });