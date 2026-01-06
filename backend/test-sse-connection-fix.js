/**
 * Test script to verify SSE connection fixes
 * This script simulates multiple rapid connection attempts to ensure they're handled properly
 */

import fetch from 'node-fetch';
import EventSource from 'eventsource';

const BASE_URL = 'http://localhost:5000';
const TEST_TOKEN = process.env.TEST_TOKEN || 'your-test-token-here';

console.log('🧪 Testing SSE Connection Fixes...\n');

// Test 1: Multiple rapid connections from same user
async function testRapidConnections() {
    console.log('📡 Test 1: Multiple rapid connections from same user');
    
    const connections = [];
    const connectionPromises = [];
    
    // Create 5 rapid connections
    for (let i = 0; i < 5; i++) {
        const promise = new Promise((resolve, reject) => {
            const eventSource = new EventSource(`${BASE_URL}/api/employee/notifications/stream?token=${TEST_TOKEN}`);
            
            eventSource.onopen = () => {
                console.log(`  ✅ Connection ${i + 1} opened`);
                resolve(eventSource);
            };
            
            eventSource.onerror = (error) => {
                console.log(`  ❌ Connection ${i + 1} error:`, error.message);
                reject(error);
            };
            
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log(`  📨 Connection ${i + 1} received:`, data.type);
            };
            
            connections.push(eventSource);
        });
        
        connectionPromises.push(promise);
        
        // Small delay between connections
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    try {
        await Promise.allSettled(connectionPromises);
        console.log('  ⏱️  Waiting 5 seconds to observe behavior...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Close all connections
        connections.forEach((conn, index) => {
            if (conn && conn.readyState !== EventSource.CLOSED) {
                conn.close();
                console.log(`  🔌 Connection ${index + 1} closed`);
            }
        });
        
        console.log('  ✅ Test 1 completed\n');
    } catch (error) {
        console.error('  ❌ Test 1 failed:', error.message);
    }
}

// Test 2: Connection with invalid token
async function testInvalidToken() {
    console.log('📡 Test 2: Connection with invalid token');
    
    return new Promise((resolve) => {
        const eventSource = new EventSource(`${BASE_URL}/api/employee/notifications/stream?token=invalid-token`);
        
        eventSource.onopen = () => {
            console.log('  ❌ Connection should not have opened with invalid token');
            eventSource.close();
            resolve();
        };
        
        eventSource.onerror = (error) => {
            console.log('  ✅ Connection properly rejected invalid token');
            eventSource.close();
            resolve();
        };
        
        // Timeout after 5 seconds
        setTimeout(() => {
            eventSource.close();
            console.log('  ✅ Test 2 completed (timeout)\n');
            resolve();
        }, 5000);
    });
}

// Test 3: Connection lifecycle
async function testConnectionLifecycle() {
    console.log('📡 Test 3: Connection lifecycle');
    
    return new Promise((resolve) => {
        const eventSource = new EventSource(`${BASE_URL}/api/employee/notifications/stream?token=${TEST_TOKEN}`);
        let messageCount = 0;
        
        eventSource.onopen = () => {
            console.log('  ✅ Connection opened');
        };
        
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            messageCount++;
            console.log(`  📨 Message ${messageCount}: ${data.type}`);
            
            // Close after receiving a few messages
            if (messageCount >= 3) {
                eventSource.close();
                console.log('  🔌 Connection closed gracefully');
                console.log('  ✅ Test 3 completed\n');
                resolve();
            }
        };
        
        eventSource.onerror = (error) => {
            console.log('  ❌ Connection error:', error.message);
            eventSource.close();
            resolve();
        };
        
        // Timeout after 30 seconds
        setTimeout(() => {
            eventSource.close();
            console.log('  ⏱️  Test 3 completed (timeout)\n');
            resolve();
        }, 30000);
    });
}

// Run all tests
async function runTests() {
    if (!TEST_TOKEN || TEST_TOKEN === 'your-test-token-here') {
        console.log('❌ Please set TEST_TOKEN environment variable with a valid JWT token');
        console.log('   You can get a token by logging into the frontend and checking localStorage');
        process.exit(1);
    }
    
    try {
        await testRapidConnections();
        await testInvalidToken();
        await testConnectionLifecycle();
        
        console.log('🎉 All tests completed!');
        console.log('📊 Check the backend logs to verify connection behavior');
    } catch (error) {
        console.error('❌ Test suite failed:', error);
    }
    
    process.exit(0);
}

runTests();