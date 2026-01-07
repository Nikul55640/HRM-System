/**
 * Test script to verify HR authorization is working correctly
 */

import { authorize } from './src/middleware/authorize.js';

// Mock request and response objects
const createMockReq = (userRole) => ({
  user: {
    role: userRole,
    id: 'test-user-id',
    employeeId: 'test-employee-id'
  }
});

const createMockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.jsonData = data;
    return res;
  };
  return res;
};

const createMockNext = () => {
  let called = false;
  const next = () => {
    called = true;
  };
  next.called = () => called;
  return next;
};

// Test HR authorization
console.log('🧪 Testing HR Authorization...\n');

// Test 1: HR user should be authorized for HR-only routes
console.log('Test 1: HR user accessing HR-only route');
const hrReq = createMockReq('HR');
const hrRes = createMockRes();
const hrNext = createMockNext();

const hrMiddleware = authorize(['SuperAdmin', 'HR']);
hrMiddleware(hrReq, hrRes, hrNext);

if (hrNext.called()) {
  console.log('✅ PASS: HR user authorized successfully');
} else {
  console.log('❌ FAIL: HR user was denied access');
  console.log('Response:', hrRes.jsonData);
}

// Test 2: Employee should be denied access to HR routes
console.log('\nTest 2: Employee accessing HR-only route');
const empReq = createMockReq('Employee');
const empRes = createMockRes();
const empNext = createMockNext();

const empMiddleware = authorize(['SuperAdmin', 'HR']);
empMiddleware(empReq, empRes, empNext);

if (!empNext.called() && empRes.statusCode === 403) {
  console.log('✅ PASS: Employee correctly denied access');
} else {
  console.log('❌ FAIL: Employee was incorrectly authorized');
}

// Test 3: SuperAdmin should be authorized
console.log('\nTest 3: SuperAdmin accessing HR route');
const adminReq = createMockReq('SuperAdmin');
const adminRes = createMockRes();
const adminNext = createMockNext();

const adminMiddleware = authorize(['SuperAdmin', 'HR']);
adminMiddleware(adminReq, adminRes, adminNext);

if (adminNext.called()) {
  console.log('✅ PASS: SuperAdmin authorized successfully');
} else {
  console.log('❌ FAIL: SuperAdmin was denied access');
  console.log('Response:', adminRes.jsonData);
}

console.log('\n🎯 Authorization test completed!');