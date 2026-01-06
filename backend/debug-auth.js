const jwt = require('jsonwebtoken');

// Test the tokens from your database
const tokens = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzM2MTU5ODg4LCJleHAiOjE3MzYxNjM0ODh9.RLaeLLCJhc3Hg2z1ZEIGrYdLlCJmwvRTCdk50jNS4t',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwia2F0IjoxNzM1MTA2MzA2LCJleHAiOjE3MzUxMDk5MDZ9.EP19TGabGNMc5M6EuqIATOyN08dBcGJ69oHBTB9W9XB',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywia2F0IjoxNzM2MTU4MjAyLCJleHAiOjE3MzYxNjE4MDJ9.GLtHneS9nJlFUrA9TRjP1ezuiXBd6myANUJ43.YYoUJ'
];

console.log('=== TOKEN ANALYSIS ===');

tokens.forEach((token, index) => {
  console.log(`\n--- Token ${index + 1} ---`);
  
  try {
    // Decode without verification to see structure
    const decoded = jwt.decode(token);
    console.log('Decoded payload:', decoded);
    
    if (decoded && decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      const isExpired = decoded.exp < now;
      const expiryDate = new Date(decoded.exp * 1000);
      console.log('Expires at:', expiryDate.toISOString());
      console.log('Is expired:', isExpired);
      console.log('Current time:', new Date().toISOString());
    }
  } catch (error) {
    console.log('Error decoding token:', error.message);
  }
});

// Test with a sample JWT secret (you'll need to replace with your actual secret)
const testSecret = 'your-jwt-secret-here';

console.log('\n=== VERIFICATION TEST ===');
console.log('Note: Replace testSecret with your actual JWT_SECRET from .env');

tokens.forEach((token, index) => {
  console.log(`\n--- Verifying Token ${index + 1} ---`);
  
  try {
    const verified = jwt.verify(token, testSecret);
    console.log('✅ Token is valid:', verified);
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
  }
});