/**
 * Script to fix broken address data in database
 * Run this once to clean up existing [object Object] values
 * 
 * Usage: node scripts/fix-address-data.js
 */

import { up } from '../src/migrations/fix-address-object-object.js';

console.log('🚀 Starting address data cleanup...\n');

up()
  .then(() => {
    console.log('\n✅ Address cleanup completed successfully!');
    console.log('💡 Affected employees should re-enter their address in Profile Settings');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Address cleanup failed:', error);
    process.exit(1);
  });
