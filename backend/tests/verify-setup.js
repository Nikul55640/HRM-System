/**
 * Verify Property-Based Testing Setup
 * Run this script to verify fast-check and generators are working
 */

import fc from 'fast-check';
import {
  objectIdGen,
  timestampGen,
  workLocationGen,
  validSessionGen,
  propertyTestConfig,
} from './utils/generators.js';

console.log('🧪 Verifying Property-Based Testing Setup...\n');

// Test 1: fast-check is working
console.log('✓ Test 1: fast-check library loaded');
console.log(`  Version: ${fc.version || 'unknown'}\n`);

// Test 2: Generators are working
console.log('✓ Test 2: Generators are working');
console.log('  Sample ObjectId:', fc.sample(objectIdGen, 1)[0]);
console.log('  Sample Timestamp:', fc.sample(timestampGen(), 1)[0]);
console.log('  Sample Work Location:', fc.sample(workLocationGen, 1)[0]);
console.log('  Sample Session:', JSON.stringify(fc.sample(validSessionGen, 1)[0], null, 2));
console.log();

// Test 3: Property test configuration
console.log('✓ Test 3: Property test configuration');
console.log(`  Configured iterations: ${propertyTestConfig.numRuns}`);
console.log();

// Test 4: Run a simple property test
console.log('✓ Test 4: Running sample property test (100 iterations)...');
let testPassed = false;
try {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (a, b) => {
      return a + b === b + a; // Addition is commutative
    }),
    propertyTestConfig
  );
  testPassed = true;
  console.log('  ✓ Property test passed!\n');
} catch (error) {
  console.log('  ✗ Property test failed:', error.message, '\n');
}

// Test 5: Verify session generator produces valid data
console.log('✓ Test 5: Validating session generator...');
try {
  fc.assert(
    fc.property(validSessionGen, (session) => {
      // Check required fields exist
      if (!session.sessionId) return false;
      if (!session.checkIn) return false;
      if (!session.checkOut) return false;
      if (!session.workLocation) return false;
      
      // Check checkOut is after checkIn
      if (session.checkOut.getTime() <= session.checkIn.getTime()) return false;
      
      // Check work location is valid
      if (!['office', 'wfh', 'client_site'].includes(session.workLocation)) return false;
      
      return true;
    }),
    { numRuns: 50 } // Run 50 times for quick verification
  );
  console.log('  ✓ Session generator produces valid data!\n');
} catch (error) {
  console.log('  ✗ Session generator validation failed:', error.message, '\n');
}

// Summary
console.log('═'.repeat(60));
console.log('🎉 Property-Based Testing Setup Complete!');
console.log('═'.repeat(60));
console.log('\nYou can now write property-based tests using:');
console.log('  - import fc from "fast-check"');
console.log('  - import { generators } from "./utils/generators.js"');
console.log('  - import { runPropertyTest } from "./utils/generators.js"');
console.log('\nRun tests with:');
console.log('  npm run test:property');
console.log();
